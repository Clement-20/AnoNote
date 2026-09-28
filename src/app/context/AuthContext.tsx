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
}

const DEFAULT_USER: UserAccount = {
  id: "me",
  anonId: "Anon #8462",
  name: "Anon #8462",
  avatar: "🎭",
  pin: "123456",
  isVerified: true,
  createdAt: "2026-01-15T00:00:00.000Z",
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserAccount>(() => {
    try {
      const saved = localStorage.getItem("anonote_current_user");
      if (saved) return JSON.parse(saved);
      
      const legacyName = localStorage.getItem("ghost_note_account_name");
      if (legacyName) {
        return {
          ...DEFAULT_USER,
          name: legacyName,
          anonId: legacyName,
          isVerified: localStorage.getItem("anon_is_verified") === "true",
        };
      }
    } catch (e) {
      console.error("Failed to load user from localStorage", e);
    }
    return DEFAULT_USER;
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
    return [
      DEFAULT_USER,
      {
        id: "anon_3847",
        anonId: "Anon #3847",
        name: "Anon #3847",
        avatar: "👤",
        isVerified: true,
        createdAt: "2026-01-12T00:00:00.000Z",
      },
      {
        id: "anon_7291",
        anonId: "Anon #7291",
        name: "Anon #7291",
        avatar: "🕶️",
        isVerified: true,
        createdAt: "2026-01-14T00:00:00.000Z",
      },
    ];
  });

  // Keep localStorage in sync
  useEffect(() => {
    localStorage.setItem("anonote_current_user", JSON.stringify(currentUser));
    localStorage.setItem("ghost_note_account_name", currentUser.name);
    localStorage.setItem("anon_is_verified", currentUser.isVerified ? "true" : "false");
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem("anonote_saved_accounts", JSON.stringify(savedAccounts));
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

    // If not in saved, log in as new/verified identity seamlessly
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

  // Zero-friction instant account creation: 1-click identity setup
  const quickStart = (): UserAccount => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const avatars = ["🎭", "🕶️", "👤", "🌑", "💭", "🔮", "🎪", "🌙", "✨", "🛡️"];
    const randomAvatar = avatars[Math.floor(Math.random() * avatars.length)];
    const anonId = `Anon #${randomNum}`;

    const newUser: UserAccount = {
      id: `u_${Date.now()}`,
      anonId,
      name: anonId,
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
    // Retain saved accounts so user can log right back in without friction
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
