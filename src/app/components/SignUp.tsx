import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { ShieldCheck, Eye, EyeOff, Lock, Shield, Sparkles, User } from "lucide-react";

export function SignUp() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [avatar, setAvatar] = useState("🎭");

  const avatarOptions = ["🎭", "🕶️", "👤", "🌑", "💭", "🔮", "🎪", "🌙", "✨", "🛡️"];

  // Generate random Anon ID
  const [anonId] = useState(`Anon #${Math.floor(1000 + Math.random() * 9000)}`);

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin !== confirmPin) {
      alert("PINs don't match!");
      return;
    }
    // Set real user profile
    localStorage.setItem("ghost_note_account_name", anonId);
    localStorage.setItem("anon_user_profile", JSON.stringify({
      id: anonId,
      name: anonId,
      avatar,
      createdAt: new Date().toISOString(),
    }));
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 mb-4 shadow-lg shadow-purple-600/30">
            <ShieldCheck className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-1 tracking-tight">anoNote</h1>
          <p className="text-xs text-purple-400 font-mono mb-2">anoNote.icepab.name.ng</p>
          <p className="text-gray-400 text-sm">Create your anonymous identity</p>
        </div>

        {/* Sign up form */}
        <div className="bg-[#1c1c1e] rounded-2xl border border-gray-800 p-6 md:p-8 shadow-2xl">
          <h2 className="text-2xl font-semibold text-white mb-6">Join anoNote</h2>

          <form onSubmit={handleSignUp} className="space-y-5">
            {/* Generated Anon ID */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Your Anon ID
              </label>
              <div className="bg-[#2c2c2e] rounded-lg px-4 py-3 flex items-center justify-between border border-purple-500/30">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-purple-400" />
                  <span className="text-white font-semibold text-lg font-mono">{anonId}</span>
                </div>
                <Sparkles className="w-5 h-5 text-yellow-400" />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                This is your unique cryptographic identifier on anoNote.icepab.name.ng
              </p>
            </div>

            {/* Avatar selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Choose Your Avatar
              </label>
              <div className="grid grid-cols-5 gap-2">
                {avatarOptions.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setAvatar(emoji)}
                    className={`aspect-square rounded-lg flex items-center justify-center text-2xl transition-all ${
                      avatar === emoji
                        ? "bg-purple-600 scale-110"
                        : "bg-[#2c2c2e] hover:bg-[#3c3c3e]"
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* PIN */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Create Security PIN
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="Enter a secure 6-digit PIN"
                  className="w-full bg-[#2c2c2e] text-white placeholder-gray-500 rounded-lg px-4 py-3 pl-10 pr-12 outline-none focus:ring-2 focus:ring-purple-600 transition-all text-sm"
                  required
                  minLength={6}
                />
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm PIN */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Confirm PIN
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value)}
                  placeholder="Re-enter your PIN"
                  className="w-full bg-[#2c2c2e] text-white placeholder-gray-500 rounded-lg px-4 py-3 pl-10 pr-12 outline-none focus:ring-2 focus:ring-purple-600 transition-all text-sm"
                  required
                  minLength={6}
                />
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Terms */}
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="terms"
                required
                className="mt-1 w-4 h-4 rounded border-gray-600 bg-[#2c2c2e] text-purple-600 focus:ring-purple-600"
              />
              <label htmlFor="terms" className="text-xs text-gray-400">
                I agree to the{" "}
                <span className="text-purple-400 hover:underline cursor-pointer">
                  anoNote Terms of Service
                </span>{" "}
                and{" "}
                <span className="text-purple-400 hover:underline cursor-pointer">
                  Privacy Policy
                </span>
              </label>
            </div>

            {/* Sign up button */}
            <button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg transition-colors shadow-lg"
            >
              Create Anon Account
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-[#1c1c1e] text-gray-400">
                Already have an account?
              </span>
            </div>
          </div>

          {/* Login link */}
          <Link to="/login">
            <button className="w-full border border-purple-600 text-purple-400 hover:bg-purple-600/10 font-semibold py-3 rounded-lg transition-colors">
              Sign In
            </button>
          </Link>
        </div>

        {/* Security notice */}
        <div className="mt-6 flex gap-3 bg-purple-600/10 border border-purple-600/20 rounded-lg p-4">
          <Shield className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-white font-medium mb-1">
              Complete Anonymity Guaranteed
            </p>
            <p className="text-xs text-gray-400 leading-relaxed">
              We never ask for personal emails, phone numbers, or real identities. Your Anon ID is your only
              identifier on anoNote.icepab.name.ng.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
