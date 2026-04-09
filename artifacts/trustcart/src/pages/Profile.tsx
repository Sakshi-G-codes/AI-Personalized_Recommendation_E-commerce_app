import { useState } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { User, Package, LogOut, Palette, Tag } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useGetPreferences, useUpdatePreferences, useListOrders, getGetPreferencesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

const COLOR_OPTIONS = ["Black", "White", "Blue", "Red", "Yellow", "Green", "Purple", "Pink"];
const CATEGORY_OPTIONS = ["Clothing", "Accessories", "Footwear", "Electronics", "Beauty", "Sports"];
const MOOD_OPTIONS = ["energetic", "chill", "professional", "party"];

export default function Profile() {
  const { user, logout, isLoggedIn } = useAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const { data: prefs } = useGetPreferences();
  const { data: orders } = useListOrders();
  const updatePrefs = useUpdatePreferences();

  const [selectedColors, setSelectedColors] = useState<string[]>(prefs?.favoriteColors ?? []);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(prefs?.favoriteCategories ?? []);
  const [currentMood, setCurrentMood] = useState(prefs?.currentMood ?? "chill");

  const toggleColor = async (color: string) => {
    const next = selectedColors.includes(color)
      ? selectedColors.filter((c) => c !== color)
      : [...selectedColors, color];
    setSelectedColors(next);
    await updatePrefs.mutateAsync({ data: { favoriteColors: next } });
    queryClient.invalidateQueries({ queryKey: getGetPreferencesQueryKey() });
  };

  const toggleCategory = async (cat: string) => {
    const next = selectedCategories.includes(cat)
      ? selectedCategories.filter((c) => c !== cat)
      : [...selectedCategories, cat];
    setSelectedCategories(next);
    await updatePrefs.mutateAsync({ data: { favoriteCategories: next } });
    queryClient.invalidateQueries({ queryKey: getGetPreferencesQueryKey() });
  };

  const setMood = async (mood: string) => {
    setCurrentMood(mood);
    await updatePrefs.mutateAsync({ data: { currentMood: mood } });
    queryClient.invalidateQueries({ queryKey: getGetPreferencesQueryKey() });
  };

  const handleLogout = async () => {
    await logout();
    setLocation("/login");
  };

  if (!isLoggedIn) {
    setLocation("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0F172A] pt-24 pb-20 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Profile card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 flex items-center gap-5"
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
            <User className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-extrabold text-white">{user?.name}</h1>
            <p className="text-white/50 text-sm">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-full glass border border-white/15 text-white/60 hover:text-white text-sm transition-all"
          >
            <LogOut className="w-3.5 h-3.5" /> Logout
          </button>
        </motion.div>

        {/* Preferences */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6 space-y-5"
        >
          <h2 className="text-white font-bold text-lg flex items-center gap-2">
            <Palette className="w-5 h-5 text-purple-400" /> Your Preferences
          </h2>
          <p className="text-white/40 text-xs">Updating preferences instantly updates your recommendations</p>

          {/* Mood */}
          <div>
            <p className="text-white/60 text-sm font-medium mb-2">Current Mood</p>
            <div className="flex flex-wrap gap-2">
              {MOOD_OPTIONS.map((mood) => (
                <motion.button
                  key={mood}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setMood(mood)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-all ${
                    currentMood === mood
                      ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white"
                      : "glass border border-white/10 text-white/60 hover:text-white"
                  }`}
                >
                  {mood}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Colors */}
          <div>
            <p className="text-white/60 text-sm font-medium mb-2">Favorite Colors</p>
            <div className="flex flex-wrap gap-2">
              {COLOR_OPTIONS.map((color) => (
                <motion.button
                  key={color}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleColor(color)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    selectedColors.includes(color)
                      ? "bg-purple-500/30 text-purple-300 border border-purple-500/50"
                      : "glass border border-white/10 text-white/50 hover:text-white"
                  }`}
                >
                  {color}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div>
            <p className="text-white/60 text-sm font-medium mb-2">Favorite Categories</p>
            <div className="flex flex-wrap gap-2">
              {CATEGORY_OPTIONS.map((cat) => (
                <motion.button
                  key={cat}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleCategory(cat)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    selectedCategories.includes(cat)
                      ? "bg-blue-500/30 text-blue-300 border border-blue-500/50"
                      : "glass border border-white/10 text-white/50 hover:text-white"
                  }`}
                >
                  {cat}
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Order History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6"
        >
          <h2 className="text-white font-bold text-lg flex items-center gap-2 mb-4">
            <Package className="w-5 h-5 text-blue-400" /> Order History
          </h2>
          {orders && orders.length > 0 ? (
            <div className="space-y-3">
              {orders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 rounded-xl glass border border-white/8">
                  <div>
                    <p className="text-white text-sm font-medium">Order #{order.id}</p>
                    <p className="text-white/40 text-xs">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-bold">${typeof order.total === "number" ? order.total.toFixed(2) : order.total}</p>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-medium capitalize">
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-white/30">
              <Package className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No orders yet</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
