import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { ShieldCheck, Eye, EyeOff, Lock, Shield, User, Sparkles, ArrowRight, CheckCircle2, Plus } from "lucide-react";
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
      setError("Please enter your Anon ID or numeric code");
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
      setError("Failed to create quick session.");
    }
  };

  const handleSelectSaved = (userId: string) => {
    switchAccount(userId);
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and branding */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 mb-4 shadow-lg shadow-purple-600/30">
            <ShieldCheck className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-1 tracking-tight">anoNote</h1>
          <p className="text-xs text-purple-400 font-mono mb-2">anoNote.icepab.name.ng</p>
          <p className="text-gray-400 text-sm">Frictionless, encrypted anonymous messaging</p>
        </div>

        {/* 1-CLICK INSTANT QUICK JOIN BANNER */}
        <div className="bg-gradient-to-r from-purple-900/40 via-purple-800/30 to-indigo-900/40 border border-purple-500/40 rounded-2xl p-4 mb-4 shadow-xl flex items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-purple-300 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
              Instant Start (0 Setup)
            </div>
            <p className="text-xs text-gray-300 mt-0.5">
              Jump straight into messaging with 1 tap.
            </p>
          </div>
          <button
            onClick={handleQuickJoin}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-xl transition-all shadow-md shadow-purple-600/30 whitespace-nowrap flex items-center gap-1.5"
          >
            Quick Join
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* SAVED IDENTITIES ON THIS DEVICE */}
        {savedAccounts.length > 0 && (
          <div className="bg-[#1c1c1e] rounded-2xl border border-gray-800 p-5 mb-4 shadow-xl">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
              Continue With Saved Identity
            </h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {savedAccounts.slice(0, 3).map((account) => (
                <button
                  key={account.id}
                  onClick={() => handleSelectSaved(account.id)}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-[#2c2c2e] hover:bg-[#3c3c3e] border border-gray-700/60 hover:border-purple-500/50 transition-all text-left"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{account.avatar}</span>
                    <div>
                      <div className="text-sm font-semibold text-white">{account.name}</div>
                      <div className="text-[11px] text-gray-400 font-mono">{account.anonId}</div>
                    </div>
                  </div>
                  <span className="text-xs text-purple-400 font-medium flex items-center gap-1">
                    Enter <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Regular Login Form */}
        <div className="bg-[#1c1c1e] rounded-2xl border border-gray-800 p-6 md:p-8 shadow-2xl">
          <h2 className="text-xl font-semibold text-white mb-4">Sign In with Existing Anon ID</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-500/15 border border-red-500/30 rounded-xl text-xs text-red-400 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Anon ID */}
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">
                Anon ID or Number
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={anonId}
                  onChange={(e) => {
                    setAnonId(e.target.value);
                    setError(null);
                  }}
                  placeholder="e.g. Anon #8462 or 8462"
                  className="w-full bg-[#2c2c2e] text-white placeholder-gray-500 rounded-xl px-4 py-2.5 pl-10 outline-none focus:ring-2 focus:ring-purple-600 transition-all text-sm border border-gray-700"
                  required
                />
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              </div>
            </div>

            {/* PIN */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-gray-300">
                  Security PIN <span className="text-gray-500 font-normal">(optional if not set)</span>
                </label>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={pin}
                  onChange={(e) => {
                    setPin(e.target.value);
                    setError(null);
                  }}
                  placeholder="Enter your PIN (or leave blank)"
                  className="w-full bg-[#2c2c2e] text-white placeholder-gray-500 rounded-xl px-4 py-2.5 pl-10 pr-10 outline-none focus:ring-2 focus:ring-purple-600 transition-all text-sm border border-gray-700"
                />
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Login button */}
            <button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2.5 rounded-xl transition-colors shadow-lg shadow-purple-600/30 text-sm mt-2"
            >
              Sign In to anoNote
            </button>
          </form>

          {/* Test peer quick fill */}
          <div className="mt-4 pt-4 border-t border-gray-800 text-center">
            <p className="text-[11px] text-gray-500 mb-2">Or test quick login with active demo identities:</p>
            <div className="flex justify-center gap-2">
              {["Anon #3847", "Anon #7291", "Anon #5612"].map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    setAnonId(id);
                    setPin("");
                  }}
                  className="text-[11px] font-mono text-purple-400 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 px-2 py-1 rounded-md transition-colors"
                >
                  {id}
                </button>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-800"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-[#1c1c1e] text-gray-500">
                New to anoNote?
              </span>
            </div>
          </div>

          {/* Sign up link */}
          <Link to="/signup">
            <button className="w-full border border-purple-600/60 hover:border-purple-500 text-purple-400 hover:bg-purple-600/10 font-medium py-2.5 rounded-xl transition-colors text-xs flex items-center justify-center gap-1.5">
              <Plus className="w-3.5 h-3.5" />
              Create Custom Anon Identity
            </button>
          </Link>
        </div>

        {/* Security notice */}
        <div className="mt-5 flex gap-3 bg-purple-600/10 border border-purple-600/20 rounded-xl p-3.5">
          <Shield className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs text-white font-medium mb-0.5">
              Zero-Knowledge Protocol
            </p>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              No phone numbers, emails, or personal data collected. All keys are stored safely on your device.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
