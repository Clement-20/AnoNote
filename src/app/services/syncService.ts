import { collection, doc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebase";
import { offlineDb, OutgoingQueuedMessage, CachedMessage } from "../lib/offlineDb";
import { UserAccount } from "../context/AuthContext";

type QueueChangeListener = (queuedCount: number) => void;
const queueChangeListeners: Set<QueueChangeListener> = new Set();

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
        // Idempotent doc reference using localId as the unique document key
        const messageDocRef = doc(db, "chats", item.chatId, "messages", item.localId);
        
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
            status: "delivered",
          },
          { merge: true }
        );

        // Update parent chat doc
        const chatRef = doc(db, "chats", item.chatId);
        const nowIso = new Date().toISOString();
        updateDoc(chatRef, {
          lastMessage: item.text || `[${item.mediaType || "Media"}]`,
          lastMessageTimestamp: nowIso,
          lastSenderId: item.senderAnonId,
          updatedAt: nowIso,
        }).catch(() => {
          // Non-critical
        });

        // Update local Dexie cached message to delivered status
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
          status: "delivered",
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

// Add an outgoing message to the Dexie queue and trigger sync
export async function queueAndSendMessage(
  chatId: string,
  sender: UserAccount,
  text: string,
  mediaType?: "image" | "audio" | "video" | "document",
  mediaUrl?: string
): Promise<string> {
  const localId = `local_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const now = Date.now();
  const timeFormatted = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

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
    status: "sent",
    isPending: true,
  });

  // 2. Add to Dexie outgoing persistent queue
  await offlineDb.outgoingQueue.add(queuedItem);
  notifyQueueChange();

  // 3. Trigger queue processor
  processOutgoingQueue();

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
