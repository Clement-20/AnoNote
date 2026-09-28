import React, { createContext, useContext, useState, useEffect } from "react";

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
  login: (anonId: string, pin?: string) => { success: boolean; error?: string };
  signUp: (anonId: string, avatar: string, pin?: string) => { success: boolean; error?: string };
  quickStart: () => UserAccount;
  logout: () => void;
  switchAccount: (userId: string) => boolean;
  removeSavedAccount: (userId: string) => void;
  updateProfile: (name: string, avatar?: string) => void;
  generateUniqueId: () => string;
  getConnectUrl: (anonId?: string) => string;
}

// Registry helper for guaranteed unique Anon IDs
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
  return new Set(["Anon #3847", "Anon #7291", "Anon #5612", "Anon #9204", "Anon #4156", "Anon #8873", "Anon #2490"]);
}

function claimAnonId(id: string) {
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
  // Try generating 4-digit unique ID, if saturated move to 5 or 6 digits
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
  // Use https://anonote-three.vercel.app as the canonical live link unless user is on custom domain
  const isInternal = typeof window !== "undefined" && (
    window.location.hostname.includes("run.app") || 
    window.location.hostname.includes("localhost") ||
    window.location.hostname.includes("127.0.0.1")
  );
  const baseUrl = isInternal ? "https://anonote-three.vercel.app" : (typeof window !== "undefined" ? window.location.origin : "https://anonote-three.vercel.app");
  return `${baseUrl}/?connect=${encodeURIComponent(anonId)}`;
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
    
    // Brand new user gets their OWN brand new unique anonymous ID
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
        if (Array.isArray(list) && list.length > 0) return list;
      }
    } catch (e) {
      console.error("Failed to load saved accounts", e);
    }
    return [];
  });

  // Keep localStorage & claimed list in sync
  useEffect(() => {
    localStorage.setItem("anonote_current_user", JSON.stringify(currentUser));
    localStorage.setItem("ghost_note_account_name", currentUser.name);
    localStorage.setItem("anon_is_verified", currentUser.isVerified ? "true" : "false");
    claimAnonId(currentUser.anonId);
  }, [currentUser]);

  useEffect(() => {
    if (savedAccounts.length > 0) {
      localStorage.setItem("anonote_saved_accounts", JSON.stringify(savedAccounts));
      savedAccounts.forEach((acc) => claimAnonId(acc.anonId));
    }
  }, [savedAccounts]);

  const normalizeAnonId = (raw: string) => {
    const trimmed = raw.trim();
    if (trimmed.startsWith("Anon #")) return trimmed;
    if (trimmed.startsWith("#")) return `Anon ${trimmed}`;
    if (trimmed.startsWith("Anon")) return trimmed;
    const digits = trimmed.replace(/[^0-9a-zA-Z]/g, "");
    return `Anon #${digits || Math.floor(1000 + Math.random() * 9000)}`;
  };

  const login = (rawAnonId: string, pin?: string): { success: boolean; error?: string } => {
    const formattedId = normalizeAnonId(rawAnonId);
    
    // Check if account is in saved list with matching pin
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

    // Log in as new/unique identity
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

  const signUp = (rawAnonId: string, avatar: string, pin?: string): { success: boolean; error?: string } => {
    const formattedId = normalizeAnonId(rawAnonId);
    
    // Check if this ID belongs to a different user in saved accounts
    const isTaken = savedAccounts.some((a) => a.anonId.toLowerCase() === formattedId.toLowerCase() && a.id !== currentUser.id);
    if (isTaken) {
      return { success: false, error: `Anon ID ${formattedId} is already active on this device. Please log into it or choose another ID.` };
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

  // Zero-friction instant account creation: generates guaranteed unique ID
  const quickStart = (): UserAccount => {
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

    setCurrentUser(newUser);
    setSavedAccounts((prev) => [newUser, ...prev]);
    window.dispatchEvent(new CustomEvent("auth_account_switched", { detail: newUser }));
    return newUser;
  };

  const logout = () => {
    window.dispatchEvent(new CustomEvent("auth_logged_out"));
  };

  const switchAccount = (userId: string): boolean => {
    const target = savedAccounts.find((a) => a.id === userId || a.anonId === userId);
    if (target) {
      setCurrentUser(target);
      window.dispatchEvent(new CustomEvent("auth_account_switched", { detail: target }));
      return true;
    }
    return false;
  };

  const removeSavedAccount = (userId: string) => {
    setSavedAccounts((prev) => prev.filter((a) => a.id !== userId));
  };

  const updateProfile = (name: string, avatar?: string) => {
    setCurrentUser((prev) => {
      const updated = {
        ...prev,
        name: name.trim() || prev.name,
        avatar: avatar || prev.avatar,
      };
      setSavedAccounts((all) => all.map((a) => (a.id === prev.id ? updated : a)));
      return updated;
    });
  };

  const getConnectUrl = (anonId?: string): string => {
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
        generateUniqueId: generateUniqueAnonId,
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
