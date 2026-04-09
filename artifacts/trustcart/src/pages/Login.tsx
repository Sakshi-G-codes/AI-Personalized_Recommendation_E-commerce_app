import { useState } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { Shield, Cpu, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/lib/auth";

export default function Login() {
  const [, setLocation] = useLocation();
  const { login, register } = useAuth();
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (isSignup) {
        await register(email, password, name);
      } else {
        await login(email, password);
      }
      setLocation("/");
    } catch (err: any) {
      setError(err?.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = () => {
    setLocation("/");
  };

  return (
    <div className="min-h-screen mesh-bg flex items-center justify-center px-4 pt-20">
      {/* Background orbs */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/3 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center mx-auto mb-4 glow-purple">
            <Cpu className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold gradient-text">TrustCart AI+</h1>
          <p className="text-white/50 text-sm mt-1">Privacy-First Personalization</p>
        </div>

        {/* Card */}
        <div className="glass-card p-8">
          {/* Tabs */}
          <div className="flex rounded-full glass p-1 mb-8">
            {["Login", "Sign Up"].map((tab) => (
              <button
                key={tab}
                onClick={() => setIsSignup(tab === "Sign Up")}
                className={`flex-1 py-2 rounded-full text-sm font-semibold transition-all ${
                  (tab === "Sign Up") === isSignup
                    ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow"
                    : "text-white/50 hover:text-white"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignup && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <label className="text-white/60 text-xs font-medium block mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl glass text-white placeholder-white/30 bg-transparent border border-white/15 focus:border-purple-500/50 focus:outline-none focus:ring-1 focus:ring-purple-500/30 transition-all text-sm"
                  placeholder="Your name"
                  required={isSignup}
                />
              </motion.div>
            )}

            <div>
              <label className="text-white/60 text-xs font-medium block mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl glass text-white placeholder-white/30 bg-transparent border border-white/15 focus:border-purple-500/50 focus:outline-none focus:ring-1 focus:ring-purple-500/30 transition-all text-sm"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="text-white/60 text-xs font-medium block mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-10 rounded-xl glass text-white placeholder-white/30 bg-transparent border border-white/15 focus:border-purple-500/50 focus:outline-none focus:ring-1 focus:ring-purple-500/30 transition-all text-sm"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-red-400 text-xs bg-red-500/10 px-3 py-2 rounded-lg border border-red-500/20"
              >
                {error}
              </motion.p>
            )}

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold text-sm hover:shadow-lg hover:shadow-purple-500/25 transition-all disabled:opacity-50"
            >
              {loading ? "Loading..." : isSignup ? "Create Account" : "Sign In"}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-white/30 text-xs">or</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Guest mode */}
          <motion.button
            onClick={handleGuest}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-3 rounded-xl glass border border-white/15 text-white/60 font-medium text-sm hover:text-white hover:border-white/25 transition-all"
          >
            Continue as Guest
          </motion.button>

          {/* Privacy assurance */}
          <div className="mt-6 flex items-start gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <Shield className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
            <p className="text-emerald-300/80 text-xs leading-relaxed">
              We respect your privacy. Your data is encrypted with AES-256 and stays secure in our vault.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
