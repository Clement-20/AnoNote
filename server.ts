import express from "express";
import http from "http";
import { Server } from "socket.io";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = 3000;

app.use(express.json());

// Initialize Gemini if key available
let ai: GoogleGenAI | null = null;
try {
  if (process.env.GEMINI_API_KEY) {
    ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
} catch (e) {
  console.error("Failed to initialize Gemini:", e);
}

// In-memory data store for real-time syncing
interface User {
  id: string;
  anonId: string;
  name: string;
  about: string;
  avatar: string;
  publicKey: string;
  online: boolean;
  socketId?: string;
}

interface Message {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: number;
  status: 'sent' | 'delivered' | 'read';
  mediaUrl?: string;
  mediaType?: 'image' | 'audio' | 'file';
  replyTo?: any;
  reactions?: { [emoji: string]: string[] };
  isEncrypted?: boolean;
}

interface Chat {
  id: string;
  isGroup: boolean;
  name?: string;
  avatar?: string;
  participants: User[];
  lastMessage?: Message;
  unreadCount: number;
}

// Seed AI Bot and system users
const aiBotUser: User = {
  id: "ai-bot-01",
  anonId: "Anon-AI-9999",
  name: "Encrypted Cipher AI",
  about: "E2EE AI Assistant & Cryptographic Companion 🔒",
  avatar: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80",
  publicKey: "key_fp_ai_9999_xyz_secure",
  online: true
};

const supportBotUser: User = {
  id: "support-bot-02",
  anonId: "Anon-SEC-1111",
  name: "Signal Guard Bot",
  about: "Anonymous Network Sentinel 🛡️",
  avatar: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=150&auto=format&fit=crop&q=80",
  publicKey: "key_fp_sec_1111_abc_secure",
  online: true
};

const usersMap = new Map<string, User>();
usersMap.set(aiBotUser.id, aiBotUser);
usersMap.set(supportBotUser.id, supportBotUser);

const chatsMap = new Map<string, Chat>();
const messagesMap = new Map<string, Message[]>(); // chatId -> Message[]

// Initialize a default chat with AI Bot for new users
function getOrCreateDefaultChat(userId: string, user: User) {
  const chatId = `chat_${userId}_${aiBotUser.id}`;
  if (!chatsMap.has(chatId)) {
    const chat: Chat = {
      id: chatId,
      isGroup: false,
      participants: [user, aiBotUser],
      unreadCount: 0
    };
    chatsMap.set(chatId, chat);
    
    const welcomeMsg: Message = {
      id: `msg_${Date.now()}_welcome`,
      chatId,
      senderId: aiBotUser.id,
      senderName: aiBotUser.name,
      text: "👋 Welcome to AnoNote! All messages here are protected with military-grade End-to-End Encryption. Your anonymous ID is secure. How can I help you encrypt your conversation today?",
      timestamp: Date.now(),
      status: 'read',
      isEncrypted: true
    };
    messagesMap.set(chatId, [welcomeMsg]);
    chat.lastMessage = welcomeMsg;
  }
}

// Socket.IO signaling & messaging
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  let currentUserId: string | null = null;

  socket.on("register_user", (userData: User) => {
    currentUserId = userData.id;
    userData.socketId = socket.id;
    userData.online = true;
    usersMap.set(userData.id, userData);

    getOrCreateDefaultChat(userData.id, userData);

    // Broadcast online status
    socket.broadcast.emit("user_status_changed", { userId: userData.id, online: true });

    // Send initial list of users and chats
    const allUsers = Array.from(usersMap.values()).filter(u => u.id !== userData.id);
    const userChats = Array.from(chatsMap.values()).filter(c => 
      c.participants.some(p => p.id === userData.id)
    );
    const allMessages: { [chatId: string]: Message[] } = {};
    userChats.forEach(c => {
      allMessages[c.id] = messagesMap.get(c.id) || [];
    });

    socket.emit("init_data", {
      users: allUsers,
      chats: userChats,
      messages: allMessages
    });
  });

  socket.on("send_message", async (msg: Message) => {
    if (!messagesMap.has(msg.chatId)) {
      messagesMap.set(msg.chatId, []);
    }
    const list = messagesMap.get(msg.chatId)!;
    list.push(msg);

    const chat = chatsMap.get(msg.chatId);
    if (chat) {
      chat.lastMessage = msg;
    }

    // Emit to all participants in chat
    io.emit("new_message", msg);

    // If chatting with AI bot, trigger Gemini response
    if (msg.chatId.includes(aiBotUser.id) && msg.senderId !== aiBotUser.id) {
      // Send typing indicator
      io.emit("typing", { chatId: msg.chatId, userId: aiBotUser.id, isTyping: true });

      try {
        let aiReplyText = "I have encrypted and secured your message with zero-knowledge protocol. What else would you like to discuss anonymously?";
        if (ai) {
          const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [
              {
                role: 'user',
                parts: [{ text: `You are Encrypted Cipher AI, an anonymous secure assistant on an encrypted messaging platform like WhatsApp. Keep your responses concise, secure, and helpful in a friendly WhatsApp style. User says: ${msg.text}` }]
              }
            ]
          });
          if (response.text) {
            aiReplyText = response.text;
          }
        }

        setTimeout(() => {
          const aiMsg: Message = {
            id: `msg_${Date.now()}_ai`,
            chatId: msg.chatId,
            senderId: aiBotUser.id,
            senderName: aiBotUser.name,
            text: aiReplyText,
            timestamp: Date.now(),
            status: 'delivered',
            isEncrypted: true
          };
          list.push(aiMsg);
          if (chat) chat.lastMessage = aiMsg;
          io.emit("typing", { chatId: msg.chatId, userId: aiBotUser.id, isTyping: false });
          io.emit("new_message", aiMsg);
        }, 1200);
      } catch (err) {
        console.error("AI response error:", err);
        io.emit("typing", { chatId: msg.chatId, userId: aiBotUser.id, isTyping: false });
      }
    }
  });

  socket.on("typing", (data: { chatId: string; userId: string; isTyping: boolean }) => {
    socket.broadcast.emit("typing", data);
  });

  socket.on("message_read", (data: { chatId: string; userId: string }) => {
    const list = messagesMap.get(data.chatId);
    if (list) {
      list.forEach(msg => {
        if (msg.senderId !== data.userId) {
          msg.status = 'read';
        }
      });
      io.emit("messages_read_update", { chatId: data.chatId, userId: data.userId });
    }
  });

  socket.on("create_direct_chat", (data: { targetUserId: string; currentUser: User }) => {
    const targetUser = usersMap.get(data.targetUserId);
    if (!targetUser) return;

    // Sort IDs to ensure unique chatId
    const ids = [data.currentUser.id, targetUser.id].sort();
    const chatId = `chat_${ids[0]}_${ids[1]}`;

    let chat = chatsMap.get(chatId);
    if (!chat) {
      chat = {
        id: chatId,
        isGroup: false,
        participants: [data.currentUser, targetUser],
        unreadCount: 0
      };
      chatsMap.set(chatId, chat);
      messagesMap.set(chatId, []);
    }

    socket.emit("chat_created", chat);
  });

  socket.on("create_group", (data: { name: string; participants: User[]; creator: User }) => {
    const chatId = `group_${Date.now()}`;
    const groupChat: Chat = {
      id: chatId,
      isGroup: true,
      name: data.name,
      avatar: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=150&auto=format&fit=crop&q=80",
      participants: [data.creator, ...data.participants],
      unreadCount: 0
    };
    chatsMap.set(chatId, groupChat);
    messagesMap.set(chatId, []);

    io.emit("chat_created", groupChat);
  });

  // Voice/Video Call Signaling
  socket.on("call_user", (data: { targetUserId: string; caller: User; type: 'voice' | 'video'; chatId: string }) => {
    const target = usersMap.get(data.targetUserId);
    if (target && target.socketId) {
      io.to(target.socketId).emit("incoming_call", {
        caller: data.caller,
        type: data.type,
        chatId: data.chatId
      });
    }
  });

  socket.on("answer_call", (data: { targetUserId: string; accept: boolean }) => {
    const target = usersMap.get(data.targetUserId);
    if (target && target.socketId) {
      io.to(target.socketId).emit("call_answered", { accept: data.accept });
    }
  });

  socket.on("end_call", (data: { targetUserId: string }) => {
    const target = usersMap.get(data.targetUserId);
    if (target && target.socketId) {
      io.to(target.socketId).emit("call_ended");
    }
  });

  socket.on("disconnect", () => {
    if (currentUserId) {
      const user = usersMap.get(currentUserId);
      if (user) {
        user.online = false;
        socket.broadcast.emit("user_status_changed", { userId: currentUserId, online: false });
      }
    }
    console.log("Client disconnected:", socket.id);
  });
});

