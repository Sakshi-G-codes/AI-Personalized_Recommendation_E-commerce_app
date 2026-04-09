import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Moon, Briefcase, PartyPopper, Sparkles } from "lucide-react";
import { useListProducts, useGetRecommendations } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import ProductCard from "@/components/ProductCard";
import SkeletonCard from "@/components/SkeletonCard";

const moods = [
  { label: "Energetic", icon: Zap, value: "energetic", color: "from-yellow-500 to-orange-500" },
  { label: "Chill", icon: Moon, value: "chill", color: "from-blue-500 to-cyan-500" },
  { label: "Professional", icon: Briefcase, value: "professional", color: "from-slate-400 to-slate-600" },
  { label: "Party", icon: PartyPopper, value: "party", color: "from-pink-500 to-purple-500" },
];

export default function Home() {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const { user } = useAuth();

  const { data: recommended, isLoading: recLoading } = useGetRecommendations({
    mood: selectedMood ?? "chill",
    userId: user?.id,
  });

  const { data: allProducts, isLoading: productsLoading } = useListProducts({
    mood: selectedMood ?? undefined,
  });

  const isLoading = recLoading || productsLoading;

  return (
    <div className="min-h-screen mesh-bg">
      {/* Hero */}
      <section className="pt-28 pb-16 px-4 text-center relative overflow-hidden">
        {/* Background glow orbs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
          <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="relative z-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-xs text-white/60 mb-6">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            Privacy-first AI personalization
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-white mb-4 leading-tight">
            What's your{" "}
            <span className="gradient-text">vibe</span>{" "}
            today?
          </h1>
          <p className="text-white/50 text-lg max-w-xl mx-auto mb-10">
            AI-powered recommendations that respect your privacy. Your data stays yours.
          </p>

          {/* Mood chips */}
          <div className="flex flex-wrap gap-3 justify-center mb-4">
            {moods.map((mood) => {
              const Icon = mood.icon;
              const isSelected = selectedMood === mood.value;
              return (
                <motion.button
                  key={mood.value}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedMood(isSelected ? null : mood.value)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm transition-all ${
                    isSelected
                      ? `bg-gradient-to-r ${mood.color} text-white shadow-lg`
                      : "glass text-white/70 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {mood.label}
                </motion.button>
              );
            })}
          </div>

          {selectedMood && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-white/40 text-sm"
            >
              Showing{" "}
              <span className="text-purple-400 font-medium capitalize">{selectedMood}</span>{" "}
              picks for you
            </motion.p>
          )}
        </motion.div>
      </section>

      {/* AI Recommended Section */}
      <section className="px-4 pb-12 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-center gap-3 mb-8"
        >
          <Sparkles className="w-5 h-5 text-purple-400" />
          <h2 className="text-2xl font-bold gradient-text">Recommended for You</h2>
          <div className="flex-1 h-px bg-gradient-to-r from-purple-500/30 to-transparent" />
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={selectedMood ?? "default"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
          >
            {isLoading
              ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
              : (recommended ?? []).slice(0, 8).map((product, i) => (
                  <ProductCard key={product.id} product={product} index={i} />
                ))}
          </motion.div>
        </AnimatePresence>

        {!isLoading && (recommended ?? []).length === 0 && (
          <div className="text-center py-20 text-white/40">
            <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>No recommendations yet. Select a mood to get started.</p>
          </div>
        )}
      </section>

      {/* All Products */}
      <section className="px-4 pb-20 max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <h2 className="text-2xl font-bold text-white">All Products</h2>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {productsLoading
            ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
            : (allProducts ?? []).map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
        </div>
      </section>
    </div>
  );
}
