export interface User {
  id: string;
  anonId: string; // e.g. "Anon-4821-X9"
  name: string;
  about: string;
  avatar: string;
  publicKey: string;
  online: boolean;
  lastSeen?: string;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: number;
  status: 'sent' | 'delivered' | 'read';
  mediaUrl?: string;
  mediaType?: 'image' | 'audio' | 'file';
  replyTo?: {
    id: string;
    text: string;
    senderName: string;
  };
  reactions?: { [emoji: string]: string[] }; // emoji -> array of userIds
  isEncrypted?: boolean;
}

export interface Chat {
  id: string;
  isGroup: boolean;
  name?: string;
  avatar?: string;
  participants: User[];
  lastMessage?: Message;
  unreadCount: number;
  pinned?: boolean;
  archived?: boolean;
}

export interface StatusStory {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  mediaUrl: string;
  caption: string;
  timestamp: number;
  viewed: boolean;
}

export interface CallRecord {
  id: string;
  chatId: string;
  callerId: string;
  callerName: string;
  callerAvatar: string;
  type: 'voice' | 'video';
  direction: 'incoming' | 'outgoing' | 'missed';
  timestamp: number;
  duration?: number;
}
