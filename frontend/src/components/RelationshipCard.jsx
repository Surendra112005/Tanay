import React from "react";
import { Award, Heart, MessageCircle, Star } from "lucide-react";

export default function RelationshipCard({ 
  level = "Stranger", 
  score = 10.0, 
  interactionsCount = 0 
}) {
  // Determine next milestone description
  const getMilestoneInfo = (currentLevel) => {
    switch (currentLevel) {
      case "Stranger":
        return { next: "Acquaintance", target: 15, desc: "Speak more to break the ice and store initial facts." };
      case "Acquaintance":
        return { next: "Friend", target: 40, desc: "Express feelings and thoughts to deepen the trust." };
      case "Friend":
        return { next: "Best Friend", target: 70, desc: "Discuss dreams, stress, and memories to form a solid bond." };
      case "Best Friend":
        return { next: "Soulmate", target: 90, desc: "Reach the ultimate alignment of understanding." };
      case "Soulmate":
        default:
        return { next: "Max level reached", target: 100, desc: "You have reached perfect emotional resonance." };
    }
  };

  const milestone = getMilestoneInfo(level);
  const nextTargetPercent = Math.min(100, Math.max(0, (score / milestone.target) * 100));

  return (
    <div className="glassmorphism rounded-2xl p-6 border border-luxury-gold/15 shadow-gold-glow flex flex-col gap-5 relative overflow-hidden">
      {/* Background radial gold glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-luxury-gold/5 rounded-full blur-2xl pointer-events-none" />

      {/* Header Info */}
      <div className="flex items-start justify-between">
        <div className="flex flex-col text-left">
          <span className="text-[10px] uppercase font-mono tracking-widest text-luxury-gold/60 font-bold">
            Bond Diagnostics
          </span>
          <h3 className="luxury-heading text-2xl text-gold-gradient font-bold mt-1">
            {level}
          </h3>
        </div>
        <div className="w-12 h-12 rounded-full bg-neutral-900 border border-luxury-gold/20 flex items-center justify-center glow-gold text-luxury-gold animate-pulse">
          <Heart className="w-6 h-6 fill-current" />
        </div>
      </div>

      {/* Score and Progress Bar */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-neutral-400">Emotional Alignment</span>
          <span className="text-luxury-gold font-mono">{score} / 100</span>
        </div>
        
        {/* Luxury Glowing Progress Bar */}
        <div className="w-full h-3 bg-neutral-950 rounded-full overflow-hidden border border-luxury-gold/5 shadow-inner">
          <div 
            className="h-full bg-gold-gradient transition-all duration-1000 shadow-gold-glow-btn"
            style={{ width: `${score}%` }}
          />
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 gap-4 py-2 border-y border-luxury-gold/5 text-center">
        <div className="flex flex-col items-center">
          <MessageCircle className="w-4 h-4 text-luxury-gold mb-1" />
          <span className="text-[10px] text-neutral-500 uppercase font-mono">Conversations</span>
          <span className="text-sm font-bold text-neutral-200 mt-0.5">{interactionsCount}</span>
        </div>
        <div className="flex flex-col items-center">
          <Star className="w-4 h-4 text-luxury-gold mb-1" />
          <span className="text-[10px] text-neutral-500 uppercase font-mono">Bond Stage</span>
          <span className="text-sm font-bold text-neutral-200 mt-0.5">
            {score < 15 ? "1/5" : score < 40 ? "2/5" : score < 70 ? "3/5" : score < 90 ? "4/5" : "5/5"}
          </span>
        </div>
      </div>

      {/* Unlocked Milestones / Next Goal description */}
      <div className="flex gap-3 text-left">
        <div className="mt-0.5">
          <Award className="w-5 h-5 text-luxury-gold" />
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-neutral-300">
            Next Level: {milestone.next}
          </span>
          <span className="text-[11px] text-neutral-400 leading-relaxed mt-0.5">
            {milestone.desc}
          </span>
        </div>
      </div>
    </div>
  );
}
