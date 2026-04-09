import { motion } from "framer-motion";
import { Brain, TrendingUp, Users, Shield, Target, Sparkles } from "lucide-react";
import {
  useGetDashboardStats,
  useGetRecommendationAccuracy,
  useGetCategoryBreakdown,
} from "@workspace/api-client-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const COLORS = ["#a855f7", "#3b82f6", "#06b6d4", "#f59e0b", "#ef4444"];

const StatCard = ({ icon: Icon, label, value, sub, gradient }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="glass-card p-5"
  >
    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-4`}>
      <Icon className="w-5 h-5 text-white" />
    </div>
    <p className="text-white/50 text-xs font-medium mb-1">{label}</p>
    <p className="text-2xl font-extrabold text-white">{value}</p>
    {sub && <p className="text-white/40 text-xs mt-1">{sub}</p>}
  </motion.div>
);

export default function Dashboard() {
  const { data: stats } = useGetDashboardStats();
  const { data: accuracy } = useGetRecommendationAccuracy();
  const { data: categories } = useGetCategoryBreakdown();

  return (
    <div className="min-h-screen bg-[#0F172A] pt-24 pb-20 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-1">
            <Brain className="w-7 h-7 text-purple-400" />
            <h1 className="text-3xl font-extrabold gradient-text">AI Dashboard</h1>
          </div>
          <p className="text-white/50 text-sm">Recommendation analytics & personalization insights</p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={Target}
            label="Accuracy Rate"
            value={`${stats?.accuracyRate ?? 0}%`}
            sub="Recommendation precision"
            gradient="from-purple-500 to-blue-500"
          />
          <StatCard
            icon={Sparkles}
            label="Total Recommendations"
            value={(stats?.totalRecommendations ?? 0).toLocaleString()}
            sub={`${stats?.acceptedRecommendations ?? 0} accepted`}
            gradient="from-blue-500 to-cyan-500"
          />
          <StatCard
            icon={Users}
            label="Active Users"
            value={stats?.activeUsers ?? 0}
            sub="Registered users"
            gradient="from-cyan-500 to-teal-500"
          />
          <StatCard
            icon={Shield}
            label="Privacy Compliance"
            value={`${stats?.privacyCompliance ?? 0}%`}
            sub="Data protection score"
            gradient="from-emerald-500 to-green-500"
          />
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="glass-card p-5 text-center">
            <p className="text-white/50 text-xs mb-1">Top Mood</p>
            <p className="text-2xl font-extrabold text-white capitalize">{stats?.topMood ?? "chill"}</p>
          </div>
          <div className="glass-card p-5 text-center">
            <p className="text-white/50 text-xs mb-1">Avg Trust Score</p>
            <p className="text-2xl font-extrabold gradient-text">{Math.round(stats?.avgTrustScore ?? 0)}%</p>
          </div>
          <div className="glass-card p-5 text-center">
            <p className="text-white/50 text-xs mb-1">Total Products</p>
            <p className="text-2xl font-extrabold text-white">{stats?.totalProducts ?? 0}</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Accuracy Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-6"
          >
            <div className="flex items-center gap-2 mb-5">
              <TrendingUp className="w-5 h-5 text-purple-400" />
              <h2 className="text-white font-bold">Recommendation Accuracy (30 days)</h2>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={accuracy ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }}
                  tickFormatter={(v) => v.slice(5)}
                  interval={6}
                />
                <YAxis
                  tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }}
                  domain={[50, 100]}
                  unit="%"
                />
                <Tooltip
                  contentStyle={{ background: "#1e1b4b", border: "1px solid rgba(139,92,246,0.3)", borderRadius: "8px", color: "#fff" }}
                  formatter={(v: any) => [`${v}%`, "Accuracy"]}
                />
                <Line
                  type="monotone"
                  dataKey="accuracy"
                  stroke="url(#lineGrad)"
                  strokeWidth={2}
                  dot={false}
                />
                <defs>
                  <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#a855f7" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                </defs>
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Category Pie */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-6"
          >
            <div className="flex items-center gap-2 mb-5">
              <Target className="w-5 h-5 text-blue-400" />
              <h2 className="text-white font-bold">Category Preferences</h2>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={categories ?? []}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  dataKey="count"
                  nameKey="category"
                >
                  {(categories ?? []).map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: "#1e1b4b", border: "1px solid rgba(139,92,246,0.3)", borderRadius: "8px", color: "#fff" }}
                  formatter={(v: any, name: any, entry: any) => [`${entry.payload.percentage}%`, entry.payload.category]}
                />
                <Legend
                  wrapperStyle={{ fontSize: "11px", color: "rgba(255,255,255,0.6)" }}
                  formatter={(value) => <span style={{ color: "rgba(255,255,255,0.6)" }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
