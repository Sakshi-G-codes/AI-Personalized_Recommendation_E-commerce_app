import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight } from "lucide-react";
import { useGetCart, useRemoveFromCart, useClearCart, getGetCartQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

export default function Cart() {
  const queryClient = useQueryClient();
  const { data: cart, isLoading } = useGetCart();
  const removeFromCart = useRemoveFromCart();
  const clearCart = useClearCart();

  const handleRemove = async (itemId: number) => {
    await removeFromCart.mutateAsync({ itemId });
    queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
  };

  const handleClear = async () => {
    await clearCart.mutateAsync();
    queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
  };

  return (
    <div className="min-h-screen bg-[#0F172A] pt-24 pb-20 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-extrabold text-white">Your Cart</h1>
            <p className="text-white/50 text-sm mt-1">{cart?.itemCount ?? 0} items</p>
          </div>
          {cart && cart.items.length > 0 && (
            <button
              onClick={handleClear}
              className="text-red-400/70 hover:text-red-400 text-sm flex items-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear All
            </button>
          )}
        </motion.div>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="skeleton h-24 rounded-2xl" />
            ))}
          </div>
        ) : cart && cart.items.length > 0 ? (
          <>
            <div className="space-y-3 mb-6">
              <AnimatePresence>
                {cart.items.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20, height: 0 }}
                    className="glass-card p-4 flex items-center gap-4"
                  >
                    <img
                      src={item.product?.imageUrl ?? ""}
                      alt={item.product?.name ?? ""}
                      className="w-20 h-20 object-cover rounded-xl"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${item.productId}/200/200`;
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-semibold text-sm leading-tight truncate">
                        {item.product?.name}
                      </h3>
                      <p className="text-white/40 text-xs mt-0.5">{item.product?.category}</p>
                      <p className="text-white/70 text-sm mt-1">${item.price.toFixed(2)} each</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-2 glass rounded-full px-3 py-1">
                        <Minus className="w-3 h-3 text-white/60" />
                        <span className="text-white text-sm font-medium w-4 text-center">{item.quantity}</span>
                        <Plus className="w-3 h-3 text-white/60" />
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-bold">${(item.price * item.quantity).toFixed(2)}</p>
                      <button
                        onClick={() => handleRemove(item.id)}
                        className="text-red-400/60 hover:text-red-400 mt-1 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Summary */}
            <div className="glass-card p-6">
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-white/60 text-sm">
                  <span>Subtotal ({cart.itemCount} items)</span>
                  <span>${cart.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-white/60 text-sm">
                  <span>Shipping</span>
                  <span className="text-emerald-400">Free</span>
                </div>
                <div className="h-px bg-white/10" />
                <div className="flex justify-between text-white font-bold text-lg">
                  <span>Total</span>
                  <span className="gradient-text">${cart.total.toFixed(2)}</span>
                </div>
              </div>

              <Link href="/checkout">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all"
                >
                  Proceed to Checkout <ArrowRight className="w-4 h-4" />
                </motion.button>
              </Link>
            </div>
          </>
        ) : (
          <div className="text-center py-24">
            <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-white/20" />
            <h2 className="text-white font-semibold text-xl mb-2">Your cart is empty</h2>
            <p className="text-white/40 text-sm mb-6">Add some products to get started</p>
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
