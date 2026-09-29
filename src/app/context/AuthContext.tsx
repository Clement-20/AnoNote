import React, { createContext, useContext, useState, useEffect } from "react";
import { syncUserToFirestore, isAnonIdRegistered, updateUserPresence } from "../services/chatService";

export interface UserAccount {
  id: string;
  anonId: string;
  name: string;
  avatar: string;
  pin?: string;
  isVerified: boolean;
  createdAt: string;
}

interface AuthContextType {
  currentUser: UserAccount;
  savedAccounts: UserAccount[];
  login: (anonId: string, pin?: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (anonId: string, avatar: string, pin?: string) => Promise<{ success: boolean; error?: string }>;
  quickStart: () => Promise<UserAccount>;
  logout: () => void;
  switchAccount: (userId: string) => boolean;
  removeSavedAccount: (userId: string) => void;
  updateProfile: (name: string, avatar?: string) => void;
  generateUniqueId: () => string;
  getConnectUrl: (anonId?: string) => string;
}

const CLAIMED_IDS_KEY = "anonote_claimed_anon_ids";

function getClaimedIds(): Set<string> {
  try {
    const raw = localStorage.getItem(CLAIMED_IDS_KEY);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) return new Set(arr);
    }
  } catch (e) {
    console.error(e);
  }
  return new Set();
}

export function claimAnonId(id: string) {
  const claimed = getClaimedIds();
  claimed.add(id);
  try {
    localStorage.setItem(CLAIMED_IDS_KEY, JSON.stringify(Array.from(claimed)));
  } catch (e) {
    console.error(e);
  }
}

export function generateUniqueAnonId(): string {
  const claimed = getClaimedIds();
  for (let i = 0; i < 500; i++) {
    const num = Math.floor(1000 + Math.random() * 9000);
    const candidate = `Anon #${num}`;
    if (!claimed.has(candidate)) {
      claimAnonId(candidate);
      return candidate;
    }
  }
  const fallback = `Anon #${Math.floor(10000 + Math.random() * 90000)}`;
  claimAnonId(fallback);
  return fallback;
}

