import {
  collection,
  doc,
  setDoc,
  getDoc,
  deleteDoc,
  updateDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { UserAccount } from "../context/AuthContext";

export interface CallRecord {
  id: string;
  callerAnonId: string;
  callerName: string;
  callerAvatar: string;
  receiverAnonId: string;
  receiverName?: string;
  receiverAvatar?: string;
  type: "audio" | "video";
  status: "outgoing" | "incoming" | "missed" | "completed" | "active";
  timestamp: string;
  createdAt: number;
  durationSeconds?: number;
  roomUrl?: string;
}

// Log a call event to Firestore
export async function logCall(
  currentUser: UserAccount,
  peerAnonId: string,
  peerName: string,
  peerAvatar: string,
  type: "audio" | "video",
  status: "outgoing" | "incoming" | "missed" | "completed" = "outgoing",
  durationSeconds = 0
): Promise<string> {
  const callId = `call_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = Date.now();
  const timeFormatted = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const record: CallRecord = {
    id: callId,
    callerAnonId: currentUser.anonId,
    callerName: currentUser.name,
    callerAvatar: currentUser.avatar,
    receiverAnonId: peerAnonId,
    receiverName: peerName,
    receiverAvatar: peerAvatar,
    type,
    status,
    timestamp: timeFormatted,
    createdAt: now,
    durationSeconds,
  };

  try {
    const callRef = doc(db, "calls", callId);
    await setDoc(callRef, record);
  } catch (err) {
    console.warn("Failed to log call:", err);
  }

  return callId;
}

// Subscribe to real-time call history for user
export function subscribeToCalls(
  userAnonId: string,
  onUpdate: (calls: CallRecord[]) => void
) {
  const callsRef = collection(db, "calls");
  const q = query(callsRef, orderBy("createdAt", "desc"), limit(50));

  return onSnapshot(
    q,
    (snapshot) => {
      const records: CallRecord[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as CallRecord;
        if (data.callerAnonId === userAnonId || data.receiverAnonId === userAnonId) {
          records.push({
            ...data,
            id: docSnap.id,
          });
        }
      });
      onUpdate(records);
    },
    (err) => {
      console.warn("Calls listener error:", err);
      onUpdate([]);
    }
  );
}
