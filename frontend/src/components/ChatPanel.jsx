import React, { useRef, useEffect } from "react";
import { Send, Globe, Heart, Shield } from "lucide-react";
import MicButton from "./MicButton";
import EmotionSelector from "./EmotionSelector";

export default function ChatPanel({
  messages = [],
  inputValue = "",
  onInputChange,
  onSendMessage,
  isListening = false,
  onToggleListen,
  isGenerating = false,
  selectedEmotion = "auto",
  onEmotionChange,
  showManualEmotion = false
}) {
  const chatEndRef = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isGenerating]);

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-transparent">
      {/* Scrollable message logs area */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-60 max-w-md mx-auto space-y-3">
            <div className="w-16 h-16 rounded-full bg-neutral-900 border border-luxury-gold/25 flex items-center justify-center glow-gold">
              <span className="text-xl">✨</span>
            </div>
            <h3 className="luxury-heading text-lg text-gold-gradient font-bold">Initiate Consciousness</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Welcome to the digital sanctuary of Tanay AI. Speak or write your thoughts below. I am attuned to your emotions.
            </p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isUser = msg.sender === "user";
            return (
              <div
                key={index}
                className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-3 border transition-all duration-300 ${
                    isUser
                      ? "bg-neutral-950 border-luxury-gold/30 text-neutral-200 rounded-tr-none shadow-gold-glow"
                      : "glassmorphism border-luxury-gold/15 text-neutral-100 rounded-tl-none glow-gold"
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                  
                  {/* Message Metadata Tags */}
                  <div className="flex items-center gap-3 mt-2 text-[10px] text-neutral-500 font-medium">
                    <span className="font-mono">
                      {msg.timestamp
                        ? new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                        : new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                    {!isUser && msg.language && (
                      <span className="flex items-center gap-0.5 border border-neutral-800 bg-neutral-900 px-1.5 py-0.2 rounded font-mono">
                        <Globe className="w-2.5 h-2.5" />
                        {msg.language}
                      </span>
                    )}
                    {!isUser && msg.emotion && (
                      <span className="flex items-center gap-0.5 border border-neutral-800 bg-neutral-900 px-1.5 py-0.2 rounded font-mono uppercase font-bold text-luxury-gold">
                        {msg.emotion}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* AI Generating Loader Indicator */}
        {isGenerating && (
          <div className="flex w-full justify-start">
            <div className="glassmorphism rounded-2xl rounded-tl-none px-4 py-3.5 border border-luxury-gold/10 flex items-center gap-1.5 shadow-gold-glow">
              <div className="w-2 h-2 rounded-full bg-luxury-gold animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 rounded-full bg-luxury-gold animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 rounded-full bg-luxury-gold animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Manual Emotion Selector Overlay (if detection fails or overridden) */}
      {showManualEmotion && (
        <div className="px-6 py-2 bg-neutral-950/60 border-t border-luxury-gold/5 flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-[11px] text-neutral-400 font-medium">
            <span>Emotion Detection Override:</span>
            <span className="text-luxury-gold font-bold uppercase">{selectedEmotion}</span>
          </div>
          <EmotionSelector 
            selectedEmotion={selectedEmotion} 
            onSelect={onEmotionChange} 
          />
        </div>
      )}

      {/* Inputs controls tray */}
      <div className="p-4 bg-neutral-950/40 border-t border-luxury-gold/10 flex items-center gap-3">
        {/* Micro Speak Button */}
        <MicButton 
          isListening={isListening} 
          onClick={onToggleListen} 
        />

        {/* Chat input box */}
        <div className="flex-1 relative flex items-center">
          <textarea
            value={inputValue}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={isListening ? "Listening to your voice..." : "Whisper to Tanay AI..."}
            rows={1}
            disabled={isListening}
            className="w-full bg-neutral-900/80 hover:bg-neutral-900 border border-luxury-gold/10 hover:border-luxury-gold/20 focus:border-luxury-gold/50 rounded-xl py-3 pl-4 pr-12 text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none resize-none max-h-24 transition-all duration-300 font-sans shadow-inner"
          />
          <button
            onClick={onSendMessage}
            disabled={!inputValue.trim() || isGenerating}
            className="absolute right-2.5 p-2 rounded-lg bg-gold-gradient text-black hover:scale-105 active:scale-95 disabled:opacity-30 disabled:scale-100 disabled:hover:scale-100 transition-all cursor-pointer shadow-gold-glow"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
