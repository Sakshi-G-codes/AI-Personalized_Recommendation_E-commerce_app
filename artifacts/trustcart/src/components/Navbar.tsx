import { motion } from "framer-motion";
import { Link, useLocation } from "wouter";
import { ShoppingCart, Heart, User, Cpu, Shield, LayoutDashboard, Home } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useGetCart, useGetVaultStatus } from "@workspace/api-client-react";

export default function Navbar() {
  const [location] = useLocation();
  const { isLoggedIn } = useAuth();
  const { data: cart } = useGetCart({ query: { retry: false } });
  const { data: vault } = useGetVaultStatus({ query: { retry: false } });

  const isAnonymous = vault?.isAnonymous ?? false;

  const navLinks = [
    { href: "/", label: "Home", icon: Home },
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/vault", label: "Vault", icon: Shield },
    { href: isLoggedIn ? "/profile" : "/login", label: isLoggedIn ? "Profile" : "Login", icon: User },
  ];

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4"
    >
      <div className="glass-strong rounded-full px-6 py-3 flex items-center justify-between shadow-lg glow-purple">
        {/* Logo */}
        <Link href="/">
          <motion.div
            className="flex items-center gap-2 cursor-pointer"
            whileHover={{ scale: 1.05 }}
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <Cpu className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-sm gradient-text hidden sm:block">TrustCart AI+</span>
          </motion.div>
        </Link>

        {/* Nav Links */}
        <div className="flex items-center gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location === link.href;
            return (
              <Link key={link.href} href={link.href}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                    isActive
                      ? "bg-white/15 text-white"
                      : "text-white/60 hover:text-white hover:bg-white/8"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:block">{link.label}</span>
                </motion.div>
              </Link>
            );
          })}
        </div>

        {/* Right side: cart, wishlist, privacy indicator */}
        <div className="flex items-center gap-2">
          {/* Privacy Pulse Indicator */}
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full glass text-xs">
            <div className={`w-2 h-2 rounded-full animate-pulse ${isAnonymous ? "bg-amber-400" : "bg-emerald-400"}`} />
            <span className="text-white/60 hidden sm:block text-[10px]">
              {isAnonymous ? "Anon" : "Active"}
            </span>
          </div>

          {/* Wishlist */}
          <Link href="/wishlist">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="relative p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <Heart className="w-4 h-4 text-white/70" />
            </motion.button>
          </Link>

          {/* Cart */}
          <Link href="/cart">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="relative p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <ShoppingCart className="w-4 h-4 text-white/70" />
              {cart && cart.itemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-purple-500 rounded-full text-[10px] flex items-center justify-center text-white font-bold">
                  {cart.itemCount}
                </span>
              )}
            </motion.button>
          </Link>
        </div>
      </div>
    </motion.nav>
  );
}
