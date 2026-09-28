import { useState } from "react";
import { useNavigate, Link } from "react-router";
import {
  ShieldCheck,
  Eye,
  EyeOff,
  Lock,
  Shield,
  Sparkles,
  User,
  ArrowRight,
  RefreshCw,
  Check,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export function SignUp() {
  const navigate = useNavigate();
  const { signUp, quickStart } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [avatar, setAvatar] = useState("🎭");
  const [anonId, setAnonId] = useState(`Anon #${Math.floor(1000 + Math.random() * 9000)}`);
  const [error, setError] = useState<string | null>(null);

  const avatarOptions = ["🎭", "🕶️", "👤", "🌑", "💭", "🔮", "🎪", "🌙", "✨", "🛡️", "🚀", "⚡", "🔥", "💎", "🦁"];

  const handleRegenerateId = () => {
    setAnonId(`Anon #${Math.floor(1000 + Math.random() * 9000)}`);
  };

  const handleInstantQuickStart = () => {
    quickStart();
    navigate("/");
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin && pin !== confirmPin) {
      setError("PINs do not match. Please verify.");
      return;
    }

    const res = signUp(anonId, avatar, pin || undefined);
    if (res.success) {
      navigate("/");
    } else {
      setError(res.error || "Failed to create identity.");
    }
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
          <p className="text-gray-400 text-sm">Create your anonymous identity with zero friction</p>
        </div>

        {/* 1-CLICK INSTANT QUICK START HERO */}
        <div className="bg-gradient-to-br from-purple-900/50 via-purple-800/30 to-indigo-950/60 border border-purple-500/50 rounded-2xl p-5 mb-5 shadow-2xl text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-400/10 text-yellow-400 text-xs font-semibold border border-yellow-400/20">
            <Sparkles className="w-3.5 h-3.5" />
            Fastest Method (0 Setup Required)
          </div>
          <h3 className="text-lg font-bold text-white">Join in 1 Click as an Anonymous Guest</h3>
          <p className="text-xs text-gray-300 leading-relaxed max-w-xs mx-auto">
            No phone, no email, no password. An encrypted Anon ID is auto-generated for you instantly.
          </p>
          <button
            onClick={handleInstantQuickStart}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-purple-600/40 text-sm flex items-center justify-center gap-2"
          >
            Instant 1-Click Start
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* CUSTOM IDENTITY FORM */}
        <div className="bg-[#1c1c1e] rounded-2xl border border-gray-800 p-6 md:p-8 shadow-2xl">
          <h2 className="text-xl font-semibold text-white mb-1">Customize Your Identity</h2>
          <p className="text-xs text-gray-400 mb-5">Choose your avatar and custom Anon ID</p>

          {error && (
            <div className="mb-4 p-3 bg-red-500/15 border border-red-500/30 rounded-xl text-xs text-red-400 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSignUp} className="space-y-4">
            {/* Generated / Custom Anon ID */}
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">
                Your Anon ID
              </label>
              <div className="bg-[#2c2c2e] rounded-xl px-4 py-2.5 flex items-center justify-between border border-purple-500/30">
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  <User className="w-4 h-4 text-purple-400 flex-shrink-0" />
                  <input
                    type="text"
                    value={anonId}
                    onChange={(e) => setAnonId(e.target.value)}
                    className="bg-transparent text-white font-semibold text-base font-mono outline-none w-full"
                    placeholder="e.g. Anon #8462"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleRegenerateId}
                  className="text-gray-400 hover:text-purple-300 p-1 rounded-lg transition-colors ml-2 flex-shrink-0"
                  title="Generate new ID"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[11px] text-gray-500 mt-1">
                Your peers will find and message you using this Anon ID.
              </p>
            </div>

            {/* Avatar selection */}
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">
                Select Avatar Emoji
              </label>
              <div className="grid grid-cols-5 gap-2 max-h-36 overflow-y-auto p-1">
                {avatarOptions.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setAvatar(emoji)}
                    className={`aspect-square rounded-xl flex items-center justify-center text-xl transition-all ${
                      avatar === emoji
                        ? "bg-purple-600 scale-105 shadow-md shadow-purple-600/30 border border-purple-400"
                        : "bg-[#2c2c2e] hover:bg-[#3c3c3e] border border-gray-700/50"
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Optional PIN */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-gray-300">
                  Security PIN <span className="text-gray-500 font-normal">(optional)</span>
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
                  placeholder="Set an optional 4 to 6-digit PIN"
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

            {pin && (
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">
                  Confirm Security PIN
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={confirmPin}
                    onChange={(e) => {
                      setConfirmPin(e.target.value);
                      setError(null);
                    }}
                    placeholder="Re-enter your PIN"
                    className="w-full bg-[#2c2c2e] text-white placeholder-gray-500 rounded-xl px-4 py-2.5 pl-10 outline-none focus:ring-2 focus:ring-purple-600 transition-all text-sm border border-gray-700"
                  />
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                </div>
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2.5 rounded-xl transition-colors shadow-lg shadow-purple-600/30 text-sm mt-3"
            >
              Create Identity & Enter
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-800"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-[#1c1c1e] text-gray-500">
                Already have an identity?
              </span>
            </div>
          </div>

          {/* Sign in link */}
          <Link to="/login">
            <button className="w-full border border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800/50 font-medium py-2.5 rounded-xl transition-colors text-xs">
              Sign In to Existing Account
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
