import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { CheckCircle, Package } from "lucide-react";
import { useGetCart, useCreateOrder, getGetCartQueryKey, getListOrdersQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

export default function Checkout() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { data: cart } = useGetCart();
  const createOrder = useCreateOrder();
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "US",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createOrder.mutateAsync({ data: form });
    queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
    queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey() });
    setSuccess(true);
    setTimeout(() => setLocation("/profile"), 3000);
  };

  return (
    <div className="min-h-screen bg-[#0F172A] pt-24 pb-20 px-4">
      <div className="max-w-4xl mx-auto">
        <AnimatePresence mode="wait">
          {success ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mx-auto mb-6"
              >
                <CheckCircle className="w-10 h-10 text-white" />
              </motion.div>
              <h2 className="text-3xl font-extrabold text-white mb-2">Order Confirmed!</h2>
              <p className="text-white/50">Redirecting to your profile...</p>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-8"
            >
              {/* Form */}
              <div>
                <h1 className="text-3xl font-extrabold text-white mb-6">Checkout</h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="glass-card p-5 space-y-4">
                    <h2 className="text-white font-semibold">Shipping Address</h2>
                    {[
                      { name: "address", label: "Street Address", placeholder: "123 Main St" },
                      { name: "city", label: "City", placeholder: "New York" },
                      { name: "state", label: "State", placeholder: "NY" },
                      { name: "zipCode", label: "ZIP Code", placeholder: "10001" },
                    ].map((field) => (
                      <div key={field.name}>
                        <label className="text-white/50 text-xs block mb-1">{field.label}</label>
                        <input
                          type="text"
                          name={field.name}
                          value={(form as any)[field.name]}
                          onChange={handleChange}
                          required
                          placeholder={field.placeholder}
                          className="w-full px-4 py-2.5 rounded-xl glass border border-white/15 text-white placeholder-white/30 bg-transparent text-sm focus:border-purple-500/50 focus:outline-none transition-all"
                        />
                      </div>
                    ))}
                    <div>
                      <label className="text-white/50 text-xs block mb-1">Country</label>
                      <select
                        name="country"
                        value={form.country}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 rounded-xl glass border border-white/15 text-white bg-[#0F172A] text-sm focus:border-purple-500/50 focus:outline-none transition-all"
                      >
                        <option value="US">United States</option>
                        <option value="UK">United Kingdom</option>
                        <option value="CA">Canada</option>
                        <option value="AU">Australia</option>
                      </select>
                    </div>
                  </div>

                  <motion.button
                    type="submit"
                    disabled={createOrder.isPending}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all disabled:opacity-50"
                  >
                    {createOrder.isPending ? "Placing Order..." : "Place Order"}
                  </motion.button>
                </form>
              </div>

              {/* Summary */}
              <div>
                <h2 className="text-xl font-bold text-white mb-4">Order Summary</h2>
                <div className="glass-card p-5 space-y-3">
                  {cart?.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <img
                        src={item.product?.imageUrl ?? ""}
                        alt={item.product?.name ?? ""}
                        className="w-12 h-12 rounded-lg object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${item.productId}/200/200`;
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">{item.product?.name}</p>
                        <p className="text-white/40 text-xs">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-white font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                  {(!cart || cart.items.length === 0) && (
                    <div className="text-center py-6 text-white/40">
                      <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Cart is empty</p>
                    </div>
                  )}
                  <div className="h-px bg-white/10" />
                  <div className="flex justify-between text-white font-bold">
                    <span>Total</span>
                    <span className="gradient-text">${(cart?.total ?? 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
