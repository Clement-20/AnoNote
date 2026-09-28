import Dexie, { type Table } from "dexie";

export interface OutgoingQueuedMessage {
  id?: number;
  localId: string;
  chatId: string;
  senderAnonId: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  timestamp: string;
  mediaType?: "image" | "audio" | "video" | "document" | null;
  mediaUrl?: string | null;
  createdAt: number;
  retryCount: number;
  status: "queued" | "sending" | "failed";
  error?: string;
}

export interface CachedMessage {
  id: string; // Firestore ID or localId
  chatId: string;
  text: string;
  senderAnonId: string;
  senderName: string;
  senderAvatar: string;
  timestamp: string;
  createdAtTimestamp: number;
  mediaType?: "image" | "audio" | "video" | "document" | null;
  mediaUrl?: string | null;
  status: "sent" | "delivered" | "read";
  isPending?: boolean;
}

export interface CachedDraft {
  id: string; // `${userAnonId}_${chatId}`
  userAnonId: string;
  chatId: string;
  text: string;
  replyTo?: any;
  updatedAt: string;
}

export class AnonoteDexieDatabase extends Dexie {
  outgoingQueue!: Table<OutgoingQueuedMessage, number>;
  cachedMessages!: Table<CachedMessage, string>;
  cachedDrafts!: Table<CachedDraft, string>;

  constructor() {
    super("AnonoteDexieDB");
    this.version(1).stores({
      outgoingQueue: "++id, localId, chatId, senderAnonId, createdAt, status",
      cachedMessages: "id, chatId, createdAtTimestamp",
      cachedDrafts: "id, userAnonId, chatId",
    });
  }
}

export const offlineDb = new AnonoteDexieDatabase();
