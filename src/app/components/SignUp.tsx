import { useState } from "react";
import { useNavigate, Link } from "react-router";
import {
  ShieldCheck,
  Eye,
  EyeOff,
  Lock,
  User,
  ArrowRight,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export function SignUp() {
  const navigate = useNavigate();
  const { signUp, quickStart, generateUniqueId } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [avatar, setAvatar] = useState("🎭");
  const [anonId, setAnonId] = useState(() => generateUniqueId());
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const avatarOptions = ["🎭", "🕶️", "👤", "🌑", "💭", "🔮", "🎪", "🌙", "✨", "🛡️", "🚀", "⚡", "🔥", "💎", "🦁"];

  const handleRegenerateId = () => {
    setAnonId(generateUniqueId());
    setError(null);
  };

  const handleInstantQuickStart = async () => {
    setIsLoading(true);
    try {
      await quickStart();
      navigate("/");
    } catch {
      setError("Failed to generate instant identity.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pin && pin !== confirmPin) {
      setError("PINs do not match. Please verify.");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const res = await signUp(anonId, avatar, pin || undefined);
      if (res.success) {
        navigate("/");
      } else {
        setError(res.error || "Failed to create identity.");
      }
    } catch (err: any) {
      setError(err?.message || "Error validating Anon ID.");
    } finally {
      setIsLoading(false);
    }
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
          <p className="text-xs text-[#8696a0] mt-1">Create your anonymous identity with zero metadata</p>
        </div>

        {/* 1-CLICK INSTANT QUICK START */}
        <div className="bg-[#111b21] border border-[#202c33] rounded-lg p-4 mb-4 flex items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#38bdf8] uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              1-Tap Guest Access
            </div>
            <p className="text-xs text-[#8696a0] mt-0.5">
              Auto-generate identity and start immediately.
            </p>
          </div>
          <button
            onClick={handleInstantQuickStart}
            disabled={isLoading}
            className="px-3.5 py-1.5 bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5"
          >
            Quick Join
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* CUSTOM IDENTITY FORM */}
        <div className="bg-[#111b21] rounded-lg border border-[#202c33] p-6">
          <h2 className="text-base font-medium text-[#e9edef] mb-1">Customize Identity</h2>
          <p className="text-xs text-[#8696a0] mb-4">Choose your avatar and custom Anon ID</p>

          {error && (
            <div className="mb-4 p-3 bg-[#f15c6d]/15 border border-[#f15c6d]/30 rounded-md text-xs text-[#f15c6d]">
              {error}
            </div>
          )}

          <form onSubmit={handleSignUp} className="space-y-4">
            {/* Generated / Custom Anon ID */}
            <div>
              <label className="block text-xs font-medium text-[#8696a0] mb-1.5">
                Anon ID
              </label>
              <div className="bg-[#202c33] rounded-md px-3.5 py-2 flex items-center justify-between border border-[#2a3942]">
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  <User className="w-4 h-4 text-[#38bdf8] flex-shrink-0" />
                  <input
                    type="text"
                    value={anonId}
                    onChange={(e) => setAnonId(e.target.value)}
                    className="bg-transparent text-[#e9edef] font-medium text-sm font-mono outline-none w-full"
                    placeholder="e.g. Anon #8462"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleRegenerateId}
                  className="text-[#8696a0] hover:text-[#e9edef] p-1 rounded transition-colors ml-2 flex-shrink-0"
                  title="Generate new ID"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Avatar selection */}
            <div>
              <label className="block text-xs font-medium text-[#8696a0] mb-1.5">
                Avatar Emoji
              </label>
              <div className="grid grid-cols-5 gap-2 max-h-32 overflow-y-auto p-1 bg-[#0b141a] rounded-md border border-[#202c33]">
                {avatarOptions.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setAvatar(emoji)}
                    className={`aspect-square rounded-md flex items-center justify-center text-xl transition-all ${
                      avatar === emoji
                        ? "bg-[#0284c7] text-white"
                        : "bg-[#202c33] hover:bg-[#2a3942] text-[#e9edef]"
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Optional PIN */}
            <div>
              <label className="block text-xs font-medium text-[#8696a0] mb-1.5">
                Security PIN <span className="text-[#8696a0]/70 font-normal">(optional)</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={pin}
                  onChange={(e) => {
                    setPin(e.target.value);
                    setError(null);
                  }}
                  placeholder="Set an optional PIN"
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

            {pin && (
              <div>
                <label className="block text-xs font-medium text-[#8696a0] mb-1.5">
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
                    placeholder="Re-enter PIN"
                    className="w-full bg-[#202c33] text-[#e9edef] placeholder-[#8696a0] rounded-md px-3.5 py-2.5 pl-9 outline-none focus:border-[#0284c7] transition-colors text-sm border border-[#2a3942]"
                  />
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8696a0]" />
                </div>
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#0284c7] hover:bg-[#0369a1] disabled:opacity-50 text-white font-medium py-2.5 rounded-md transition-colors text-sm mt-3"
            >
              {isLoading ? "Creating Identity..." : "Create Identity"}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#202c33]"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-[#111b21] text-[#8696a0]">
                Already have an identity?
              </span>
            </div>
          </div>

          {/* Sign in link */}
          <Link to="/login">
            <button className="w-full border border-[#2a3942] text-[#8696a0] hover:text-[#e9edef] hover:bg-[#202c33] font-medium py-2 rounded-md transition-colors text-xs">
              Sign In with Existing Anon ID
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
