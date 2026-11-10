import React, { useState } from "react";
import { Brain, Star, Trash2, Plus, RefreshCw, Sparkles } from "lucide-react";

export default function MemoryPage({ 
  memories = [], 
  onAddMemory, 
  onDeleteMemory, 
  onRefresh 
}) {
  const [newContent, setNewContent] = useState("");
  const [importance, setImportance] = useState(3);
  const [emotion, setEmotion] = useState("neutral");
  const [showAddForm, setShowAddForm] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newContent.trim()) return;
    onAddMemory({
      content: newContent,
      importance,
      emotion
    }).then(() => {
      setNewContent("");
      setImportance(3);
      setEmotion("neutral");
      setShowAddForm(false);
    });
  };

  const getImportanceStars = (count) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star 
        key={i} 
        className={`w-3 h-3 ${i < count ? "text-luxury-gold fill-current" : "text-neutral-700"}`} 
      />
    ));
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 text-left">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-luxury-gold/15 pb-4 gap-4">
          <div className="flex flex-col">
            <span className="text-[10px] font-mono tracking-widest uppercase text-luxury-gold/50 font-bold">
              Cognitive Archive
            </span>
            <h2 className="luxury-heading text-3xl text-gold-gradient font-bold mt-1">
              Memory Vault
            </h2>
            <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
              These are key behavioral facts and statements that Tanay AI has extracted to customize interactions.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onRefresh}
              className="px-3 py-2 rounded border border-neutral-700 hover:border-luxury-gold/50 text-neutral-400 hover:text-luxury-gold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Sync Vault</span>
            </button>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="gold-btn py-2 px-4 rounded text-xs flex items-center gap-1.5 cursor-pointer font-bold"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Inject Memory</span>
            </button>
          </div>
        </div>

        {/* Add Memory Form */}
        {showAddForm && (
          <form onSubmit={handleSubmit} className="glassmorphism rounded-2xl p-6 border border-luxury-gold/20 flex flex-col gap-4 shadow-gold-glow animate-pulse-slow">
            <h3 className="luxury-heading text-lg text-luxury-gold font-bold">Manual Fact Injection</h3>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-neutral-400 uppercase font-mono font-bold">Memory Statement</label>
              <input
                type="text"
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="E.g. Prefers studying at night with instrumental music."
                required
                className="bg-neutral-900 border border-luxury-gold/15 focus:border-luxury-gold/40 rounded-lg p-3 text-xs text-neutral-200 focus:outline-none focus:ring-0"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-neutral-400 uppercase font-mono font-bold">Importance Score (1-5)</label>
                <select
                  value={importance}
                  onChange={(e) => setImportance(parseInt(e.target.value))}
                  className="bg-neutral-900 border border-luxury-gold/15 focus:border-luxury-gold/40 rounded-lg p-2.5 text-xs text-neutral-200 focus:outline-none"
                >
                  <option value={1}>1 (Low - Casual trivia)</option>
                  <option value={2}>2 (Standard - Interest/Dislike)</option>
                  <option value={3}>3 (Medium - Important habit)</option>
                  <option value={4}>4 (High - Vital context)</option>
                  <option value={5}>5 (Critical - Core memory)</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-neutral-400 uppercase font-mono font-bold">Associated Emotion</label>
                <select
                  value={emotion}
                  onChange={(e) => setEmotion(e.target.value)}
                  className="bg-neutral-900 border border-luxury-gold/15 focus:border-luxury-gold/40 rounded-lg p-2.5 text-xs text-neutral-200 focus:outline-none"
                >
                  <option value="neutral">Neutral</option>
                  <option value="joy">Joy / Happy</option>
                  <option value="sadness">Sadness</option>
                  <option value="love">Love</option>
                  <option value="stress">Stress</option>
                  <option value="fear">Fear</option>
                  <option value="anger">Anger</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 rounded border border-neutral-700 text-neutral-400 hover:bg-neutral-900 text-xs transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="gold-btn py-2 px-5 rounded text-xs cursor-pointer font-bold"
              >
                Commit to Core
              </button>
            </div>
          </form>
        )}

        {/* Memory Grid */}
        {memories.length === 0 ? (
          <div className="glassmorphism rounded-2xl py-16 px-6 border border-neutral-800 text-center flex flex-col items-center justify-center max-w-lg mx-auto space-y-3">
            <Brain className="w-12 h-12 text-luxury-gold animate-bounce" />
            <h3 className="luxury-heading text-lg font-bold text-neutral-300">Archive Offline</h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              No behavioral facts have been committed to memory yet. Chat with Tanay AI or inject facts manually above to start building its personality mapping.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {memories.map((m) => (
              <div
                key={m.id}
                className="glassmorphism rounded-xl p-5 border border-luxury-gold/10 hover:border-luxury-gold/20 hover:scale-[1.01] hover:shadow-gold-glow transition-all flex flex-col justify-between gap-4 group"
              >
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-[9px] uppercase font-mono font-bold text-luxury-gold">
                      <Sparkles className="w-3 h-3" /> Node #{m.id}
                    </span>
                    <div className="flex gap-0.5">{getImportanceStars(m.importance)}</div>
                  </div>
                  <p className="text-xs text-neutral-300 leading-relaxed font-sans">{m.content}</p>
                </div>

                <div className="flex items-center justify-between border-t border-luxury-gold/5 pt-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] px-2 py-0.5 rounded bg-neutral-800 border border-neutral-700/30 text-neutral-400 uppercase font-bold font-mono">
                      {m.emotion || "neutral"}
                    </span>
                    <span className="text-[9px] text-neutral-600 font-mono">
                      {m.created_at ? new Date(m.created_at).toLocaleDateString() : ""}
                    </span>
                  </div>
                  <button
                    onClick={() => onDeleteMemory(m.id)}
                    className="text-neutral-600 hover:text-red-400 p-1.5 rounded transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                    title="Erase Memory"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
