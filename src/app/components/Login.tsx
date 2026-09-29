import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { ShieldCheck, Eye, EyeOff, Lock, User, ArrowRight, Sparkles, Plus } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export function Login() {
  const navigate = useNavigate();
  const { login, quickStart, savedAccounts, switchAccount } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [anonId, setAnonId] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!anonId.trim()) {
      setError("Please enter your Anon ID");
      return;
    }

    try {
      const res = await login(anonId, pin);
      if (res.success) {
        navigate("/");
      } else {
        setError(res.error || "Login failed. Check your credentials.");
      }
    } catch {
      setError("Login failed. Check your credentials.");
    }
  };

  const handleQuickJoin = async () => {
    try {
      await quickStart();
      navigate("/");
    } catch {
      setError("Failed to create instant session.");
    }
  };

  const handleSelectSaved = (userId: string) => {
    switchAccount(userId);
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-[#0b141a] text-[#e9edef] flex items-center justify-center p-4 font-sans select-none">
      <div className="w-full max-w-md">
        {/* Logo and branding */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#111b21] border border-[#202c33] mb-3 text-[#38bdf8]">
            <ShieldCheck className="w-8 h-8 text-[#38bdf8]" />
          </div>
          <h1 className="text-2xl font-bold text-[#e9edef] tracking-tight">AnoNote</h1>
          <p className="text-xs text-[#8696a0] mt-1">End-to-End Encrypted Anonymous Messenger</p>
        </div>

        {/* 1-CLICK INSTANT QUICK JOIN BANNER */}
        <div className="bg-[#111b21] border border-[#202c33] rounded-lg p-4 mb-4 flex items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#38bdf8] uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              Instant 1-Tap Entry
            </div>
            <p className="text-xs text-[#8696a0] mt-0.5">
              Jump directly into messaging with no credentials.
            </p>
          </div>
          <button
            onClick={handleQuickJoin}
            className="px-3.5 py-1.5 bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5"
          >
            Quick Start
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* SAVED IDENTITIES ON THIS DEVICE */}
        {savedAccounts.length > 0 && (
          <div className="bg-[#111b21] rounded-lg border border-[#202c33] p-4 mb-4">
            <h3 className="text-xs font-semibold text-[#8696a0] uppercase tracking-wider mb-2.5">
              Saved Identities on Device
            </h3>
            <div className="space-y-1.5 max-h-48 overflow-y-auto divide-y divide-[#202c33]/40">
              {savedAccounts.slice(0, 3).map((account) => (
                <button
                  key={account.id}
                  onClick={() => handleSelectSaved(account.id)}
                  className="w-full flex items-center justify-between p-2.5 rounded-md hover:bg-[#202c33] transition-colors text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">{account.avatar}</span>
                    <div>
                      <div className="text-sm font-medium text-[#e9edef]">{account.name}</div>
                      <div className="text-[11px] text-[#8696a0] font-mono">{account.anonId}</div>
                    </div>
                  </div>
                  <span className="text-xs text-[#38bdf8] font-medium flex items-center gap-1">
                    Enter <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Regular Login Form */}
        <div className="bg-[#111b21] rounded-lg border border-[#202c33] p-6">
          <h2 className="text-base font-medium text-[#e9edef] mb-4">Sign in with Anon ID</h2>

          {error && (
            <div className="mb-4 p-3 bg-[#f15c6d]/15 border border-[#f15c6d]/30 rounded-md text-xs text-[#f15c6d]">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Anon ID */}
            <div>
              <label className="block text-xs font-medium text-[#8696a0] mb-1.5">
                Anon ID
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={anonId}
                  onChange={(e) => {
                    setAnonId(e.target.value);
                    setError(null);
                  }}
                  placeholder="e.g. Anon #8462"
                  className="w-full bg-[#202c33] text-[#e9edef] placeholder-[#8696a0] rounded-md px-3.5 py-2.5 pl-9 outline-none focus:border-[#0284c7] transition-colors text-sm border border-[#2a3942]"
                  required
                />
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8696a0]" />
              </div>
            </div>

            {/* PIN */}
            <div>
              <label className="block text-xs font-medium text-[#8696a0] mb-1.5">
                Security PIN <span className="text-[#8696a0]/70 font-normal">(optional if not set)</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={pin}
                  onChange={(e) => {
                    setPin(e.target.value);
                    setError(null);
                  }}
                  placeholder="Enter PIN if configured"
                  className="w-full bg-[#202c33] text-[#e9edef] placeholder-[#8696a0] rounded-md px-3.5 py-2.5 pl-9 pr-9 outline-none focus:border-[#0284c7] transition-colors text-sm border border-[#2a3942]"
                />
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8696a0]" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8696a0] hover:text-[#e9edef]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Login button */}
            <button
              type="submit"
              className="w-full bg-[#0284c7] hover:bg-[#0369a1] text-white font-medium py-2.5 rounded-md transition-colors text-sm mt-2"
            >
              Enter AnoNote
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#202c33]"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-[#111b21] text-[#8696a0]">
                Or
              </span>
            </div>
          </div>

          {/* Sign up link */}
          <Link to="/signup">
            <button className="w-full border border-[#2a3942] hover:bg-[#202c33] text-[#38bdf8] font-medium py-2 rounded-md transition-colors text-xs flex items-center justify-center gap-1.5">
              <Plus className="w-3.5 h-3.5" />
              Create Custom Anon Identity
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