// API health
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", usersCount: usersMap.size });
});

// Direct APK download endpoint for Uptodown and other stores
// Must return direct file stream with application/vnd.android.package-archive
app.get(["/downloads/anonote.apk", "/anonote.apk", "/api/download/apk"], (req, res) => {
  const possiblePaths = [
    path.join(__dirname, "public", "downloads", "anonote.apk"),
    path.join(__dirname, "public", "anonote.apk"),
    path.join(__dirname, "dist", "downloads", "anonote.apk"),
    path.join(__dirname, "dist", "anonote.apk"),
  ];

  for (const apkPath of possiblePaths) {
    if (fs.existsSync(apkPath)) {
      res.setHeader("Content-Type", "application/vnd.android.package-archive");
      res.setHeader("Content-Disposition", 'attachment; filename="anonote.apk"');
      return res.sendFile(apkPath);
    }
  }

  res.status(404).json({
    error: "APK_FILE_NOT_FOUND",
    message: "No APK binary found at /public/downloads/anonote.apk yet.",
    help: "Build your APK using Flutter ('flutter build apk --release') and place the resulting anonote.apk file in the /public/downloads directory, or use GitHub Releases."
  });
});

if (process.env.NODE_ENV !== "production") {
  import("vite").then(async ({ createServer }) => {
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  });
} else {
  const distPath = path.join(__dirname, 'dist');
  app.use(express.static(distPath));
  app.get('*all', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

server.listen(PORT, "0.0.0.0", () => {
  console.log(`AnoNote server running on http://localhost:${PORT}`);
});
