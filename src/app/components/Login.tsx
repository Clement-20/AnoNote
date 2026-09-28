import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { ShieldCheck, Eye, EyeOff, Lock, Shield, User } from "lucide-react";

export function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [anonId, setAnonId] = useState("");
  const [pin, setPin] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (anonId.trim()) {
      const formatted = anonId.startsWith("Anon") ? anonId.trim() : `Anon #${anonId.replace(/[^0-9a-zA-Z]/g, '')}`;
      localStorage.setItem("ghost_note_account_name", formatted);
    }
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
          <p className="text-gray-400 text-sm">Encrypted anonymous messaging for everyone</p>
        </div>

        {/* Login form */}
        <div className="bg-[#1c1c1e] rounded-2xl border border-gray-800 p-6 md:p-8 shadow-2xl">
          <h2 className="text-2xl font-semibold text-white mb-6">Welcome Back</h2>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Anon ID */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Anon ID
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={anonId}
                  onChange={(e) => setAnonId(e.target.value)}
                  placeholder="Enter your Anon ID (e.g., Anon #8462 or 8462)"
                  className="w-full bg-[#2c2c2e] text-white placeholder-gray-500 rounded-lg px-4 py-3 pl-10 outline-none focus:ring-2 focus:ring-purple-600 transition-all text-sm"
                  required
                />
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              </div>
            </div>

            {/* PIN */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Security PIN
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="Enter your 6-digit PIN"
                  className="w-full bg-[#2c2c2e] text-white placeholder-gray-500 rounded-lg px-4 py-3 pl-10 pr-12 outline-none focus:ring-2 focus:ring-purple-600 transition-all text-sm"
                  required
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

            {/* Forgot PIN */}
            <div className="text-right">
              <button
                type="button"
                className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
              >
                Forgot PIN?
              </button>
            </div>

            {/* Login button */}
            <button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg transition-colors shadow-lg"
            >
              Sign In to anoNote
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-[#1c1c1e] text-gray-400">
                New to anoNote?
              </span>
            </div>
          </div>

          {/* Sign up link */}
          <Link to="/signup">
            <button className="w-full border border-purple-600 text-purple-400 hover:bg-purple-600/10 font-semibold py-3 rounded-lg transition-colors">
              Create New Anon Identity
            </button>
          </Link>
        </div>

        {/* Security notice */}
        <div className="mt-6 flex gap-3 bg-purple-600/10 border border-purple-600/20 rounded-lg p-4">
          <Shield className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-white font-medium mb-1">
              Your Privacy is Protected
            </p>
            <p className="text-xs text-gray-400 leading-relaxed">
              All messages are end-to-end encrypted with zero-knowledge protocol. Your identity remains
              anonymous by default on anoNote.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
