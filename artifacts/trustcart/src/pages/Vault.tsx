import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Lock, Cloud, HardDrive, Trash2, Eye, EyeOff, RefreshCw } from "lucide-react";
import { useGetVaultStatus, useToggleVaultMode, useClearVaultData, getGetVaultStatusQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

function HexGrid() {
  const [activeHexes, setActiveHexes] = useState<Set<number>>(new Set());

  useEffect(() => {
    const interval = setInterval(() => {
      const newActive = new Set<number>();
      const count = Math.floor(Math.random() * 8) + 4;
      while (newActive.size < count) {
        newActive.add(Math.floor(Math.random() * 80));
      }
      setActiveHexes(newActive);
    }, 800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="grid grid-cols-10 gap-1 p-4 opacity-30 w-full h-full">
        {Array.from({ length: 80 }).map((_, i) => (
          <motion.div
            key={i}
            animate={{ opacity: activeHexes.has(i) ? 0.8 : 0.1 }}
            transition={{ duration: 0.4 }}
            className="text-purple-400 font-mono text-[8px] flex items-center justify-center"
          >
            {Math.floor(Math.random() * 255).toString(16).padStart(2, "0")}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default function Vault() {
  const queryClient = useQueryClient();
  const { data: vault, isLoading } = useGetVaultStatus();
  const toggleVault = useToggleVaultMode();
  const clearData = useClearVaultData();
  const [showHashId, setShowHashId] = useState(false);
  const [clearing, setClearing] = useState(false);

  const handleToggle = async () => {
    if (!vault) return;
    await toggleVault.mutateAsync({ data: { anonymous: !vault.isAnonymous } });
    queryClient.invalidateQueries({ queryKey: getGetVaultStatusQueryKey() });
  };

  const handleClear = async () => {
    setClearing(true);
    setTimeout(async () => {
      await clearData.mutateAsync();
      queryClient.invalidateQueries({ queryKey: getGetVaultStatusQueryKey() });
      setClearing(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#0F172A] pt-24 pb-20 px-4 overflow-hidden relative">
      {/* Hex matrix background */}
      <HexGrid />

      {/* Purple glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-purple-500/8 rounded-full blur-3xl" />
      </div>

      <div className="max-w-2xl mx-auto relative z-10 space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center glow-purple">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold gradient-text">SecureSync Vault</h1>
              <p className="text-white/40 text-xs">Privacy Control Center</p>
            </div>
          </div>
        </motion.div>

        {/* Hashed User ID */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-5"
        >
          <div className="flex items-center gap-2 mb-3">
            <Lock className="w-4 h-4 text-purple-400" />
            <h2 className="text-white font-semibold text-sm">Encrypted Identity</h2>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 font-mono text-xs text-purple-300 bg-black/30 px-3 py-2 rounded-lg border border-purple-500/20 overflow-hidden">
              {showHashId
                ? vault?.hashedUserId ?? "Loading..."
                : (vault?.hashedUserId ?? "").replace(/./g, "•")}
            </div>
            <button
              onClick={() => setShowHashId(!showHashId)}
              className="p-2 rounded-lg glass border border-white/10 text-white/50 hover:text-white transition-colors"
            >
              {showHashId ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-white/30 text-xs mt-2">SHA-256 Hashed — Your real identity is never exposed</p>
        </motion.div>

        {/* Mode Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h2 className="text-white font-bold text-lg">
                {vault?.isAnonymous ? "Anonymous Mode" : "Personalized Mode"}
              </h2>
              <p className="text-white/40 text-sm mt-1">
                {vault?.isAnonymous
                  ? "Your browsing stays on this device only"
                  : "Your preferences are locked in the Vault"}
              </p>
              <div className={`inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full text-xs font-medium ${
                vault?.isAnonymous
                  ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                  : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
              }`}>
                <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${vault?.isAnonymous ? "bg-amber-400" : "bg-emerald-400"}`} />
                {vault?.isAnonymous ? "Anonymous Mode Active" : "Tracking Active"}
              </div>
            </div>

            {/* Toggle switch */}
            <motion.button
              onClick={handleToggle}
              disabled={toggleVault.isPending || isLoading}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`relative w-16 h-8 rounded-full transition-colors disabled:opacity-50 ${
                !vault?.isAnonymous ? "bg-gradient-to-r from-purple-500 to-blue-500" : "bg-white/10"
              }`}
            >
              <motion.div
                animate={{ x: !vault?.isAnonymous ? 32 : 2 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className="absolute top-1 w-6 h-6 rounded-full bg-white shadow-lg"
              />
            </motion.button>
          </div>

          {/* Blur overlay when anonymous */}
          {vault?.isAnonymous && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 p-3 rounded-xl border border-amber-500/20 bg-amber-500/5"
            >
              <p className="text-amber-300/70 text-xs">
                Anonymous Mode: AI personalization is paused. Your preferences are not being stored.
              </p>
            </motion.div>
          )}
        </motion.div>

        {/* Storage Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-2 gap-4"
        >
          <div className="glass-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <HardDrive className="w-4 h-4 text-blue-400" />
              <p className="text-white/60 text-xs font-medium">Local Storage</p>
            </div>
            <p className="text-white font-bold text-xl">{vault?.localStorageSize ?? 0} KB</p>
            <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
                style={{ width: `${Math.min(((vault?.localStorageSize ?? 0) / 100) * 100, 100)}%` }}
              />
            </div>
          </div>

          <div className="glass-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <Cloud className="w-4 h-4 text-purple-400" />
              <p className="text-white/60 text-xs font-medium">Cloud Sync</p>
            </div>
            <p className="text-white font-bold text-xl">
              {vault?.cloudSyncEnabled ? "Active" : "Paused"}
            </p>
            <div className={`mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium ${
              vault?.cloudSyncEnabled
                ? "bg-emerald-500/20 text-emerald-400"
                : "bg-white/10 text-white/40"
            }`}>
              <div className={`w-1.5 h-1.5 rounded-full ${vault?.cloudSyncEnabled ? "bg-emerald-400 animate-pulse" : "bg-white/30"}`} />
              {vault?.cloudSyncEnabled ? "Syncing" : "Offline"}
            </div>
          </div>
        </motion.div>

        {/* Encryption Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="glass-card p-5"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <Lock className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <p className="text-white font-medium text-sm">Encryption Status</p>
                <p className="text-emerald-400 text-xs font-medium">{vault?.encryptionStatus}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-400 text-xs font-medium">Secured</span>
            </div>
          </div>

          {vault?.dataCategories && (
            <div className="mt-4 flex flex-wrap gap-2">
              {vault.dataCategories.map((cat) => (
                <span key={cat} className="px-2 py-0.5 rounded-full glass border border-white/10 text-white/50 text-[10px]">
                  {cat.replace("_", " ")}
                </span>
              ))}
            </div>
          )}
        </motion.div>

        {/* Clear Data */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <motion.button
            onClick={handleClear}
            disabled={clearData.isPending || clearing}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-3 rounded-xl border border-red-500/30 glass text-red-400 font-semibold text-sm flex items-center justify-center gap-2 hover:border-red-500/50 hover:bg-red-500/5 transition-all disabled:opacity-50"
          >
            <AnimatePresence mode="wait">
              {clearing ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Dissolving data...
                </motion.div>
              ) : (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear All Vault Data
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
          <p className="text-white/30 text-xs text-center mt-2">
            This will permanently remove all stored preferences and data
          </p>
        </motion.div>
      </div>
    </div>
  );
}
