import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router";
import {
  ShieldAlert,
  Users,
  BadgeCheck,
  Ban,
  Flag,
  Radio,
  Search,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ArrowLeft,
  Lock,
  Download,
  Trash2,
  Send,
  Eye,
  RefreshCw,
  Key,
  ShieldCheck,
  Check,
} from "lucide-react";
import { VerifiedBadge } from "./VerifiedBadge";
import { publishBroadcast as firestorePublishBroadcast, clearBroadcast as firestoreClearBroadcast, subscribeToBroadcast } from "../services/chatService";

interface AnonUserRecord {
  id: string;
  name: string;
  avatar: string;
  anonId: string;
  publicKey: string;
  status: "active" | "suspended" | "banned";
  isVerified: boolean;
  joinedDate: string;
  reportCount: number;
}

interface AbuseReport {
  id: string;
  targetUser: string;
  reason: string;
  timestamp: string;
  status: "pending" | "resolved" | "dismissed";
}

const DEFAULT_USERS: AnonUserRecord[] = [
  {
    id: "1",
    name: "Anon #3847",
    avatar: "👤",
    anonId: "#3847",
    publicKey: "0x8f2a...c491",
    status: "active",
    isVerified: true,
    joinedDate: "Jan 12, 2026",
    reportCount: 0,
  },
  {
    id: "2",
    name: "Anon #7291",
    avatar: "🕶️",
    anonId: "#7291",
    publicKey: "0x1e9b...724a",
    status: "active",
    isVerified: true,
    joinedDate: "Jan 14, 2026",
    reportCount: 0,
  },
  {
    id: "3",
    name: "Anon #5612",
    avatar: "🎭",
    anonId: "#5612",
    publicKey: "0x77d1...99bc",
    status: "active",
    isVerified: false,
    joinedDate: "Feb 01, 2026",
    reportCount: 1,
  },
  {
    id: "4",
    name: "Anon #9204",
    avatar: "👤",
    anonId: "#9204",
    publicKey: "0x44ac...3321",
    status: "active",
    isVerified: false,
    joinedDate: "Feb 10, 2026",
    reportCount: 0,
  },
  {
    id: "5",
    name: "Anon #4156",
    avatar: "🌑",
    anonId: "#4156",
    publicKey: "0x00f3...ee12",
    status: "active",
    isVerified: false,
    joinedDate: "Feb 18, 2026",
    reportCount: 0,
  },
  {
    id: "6",
    name: "Anon #8873",
    avatar: "💭",
    anonId: "#8873",
    publicKey: "0x33aa...5120",
    status: "active",
    isVerified: false,
    joinedDate: "Feb 22, 2026",
    reportCount: 0,
  },
  {
    id: "7",
    name: "Anon #2490",
    avatar: "🔮",
    anonId: "#2490",
    publicKey: "0x99cc...2041",
    status: "active",
    isVerified: true,
    joinedDate: "Mar 01, 2026",
    reportCount: 0,
  },
  {
    id: "me",
    name: "Anon #8462 (You)",
    avatar: "🎭",
    anonId: "#8462",
    publicKey: "0xbb71...8462",
    status: "active",
    isVerified: true,
    joinedDate: "Jan 15, 2026",
    reportCount: 0,
  },
];

const DEFAULT_REPORTS: AbuseReport[] = [
  {
    id: "rep_1",
    targetUser: "Anon #5612",
    reason: "Spam or unsolicited messages",
    timestamp: "Yesterday, 4:15 PM",
    status: "pending",
  },
];

