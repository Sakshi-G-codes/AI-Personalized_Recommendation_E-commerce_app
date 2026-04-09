import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { Link } from "wouter";
import { useGetWishlist, useRemoveFromWishlist, getGetWishlistQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import ProductCard from "@/components/ProductCard";

export default function Wishlist() {
  const queryClient = useQueryClient();
  const { data: items, isLoading } = useGetWishlist();
  const removeFromWishlist = useRemoveFromWishlist();

  const handleRemove = async (productId: number) => {
    await removeFromWishlist.mutateAsync({ productId });
    queryClient.invalidateQueries({ queryKey: getGetWishlistQueryKey() });
  };

  return (
    <div className="min-h-screen bg-[#0F172A] pt-24 pb-20 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
            <Heart className="w-7 h-7 text-pink-400 fill-pink-400" /> Wishlist
          </h1>
          <p className="text-white/50 text-sm mt-1">{items?.length ?? 0} saved items</p>
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton h-72 rounded-2xl" />
            ))}
          </div>
        ) : items && items.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {items.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24">
            <Heart className="w-16 h-16 mx-auto mb-4 text-white/20" />
            <h2 className="text-white font-semibold text-xl mb-2">Your wishlist is empty</h2>
            <p className="text-white/40 text-sm mb-6">Save products you love</p>
            <Link href="/products">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold"
              >
                Browse Products
              </motion.button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
