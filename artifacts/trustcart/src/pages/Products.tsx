import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useListProducts } from "@workspace/api-client-react";
import ProductCard from "@/components/ProductCard";
import SkeletonCard from "@/components/SkeletonCard";

const CATEGORIES = ["All", "Clothing", "Accessories", "Footwear", "Electronics", "Beauty"];

export default function Products() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minRating, setMinRating] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const { data: products, isLoading } = useListProducts({
    category: category !== "All" ? category : undefined,
    search: search || undefined,
    minPrice: minPrice ? parseFloat(minPrice) : undefined,
    maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
    minRating: minRating ? parseFloat(minRating) : undefined,
  });

  const clearFilters = () => {
    setCategory("All");
    setMinPrice("");
    setMaxPrice("");
    setMinRating("");
    setSearch("");
  };

  const hasFilters = category !== "All" || minPrice || maxPrice || minRating || search;

  return (
    <div className="min-h-screen bg-[#0F172A] pt-24 pb-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-extrabold text-white mb-2">All Products</h1>
          <p className="text-white/50">Discover curated picks with AI insights</p>
        </motion.div>

        {/* Search + Filter Bar */}
        <div className="flex gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2.5 rounded-full glass border border-white/15 text-white placeholder-white/30 bg-transparent focus:border-purple-500/50 focus:outline-none focus:ring-1 focus:ring-purple-500/30 text-sm transition-all"
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all ${
              showFilters
                ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white"
                : "glass border border-white/15 text-white/70 hover:text-white"
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
          </motion.button>
          {hasFilters && (
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              onClick={clearFilters}
              className="p-2.5 rounded-full glass border border-white/15 text-white/60 hover:text-white"
            >
              <X className="w-4 h-4" />
            </motion.button>
          )}
        </div>

        {/* Category chips */}
        <div className="flex flex-wrap gap-2 mb-6">
          {CATEGORIES.map((cat) => (
            <motion.button
              key={cat}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                category === cat
                  ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg shadow-purple-500/20"
                  : "glass border border-white/10 text-white/60 hover:text-white"
              }`}
            >
              {cat}
            </motion.button>
          ))}
        </div>

        {/* Advanced Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="glass-card p-5 mb-6 overflow-hidden"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-white/50 text-xs mb-1 block">Min Price ($)</label>
                  <input
                    type="number"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl glass border border-white/15 text-white bg-transparent text-sm focus:border-purple-500/50 focus:outline-none"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="text-white/50 text-xs mb-1 block">Max Price ($)</label>
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl glass border border-white/15 text-white bg-transparent text-sm focus:border-purple-500/50 focus:outline-none"
                    placeholder="1000"
                  />
                </div>
                <div>
                  <label className="text-white/50 text-xs mb-1 block">Min Rating</label>
                  <input
                    type="number"
                    value={minRating}
                    onChange={(e) => setMinRating(e.target.value)}
                    min="1"
                    max="5"
                    step="0.5"
                    className="w-full px-3 py-2 rounded-xl glass border border-white/15 text-white bg-transparent text-sm focus:border-purple-500/50 focus:outline-none"
                    placeholder="4.0"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${category}-${search}-${minPrice}-${maxPrice}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
          >
            {isLoading
              ? Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)
              : (products ?? []).map((product, i) => (
                  <ProductCard key={product.id} product={product} index={i} />
                ))}
          </motion.div>
        </AnimatePresence>

        {!isLoading && (products ?? []).length === 0 && (
          <div className="text-center py-20 text-white/40">
            <Search className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="font-medium">No products found</p>
            <p className="text-sm mt-1">Try adjusting your filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
