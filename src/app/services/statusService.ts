import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
  arrayUnion,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { UserAccount } from "../context/AuthContext";

export interface StatusItemData {
  id: string;
  authorAnonId: string;
  authorName: string;
  authorAvatar: string;
  isAuthorVerified?: boolean;
  text?: string;
  mediaUrl?: string;
  bgColor?: string;
  createdAt: number;
  expiresAt: number;
  viewers: string[];
}

export interface UserStatusGroup {
  anonId: string;
  name: string;
  avatar: string;
  isVerified?: boolean;
  items: StatusItemData[];
  latestTimestamp: number;
  hasUnviewed: boolean;
}

// Publish a new 24h status update
export async function publishStatus(
  author: UserAccount,
  text?: string,
  bgColor = "#0b4d75",
  mediaUrl?: string
): Promise<string> {
  const statusId = `status_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const now = Date.now();
  const expiresAt = now + 24 * 60 * 60 * 1000; // 24 hours

  const statusDoc: StatusItemData = {
    id: statusId,
    authorAnonId: author.anonId,
    authorName: author.name,
    authorAvatar: author.avatar,
    isAuthorVerified: !!author.isVerified,
    text: text?.trim() || "",
    bgColor,
    mediaUrl: mediaUrl || "",
    createdAt: now,
    expiresAt,
    viewers: [author.anonId],
  };

  const statusRef = doc(db, "statuses", statusId);
  await setDoc(statusRef, statusDoc);
  return statusId;
}

// Delete status update
export async function deleteStatus(statusId: string): Promise<void> {
  try {
    const statusRef = doc(db, "statuses", statusId);
    await deleteDoc(statusRef);
  } catch (err) {
    console.error("Failed to delete status:", err);
  }
}

// Record viewer
export async function markStatusViewed(statusId: string, viewerAnonId: string): Promise<void> {
  if (!statusId || !viewerAnonId) return;
  try {
    const statusRef = doc(db, "statuses", statusId);
    await updateDoc(statusRef, {
      viewers: arrayUnion(viewerAnonId),
    });
  } catch (err) {
    console.warn("Failed to mark status viewed:", err);
  }
}

// Real-time subscription to active status updates grouped by author
export function subscribeToStatuses(
  currentViewerAnonId: string,
  onUpdate: (userGroups: UserStatusGroup[], myGroup: UserStatusGroup | null) => void
) {
  const statusesRef = collection(db, "statuses");
  const q = query(statusesRef, orderBy("createdAt", "desc"));

  return onSnapshot(
    q,
    (snapshot) => {
      const now = Date.now();
      const allStatuses: StatusItemData[] = [];

      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as StatusItemData;
        // Filter out expired updates (> 24 hours)
        if (data.expiresAt && data.expiresAt > now) {
          allStatuses.push({
            ...data,
            id: docSnap.id,
          });
        }
      });

      // Group by authorAnonId
      const groupsMap: Record<string, StatusItemData[]> = {};
      allStatuses.forEach((st) => {
        if (!groupsMap[st.authorAnonId]) {
          groupsMap[st.authorAnonId] = [];
        }
        groupsMap[st.authorAnonId].push(st);
      });

      let myGroup: UserStatusGroup | null = null;
      const otherGroups: UserStatusGroup[] = [];

      Object.entries(groupsMap).forEach(([anonId, items]) => {
        // Sort items oldest to newest within user's story
        items.sort((a, b) => a.createdAt - b.createdAt);
        const latest = items[items.length - 1];
        const hasUnviewed = items.some((item) => !item.viewers?.includes(currentViewerAnonId));

        const group: UserStatusGroup = {
          anonId,
          name: latest.authorName || anonId,
          avatar: latest.authorAvatar || "👤",
          isVerified: latest.isAuthorVerified,
          items,
          latestTimestamp: latest.createdAt,
          hasUnviewed,
        };

        if (anonId === currentViewerAnonId) {
          myGroup = group;
        } else {
          otherGroups.push(group);
        }
      });

      // Sort other groups: unviewed first, then by latest timestamp
      otherGroups.sort((a, b) => {
        if (a.hasUnviewed && !b.hasUnviewed) return -1;
        if (!a.hasUnviewed && b.hasUnviewed) return 1;
        return b.latestTimestamp - a.latestTimestamp;
      });

      onUpdate(otherGroups, myGroup);
    },
    (err) => {
      console.warn("Status subscription listener:", err);
      onUpdate([], null);
    }
  );
}
