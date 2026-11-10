import React, { useState, useEffect } from "react";
import { BarChart3, Users, MessageSquare, Heart, RefreshCw } from "lucide-react";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  BarChart, Bar
} from "recharts";
import { api } from "../utils/api";

const CHART_COLORS = {
  joy: "#e5c048",      // Gold
  sadness: "#3b82f6",  // Blue
  anger: "#ef4444",    // Red
  fear: "#a855f7",     // Purple
  love: "#ec4899",     // Pink
  lonely: "#14b8a6",   // Teal
  stress: "#f97316",   // Orange
  neutral: "#9ca3af"   // Slate gray
};

const PALETTE = ["#d4af37", "#f3e5ab", "#aa7c11", "#a855f7", "#ec4899", "#3b82f6", "#14b8a6", "#f97316"];

export default function AnalyticsDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await api.getAnalytics();
      setData(res);
    } catch (err) {
      console.error("Failed to load analytics", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="h-96 flex items-center justify-center gap-2">
        <RefreshCw className="w-6 h-6 animate-spin text-luxury-gold" />
        <span className="text-sm text-neutral-400">Compiling database analytics...</span>
      </div>
    );
  }

  // Format pie chart color keys
  const getEmotionColor = (name) => {
    const key = name.toLowerCase();
    return CHART_COLORS[key] || "#d4af37";
  };

  return (
    <div className="text-left space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-luxury-gold/15 pb-4">
        <div className="flex flex-col">
          <span className="text-[10px] font-mono tracking-widest text-luxury-gold/50 uppercase font-bold">
            Cognitive Diagnostics
          </span>
          <h2 className="luxury-heading text-2xl text-gold-gradient font-bold mt-1">
            System Analytics & Activity
          </h2>
        </div>
        <button
          onClick={fetchAnalytics}
          className="px-3 py-2 rounded border border-neutral-700 hover:border-luxury-gold/50 text-neutral-400 hover:text-luxury-gold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Analytics</span>
        </button>
      </div>

      {/* Stats Cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <div className="glassmorphism rounded-xl p-5 border border-luxury-gold/10 hover:border-luxury-gold/20 hover:scale-[1.01] transition-all flex items-center justify-between shadow-gold-glow">
          <div className="flex flex-col text-left">
            <span className="text-[9px] uppercase font-mono tracking-wider text-neutral-500 font-bold">Total Mind Nodes</span>
            <span className="text-2xl font-bold text-neutral-100 mt-1">{data.total_users}</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-neutral-900 border border-luxury-gold/10 flex items-center justify-center text-luxury-gold shadow-gold-glow">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Total Conversations */}
        <div className="glassmorphism rounded-xl p-5 border border-luxury-gold/10 hover:border-luxury-gold/20 hover:scale-[1.01] transition-all flex items-center justify-between shadow-gold-glow">
          <div className="flex flex-col text-left">
            <span className="text-[9px] uppercase font-mono tracking-wider text-neutral-500 font-bold">Total Interactions</span>
            <span className="text-2xl font-bold text-neutral-100 mt-1">{data.total_conversations}</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-neutral-900 border border-luxury-gold/10 flex items-center justify-center text-luxury-gold shadow-gold-glow">
            <MessageSquare className="w-5 h-5" />
          </div>
        </div>

        {/* Most Used Emotion */}
        <div className="glassmorphism rounded-xl p-5 border border-luxury-gold/10 hover:border-luxury-gold/20 hover:scale-[1.01] transition-all flex items-center justify-between shadow-gold-glow">
          <div className="flex flex-col text-left">
            <span className="text-[9px] uppercase font-mono tracking-wider text-neutral-500 font-bold">Dominant Mood</span>
            <span className="text-lg font-bold text-luxury-gold capitalize mt-1.5 flex items-center gap-1.5 leading-none">
              <span className="w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: getEmotionColor(data.most_used_emotion) }} />
              {data.most_used_emotion}
            </span>
          </div>
          <div className="w-10 h-10 rounded-full bg-neutral-900 border border-luxury-gold/10 flex items-center justify-center text-luxury-gold shadow-gold-glow">
            <BarChart3 className="w-5 h-5" />
          </div>
        </div>

        {/* Relationship Distribution summary */}
        <div className="glassmorphism rounded-xl p-5 border border-luxury-gold/10 hover:border-luxury-gold/20 hover:scale-[1.01] transition-all flex items-center justify-between shadow-gold-glow">
          <div className="flex flex-col text-left">
            <span className="text-[9px] uppercase font-mono tracking-wider text-neutral-500 font-bold">Core Bond State</span>
            <span className="text-sm font-bold text-neutral-200 mt-2 truncate">
              {data.relationship_distribution.find(item => item.value > 0)?.name || "Close Friend"}
            </span>
          </div>
          <div className="w-10 h-10 rounded-full bg-neutral-900 border border-luxury-gold/10 flex items-center justify-center text-luxury-gold shadow-gold-glow animate-pulse">
            <Heart className="w-5 h-5 fill-current" />
          </div>
        </div>
      </div>

      {/* Charts Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Line Chart: Chat activity over time */}
        <div className="lg:col-span-2 glassmorphism rounded-2xl p-5 border border-luxury-gold/10 flex flex-col gap-4 shadow-gold-glow">
          <h3 className="text-xs font-bold text-luxury-gold uppercase tracking-wider font-mono">
            Interactions Activity (Past 7 Days)
          </h3>
          <div className="w-full h-64 text-xs font-mono">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.chat_activity} margin={{ left: -15, right: 10, top: 10, bottom: 0 }}>
                <CartesianGrid stroke="#1f1f23" strokeDasharray="3 3" />
                <XAxis dataKey="date" stroke="#6b7280" />
                <YAxis stroke="#6b7280" allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#121212", border: "1px solid rgba(212,175,55,0.15)", borderRadius: "8px", color: "#e5e7eb" }}
                />
                <Line 
                  type="monotone" 
                  dataKey="chats" 
                  stroke="#d4af37" 
                  strokeWidth={2.5}
                  activeDot={{ r: 6, strokeWidth: 0, fill: "#f3e5ab" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart: Emotion shares */}
        <div className="glassmorphism rounded-2xl p-5 border border-luxury-gold/10 flex flex-col gap-4 shadow-gold-glow">
          <h3 className="text-xs font-bold text-luxury-gold uppercase tracking-wider font-mono">
            Emotional Sentiment Share
          </h3>
          <div className="w-full h-64 text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.emotion_usage}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {data.emotion_usage.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={getEmotionColor(entry.name)} 
                    />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: "#121212", border: "1px solid rgba(212,175,55,0.15)", borderRadius: "8px" }}
                />
                <Legend 
                  layout="horizontal" 
                  align="center"
                  verticalAlign="bottom"
                  iconSize={8}
                  iconType="circle"
                  wrapperStyle={{ color: "#d1d5db", fontSize: "10px" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart: Languages */}
        <div className="lg:col-span-3 glassmorphism rounded-2xl p-5 border border-luxury-gold/10 flex flex-col gap-4 shadow-gold-glow">
          <h3 className="text-xs font-bold text-luxury-gold uppercase tracking-wider font-mono">
            Vocal Language Demographics
          </h3>
          <div className="w-full h-48 text-xs font-mono">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.language_usage} margin={{ left: -15, right: 10, top: 10, bottom: 0 }}>
                <CartesianGrid stroke="#1f1f23" strokeDasharray="3 3" />
                <XAxis dataKey="name" stroke="#6b7280" />
                <YAxis stroke="#6b7280" allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#121212", border: "1px solid rgba(212,175,55,0.15)", borderRadius: "8px" }}
                />
                <Bar dataKey="value" fill="#d4af37" radius={[4, 4, 0, 0]}>
                  {data.language_usage.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PALETTE[index % PALETTE.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
