import React from "react";
import { Mic, MicOff } from "lucide-react";

export default function MicButton({ isListening = false, onClick }) {
  return (
    <div className="relative flex items-center justify-center">
      {/* Glow Aura Layer for active listening */}
      {isListening && (
        <>
          <div className="absolute w-14 h-14 rounded-full bg-red-500/30 animate-ping" />
          <div className="absolute w-16 h-16 rounded-full border border-red-500/40 animate-pulse-slow" />
          <div className="absolute inset-0 rounded-full bg-emotion-anger/10 blur-md" />
        </>
      )}
      
      {/* Main Microphone Button */}
      <button
        onClick={onClick}
        title={isListening ? "Listening... Click to stop" : "Press to Speak"}
        className={`w-12 h-12 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 z-10 border ${
          isListening
            ? "bg-red-600 border-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.7)] hover:bg-red-700"
            : "bg-neutral-900 border-luxury-gold/30 text-luxury-gold shadow-gold-glow hover:border-luxury-gold hover:bg-neutral-800"
        }`}
      >
        {isListening ? (
          <MicOff className="w-5 h-5 animate-pulse" />
        ) : (
          <Mic className="w-5 h-5" />
        )}
      </button>
    </div>
  );
}
