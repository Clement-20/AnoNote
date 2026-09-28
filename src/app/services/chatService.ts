import {
  collection,
  doc,
  setDoc,
  getDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { offlineDb, CachedMessage } from "../lib/offlineDb";
import { queueAndSendMessage, processOutgoingQueue, subscribeToQueueCount, getQueuedCount } from "./syncService";
import { UserAccount } from "../context/AuthContext";

export { subscribeToQueueCount, getQueuedCount, processOutgoingQueue };

export interface FirestoreMessage {
  id: string;
  text: string;
  senderAnonId: string;
  senderName: string;
  senderAvatar: string;
  timestamp: string;
  createdAt?: any;
  mediaType?: "image" | "audio" | "video" | "document";
  mediaUrl?: string;
  status: "sent" | "delivered" | "read";
  isPending?: boolean; // True if queued locally in Dexie IndexedDB waiting for network transmission
}

export interface FirestoreChat {
  id: string;
  participants: string[];
  participantData: {
    [anonId: string]: {
      name: string;
      avatar: string;
      isVerified?: boolean;
    };
  };
  lastMessage: string;
  lastMessageTimestamp: string;
  lastSenderId: string;
  unreadCount?: { [anonId: string]: number };
  createdAt: string;
  updatedAt: string;
  isPending?: boolean;
}

// Generate consistent direct chat ID for 2 participants
export function getDirectChatId(anonId1: string, anonId2: string): string {
  const sorted = [anonId1.trim().toLowerCase(), anonId2.trim().toLowerCase()].sort();
  const clean1 = sorted[0].replace(/[^a-zA-Z0-9]/g, "_");
  const clean2 = sorted[1].replace(/[^a-zA-Z0-9]/g, "_");
  return `chat_${clean1}__${clean2}`;
}

// Register user in Firestore with offline capability
export async function syncUserToFirestore(user: UserAccount) {
  try {
    const userKey = user.anonId.trim().toLowerCase().replace(/[^a-zA-Z0-9]/g, "_");
    const userRef = doc(db, "users", userKey);
    await setDoc(
      userRef,
      {
        id: user.id,
        anonId: user.anonId,
        name: user.name,
        avatar: user.avatar,
        isVerified: !!user.isVerified,
        lastActive: new Date().toISOString(),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (err) {
    console.error("Failed to sync user to Firestore:", err);
  }
}

// Subscribe to real-time chats with offline cache support
export function subscribeToUserChats(
  userAnonId: string,
  onChatsUpdate: (chats: FirestoreChat[]) => void
) {
  const chatsRef = collection(db, "chats");
  const q = query(
    chatsRef,
    where("participants", "array-contains", userAnonId)
  );

  return onSnapshot(
    q,
    { includeMetadataChanges: true },
    (snapshot) => {
      const chats: FirestoreChat[] = [];
      snapshot.forEach((docSnap) => {
        chats.push({
          id: docSnap.id,
          ...docSnap.data(),
          isPending: docSnap.metadata.hasPendingWrites,
        } as FirestoreChat);
      });
      chats.sort((a, b) => {
        const timeA = new Date(a.updatedAt || a.createdAt || 0).getTime();
        const timeB = new Date(b.updatedAt || b.createdAt || 0).getTime();
        return timeB - timeA;
      });
      onChatsUpdate(chats);
    },
    (err) => {
      console.error("Error listening to chats:", err);
    }
  );
}

// Create or get conversation between 2 users
export async function getOrCreateDirectChat(
  currentUser: UserAccount,
  peerAnonId: string,
  peerAvatar = "👤"
): Promise<string> {
  const chatId = getDirectChatId(currentUser.anonId, peerAnonId);
  const chatRef = doc(db, "chats", chatId);

  try {
    const chatSnap = await getDoc(chatRef);
    if (!chatSnap.exists()) {
      const newChat: FirestoreChat = {
        id: chatId,
        participants: [currentUser.anonId, peerAnonId],
        participantData: {
          [currentUser.anonId]: {
            name: currentUser.name,
            avatar: currentUser.avatar,
            isVerified: !!currentUser.isVerified,
          },
          [peerAnonId]: {
            name: peerAnonId,
            avatar: peerAvatar,
            isVerified: false,
          },
        },
        lastMessage: "Encrypted conversation established",
        lastMessageTimestamp: new Date().toISOString(),
        lastSenderId: currentUser.anonId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await setDoc(chatRef, newChat, { merge: true });

      const messagesRef = collection(db, "chats", chatId, "messages");
      await addDoc(messagesRef, {
        text: `🔐 Encrypted channel established between ${currentUser.anonId} and ${peerAnonId}. Messages are stored in zero-knowledge real-time cloud storage.`,
        senderAnonId: "system",
        senderName: "System",
        senderAvatar: "🛡️",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        createdAt: serverTimestamp(),
        status: "read",
      });
    }
  } catch (err) {
    console.error("Error creating direct chat:", err);
  }

  return chatId;
}

// Subscribe to real-time messages with Dexie.js IndexedDB storage layer
export function subscribeToMessages(
  chatId: string,
  onMessagesUpdate: (messages: FirestoreMessage[]) => void
) {
  let isMounted = true;

  // 1. Instantly load locally cached messages & queued messages from Dexie IndexedDB
  const loadLocalDexieCache = async () => {
    try {
      const cached = await offlineDb.cachedMessages
        .where("chatId")
        .equals(chatId)
        .sortBy("createdAtTimestamp");

      const queued = await offlineDb.outgoingQueue
        .where("chatId")
        .equals(chatId)
        .sortBy("createdAt");

      const queuedAsMessages: CachedMessage[] = queued.map((q) => ({
        id: q.localId,
        chatId: q.chatId,
        text: q.text,
        senderAnonId: q.senderAnonId,
        senderName: q.senderName,
        senderAvatar: q.senderAvatar,
        timestamp: q.timestamp,
        createdAtTimestamp: q.createdAt,
        mediaType: q.mediaType,
        mediaUrl: q.mediaUrl,
        status: "sent",
        isPending: true,
      }));

      // Merge and deduplicate by id
      const map = new Map<string, FirestoreMessage>();
      for (const msg of [...cached, ...queuedAsMessages]) {
        map.set(msg.id, {
          id: msg.id,
          text: msg.text,
          senderAnonId: msg.senderAnonId,
          senderName: msg.senderName,
          senderAvatar: msg.senderAvatar,
          timestamp: msg.timestamp,
          createdAt: msg.createdAtTimestamp,
          mediaType: msg.mediaType || undefined,
          mediaUrl: msg.mediaUrl || undefined,
          status: msg.status,
          isPending: msg.isPending,
        });
      }

      if (isMounted && map.size > 0) {
        onMessagesUpdate(Array.from(map.values()));
      }
    } catch (e) {
      console.warn("[Dexie] Initial cache load error:", e);
    }
  };

  loadLocalDexieCache();

  // 2. Subscribe to live Firestore collection
  const messagesRef = collection(db, "chats", chatId, "messages");
  const q = query(messagesRef, orderBy("createdAt", "asc"));

  const unsubscribeFirestore = onSnapshot(
    q,
    { includeMetadataChanges: true },
    async (snapshot) => {
      const serverMsgs: FirestoreMessage[] = [];

      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        const msg: FirestoreMessage = {
          id: docSnap.id,
          ...data,
          isPending: docSnap.metadata.hasPendingWrites,
          status: docSnap.metadata.hasPendingWrites ? "sent" : (data.status || "delivered"),
        } as FirestoreMessage;
        serverMsgs.push(msg);

        // Store server message into Dexie IndexedDB cache for offline persistence
        try {
          const timestampNum = data.createdAt?.toMillis ? data.createdAt.toMillis() : Date.now();
          await offlineDb.cachedMessages.put({
            id: docSnap.id,
            chatId,
            text: msg.text,
            senderAnonId: msg.senderAnonId,
            senderName: msg.senderName,
            senderAvatar: msg.senderAvatar,
            timestamp: msg.timestamp,
            createdAtTimestamp: timestampNum,
            mediaType: msg.mediaType || null,
            mediaUrl: msg.mediaUrl || null,
            status: msg.status,
            isPending: msg.isPending,
          });
        } catch {
          // ignore cache put errors
        }
      }

      // Check for any currently pending items in Dexie outgoing queue for this chat
      try {
        const queuedItems = await offlineDb.outgoingQueue
          .where("chatId")
          .equals(chatId)
          .sortBy("createdAt");

        const queuedMsgs: FirestoreMessage[] = queuedItems.map((item) => ({
          id: item.localId,
          text: item.text,
          senderAnonId: item.senderAnonId,
          senderName: item.senderName,
          senderAvatar: item.senderAvatar,
          timestamp: item.timestamp,
          createdAt: item.createdAt,
          mediaType: item.mediaType || undefined,
          mediaUrl: item.mediaUrl || undefined,
          status: "sent",
          isPending: true,
        }));

        // Combine server messages + queued Dexie messages
        const all = [...serverMsgs];
        for (const qItem of queuedMsgs) {
          // Avoid duplicate if server already returned it
          if (!all.some((m) => m.id === qItem.id || (m.text === qItem.text && m.senderAnonId === qItem.senderAnonId && Math.abs((m.createdAt?.toMillis?.() || 0) - (qItem.createdAt || 0)) < 2000))) {
            all.push(qItem);
          }
        }

        if (isMounted) {
          onMessagesUpdate(all);
        }
      } catch {
        if (isMounted) {
          onMessagesUpdate(serverMsgs);
        }
      }
    },
    (err) => {
      console.error("[Firestore] Error listening to messages:", err);
      // Even if Firestore errors due to offline, reload Dexie local cache
      loadLocalDexieCache();
    }
  );

  // Subscribe to queue change notifications to re-render pending messages in this chat
  const unsubscribeQueue = subscribeToQueueCount(() => {
    loadLocalDexieCache();
  });

  return () => {
    isMounted = false;
    unsubscribeFirestore();
    unsubscribeQueue();
  };
}

// Send a message: caches and queues in Dexie.js and synchronizes automatically with Firestore
export async function sendChatMessage(
  chatId: string,
  sender: UserAccount,
  text: string,
  mediaType?: "image" | "audio" | "video" | "document",
  mediaUrl?: string
) {
  if (!text.trim() && !mediaUrl) return;

  // Queue into Dexie.js IndexedDB storage and auto-sync
  await queueAndSendMessage(chatId, sender, text, mediaType, mediaUrl);

  // Clean up any draft for this chat
  deleteChatDraft(sender.anonId, chatId);
}

// --- DRAFT MANAGEMENT WITH DEXIE & FIRESTORE ---

export async function saveChatDraft(
  userAnonId: string,
  chatId: string,
  text: string,
  replyTo?: any
) {
  if (!userAnonId || !chatId) return;
  const userKey = userAnonId.trim().toLowerCase().replace(/[^a-zA-Z0-9]/g, "_");
  const chatKey = chatId.trim().replace(/[^a-zA-Z0-9_]/g, "_");
  const draftId = `${userKey}_${chatKey}`;

  if (!text || !text.trim()) {
    try {
      await offlineDb.cachedDrafts.delete(draftId);
      const draftRef = doc(db, "users", userKey, "drafts", chatKey);
      await deleteDoc(draftRef);
    } catch (e) {
      console.error("Error deleting draft:", e);
    }
    return;
  }

  // 1. Save in Dexie IndexedDB
  try {
    await offlineDb.cachedDrafts.put({
      id: draftId,
      userAnonId,
      chatId,
      text,
      replyTo: replyTo || null,
      updatedAt: new Date().toISOString(),
    });
  } catch (e) {
    console.warn("[Dexie] Error saving draft locally:", e);
  }

  // 2. Save in Firestore cloud
  try {
    const draftRef = doc(db, "users", userKey, "drafts", chatKey);
    await setDoc(
      draftRef,
      {
        chatId,
        userAnonId,
        text,
        replyTo: replyTo || null,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (e) {
    console.warn("[Firestore] Offline - Draft saved in Dexie locally:", e);
  }
}

export async function deleteChatDraft(userAnonId: string, chatId: string) {
  if (!userAnonId || !chatId) return;
  const userKey = userAnonId.trim().toLowerCase().replace(/[^a-zA-Z0-9]/g, "_");
  const chatKey = chatId.trim().replace(/[^a-zA-Z0-9_]/g, "_");
  const draftId = `${userKey}_${chatKey}`;

  try {
    await offlineDb.cachedDrafts.delete(draftId);
    const draftRef = doc(db, "users", userKey, "drafts", chatKey);
    await deleteDoc(draftRef);
  } catch (e) {
    console.error("Error removing draft:", e);
  }
}

export function subscribeToChatDraft(
  userAnonId: string,
  chatId: string,
  onDraftUpdate: (draft: { text: string; replyTo?: any } | null) => void
) {
  if (!userAnonId || !chatId) return () => {};
  const userKey = userAnonId.trim().toLowerCase().replace(/[^a-zA-Z0-9]/g, "_");
  const chatKey = chatId.trim().replace(/[^a-zA-Z0-9_]/g, "_");
  const draftId = `${userKey}_${chatKey}`;

  // Check Dexie IndexedDB first for instant draft restoration
  offlineDb.cachedDrafts.get(draftId).then((cached) => {
    if (cached) {
      onDraftUpdate({ text: cached.text || "", replyTo: cached.replyTo });
    }
  });

  const draftRef = doc(db, "users", userKey, "drafts", chatKey);

  return onSnapshot(
    draftRef,
    { includeMetadataChanges: true },
    (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        onDraftUpdate({ text: data.text || "", replyTo: data.replyTo });
      } else {
        onDraftUpdate(null);
      }
    },
    (err) => {
      console.warn("[Firestore] Listening to draft offline:", err);
    }
  );
}

export function subscribeToAllUserDrafts(
  userAnonId: string,
  onDraftsUpdate: (drafts: Record<string, string>) => void
) {
  if (!userAnonId) return () => {};
  const userKey = userAnonId.trim().toLowerCase().replace(/[^a-zA-Z0-9]/g, "_");
  const draftsRef = collection(db, "users", userKey, "drafts");

  // Load from Dexie first
  offlineDb.cachedDrafts
    .where("userAnonId")
    .equals(userAnonId)
    .toArray()
    .then((cachedDrafts) => {
      const map: Record<string, string> = {};
      for (const d of cachedDrafts) {
        if (d.text && d.text.trim()) map[d.chatId] = d.text;
      }
      if (Object.keys(map).length > 0) {
        onDraftsUpdate(map);
      }
    });

  return onSnapshot(
    draftsRef,
    { includeMetadataChanges: true },
    (snapshot) => {
      const drafts: Record<string, string> = {};
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.chatId && data.text && data.text.trim()) {
          drafts[data.chatId] = data.text;
        }
      });
      onDraftsUpdate(drafts);
    },
    (err) => {
      console.warn("Error listening to all drafts:", err);
    }
  );
}

// Subscribe to active real network users
export function subscribeToActiveUsers(
  currentUserAnonId: string,
  onUsersUpdate: (users: any[]) => void
) {
  const usersRef = collection(db, "users");
  return onSnapshot(
    usersRef,
    { includeMetadataChanges: true },
    (snapshot) => {
      const users: any[] = [];
      snapshot.forEach((docSnap) => {
        const u = docSnap.data();
        if (u.anonId && u.anonId !== currentUserAnonId) {
          users.push(u);
        }
      });
      onUsersUpdate(users);
    },
    (err) => {
      console.error("Error loading active users:", err);
    }
  );
}
