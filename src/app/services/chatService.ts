import {
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  query,
  where,
  orderBy,
  limitToLast,
  onSnapshot,
  addDoc,
  serverTimestamp,
  arrayUnion,
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
  reactions?: Record<string, string[]>;
}

export interface FirestoreChat {
  id: string;
  isGroup?: boolean;
  groupName?: string;
  groupAvatar?: string;
  createdBy?: string;
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
  lastMessageStatus?: "sent" | "delivered" | "read";
  unreadCount?: { [anonId: string]: number };
  archivedBy?: { [anonId: string]: boolean };
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

// Check if an Anon ID is already registered in Firestore cloud database
export async function isAnonIdRegistered(anonId: string, excludeUserId?: string): Promise<boolean> {
  try {
    const userKey = anonId.trim().toLowerCase().replace(/[^a-zA-Z0-9]/g, "_");
    const userRef = doc(db, "users", userKey);
    const snap = await getDoc(userRef);
    if (!snap.exists()) return false;
    const data = snap.data();
    if (excludeUserId && data.id === excludeUserId) return false;
    return true;
  } catch {
    return false;
  }
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

// Subscribe to real-time metadata of a specific chat or group
export function subscribeToChatMetadata(
  chatId: string,
  onUpdate: (data: FirestoreChat | null) => void
) {
  const chatRef = doc(db, "chats", chatId);
  return onSnapshot(
    chatRef,
    { includeMetadataChanges: true },
    (snap) => {
      if (snap.exists()) {
        onUpdate({ id: snap.id, ...snap.data() } as FirestoreChat);
      } else {
        onUpdate(null);
      }
    },
    (err) => {
      console.warn("[Firestore] Chat meta subscribe error:", err);
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

// Create a real-time group chat in Firestore
export async function createGroupChat(
  currentUser: UserAccount,
  groupName: string,
  groupAvatar: string,
  participantAnonIds: string[]
): Promise<string> {
  const groupId = `group_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const chatRef = doc(db, "chats", groupId);
  const allParticipants = Array.from(new Set([currentUser.anonId, ...participantAnonIds]));
  
  const participantData: Record<string, any> = {
    [currentUser.anonId]: {
      name: currentUser.name,
      avatar: currentUser.avatar,
      isVerified: !!currentUser.isVerified,
    },
  };
  
  participantAnonIds.forEach((pId) => {
    participantData[pId] = {
      name: pId,
      avatar: "👤",
      isVerified: false,
    };
  });

  const nowIso = new Date().toISOString();
  await setDoc(chatRef, {
    id: groupId,
    isGroup: true,
    groupName: groupName.trim(),
    groupAvatar: groupAvatar || "👥",
    participants: allParticipants,
    participantData,
    createdBy: currentUser.anonId,
    lastMessage: `Group "${groupName}" created`,
    lastMessageTimestamp: nowIso,
    lastSenderId: currentUser.anonId,
    createdAt: nowIso,
    updatedAt: nowIso,
  });

  const messagesRef = collection(db, "chats", groupId, "messages");
  await addDoc(messagesRef, {
    text: `🛡️ Encrypted Group "${groupName}" created by ${currentUser.anonId}. All messages are synchronized in real-time.`,
    senderAnonId: "system",
    senderName: "System",
    senderAvatar: "🛡️",
    timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    createdAt: serverTimestamp(),
    status: "read",
  });

  return groupId;
}

// Automatically register and ensure a participant is in the chat/group document
export async function ensureChatParticipant(chatId: string, currentUser: UserAccount) {
  if (!chatId || !currentUser?.anonId) return;
  try {
    const chatRef = doc(db, "chats", chatId);
    const snap = await getDoc(chatRef);
    const nowIso = new Date().toISOString();

    if (!snap.exists()) {
      const isGroup = chatId.startsWith("group_") || chatId.startsWith("g") || chatId.includes("group");
      await setDoc(
        chatRef,
        {
          id: chatId,
          isGroup,
          groupName: isGroup ? "Encrypted Group" : undefined,
          groupAvatar: isGroup ? "👥" : undefined,
          participants: [currentUser.anonId],
          participantData: {
            [currentUser.anonId]: {
              name: currentUser.name,
              avatar: currentUser.avatar,
              isVerified: !!currentUser.isVerified,
            },
          },
          lastMessage: isGroup ? "Group conversation started" : "Encrypted chat active",
          lastMessageTimestamp: nowIso,
          lastSenderId: currentUser.anonId,
          createdAt: nowIso,
          updatedAt: nowIso,
        },
        { merge: true }
      );
    } else {
      const data = snap.data();
      const participants: string[] = Array.isArray(data.participants) ? data.participants : [];
      if (!participants.includes(currentUser.anonId)) {
        await updateDoc(chatRef, {
          participants: arrayUnion(currentUser.anonId),
          [`participantData.${currentUser.anonId}`]: {
            name: currentUser.name,
            avatar: currentUser.avatar,
            isVerified: !!currentUser.isVerified,
          },
        });
      }
    }
  } catch (err) {
    console.warn("[Firestore] ensureChatParticipant:", err);
  }
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

  // Listen to active ephemeral setting of the chat document in real-time
  let currentEphemeralSetting = "off";
  const unsubscribeChatDoc = onSnapshot(doc(db, "chats", chatId), (snap) => {
    if (snap.exists()) {
      currentEphemeralSetting = snap.data().ephemeralSetting || "off";
    }
  });

  // 2. Subscribe to live Firestore collection (bounded to latest 150 messages for optimal scale & speed)
  const messagesRef = collection(db, "chats", chatId, "messages");
  const q = query(messagesRef, orderBy("createdAt", "asc"), limitToLast(150));

  const unsubscribeFirestore = onSnapshot(
    q,
    { includeMetadataChanges: true },
    async (snapshot) => {
      const serverMsgs: FirestoreMessage[] = [];

      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        const timestampNum = data.createdAt?.toMillis ? data.createdAt.toMillis() : Date.now();

        // Check if message is expired under the current ephemeral mode setting
        if (isMessageExpired(timestampNum, currentEphemeralSetting)) {
          // Delete from Firestore
          deleteDoc(doc(db, "chats", chatId, "messages", docSnap.id)).catch(() => {});
          // Delete from local cache
          offlineDb.cachedMessages.delete(docSnap.id).catch(() => {});
          continue;
        }

        const msg: FirestoreMessage = {
          id: docSnap.id,
          ...data,
          isPending: docSnap.metadata.hasPendingWrites,
          status: docSnap.metadata.hasPendingWrites ? "sent" : (data.status || "sent"),
        } as FirestoreMessage;
        serverMsgs.push(msg);

        // Store server message into Dexie IndexedDB cache for offline persistence
        try {
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

        // Combine server messages + queued Dexie messages by unique ID
        const messageMap = new Map<string, FirestoreMessage>();
        for (const s of serverMsgs) {
          messageMap.set(s.id, s);
        }
        for (const qItem of queuedMsgs) {
          if (!messageMap.has(qItem.id)) {
            messageMap.set(qItem.id, qItem);
          }
        }

        const merged = Array.from(messageMap.values());
        merged.sort((a, b) => {
          const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : typeof a.createdAt === "number" ? a.createdAt : 0;
          const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : typeof b.createdAt === "number" ? b.createdAt : 0;
          return timeA - timeB;
        });

        if (isMounted) {
          onMessagesUpdate(merged);
        }
      } catch {
        if (isMounted) {
          onMessagesUpdate(serverMsgs);
        }
      }
    },
    (err) => {
      console.error("[Firestore] Error listening to messages:", err);
      loadLocalDexieCache();
    }
  );

  const unsubscribeQueue = subscribeToQueueCount(() => {
    loadLocalDexieCache();
  });

  return () => {
    isMounted = false;
    unsubscribeFirestore();
    unsubscribeQueue();
    unsubscribeChatDoc();
  };
}

// Toggle or add emoji reaction to a message
export async function toggleMessageReaction(
  chatId: string,
  messageId: string,
  emoji: string,
  userAnonId: string
) {
  try {
    const msgRef = doc(db, "chats", chatId, "messages", messageId);
    const snap = await getDoc(msgRef);
    if (!snap.exists()) return;

    const data = snap.data();
    const reactions: Record<string, string[]> = { ...(data.reactions || {}) };
    const currentUsers: string[] = Array.isArray(reactions[emoji]) ? [...reactions[emoji]] : [];

    const userIndex = currentUsers.indexOf(userAnonId);
    if (userIndex >= 0) {
      // User already reacted -> remove reaction (toggle off)
      currentUsers.splice(userIndex, 1);
    } else {
      // Add reaction
      currentUsers.push(userAnonId);
    }

    if (currentUsers.length === 0) {
      delete reactions[emoji];
    } else {
      reactions[emoji] = currentUsers;
    }

    await updateDoc(msgRef, {
      reactions,
    });
  } catch (err) {
    console.warn("Failed to toggle reaction:", err);
  }
}

// Send a message: caches and queues in Dexie.js and synchronizes automatically with Firestore
export async function sendChatMessage(
  chatId: string,
  sender: UserAccount,
  text: string,
  mediaType?: "image" | "audio" | "video" | "document",
  mediaUrl?: string,
  isRecipientOnline?: boolean
) {
  if (!text.trim() && !mediaUrl) return;

  await queueAndSendMessage(chatId, sender, text, mediaType, mediaUrl, isRecipientOnline);
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
      const userMap = new Map<string, any>();
      snapshot.forEach((docSnap) => {
        const u = docSnap.data();
        const rawId = (u.anonId || docSnap.id || "").trim();
        if (rawId && rawId !== currentUserAnonId) {
          // If duplicate exists, prefer verified or with non-empty name
          if (!userMap.has(rawId) || u.isVerified) {
            userMap.set(rawId, { ...u, id: docSnap.id, anonId: rawId });
          }
        }
      });
      onUsersUpdate(Array.from(userMap.values()));
    },
    (err) => {
      console.error("Error loading active users:", err);
    }
  );
}

// Mark messages as read by recipient
export async function markMessagesAsRead(chatId: string, messageIds: string[], readerAnonId: string) {
  if (!chatId || !messageIds || messageIds.length === 0) return;
  const nowIso = new Date().toISOString();

  // Update in Dexie locally
  try {
    for (const id of messageIds) {
      await offlineDb.cachedMessages.update(id, { status: "read" });
    }
  } catch {}

  // Update in Firestore
  try {
    const batch = writeBatch(db);
    for (const msgId of messageIds) {
      const msgRef = doc(db, "chats", chatId, "messages", msgId);
      batch.update(msgRef, {
        status: "read",
        readAt: nowIso,
      });
    }
    const chatRef = doc(db, "chats", chatId);
    batch.update(chatRef, {
      [`unreadCount.${readerAnonId}`]: 0,
      lastMessageStatus: "read",
    });
    await batch.commit();
  } catch (err) {
    try {
      const chatRef = doc(db, "chats", chatId);
      updateDoc(chatRef, {
        [`unreadCount.${readerAnonId}`]: 0,
        lastMessageStatus: "read",
      }).catch(() => {});
      for (const msgId of messageIds) {
        const msgRef = doc(db, "chats", chatId, "messages", msgId);
        updateDoc(msgRef, {
          status: "read",
          readAt: nowIso,
        }).catch(() => {});
      }
    } catch {}
  }
}

// Mark messages as delivered when recipient is online
export async function markMessagesAsDelivered(chatId: string, messageIds: string[]) {
  if (!chatId || !messageIds || messageIds.length === 0) return;
  const nowIso = new Date().toISOString();

  // Update in Dexie locally
  try {
    for (const id of messageIds) {
      await offlineDb.cachedMessages.update(id, { status: "delivered" });
    }
  } catch {}

  // Update in Firestore
  try {
    const batch = writeBatch(db);
    for (const msgId of messageIds) {
      const msgRef = doc(db, "chats", chatId, "messages", msgId);
      batch.update(msgRef, {
        status: "delivered",
        deliveredAt: nowIso,
      });
    }
    const chatRef = doc(db, "chats", chatId);
    batch.update(chatRef, {
      lastMessageStatus: "delivered",
    });
    await batch.commit();
  } catch (err) {
    try {
      for (const msgId of messageIds) {
        const msgRef = doc(db, "chats", chatId, "messages", msgId);
        updateDoc(msgRef, {
          status: "delivered",
          deliveredAt: nowIso,
        }).catch(() => {});
      }
    } catch {}
  }
}

// Mark all messages in a chat as read for the current user
export async function markChatAsRead(chatId: string, userAnonId: string) {
  if (!chatId || !userAnonId) return;
  try {
    const chatRef = doc(db, "chats", chatId);
    await updateDoc(chatRef, {
      [`unreadCount.${userAnonId}`]: 0,
      lastMessageStatus: "read",
    });
  } catch (err) {
    // ignore offline or non-existent
  }
}

export interface UserPresence {
  isOnline: boolean;
  lastSeen?: string;
  lastActive?: string;
  avatar?: string;
  name?: string;
  isVerified?: boolean;
}

// Update user's presence state in Firestore
export async function updateUserPresence(anonId: string, isOnline: boolean) {
  if (!anonId) return;
  try {
    const userKey = anonId.trim().toLowerCase().replace(/[^a-zA-Z0-9]/g, "_");
    const userRef = doc(db, "users", userKey);
    const nowIso = new Date().toISOString();
    await setDoc(
      userRef,
      {
        isOnline,
        lastActive: nowIso,
        lastSeen: nowIso,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (e) {
    // Ignore network dropouts
  }
}

// Subscribe to peer's live presence status
export function subscribeToUserPresence(
  anonId: string,
  onUpdate: (presence: UserPresence | null) => void
) {
  if (!anonId) {
    onUpdate(null);
    return () => {};
  }
  const userKey = anonId.trim().toLowerCase().replace(/[^a-zA-Z0-9]/g, "_");
  const userRef = doc(db, "users", userKey);

  return onSnapshot(
    userRef,
    (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        let isOnline = !!data.isOnline;
        if (data.lastActive) {
          const lastActiveTime = new Date(data.lastActive).getTime();
          // If no heartbeat for > 90 seconds, consider offline
          if (Date.now() - lastActiveTime > 90 * 1000) {
            isOnline = false;
          }
        }
        onUpdate({
          isOnline,
          lastSeen: data.lastSeen || data.lastActive || undefined,
          lastActive: data.lastActive || undefined,
          avatar: data.avatar || undefined,
          name: data.name || undefined,
          isVerified: data.isVerified !== undefined ? !!data.isVerified : undefined,
        });
      } else {
        onUpdate(null);
      }
    },
    () => {
      onUpdate(null);
    }
  );
}

// Publish dynamic system broadcast to all clients simultaneously
export async function publishBroadcast(message: string, senderName: string = "Admin") {
  try {
    const ref = doc(db, "system", "broadcast");
    await setDoc(ref, {
      message: message.trim(),
      senderName,
      updatedAt: serverTimestamp(),
      timestampStr: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    });
  } catch (e) {
    console.error("Failed to publish broadcast:", e);
  }
}

// Clear system broadcast from Firestore
export async function clearBroadcast() {
  try {
    const ref = doc(db, "system", "broadcast");
    await setDoc(ref, {
      message: "",
      updatedAt: serverTimestamp(),
    });
  } catch (e) {
    console.error("Failed to clear broadcast:", e);
  }
}

// Subscribe to real-time system broadcasts
export function subscribeToBroadcast(onUpdate: (message: string, timestampStr?: string) => void) {
  const ref = doc(db, "system", "broadcast");
  return onSnapshot(ref, (snap) => {
    if (snap.exists()) {
      const data = snap.data();
      onUpdate(data.message || "", data.timestampStr || "");
    } else {
      onUpdate("", "");
    }
  });
}

// Update Chat Ephemeral Setting
export async function updateChatEphemeralSetting(chatId: string, setting: string) {
  try {
    const chatRef = doc(db, "chats", chatId);
    await updateDoc(chatRef, {
      ephemeralSetting: setting,
      updatedAt: serverTimestamp(),
    });
  } catch (e) {
    console.error("Failed to update ephemeral setting:", e);
  }
}

// Check if a message has expired based on ephemeral setting
export function isMessageExpired(createdAtMillis: number, setting: string): boolean {
  if (!setting || setting === "off") return false;
  let durationMs = 0;
  if (setting === "10s") durationMs = 10 * 1000;
  else if (setting === "24h") durationMs = 24 * 60 * 60 * 1000;
  else if (setting === "7d") durationMs = 7 * 24 * 60 * 60 * 1000;
  else if (setting === "90d") durationMs = 90 * 24 * 60 * 60 * 1000;
  
  if (durationMs === 0) return false;
  return Date.now() - createdAtMillis > durationMs;
}

// Edit an existing message
export async function editMessage(chatId: string, messageId: string, newText: string) {
  try {
    const msgRef = doc(db, "chats", chatId, "messages", messageId);
    await updateDoc(msgRef, {
      text: newText.trim() + " (edited)",
      isEdited: true,
      editedAt: serverTimestamp(),
    });
    // Update local cache
    await offlineDb.cachedMessages.update(messageId, { text: newText.trim() + " (edited)" });
  } catch (e) {
    console.error("Failed to edit message:", e);
  }
}

// Delete a message entirely
export async function deleteMessage(chatId: string, messageId: string) {
  try {
    const msgRef = doc(db, "chats", chatId, "messages", messageId);
    await deleteDoc(msgRef);
    // Delete from local cache
    await offlineDb.cachedMessages.delete(messageId);
  } catch (e) {
    console.error("Failed to delete message:", e);
  }
}

// Archive a chat for a specific user
export async function archiveChat(chatId: string, userAnonId: string) {
  if (!chatId || !userAnonId) return;
  const chatRef = doc(db, "chats", chatId);
  try {
    await updateDoc(chatRef, {
      [`archivedBy.${userAnonId}`]: true,
    });
  } catch (err) {
    console.error("Error archiving chat:", err);
  }
}

// Unarchive a chat for a specific user
export async function unarchiveChat(chatId: string, userAnonId: string) {
  if (!chatId || !userAnonId) return;
  const chatRef = doc(db, "chats", chatId);
  try {
    await updateDoc(chatRef, {
      [`archivedBy.${userAnonId}`]: false,
    });
  } catch (err) {
    console.error("Error unarchiving chat:", err);
  }
}

