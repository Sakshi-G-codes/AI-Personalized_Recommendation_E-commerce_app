import { motion } from "framer-motion";
import { useParams, Link } from "wouter";
import { Star, Shield, Cpu, AlertTriangle, ShoppingCart, Heart, ArrowLeft } from "lucide-react";
import { useGetProduct, useGetRelatedProducts, useAddToCart, useAddToWishlist, getGetCartQueryKey, getGetWishlistQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from "recharts";
import ProductCard from "@/components/ProductCard";

export default function ProductDetail() {
  const params = useParams<{ id: string }>();
  const id = parseInt(params.id ?? "0", 10);
  const queryClient = useQueryClient();

  const { data: product, isLoading } = useGetProduct(id, { query: { enabled: !!id } });
  const { data: related } = useGetRelatedProducts(id, { query: { enabled: !!id } });
  const addToCart = useAddToCart();
  const addToWishlist = useAddToWishlist();

  const handleAddToCart = async () => {
    if (!product) return;
    await addToCart.mutateAsync({ data: { productId: product.id, quantity: 1 } });
    queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
  };

  const handleWishlist = async () => {
    if (!product) return;
    await addToWishlist.mutateAsync({ data: { productId: product.id } });
    queryClient.invalidateQueries({ queryKey: getGetWishlistQueryKey() });
  };

  const trustData = product ? [{ value: product.trustScore, fill: "url(#trustGradient)" }] : [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0F172A] pt-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="skeleton aspect-square rounded-2xl" />
            <div className="space-y-4">
              <div className="skeleton h-8 w-3/4" />
              <div className="skeleton h-4 w-1/2" />
              <div className="skeleton h-4 w-1/3" />
              <div className="skeleton h-12 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#0F172A] pt-24 flex items-center justify-center text-white/50">
        Product not found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F172A] pt-24 pb-20 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Back */}
        <Link href="/products">
          <motion.button
            whileHover={{ x: -3 }}
            className="flex items-center gap-2 text-white/50 hover:text-white mb-8 text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Products
          </motion.button>
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="relative overflow-hidden rounded-2xl glass-card"
          >
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full aspect-square object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${product.id}/600/600`;
              }}
            />
            <div className="absolute top-4 left-4 flex gap-2">
              <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-purple-500/80 backdrop-blur text-white text-xs font-medium">
                <Cpu className="w-3 h-3" /> AI Pick
              </div>
              {product.isLocalData && (
                <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/80 backdrop-blur text-white text-xs font-medium">
                  <Shield className="w-3 h-3" /> Local Data
                </div>
              )}
            </div>
          </motion.div>

          {/* Details */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <div>
              <p className="text-purple-400 text-sm font-medium mb-1">{product.category}</p>
              <h1 className="text-3xl font-extrabold text-white leading-tight">{product.name}</h1>
              <p className="text-white/50 mt-2 text-sm leading-relaxed">{product.description}</p>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i < Math.floor(product.rating) ? "text-amber-400 fill-amber-400" : "text-white/20"}`}
                  />
                ))}
              </div>
              <span className="text-white font-medium">{product.rating}</span>
              <span className="text-white/40 text-sm">({product.reviewCount ?? 0} reviews)</span>
            </div>

            {/* Price */}
            <div className="text-4xl font-extrabold text-white">${product.price.toFixed(2)}</div>

            {/* Trust Score Visualizer */}
            <div className="glass-card p-5">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart
                      cx="50%"
                      cy="50%"
                      innerRadius="60%"
                      outerRadius="100%"
                      data={[{ value: product.trustScore }]}
                      startAngle={90}
                      endAngle={-270}
                    >
                      <defs>
                        <linearGradient id="trustGradient" x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor="#a855f7" />
                          <stop offset="100%" stopColor="#3b82f6" />
                        </linearGradient>
                      </defs>
                      <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                      <RadialBar dataKey="value" background={{ fill: "rgba(255,255,255,0.05)" }} fill="url(#trustGradient)" />
                    </RadialBarChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-white font-bold text-xs">{product.trustScore}%</span>
                  </div>
                </div>
                <div>
                  <p className="text-white font-semibold">Trust Score</p>
                  <p className="text-white/50 text-xs mt-0.5">Based on reviews & returns</p>
                </div>
                <div className="ml-auto text-right">
                  <div className="flex items-center gap-1 text-amber-400 text-sm">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span className="font-medium">{product.regretPercent}%</span>
                  </div>
                  <p className="text-white/40 text-xs">return rate</p>
                </div>
              </div>
            </div>

            {/* AI Reason */}
            {product.aiReason && (
              <div className="glass-card p-4 border-l-2 border-purple-500">
                <div className="flex items-start gap-2">
                  <Cpu className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-white/60 text-xs font-medium mb-0.5">AI Recommendation Reason</p>
                    <p className="text-white/80 text-sm italic">"{product.aiReason}"</p>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddToCart}
                disabled={addToCart.isPending || !product.inStock}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all disabled:opacity-50"
              >
                <ShoppingCart className="w-4 h-4" />
                {product.inStock ? "Add to Cart" : "Out of Stock"}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleWishlist}
                className="p-3.5 rounded-xl glass border border-white/15 text-white/60 hover:text-white hover:border-white/25 transition-all"
              >
                <Heart className="w-5 h-5" />
              </motion.button>
            </div>
          </motion.div>
        </div>

        {/* Related Products */}
        {related && related.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-white mb-5">Related Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {related.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
