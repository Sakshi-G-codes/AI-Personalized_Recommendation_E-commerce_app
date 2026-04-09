import { motion } from "framer-motion";
import { Link } from "wouter";
import { Star, Shield, Cpu, Heart } from "lucide-react";
import { useAddToCart, useAddToWishlist } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { getGetCartQueryKey, getGetWishlistQueryKey } from "@workspace/api-client-react";

interface Product {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
  category: string;
  rating: number;
  trustScore: number;
  regretPercent: number;
  aiReason?: string | null;
  isLocalData?: boolean;
}

interface ProductCardProps {
  product: Product;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const queryClient = useQueryClient();
  const addToCart = useAddToCart();
  const addToWishlist = useAddToWishlist();

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await addToCart.mutateAsync({ data: { productId: product.id, quantity: 1 } });
    queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
  };

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await addToWishlist.mutateAsync({ data: { productId: product.id } });
    queryClient.invalidateQueries({ queryKey: getGetWishlistQueryKey() });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      whileHover={{ y: -4, scale: 1.01 }}
      className="group"
    >
      <Link href={`/products/${product.id}`}>
        <div className="glass-card overflow-hidden cursor-pointer transition-all duration-300 group-hover:border-white/20 group-hover:glow-purple h-full">
          {/* Image */}
          <div className="relative overflow-hidden h-48">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${product.id}/400/300`;
              }}
            />
            {/* Overlay badges */}
            <div className="absolute top-2 left-2 flex gap-1">
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-500/80 backdrop-blur text-white text-[10px] font-medium">
                <Cpu className="w-2.5 h-2.5" />
                AI Pick
              </div>
              {product.isLocalData && (
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/80 backdrop-blur text-white text-[10px] font-medium">
                  <Shield className="w-2.5 h-2.5" />
                  Local
                </div>
              )}
            </div>

            {/* Wishlist button */}
            <button
              onClick={handleWishlist}
              className="absolute top-2 right-2 p-1.5 rounded-full glass opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/20"
            >
              <Heart className="w-3 h-3 text-white" />
            </button>

            {/* Trust score badge */}
            <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur text-white text-[10px] font-medium">
              Trust {product.trustScore}%
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className="font-semibold text-white text-sm leading-tight line-clamp-2">{product.name}</h3>
            </div>
            <p className="text-white/50 text-xs mb-3">{product.category}</p>

            <div className="flex items-center gap-1 mb-3">
              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
              <span className="text-amber-400 text-xs font-medium">{product.rating}</span>
              <span className="text-white/30 text-xs ml-1">• {product.regretPercent}% return</span>
            </div>

            {product.aiReason && (
              <p className="text-white/40 text-[11px] italic mb-3 line-clamp-1">"{product.aiReason}"</p>
            )}

            <div className="flex items-center justify-between">
              <span className="text-white font-bold text-base">${product.price.toFixed(2)}</span>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleAddToCart}
                disabled={addToCart.isPending}
                className="px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all disabled:opacity-50"
              >
                Add to Cart
              </motion.button>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
