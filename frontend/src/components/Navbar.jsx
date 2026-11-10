import React from "react";
import { Sparkles, Heart, User, ShieldAlert, Cpu } from "lucide-react";

const EMOTION_EMOJIS = {
  joy: "😊 Happy",
  sadness: "😢 Sad",
  anger: "😠 Angry",
  fear: "😨 Fear",
  love: "❤️ Love",
  lonely: "🥺 Lonely",
  stress: "😓 Stressed",
  neutral: "😐 Neutral"
};

const EMOTION_COLORS = {
  joy: "text-emotion-joy border-emotion-joy/20 bg-emotion-joy/5 shadow-[0_0_12px_rgba(229,192,72,0.15)]",
  sadness: "text-emotion-sadness border-emotion-sadness/20 bg-emotion-sadness/5 shadow-[0_0_12px_rgba(59,130,246,0.15)]",
  anger: "text-emotion-anger border-emotion-anger/20 bg-emotion-anger/5 shadow-[0_0_12px_rgba(239,68,68,0.15)]",
  fear: "text-emotion-fear border-emotion-fear/20 bg-emotion-fear/5 shadow-[0_0_12px_rgba(168,85,247,0.15)]",
  love: "text-emotion-love border-emotion-love/20 bg-emotion-love/5 shadow-[0_0_12px_rgba(236,72,153,0.15)]",
  lonely: "text-emotion-lonely border-emotion-lonely/20 bg-emotion-lonely/5 shadow-[0_0_12px_rgba(20,184,166,0.15)]",
  stress: "text-emotion-stress border-emotion-stress/20 bg-emotion-stress/5 shadow-[0_0_12px_rgba(249,115,22,0.15)]",
  neutral: "text-emotion-neutral border-emotion-neutral/20 bg-emotion-neutral/5"
};

export default function Navbar({ 
  currentEmotion = "neutral", 
  relationshipLevel = "Acquaintance", 
  relationshipScore = 40.0,
  userProfile = { display_name: "Alex Mercer" },
  isAdmin = false,
  onNavigate 
}) {
  return (
    <nav className="w-full h-16 border-b border-luxury-gold/10 glassmorphism flex items-center justify-between px-6 z-50 fixed top-0 left-0">
      {/* Brand Logo */}
      <div 
        className="flex items-center gap-3 cursor-pointer"
        onClick={() => onNavigate("chat")}
      >
        <div className="w-9 h-9 rounded-full bg-gold-gradient flex items-center justify-center glow-gold">
          <Sparkles className="w-5 h-5 text-black" />
        </div>
        <div className="flex flex-col">
          <span className="luxury-heading text-lg font-bold text-gold-gradient tracking-wider">
            TANAY AI
          </span>
          <span className="text-[10px] text-luxury-gold/60 tracking-widest -mt-1 font-mono uppercase">
            Neural Companion
          </span>
        </div>
      </div>

      {/* Middle Status Indicators (Voice/Emotion/Relationship) */}
      <div className="hidden md:flex items-center gap-6">
        {/* Relationship Level Card */}
        <div className="flex items-center gap-3 glassmorphism-light py-1 px-4 rounded-full border border-luxury-gold/5">
          <Heart className="w-4 h-4 text-luxury-gold animate-pulse" />
          <div className="flex flex-col text-left">
            <span className="text-[10px] text-neutral-400 font-medium leading-none">Bond Level</span>
            <span className="text-xs text-luxury-gold font-bold leading-tight">{relationshipLevel}</span>
          </div>
          <div className="w-16 h-1.5 bg-neutral-800 rounded-full overflow-hidden ml-1 border border-neutral-700/50">
            <div 
              className="h-full bg-gold-gradient" 
              style={{ width: `${relationshipScore}%` }}
            />
          </div>
        </div>

        {/* Emotion State Banner */}
        <div className={`flex items-center gap-2 py-1 px-4 rounded-full border text-xs font-semibold uppercase tracking-wider transition-all duration-500 ${EMOTION_COLORS[currentEmotion] || EMOTION_COLORS.neutral}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-current animate-ping" />
          {EMOTION_EMOJIS[currentEmotion] || "😐 Neutral"}
        </div>
      </div>

      {/* Right Side Options & Profile */}
      <div className="flex items-center gap-4">
        {/* Admin Navigation Toggle */}
        <button
          onClick={() => onNavigate(isAdmin ? "chat" : "admin-login")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs transition-all border ${
            isAdmin 
              ? "border-luxury-gold bg-luxury-gold/10 text-luxury-gold glow-gold" 
              : "border-neutral-700 hover:border-luxury-gold/50 text-neutral-400 hover:text-luxury-gold"
          }`}
        >
          {isAdmin ? <Cpu className="w-3.5 h-3.5" /> : <ShieldAlert className="w-3.5 h-3.5" />}
          <span>{isAdmin ? "Admin Panel" : "Admin Login"}</span>
        </button>

        {/* User Profile Summary */}
        <div 
          onClick={() => onNavigate("profile")}
          className="flex items-center gap-2 cursor-pointer glassmorphism-light hover:bg-neutral-800/40 border border-neutral-700/30 py-1.5 px-3 rounded-full transition-all"
        >
          <div className="w-7 h-7 rounded-full bg-neutral-800 border border-luxury-gold/30 flex items-center justify-center overflow-hidden">
            {userProfile.avatar_url && userProfile.avatar_url !== "/assets/default_avatar.png" ? (
              <img src={userProfile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <User className="w-4 h-4 text-luxury-gold" />
            )}
          </div>
          <span className="text-xs text-neutral-300 font-medium hidden sm:inline">
            {userProfile.display_name || "User"}
          </span>
        </div>
      </div>
    </nav>
  );
}
