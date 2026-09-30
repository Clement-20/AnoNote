import { collection, doc, setDoc, getDoc, updateDoc, serverTimestamp, increment } from "firebase/firestore";
import { db } from "../lib/firebase";
import { offlineDb, OutgoingQueuedMessage, CachedMessage } from "../lib/offlineDb";
import { UserAccount } from "../context/AuthContext";
import { triggerNativeHaptic } from "./flutterBridge";

type QueueChangeListener = (queuedCount: number) => void;
const queueChangeListeners: Set<QueueChangeListener> = new Set();

export async function resolveRecipientOnline(chatId: string, senderAnonId: string): Promise<boolean> {
  try {
    if (chatId.startsWith("chat_")) {
      const parts = chatId.replace("chat_", "").split("__");
      const myClean = senderAnonId.toLowerCase().replace(/[^a-zA-Z0-9]/g, "_");
      const peerClean = parts.find((p) => p !== myClean) || parts[0];
      const peerRef = doc(db, "users", peerClean);
      const snap = await getDoc(peerRef);
      if (snap.exists()) {
        const pData = snap.data();
        if (pData.isOnline) {
          const lastActiveTime = pData.lastActive ? new Date(pData.lastActive).getTime() : 0;
          if (Date.now() - lastActiveTime < 90 * 1000) {
            return true;
          }
        }
      }
    }
  } catch {}
  return false;
}

export function subscribeToQueueCount(listener: QueueChangeListener) {
  queueChangeListeners.add(listener);
  getQueuedCount().then((count) => listener(count));
  return () => {
    queueChangeListeners.delete(listener);
  };
}

export async function getQueuedCount(): Promise<number> {
  try {
    return await offlineDb.outgoingQueue.count();
  } catch {
    return 0;
  }
}

function notifyQueueChange() {
  getQueuedCount().then((count) => {
    queueChangeListeners.forEach((fn) => fn(count));
  });
}

let isProcessingQueue = false;

// Process the Dexie outgoing message queue and push to Firestore idempotently
export async function processOutgoingQueue(): Promise<void> {
  if (isProcessingQueue) return;
  if (typeof navigator !== "undefined" && !navigator.onLine) return;

  isProcessingQueue = true;

  try {
    const queuedItems = await offlineDb.outgoingQueue
      .where("status")
      .anyOf(["queued", "failed", "sending"])
      .sortBy("createdAt");

    for (const item of queuedItems) {
      if (!item.id || !item.localId) continue;

      try {
        const messageDocRef = doc(db, "chats", item.chatId, "messages", item.localId);
        
        const isOnline = await resolveRecipientOnline(item.chatId, item.senderAnonId);
        const resolvedStatus: "sent" | "delivered" = isOnline ? "delivered" : "sent";

        await setDoc(
          messageDocRef,
          {
            text: item.text,
            senderAnonId: item.senderAnonId,
            senderName: item.senderName,
            senderAvatar: item.senderAvatar,
            timestamp: item.timestamp,
            createdAt: serverTimestamp(),
            mediaType: item.mediaType || null,
            mediaUrl: item.mediaUrl || null,
            status: resolvedStatus,
          },
          { merge: true }
        );

        // Update parent chat doc
        const chatRef = doc(db, "chats", item.chatId);
        const nowIso = new Date().toISOString();

        getDoc(chatRef)
          .then(async (chatSnap) => {
            if (chatSnap.exists()) {
              const participants = chatSnap.data().participants || [];
              const updates: any = {};
              let hasPeers = false;
              participants.forEach((pId: string) => {
                if (pId !== item.senderAnonId) {
                  updates[`unreadCount.${pId}`] = increment(1);
                  hasPeers = true;
                }
              });
              if (hasPeers) {
                await updateDoc(chatRef, updates);
              }
            }
          })
          .catch((e) => {
            console.warn("Failed to increment peers unreadCount in queue process:", e);
          });

        setDoc(
          chatRef,
          {
            lastMessage: item.text || `[${item.mediaType || "Media"}]`,
            lastMessageTimestamp: nowIso,
            lastSenderId: item.senderAnonId,
            lastMessageStatus: resolvedStatus,
            updatedAt: nowIso,
          },
          { merge: true }
        ).catch(() => {});

        // Update local Dexie cached message to delivered or sent status
        await offlineDb.cachedMessages.put({
          id: item.localId,
          chatId: item.chatId,
          text: item.text,
          senderAnonId: item.senderAnonId,
          senderName: item.senderName,
          senderAvatar: item.senderAvatar,
          timestamp: item.timestamp,
          createdAtTimestamp: item.createdAt,
          mediaType: item.mediaType,
          mediaUrl: item.mediaUrl,
          status: resolvedStatus,
          isPending: false,
        });

        // Clean up from outgoing queue
        await offlineDb.outgoingQueue.delete(item.id);
        notifyQueueChange();
      } catch (err: any) {
        console.warn("[Dexie Sync] Could not sync message to Firestore right now:", err);
        await offlineDb.outgoingQueue.update(item.id, {
          status: "failed",
          retryCount: (item.retryCount || 0) + 1,
          error: err?.message || "Sync failed",
        });
        notifyQueueChange();
        if (typeof navigator !== "undefined" && !navigator.onLine) {
          break;
        }
      }
    }
  } catch (err) {
    console.error("[Dexie Sync] Error processing outgoing queue:", err);
  } finally {
    isProcessingQueue = false;
    notifyQueueChange();
  }
}

