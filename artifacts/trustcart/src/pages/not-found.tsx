import { motion } from "framer-motion";
import { Link } from "wouter";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="text-8xl font-extrabold gradient-text mb-4">404</div>
        <h2 className="text-white text-2xl font-bold mb-2">Page not found</h2>
        <p className="text-white/50 mb-8">This page doesn't exist in the vault.</p>
        <Link href="/">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold mx-auto"
          >
            <Home className="w-4 h-4" /> Go Home
          </motion.button>
        </Link>
      </motion.div>
    </div>
  );
}
