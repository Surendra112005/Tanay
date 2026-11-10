import React from "react";

const EMOTIONS = [
  { id: "joy", label: "Happy", emoji: "😊", color: "hover:border-emotion-joy hover:bg-emotion-joy/5 text-emotion-joy" },
  { id: "sadness", label: "Sad", emoji: "😢", color: "hover:border-emotion-sadness hover:bg-emotion-sadness/5 text-emotion-sadness" },
  { id: "anger", label: "Angry", emoji: "😠", color: "hover:border-emotion-anger hover:bg-emotion-anger/5 text-emotion-anger" },
  { id: "fear", label: "Fear", emoji: "😨", color: "hover:border-emotion-fear hover:bg-emotion-fear/5 text-emotion-fear" },
  { id: "love", label: "Love", emoji: "❤️", color: "hover:border-emotion-love hover:bg-emotion-love/5 text-emotion-love" },
  { id: "lonely", label: "Lonely", emoji: "🥺", color: "hover:border-emotion-lonely hover:bg-emotion-lonely/5 text-emotion-lonely" },
  { id: "stress", label: "Stressed", emoji: "😓", color: "hover:border-emotion-stress hover:bg-emotion-stress/5 text-emotion-stress" },
  { id: "neutral", label: "Neutral", emoji: "😐", color: "hover:border-emotion-neutral hover:bg-emotion-neutral/5 text-emotion-neutral" },
];

const EMOTION_ACTIVE_STYLES = {
  joy: "border-emotion-joy bg-emotion-joy/10 text-emotion-joy shadow-[0_0_10px_rgba(229,192,72,0.2)]",
  sadness: "border-emotion-sadness bg-emotion-sadness/10 text-emotion-sadness shadow-[0_0_10px_rgba(59,130,246,0.2)]",
  anger: "border-emotion-anger bg-emotion-anger/10 text-emotion-anger shadow-[0_0_10px_rgba(239,68,68,0.2)]",
  fear: "border-emotion-fear bg-emotion-fear/10 text-emotion-fear shadow-[0_0_10px_rgba(168,85,247,0.2)]",
  love: "border-emotion-love bg-emotion-love/10 text-emotion-love shadow-[0_0_10px_rgba(236,72,153,0.2)]",
  lonely: "border-emotion-lonely bg-emotion-lonely/10 text-emotion-lonely shadow-[0_0_10px_rgba(20,184,166,0.2)]",
  stress: "border-emotion-stress bg-emotion-stress/10 text-emotion-stress shadow-[0_0_10px_rgba(249,115,22,0.2)]",
  neutral: "border-emotion-neutral bg-emotion-neutral/10 text-emotion-neutral",
};

export default function EmotionSelector({ selectedEmotion = "auto", onSelect }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
        {/* Auto Option */}
        <button
          onClick={() => onSelect("auto")}
          className={`px-2 py-2 rounded-lg text-xs font-semibold border transition-all duration-300 text-center cursor-pointer ${
            selectedEmotion === "auto"
              ? "border-luxury-gold bg-luxury-gold/10 text-luxury-gold shadow-gold-glow"
              : "border-neutral-800 bg-neutral-900/40 hover:border-luxury-gold/50 text-neutral-400 hover:text-luxury-gold"
          }`}
        >
          🤖 Auto
        </button>

        {/* Manual Emotions */}
        {EMOTIONS.map((em) => {
          const isActive = selectedEmotion === em.id;
          return (
            <button
              key={em.id}
              onClick={() => onSelect(em.id)}
              className={`px-2 py-2 rounded-lg text-xs font-medium border transition-all duration-300 flex items-center justify-center gap-1 cursor-pointer ${
                isActive 
                  ? EMOTION_ACTIVE_STYLES[em.id]
                  : `border-neutral-800 bg-neutral-900/40 ${em.color}`
              }`}
            >
              <span>{em.emoji}</span>
              <span className="hidden sm:inline">{em.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