// Add an outgoing message to the Dexie queue and trigger immediate direct Firestore write
export async function queueAndSendMessage(
  chatId: string,
  sender: UserAccount,
  text: string,
  mediaType?: "image" | "audio" | "video" | "document",
  mediaUrl?: string,
  isRecipientOnline?: boolean
): Promise<string> {
  const localId = `local_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const now = Date.now();
  const timeFormatted = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  let recipientOnline = isRecipientOnline;
  if (recipientOnline === undefined) {
    recipientOnline = await resolveRecipientOnline(chatId, sender.anonId);
  }
  const initialStatus: "sent" | "delivered" = recipientOnline ? "delivered" : "sent";

  const queuedItem: OutgoingQueuedMessage = {
    localId,
    chatId,
    senderAnonId: sender.anonId,
    senderName: sender.name,
    senderAvatar: sender.avatar,
    text: text.trim(),
    timestamp: timeFormatted,
    mediaType: mediaType || null,
    mediaUrl: mediaUrl || null,
    createdAt: now,
    retryCount: 0,
    status: "queued",
  };

  // 1. Cache immediately in Dexie for instant UI display
  triggerNativeHaptic("light");
  await offlineDb.cachedMessages.put({
    id: localId,
    chatId,
    text: text.trim(),
    senderAnonId: sender.anonId,
    senderName: sender.name,
    senderAvatar: sender.avatar,
    timestamp: timeFormatted,
    createdAtTimestamp: now,
    mediaType: mediaType || null,
    mediaUrl: mediaUrl || null,
    status: initialStatus,
    isPending: true,
  });

  // 2. Add to Dexie outgoing persistent queue
  const queueKey = await offlineDb.outgoingQueue.add(queuedItem);
  notifyQueueChange();

  // 3. Immediately write directly to Firestore for sub-millisecond real-time delivery
  const messageDocRef = doc(db, "chats", chatId, "messages", localId);
  const chatRef = doc(db, "chats", chatId);
  const nowIso = new Date().toISOString();

  setDoc(
    messageDocRef,
    {
      text: text.trim(),
      senderAnonId: sender.anonId,
      senderName: sender.name,
      senderAvatar: sender.avatar,
      timestamp: timeFormatted,
      createdAt: serverTimestamp(),
      mediaType: mediaType || null,
      mediaUrl: mediaUrl || null,
      status: initialStatus,
    },
    { merge: true }
  )
    .then(async () => {
      // Fetch chat participants and increment unreadCount for peers
      getDoc(chatRef)
        .then(async (chatSnap) => {
          if (chatSnap.exists()) {
            const participants = chatSnap.data().participants || [];
            const updates: any = {};
            let hasPeers = false;
            participants.forEach((pId: string) => {
              if (pId !== sender.anonId) {
                updates[`unreadCount.${pId}`] = increment(1);
                hasPeers = true;
              }
            });
            if (hasPeers) {
              await updateDoc(chatRef, updates);
            }
          }
        })
        .catch((e) => {
          console.warn("Failed to increment peers unreadCount in direct write:", e);
        });

      // Update chat metadata in Firestore
      setDoc(
        chatRef,
        {
          lastMessage: text.trim() || `[${mediaType || "Media"}]`,
          lastMessageTimestamp: nowIso,
          lastSenderId: sender.anonId,
          lastMessageStatus: initialStatus,
          updatedAt: nowIso,
        },
        { merge: true }
      ).catch(() => {});

      // Successfully synced to Firestore: remove from queue & mark cached message
      try {
        if (queueKey) {
          await offlineDb.outgoingQueue.delete(queueKey);
          notifyQueueChange();
        }
        await offlineDb.cachedMessages.update(localId, {
          status: initialStatus,
          isPending: false,
        });
      } catch {}
    })
    .catch((err) => {
      console.warn("[Realtime Write] Direct write deferred to background queue processor:", err);
      processOutgoingQueue();
    });

  return localId;
}

// Auto-sync initialization: listen for online event & periodic background sync
if (typeof window !== "undefined") {
  window.addEventListener("online", () => {
    processOutgoingQueue();
  });

  // Periodic flush
  setInterval(() => {
    if (navigator.onLine) {
      processOutgoingQueue();
    }
  }, 4000);
}