export function AdminConsole() {
  const navigate = useNavigate();

  // Master passcode gate
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem("anonote_admin_auth") === "true";
  });
  const [passcodeInput, setPasscodeInput] = useState("");
  const [passcodeError, setPasscodeError] = useState(false);

  // Tab navigation: 'overview' | 'users' | 'reports' | 'broadcast'
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "reports" | "broadcast">("overview");

  // Users state
  const [users, setUsers] = useState<AnonUserRecord[]>(() => {
    const saved = localStorage.getItem("anonote_admin_users");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEFAULT_USERS;
      }
    }
    return DEFAULT_USERS;
  });

  // Reports state
  const [reports, setReports] = useState<AbuseReport[]>(() => {
    const saved = localStorage.getItem("anonote_admin_reports");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEFAULT_REPORTS;
      }
    }
    return DEFAULT_REPORTS;
  });

  // Broadcast state
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [activeBroadcast, setActiveBroadcast] = useState("");

  useEffect(() => {
    const unsubscribe = subscribeToBroadcast((msg) => {
      setActiveBroadcast(msg);
    });
    return () => unsubscribe();
  }, []);

  // Search & filter
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "suspended" | "banned">("all");
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem("anonote_admin_users", JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem("anonote_admin_reports", JSON.stringify(reports));
  }, [reports]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Default master admin passcode: 'anoNote2026' or 'admin'
    if (passcodeInput.trim() === "anoNote2026" || passcodeInput.trim() === "admin") {
      setIsAuthenticated(true);
      sessionStorage.setItem("anonote_admin_auth", "true");
      setPasscodeError(false);
    } else {
      setPasscodeError(true);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("anonote_admin_auth");
    setIsAuthenticated(false);
  };

  // User moderation actions
  const handleToggleBan = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const nextStatus = u.status === "banned" ? "active" : "banned";
          showToast(`${u.name} is now ${nextStatus.toUpperCase()}`);
          return { ...u, status: nextStatus };
        }
        return u;
      })
    );
  };

  const handleToggleSuspend = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const nextStatus = u.status === "suspended" ? "active" : "suspended";
          showToast(`${u.name} is now ${nextStatus.toUpperCase()}`);
          return { ...u, status: nextStatus };
        }
        return u;
      })
    );
  };

  const handleToggleVerified = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const next = !u.isVerified;
          showToast(`Verified badge ${next ? "granted to" : "revoked from"} ${u.name}`);
          return { ...u, isVerified: next };
        }
        return u;
      })
    );
  };

  // Report resolution actions
  const handleResolveReport = (reportId: string, action: "ban" | "dismiss") => {
    const report = reports.find((r) => r.id === reportId);
    if (!report) return;

    if (action === "ban") {
      setUsers((prev) =>
        prev.map((u) => (u.name.includes(report.targetUser) ? { ...u, status: "banned" } : u))
      );
      showToast(`Banned reported user: ${report.targetUser}`);
    } else {
      showToast(`Dismissed report for: ${report.targetUser}`);
    }

    setReports((prev) =>
      prev.map((r) => (r.id === reportId ? { ...r, status: action === "ban" ? "resolved" : "dismissed" } : r))
    );
  };

  // Broadcast publish
  const handlePublishBroadcast = async () => {
    if (broadcastMessage.trim()) {
      await firestorePublishBroadcast(broadcastMessage.trim(), "Admin");
      showToast("Network announcement broadcasted!");
    }
  };

  const handleClearBroadcast = async () => {
    await firestoreClearBroadcast();
    setBroadcastMessage("");
    showToast("Announcement cleared.");
  };

  // Export audit report
  const handleExportData = () => {
    const payload = {
      exportTimestamp: new Date().toISOString(),
      network: "anoNote.icepab.name.ng",
      protocol: "Zero-Knowledge Anon Messenger",
      metrics: {
        totalAccounts: users.length,
        verifiedBadges: users.filter((u) => u.isVerified).length,
        bannedCount: users.filter((u) => u.status === "banned").length,
        pendingReports: reports.filter((r) => r.status === "pending").length,
      },
      userbaseRegistry: users,
      moderationReports: reports,
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `anoNote_userbase_audit_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Audit report exported as JSON.");
  };

  // Filtered users list
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.anonId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.publicKey.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || u.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Passcode gate view
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col h-screen bg-[#0a0a0a] items-center justify-center p-4">
        <div className="bg-[#1c1c1e] border border-purple-500/30 rounded-2xl w-full max-w-sm p-6 shadow-2xl text-center">
          <div className="w-14 h-14 mx-auto rounded-full bg-purple-600/20 border border-purple-500/40 flex items-center justify-center mb-4 text-purple-400">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-white text-xl font-bold">Admin & Moderation Console</h2>
          <p className="text-xs text-gray-400 mt-1 mb-6">
            Enter your owner passcode to manage and regulate anoNote
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                placeholder="Enter master passcode (e.g. anoNote2026)"
                value={passcodeInput}
                onChange={(e) => {
                  setPasscodeInput(e.target.value);
                  setPasscodeError(false);
                }}
                className="w-full bg-[#2c2c2e] border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 text-sm focus:outline-hidden focus:border-purple-500"
              />
              {passcodeError && (
                <p className="text-xs text-red-400 mt-2">
                  Incorrect master passcode. Default is <span className="font-mono text-white">anoNote2026</span>
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 rounded-xl transition-colors text-sm shadow-lg shadow-purple-600/30"
            >
              Access Console
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-gray-800 flex items-center justify-between text-xs text-gray-500">
            <Link to="/settings" className="hover:text-purple-400 flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to App
            </Link>
            <span>anoNote v2.0 Owner Tool</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#0a0a0a] text-white">
      {/* Toast Alert */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-purple-600 text-white px-4 py-2 rounded-xl text-xs font-medium shadow-xl animate-in fade-in slide-in-from-top-2">
          {toast}
        </div>
      )}

      {/* Header */}
      <header className="bg-[#1c1c1e] px-4 md:px-6 py-3.5 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/settings" className="text-purple-400 hover:text-purple-300">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-purple-400" />
            <div>
              <h1 className="text-base md:text-lg font-bold">anoNote Admin & Moderation Console</h1>
              <p className="text-[11px] text-gray-400 font-mono">anoNote.icepab.name.ng • Site Owner Access</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportData}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2c2c2e] hover:bg-[#3c3c3e] text-xs font-medium text-gray-300 rounded-lg transition-colors"
            title="Export JSON audit report"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export Audit</span>
          </button>
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 text-xs font-medium rounded-lg transition-colors border border-red-500/30"
          >
            Lock Console
          </button>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-[#141416] px-4 md:px-6 border-b border-gray-800 flex items-center gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-4 py-3 text-xs md:text-sm font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeTab === "overview"
              ? "border-purple-500 text-purple-400"
              : "border-transparent text-gray-400 hover:text-gray-200"
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          Metrics Overview
        </button>

        <button
          onClick={() => setActiveTab("users")}
          className={`px-4 py-3 text-xs md:text-sm font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeTab === "users"
              ? "border-purple-500 text-purple-400"
              : "border-transparent text-gray-400 hover:text-gray-200"
          }`}
        >
          <Users className="w-4 h-4" />
          Userbase & Identities ({users.length})
        </button>

        <button
          onClick={() => setActiveTab("reports")}
          className={`px-4 py-3 text-xs md:text-sm font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeTab === "reports"
              ? "border-purple-500 text-purple-400"
              : "border-transparent text-gray-400 hover:text-gray-200"
          }`}
        >
          <Flag className="w-4 h-4" />
          Abuse Moderation
          {reports.filter((r) => r.status === "pending").length > 0 && (
            <span className="w-5 h-5 bg-red-500 text-white rounded-full text-[10px] flex items-center justify-center font-bold">
              {reports.filter((r) => r.status === "pending").length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("broadcast")}
          className={`px-4 py-3 text-xs md:text-sm font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeTab === "broadcast"
              ? "border-purple-500 text-purple-400"
              : "border-transparent text-gray-400 hover:text-gray-200"
          }`}
        >
          <Radio className="w-4 h-4" />
          Network Broadcast
        </button>
      </div>

      {/* Main Body */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 max-w-6xl w-full mx-auto space-y-6">
        {/* TAB 1: OVERVIEW METRICS */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-[#1c1c1e] border border-gray-800 rounded-2xl p-4">
                <div className="flex items-center justify-between text-gray-400 text-xs mb-2">
                  <span>Registered Anons</span>
                  <Users className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-2xl font-bold text-white">{users.length}</div>
                <p className="text-[11px] text-gray-500 mt-1">
                  {users.filter((u) => u.status === "active").length} active accounts
                </p>
              </div>

              <div className="bg-[#1c1c1e] border border-gray-800 rounded-2xl p-4">
                <div className="flex items-center justify-between text-gray-400 text-xs mb-2">
                  <span>Verified Badges</span>
                  <BadgeCheck className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-2xl font-bold text-purple-400">
                  {users.filter((u) => u.isVerified).length}
                </div>
                <p className="text-[11px] text-gray-500 mt-1">Zero-knowledge attested</p>
              </div>

              <div className="bg-[#1c1c1e] border border-gray-800 rounded-2xl p-4">
                <div className="flex items-center justify-between text-gray-400 text-xs mb-2">
                  <span>Abuse Reports</span>
                  <Flag className="w-4 h-4 text-red-400" />
                </div>
                <div className="text-2xl font-bold text-white">
                  {reports.filter((r) => r.status === "pending").length}
                </div>
                <p className="text-[11px] text-red-400 mt-1">Needs moderation review</p>
              </div>

              <div className="bg-[#1c1c1e] border border-gray-800 rounded-2xl p-4">
                <div className="flex items-center justify-between text-gray-400 text-xs mb-2">
                  <span>Banned Entities</span>
                  <Ban className="w-4 h-4 text-orange-400" />
                </div>
                <div className="text-2xl font-bold text-white">
                  {users.filter((u) => u.status === "banned").length}
                </div>
                <p className="text-[11px] text-gray-500 mt-1">Network access revoked</p>
              </div>
            </div>

            {/* Quick regulation guide */}
            <div className="bg-gradient-to-r from-purple-900/20 to-indigo-900/20 border border-purple-500/30 rounded-2xl p-5">
              <h3 className="font-semibold text-sm text-purple-300 flex items-center gap-2 mb-2">
                <Key className="w-4 h-4" /> How Site Regulation Works on anoNote
              </h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                Because anoNote is built around strict zero-knowledge principles, messages are end-to-end encrypted and cannot be eavesdropped on the server. You regulate the platform at the <strong className="text-white">Identity & Network Layer</strong>:
              </p>
              <ul className="text-xs text-gray-300 space-y-1.5 mt-3 list-disc pl-5">
                <li><strong className="text-white">Banning/Suspending Anon IDs:</strong> Instantly prevents abusive or bot IDs from opening new conversations or connecting to peers.</li>
                <li><strong className="text-white">Verified Badges:</strong> Grant or revoke cryptographic trust badges for verified human participants.</li>
                <li><strong className="text-white">User-Reported Transcripts:</strong> When users report abuse in a chat, a cryptographic transcript snippet is forwarded to your Moderation Queue.</li>
                <li><strong className="text-white">Network Broadcasts:</strong> Push announcements to all connected devices without collecting user telemetry.</li>
              </ul>
            </div>

            {/* Recent Pending Reports Quick List */}
            <div className="bg-[#1c1c1e] border border-gray-800 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-semibold text-white">Pending Moderation Queue</h4>
                <button
                  onClick={() => setActiveTab("reports")}
                  className="text-xs text-purple-400 hover:underline"
                >
                  View all ({reports.length})
                </button>
              </div>

              {reports.filter((r) => r.status === "pending").length === 0 ? (
                <div className="text-center py-6 text-gray-500 text-xs">
                  <CheckCircle className="w-8 h-8 mx-auto text-emerald-500 mb-2 opacity-80" />
                  All reports are resolved. Network is clean.
                </div>
              ) : (
                <div className="space-y-3">
                  {reports
                    .filter((r) => r.status === "pending")
                    .map((report) => (
                      <div
                        key={report.id}
                        className="bg-[#2c2c2e]/60 border border-gray-800 rounded-xl p-3.5 flex items-center justify-between"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-white">{report.targetUser}</span>
                            <span className="text-[10px] px-2 py-0.5 bg-red-500/20 text-red-400 rounded-full border border-red-500/30">
                              Reported
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 mt-1">{report.reason}</p>
                          <span className="text-[10px] text-gray-500">{report.timestamp}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleResolveReport(report.id, "dismiss")}
                            className="px-2.5 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs rounded-lg transition-colors"
                          >
                            Dismiss
                          </button>
                          <button
                            onClick={() => handleResolveReport(report.id, "ban")}
                            className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded-lg transition-colors"
                          >
                            Ban Anon
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: USERBASE & IDENTITIES */}
        {activeTab === "users" && (
          <div className="space-y-4">
            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search by name, Anon #ID, or public key..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#1c1c1e] border border-gray-800 rounded-xl pl-9 pr-4 py-2.5 text-xs md:text-sm text-white placeholder-gray-500 outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
                {(["all", "active", "suspended", "banned"] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setStatusFilter(filter)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                      statusFilter === filter
                        ? "bg-purple-600 text-white"
                        : "bg-[#1c1c1e] text-gray-400 hover:text-white"
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            {/* Users Table / List */}
            <div className="bg-[#1c1c1e] border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs md:text-sm">
                  <thead className="bg-[#141416] text-gray-400 text-xs border-b border-gray-800">
                    <tr>
                      <th className="p-3.5">Anon User</th>
                      <th className="p-3.5">Anon ID & Key</th>
                      <th className="p-3.5">Verified</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5">Joined</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/80">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center p-6 text-gray-500">
                          No anonymous users found matching filter.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((user, idx) => (
                        <tr key={`${user.id}_${idx}`} className="hover:bg-[#252528] transition-colors">
                          <td className="p-3.5">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-sm">
                                {user.avatar}
                              </div>
                              <div>
                                <span className="font-medium text-white block">{user.name}</span>
                                {user.reportCount > 0 && (
                                  <span className="text-[10px] text-red-400 font-medium">
                                    {user.reportCount} abuse report
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          <td className="p-3.5 font-mono text-xs">
                            <div className="text-purple-400 font-semibold">{user.anonId}</div>
                            <div className="text-[10px] text-gray-500">{user.publicKey}</div>
                          </td>

                          <td className="p-3.5">
                            <button
                              onClick={() => handleToggleVerified(user.id)}
                              className="inline-flex items-center gap-1 hover:opacity-80 transition-opacity"
                              title="Click to toggle verified badge"
                            >
                              {user.isVerified ? (
                                <span className="flex items-center gap-1 text-purple-400 bg-purple-500/15 border border-purple-500/30 px-2 py-0.5 rounded-full text-[11px] font-medium">
                                  <VerifiedBadge size="xs" interactive={false} />
                                  Verified
                                </span>
                              ) : (
                                <span className="text-gray-500 bg-gray-800/50 px-2 py-0.5 rounded-full text-[11px]">
                                  Unverified
                                </span>
                              )}
                            </button>
                          </td>

                          <td className="p-3.5">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                user.status === "active"
                                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                                  : user.status === "suspended"
                                  ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                                  : "bg-red-500/15 text-red-400 border border-red-500/30"
                              }`}
                            >
                              {user.status}
                            </span>
                          </td>

                          <td className="p-3.5 text-xs text-gray-400">{user.joinedDate}</td>

                          <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                            <button
                              onClick={() => handleToggleSuspend(user.id)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                                user.status === "suspended"
                                  ? "bg-amber-600 hover:bg-amber-700 text-white"
                                  : "bg-[#2c2c2e] hover:bg-amber-600/30 text-amber-400 border border-amber-500/30"
                              }`}
                            >
                              {user.status === "suspended" ? "Unsuspend" : "Suspend"}
                            </button>

                            <button
                              onClick={() => handleToggleBan(user.id)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                                user.status === "banned"
                                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                                  : "bg-[#2c2c2e] hover:bg-red-600/30 text-red-400 border border-red-500/30"
                              }`}
                            >
                              {user.status === "banned" ? "Unban" : "Ban"}
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: ABUSE MODERATION QUEUE */}
        {activeTab === "reports" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-base text-white">Abuse & Security Reports</h3>
                <p className="text-xs text-gray-400">
                  Transcripts and reports flagged by users via the chat block/report trigger
                </p>
              </div>
              <button
                onClick={() => {
                  const newRep: AbuseReport = {
                    id: `rep_${Date.now()}`,
                    targetUser: `Anon #${Math.floor(1000 + Math.random() * 9000)}`,
                    reason: "Simulated abuse report for moderation audit",
                    timestamp: "Just now",
                    status: "pending",
                  };
                  setReports([newRep, ...reports]);
                  showToast("Test report created.");
                }}
                className="px-3 py-1.5 bg-[#2c2c2e] hover:bg-[#3c3c3e] text-xs font-medium text-gray-300 rounded-lg transition-colors"
              >
                + Simulate Test Report
              </button>
            </div>

            <div className="space-y-3">
              {reports.map((report) => (
                <div
                  key={report.id}
                  className={`bg-[#1c1c1e] border rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                    report.status === "pending" ? "border-red-500/40" : "border-gray-800 opacity-60"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-white">{report.targetUser}</span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          report.status === "pending"
                            ? "bg-red-500/20 text-red-400 border border-red-500/30"
                            : report.status === "resolved"
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "bg-gray-800 text-gray-400"
                        }`}
                      >
                        {report.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-300">
                      Reason: <span className="text-white font-medium">{report.reason}</span>
                    </p>
                    <p className="text-[11px] text-gray-500">Reported on {report.timestamp}</p>
                  </div>

                  {report.status === "pending" ? (
                    <div className="flex items-center gap-2 self-end md:self-center">
                      <button
                        onClick={() => handleResolveReport(report.id, "dismiss")}
                        className="px-3 py-1.5 bg-[#2c2c2e] hover:bg-[#3c3c3e] text-gray-300 text-xs font-medium rounded-lg transition-colors"
                      >
                        Dismiss Report
                      </button>
                      <button
                        onClick={() => handleResolveReport(report.id, "ban")}
                        className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-1 shadow"
                      >
                        <Ban className="w-3.5 h-3.5" />
                        Ban Offender
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-500 italic">Resolved</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: NETWORK BROADCAST */}
        {activeTab === "broadcast" && (
          <div className="space-y-5">
            <div>
              <h3 className="font-semibold text-base text-white">Global Network Broadcast</h3>
              <p className="text-xs text-gray-400">
                Publish a high-priority system announcement banner to all users across the messenger
              </p>
            </div>

            {activeBroadcast && (
              <div className="bg-purple-900/30 border border-purple-500/40 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Radio className="w-5 h-5 text-purple-400 animate-pulse flex-shrink-0" />
                  <div>
                    <span className="text-[11px] text-purple-300 font-bold uppercase tracking-wider block">
                      Active Live Broadcast
                    </span>
                    <p className="text-xs md:text-sm text-white font-medium mt-0.5">{activeBroadcast}</p>
                  </div>
                </div>
                <button
                  onClick={handleClearBroadcast}
                  className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg text-xs font-medium border border-red-500/30 transition-colors ml-4 flex-shrink-0"
                >
                  End Broadcast
                </button>
              </div>
            )}

            <div className="bg-[#1c1c1e] border border-gray-800 rounded-2xl p-5 space-y-4">
              <label className="text-xs font-medium text-gray-300 block">
                Announcement Message
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Welcome to anoNote v2.0! We have introduced multi-step zero-knowledge Verified Badges."
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                className="w-full bg-[#2c2c2e] border border-gray-700 rounded-xl p-3 text-sm text-white placeholder-gray-500 outline-none focus:border-purple-500"
              />

              <div className="flex items-center justify-between pt-2">
                <p className="text-[11px] text-gray-500">
                  Broadcasts appear at the top of all user chat views.
                </p>
                <button
                  onClick={handlePublishBroadcast}
                  disabled={!broadcastMessage.trim()}
                  className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-lg shadow-purple-600/30"
                >
                  <Send className="w-3.5 h-3.5" />
                  Broadcast to Network
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
