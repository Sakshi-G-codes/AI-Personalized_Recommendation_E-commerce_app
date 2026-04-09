import { motion } from "framer-motion";
import { Settings as SettingsIcon, Bell, Shield, Palette } from "lucide-react";
import { useGetVaultStatus, useToggleVaultMode, getGetVaultStatusQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

export default function Settings() {
  const queryClient = useQueryClient();
  const { data: vault } = useGetVaultStatus();
  const toggleVault = useToggleVaultMode();

  const handlePrivacyToggle = async () => {
    if (!vault) return;
    await toggleVault.mutateAsync({ data: { anonymous: !vault.isAnonymous } });
    queryClient.invalidateQueries({ queryKey: getGetVaultStatusQueryKey() });
  };

  const settings = [
    {
      section: "Privacy",
      icon: Shield,
      items: [
        {
          label: "Anonymous Mode",
          desc: "Browse without storing data",
          value: vault?.isAnonymous ?? false,
          onToggle: handlePrivacyToggle,
        },
        {
          label: "Cloud Sync",
          desc: "Sync preferences across devices",
          value: vault?.cloudSyncEnabled ?? false,
          onToggle: () => {},
        },
      ],
    },
    {
      section: "Appearance",
      icon: Palette,
      items: [
        {
          label: "Dark Mode",
          desc: "Always on for Amethyst & Obsidian theme",
          value: true,
          onToggle: () => {},
        },
      ],
    },
    {
      section: "Notifications",
      icon: Bell,
      items: [
        {
          label: "AI Recommendations",
          desc: "Get notified about new personalized picks",
          value: true,
          onToggle: () => {},
        },
        {
          label: "Order Updates",
          desc: "Track your order status",
          value: true,
          onToggle: () => {},
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#0F172A] pt-24 pb-20 px-4">
      <div className="max-w-xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-1">
            <SettingsIcon className="w-7 h-7 text-white/60" />
            <h1 className="text-3xl font-extrabold text-white">Settings</h1>
          </div>
          <p className="text-white/40 text-sm">Manage your TrustCart preferences</p>
        </motion.div>

        {settings.map((group, gi) => {
          const GroupIcon = group.icon;
          return (
            <motion.div
              key={group.section}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: gi * 0.1 }}
              className="glass-card p-5"
            >
              <div className="flex items-center gap-2 mb-4">
                <GroupIcon className="w-4 h-4 text-purple-400" />
                <h2 className="text-white font-semibold">{group.section}</h2>
              </div>
              <div className="space-y-4">
                {group.items.map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <div>
                      <p className="text-white text-sm font-medium">{item.label}</p>
                      <p className="text-white/40 text-xs">{item.desc}</p>
                    </div>
                    <motion.button
                      onClick={item.onToggle}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        item.value ? "bg-gradient-to-r from-purple-500 to-blue-500" : "bg-white/10"
                      }`}
                    >
                      <motion.div
                        animate={{ x: item.value ? 24 : 2 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        className="absolute top-1 w-4 h-4 rounded-full bg-white shadow"
                      />
                    </motion.button>
                  </div>
                ))}
              </div>
            </motion.div>
          );
        })}

        {/* App info */}
        <div className="text-center text-white/20 text-xs pb-4">
          TrustCart AI+ v1.0 — Privacy-First Personalization Engine
        </div>
      </div>
    </div>
  );
}
