import React from "react";
import { MessageSquare, BrainCircuit, UserCog, Settings, Calendar, RefreshCw } from "lucide-react";

export default function Sidebar({ 
  activePage = "chat", 
  onNavigate,
  chatHistory = [],
  onClearHistory,
  onRefreshHistory,
  isConnected = false
}) {
  return (
    <aside className="w-64 h-[calc(100vh-4rem)] border-r border-luxury-gold/10 glassmorphism flex flex-col fixed left-0 top-16 z-40">
      {/* Navigation Buttons */}
      <div className="p-4 border-b border-luxury-gold/5 flex flex-col gap-1.5">
        <button
          onClick={() => onNavigate("chat")}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activePage === "chat" 
              ? "bg-gold-gradient text-black font-semibold shadow-gold-glow" 
              : "text-neutral-400 hover:text-luxury-gold hover:bg-neutral-900/60"
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Chat Companion</span>
        </button>

        <button
          onClick={() => onNavigate("memories")}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activePage === "memories" 
              ? "bg-gold-gradient text-black font-semibold shadow-gold-glow" 
              : "text-neutral-400 hover:text-luxury-gold hover:bg-neutral-900/60"
          }`}
        >
          <BrainCircuit className="w-4 h-4" />
          <span>Memory Vault</span>
        </button>

        <button
          onClick={() => onNavigate("profile")}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activePage === "profile" 
              ? "bg-gold-gradient text-black font-semibold shadow-gold-glow" 
              : "text-neutral-400 hover:text-luxury-gold hover:bg-neutral-900/60"
          }`}
        >
          <UserCog className="w-4 h-4" />
          <span>Profile Settings</span>
        </button>

        <button
          onClick={() => onNavigate("settings")}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activePage === "settings" 
              ? "bg-gold-gradient text-black font-semibold shadow-gold-glow" 
              : "text-neutral-400 hover:text-luxury-gold hover:bg-neutral-900/60"
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>System Config</span>
        </button>
      </div>

      {/* Chat History Header */}
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <span className="text-[10px] uppercase font-mono tracking-widest text-luxury-gold/50 font-bold">
          Recent Interactions
        </span>
        <button
          onClick={onRefreshHistory}
          className="text-neutral-500 hover:text-luxury-gold p-1 rounded transition-all"
          title="Refresh History"
        >
          <RefreshCw className="w-3 h-3" />
        </button>
      </div>

      {/* Chat History Logs */}
      <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-1">
        {chatHistory.length === 0 ? (
          <div className="text-center py-8 px-4 text-xs text-neutral-500">
            No logged conversations found. Speak to Tanay to begin.
          </div>
        ) : (
          // Filter to user messages to display clean topic headings
          chatHistory
            .filter((item) => item.sender === "user")
            .slice(-15) // take latest 15 interactions
            .map((item, index) => {
              const formattedTime = item.timestamp 
                ? new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : "";
              return (
                <div
                  key={index}
                  onClick={() => onNavigate("chat")}
                  className="flex flex-col text-left p-2.5 rounded-md hover:bg-neutral-900/50 cursor-pointer border border-transparent hover:border-luxury-gold/10 transition-all group"
                >
                  <span className="text-xs font-medium text-neutral-300 truncate group-hover:text-luxury-gold">
                    {item.text}
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[9px] text-neutral-500 flex items-center gap-1 font-mono">
                      <Calendar className="w-2.5 h-2.5" />
                      {formattedTime}
                    </span>
                    <span className="text-[8px] px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400 border border-neutral-700/30 uppercase font-bold">
                      {item.emotion}
                    </span>
                  </div>
                </div>
              );
            })
        )}
      </div>

      {/* Connection Info footer */}
      <div className={`p-3 bg-black/40 border-t border-luxury-gold/5 text-center text-[10px] font-mono ${
        isConnected ? "text-luxury-gold/80" : "text-red-500/80 animate-pulse font-bold"
      }`}>
        {isConnected ? "SECURE CONNECTED // LATENCY 12ms" : "CORE BRAIN OFFLINE"}
      </div>
    </aside>
  );
}