export function getShareConnectUrl(anonId: string): string {
  if (typeof window !== "undefined" && window.location.origin) {
    const origin = window.location.origin;
    if (origin.includes("run.app") || origin.includes("localhost") || origin.includes("127.0.0.1")) {
      return `https://anonote-three.vercel.app/?connect=${encodeURIComponent(anonId)}`;
    }
    return `${origin}/?connect=${encodeURIComponent(anonId)}`;
  }
  return `https://anonote-three.vercel.app/?connect=${encodeURIComponent(anonId)}`;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserAccount>(() => {
    try {
      const saved = localStorage.getItem("anonote_current_user");
      if (saved) return JSON.parse(saved);
      
      const legacyName = localStorage.getItem("ghost_note_account_name");
      if (legacyName) {
        claimAnonId(legacyName);
        return {
          id: `u_${Date.now()}`,
          anonId: legacyName,
          name: legacyName,
          avatar: "🎭",
          isVerified: localStorage.getItem("anon_is_verified") === "true",
          createdAt: new Date().toISOString(),
        };
      }
    } catch (e) {
      console.error("Failed to load user from localStorage", e);
    }
    
    // Brand new real user gets unique anonymous ID
    const uniqueId = generateUniqueAnonId();
    const avatars = ["🎭", "🕶️", "👤", "🌑", "💭", "🔮", "🎪", "🌙", "✨", "🛡️"];
    const randomAvatar = avatars[Math.floor(Math.random() * avatars.length)];
    
    const newUser: UserAccount = {
      id: `u_${Date.now()}`,
      anonId: uniqueId,
      name: uniqueId,
      avatar: randomAvatar,
      isVerified: false,
      createdAt: new Date().toISOString(),
    };
    return newUser;
  });

  const [savedAccounts, setSavedAccounts] = useState<UserAccount[]>(() => {
    try {
      const saved = localStorage.getItem("anonote_saved_accounts");
      if (saved) {
        const list = JSON.parse(saved);
        if (Array.isArray(list)) {
          const map = new Map<string, UserAccount>();
          list.forEach((acc) => {
            const key = acc.id || acc.anonId;
            if (key && !map.has(key)) {
              map.set(key, acc);
            }
          });
          return Array.from(map.values());
        }
      }
    } catch (e) {
      console.error("Failed to load saved accounts", e);
    }
    return [];
  });

  // Sync with Firestore & localStorage
  useEffect(() => {
    localStorage.setItem("anonote_current_user", JSON.stringify(currentUser));
    localStorage.setItem("ghost_note_account_name", currentUser.name);
    localStorage.setItem("anon_is_verified", currentUser.isVerified ? "true" : "false");
    claimAnonId(currentUser.anonId);
    syncUserToFirestore(currentUser);
  }, [currentUser]);

  // Presence heartbeat and visibility/disconnect listeners
  useEffect(() => {
    if (!currentUser?.anonId) return;

    // Immediately mark current user online
    updateUserPresence(currentUser.anonId, true);

    const heartbeat = setInterval(() => {
      if (typeof document !== "undefined" && document.visibilityState === "visible" && navigator.onLine) {
        updateUserPresence(currentUser.anonId, true);
      }
    }, 35000);

    const handleOnline = () => updateUserPresence(currentUser.anonId, true);
    const handleOffline = () => updateUserPresence(currentUser.anonId, false);
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        updateUserPresence(currentUser.anonId, true);
      } else {
        updateUserPresence(currentUser.anonId, false);
      }
    };
    const handleBeforeUnload = () => {
      updateUserPresence(currentUser.anonId, false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      clearInterval(heartbeat);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [currentUser?.anonId]);

  useEffect(() => {
    localStorage.setItem("anonote_saved_accounts", JSON.stringify(savedAccounts));
    savedAccounts.forEach((acc) => claimAnonId(acc.anonId));
  }, [savedAccounts]);

  const normalizeAnonId = (raw: string) => {
    const trimmed = raw.trim();
    if (trimmed.startsWith("Anon #")) return trimmed;
    if (trimmed.startsWith("#")) return `Anon ${trimmed}`;
    if (trimmed.startsWith("Anon")) return trimmed;
    const digits = trimmed.replace(/[^0-9a-zA-Z]/g, "");
    return `Anon #${digits || Math.floor(1000 + Math.random() * 9000)}`;
  };

  const login = async (rawAnonId: string, pin?: string): Promise<{ success: boolean; error?: string }> => {
    const formattedId = normalizeAnonId(rawAnonId);
    
    const existing = savedAccounts.find(
      (a) => a.anonId.toLowerCase() === formattedId.toLowerCase() || a.name.toLowerCase() === formattedId.toLowerCase()
    );

    if (existing) {
      if (existing.pin && pin && existing.pin !== pin) {
        return { success: false, error: "Incorrect Security PIN. Please verify." };
      }
      setCurrentUser(existing);
      window.dispatchEvent(new CustomEvent("auth_account_switched", { detail: existing }));
      return { success: true };
    }

    claimAnonId(formattedId);
    const newUser: UserAccount = {
      id: `u_${Date.now()}`,
      anonId: formattedId,
      name: formattedId,
      avatar: "🎭",
      pin,
      isVerified: false,
      createdAt: new Date().toISOString(),
    };

    setCurrentUser(newUser);
    setSavedAccounts((prev) => [newUser, ...prev.filter((a) => a.anonId !== formattedId)]);
    window.dispatchEvent(new CustomEvent("auth_account_switched", { detail: newUser }));
    return { success: true };
  };

  const signUp = async (rawAnonId: string, avatar: string, pin?: string): Promise<{ success: boolean; error?: string }> => {
    const formattedId = normalizeAnonId(rawAnonId);
    
    // 1. Check local saved accounts
    const isTakenLocally = savedAccounts.some((a) => a.anonId.toLowerCase() === formattedId.toLowerCase() && a.id !== currentUser.id);
    if (isTakenLocally) {
      return { success: false, error: `Anon ID "${formattedId}" is already active on this device. Please log in or generate another ID.` };
    }

    // 2. Enforce strict uniqueness in cloud database across all users
    const isTakenInCloud = await isAnonIdRegistered(formattedId, currentUser.id);
    if (isTakenInCloud) {
      return {
        success: false,
        error: `Anon ID "${formattedId}" is already taken by another user on the network. Once taken, another user cannot use it. Please choose or generate another ID.`,
      };
    }

    claimAnonId(formattedId);
    const newUser: UserAccount = {
      id: `u_${Date.now()}`,
      anonId: formattedId,
      name: formattedId,
      avatar: avatar || "🎭",
      pin,
      isVerified: false,
      createdAt: new Date().toISOString(),
    };

    setCurrentUser(newUser);
    setSavedAccounts((prev) => [newUser, ...prev.filter((a) => a.anonId !== formattedId)]);
    window.dispatchEvent(new CustomEvent("auth_account_switched", { detail: newUser }));
    return { success: true };
  };

  const quickStart = async (): Promise<UserAccount> => {
    let candidate = generateUniqueAnonId();
    // Verify candidate is free in cloud
    let attempts = 0;
    while (attempts < 10) {
      const taken = await isAnonIdRegistered(candidate);
      if (!taken) break;
      candidate = generateUniqueAnonId();
      attempts++;
    }

    const avatars = ["🎭", "🕶️", "👤", "🌑", "💭", "🔮", "🎪", "🌙", "✨", "🛡️"];
    const randomAvatar = avatars[Math.floor(Math.random() * avatars.length)];

    const newUser: UserAccount = {
      id: `u_${Date.now()}`,
      anonId: candidate,
      name: candidate,
      avatar: randomAvatar,
      isVerified: false,
      createdAt: new Date().toISOString(),
    };

    claimAnonId(candidate);
    setCurrentUser(newUser);
    setSavedAccounts((prev) => [newUser, ...prev.filter((a) => a.anonId !== candidate)]);
    window.dispatchEvent(new CustomEvent("auth_account_switched", { detail: newUser }));
    return newUser;
  };

  const logout = () => {
    const nextAccount = savedAccounts.find((a) => a.id !== currentUser.id);
    if (nextAccount) {
      setCurrentUser(nextAccount);
    } else {
      const brandNewUser: UserAccount = {
        id: `u_${Date.now()}`,
        anonId: generateUniqueAnonId(),
        name: `Anon #${Math.floor(1000 + Math.random() * 9000)}`,
        avatar: "👤",
        isVerified: false,
        createdAt: new Date().toISOString(),
      };
      setCurrentUser(brandNewUser);
    }
  };

  const switchAccount = (userId: string): boolean => {
    const target = savedAccounts.find((a) => a.id === userId);
    if (target) {
      setCurrentUser(target);
      window.dispatchEvent(new CustomEvent("auth_account_switched", { detail: target }));
      return true;
    }
    return false;
  };

  const removeSavedAccount = (userId: string) => {
    setSavedAccounts((prev) => prev.filter((a) => a.id !== userId));
    if (currentUser.id === userId) {
      logout();
    }
  };

  const updateProfile = (name: string, avatar?: string) => {
    setCurrentUser((prev) => ({
      ...prev,
      name: name || prev.name,
      avatar: avatar || prev.avatar,
    }));
  };

  const generateUniqueId = () => {
    return generateUniqueAnonId();
  };

  const getConnectUrl = (anonId?: string) => {
    return getShareConnectUrl(anonId || currentUser.anonId);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        savedAccounts,
        login,
        signUp,
        quickStart,
        logout,
        switchAccount,
        removeSavedAccount,
        updateProfile,
        generateUniqueId,
        getConnectUrl,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
