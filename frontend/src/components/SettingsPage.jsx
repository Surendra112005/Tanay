import React, { useState, useEffect } from "react";
import { Cpu, Settings, Save, Sparkles, Sliders, Volume2, Palette, CheckCircle, RefreshCw } from "lucide-react";
import { api } from "../utils/api";

export default function SettingsPage() {
  const [systemPrompt, setSystemPrompt] = useState("");
  const [ollamaModel, setOllamaModel] = useState("qwen2.5:latest");
  const [creativity, setCreativity] = useState(0.7);
  const [empathyFactor, setEmpathyFactor] = useState(0.9);
  const [memoryLimit, setMemoryLimit] = useState(5);
  const [voiceVoice, setVoiceVoice] = useState("Jenny");
  const [voiceSpeed, setVoiceSpeed] = useState(1.0);
  const [voiceVolume, setVoiceVolume] = useState(1.0);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  
  const [emotionMappings, setEmotionMappings] = useState({});
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const data = await api.getSettings();
      setSystemPrompt(data.system_prompt || "");
      setOllamaModel(data.ollama_model || "qwen2.5:latest");
      
      const behavior = data.behavior_settings || {};
      setCreativity(behavior.creativity ?? 0.7);
      setEmpathyFactor(behavior.empathy_factor ?? 0.9);
      setMemoryLimit(behavior.memory_retrieval_limit ?? 5);

      const tts = data.tts_settings || {};
      setVoiceVoice(tts.voice || "Jenny");
      setVoiceSpeed(tts.speed ?? 1.0);
      setVoiceVolume(tts.volume ?? 1.0);
      setVoiceEnabled(tts.enabled ?? true);

      setEmotionMappings(data.emotion_mappings || {});
    } catch (err) {
      console.error(err);
      setFeedback({ type: "error", message: "Failed to fetch model configuration settings." });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setFeedback(null);
    try {
      const payload = {
        system_prompt: systemPrompt,
        ollama_model: ollamaModel,
        behavior_settings: {
          creativity,
          empathy_factor: empathyFactor,
          memory_retrieval_limit: memoryLimit
        },
        tts_settings: {
          voice: voiceVoice,
          speed: voiceSpeed,
          volume: voiceVolume,
          enabled: voiceEnabled
        },
        emotion_mappings: emotionMappings
      };
      const res = await api.saveSettings(payload);
      if (res.status === "success") {
        setFeedback({ type: "success", message: "Live Model configurations synchronized successfully!" });
        setTimeout(() => setFeedback(null), 3000);
      }
    } catch (err) {
      setFeedback({ type: "error", message: `Synchronization error: ${err.message}` });
    }
  };

  // Helper to edit mapping properties
  const handleMappingChange = (emotion, field, value) => {
    const updated = { ...emotionMappings };
    updated[emotion] = { ...updated[emotion], [field]: value };
    setEmotionMappings(updated);
  };

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center gap-2">
        <RefreshCw className="w-6 h-6 animate-spin text-luxury-gold" />
        <span className="text-sm text-neutral-400">Loading model settings...</span>
      </div>
    );
  }

  return (
    <div className="text-left space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-luxury-gold/15 pb-4">
        <div className="flex flex-col">
          <span className="text-[10px] font-mono tracking-widest text-luxury-gold/50 uppercase font-bold">
            Live Model Control
          </span>
          <h2 className="luxury-heading text-2xl text-gold-gradient font-bold mt-1">
            Cognitive Settings & Mapping
          </h2>
        </div>
        <button
          onClick={handleSave}
          className="px-4 py-2 rounded text-xs bg-gold-gradient text-black hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-1.5 font-bold cursor-pointer shadow-gold-glow"
        >
          <Save className="w-3.5 h-3.5" />
          <span>Synchronize Model</span>
        </button>
      </div>

      {/* Main Settings Form Grid */}
      <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Left Side: System prompt & LLM settings */}
        <div className="flex flex-col gap-5">
          {/* Core Settings block */}
          <div className="glassmorphism rounded-2xl p-5 border border-luxury-gold/10 flex flex-col gap-4 shadow-gold-glow">
            <h3 className="text-sm font-bold text-luxury-gold uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Cpu className="w-4 h-4" /> Core Brain Setting
            </h3>
            
            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase font-mono text-neutral-400 font-bold">Ollama Model ID</label>
              <input
                type="text"
                value={ollamaModel}
                onChange={(e) => setOllamaModel(e.target.value)}
                className="bg-neutral-900 border border-luxury-gold/10 focus:border-luxury-gold/40 rounded-lg p-2.5 text-xs text-neutral-200 focus:outline-none"
                placeholder="qwen2.5:latest"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase font-mono text-neutral-400 font-bold">System Directive (Prompt)</label>
              <textarea
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                rows={5}
                className="bg-neutral-900 border border-luxury-gold/10 focus:border-luxury-gold/40 rounded-lg p-2.5 text-xs text-neutral-200 focus:outline-none resize-none leading-relaxed"
                placeholder="Define AI behavior directives..."
              />
            </div>
          </div>

          {/* Behavior Settings Block */}
          <div className="glassmorphism rounded-2xl p-5 border border-luxury-gold/10 flex flex-col gap-4 shadow-gold-glow">
            <h3 className="text-sm font-bold text-luxury-gold uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Sliders className="w-4 h-4" /> Behavioral Tuning
            </h3>
            
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs text-neutral-400">
                <span>Creativity (Temperature)</span>
                <span className="font-mono text-luxury-gold">{creativity}</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.5"
                step="0.05"
                value={creativity}
                onChange={(e) => setCreativity(parseFloat(e.target.value))}
                className="w-full h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-luxury-gold"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs text-neutral-400">
                <span>Empathy Coefficient</span>
                <span className="font-mono text-luxury-gold">{empathyFactor}</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={empathyFactor}
                onChange={(e) => setEmpathyFactor(parseFloat(e.target.value))}
                className="w-full h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-luxury-gold"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase font-mono text-neutral-400 font-bold">Memory Lookup Context Limit</label>
              <select
                value={memoryLimit}
                onChange={(e) => setMemoryLimit(parseInt(e.target.value))}
                className="bg-neutral-900 border border-luxury-gold/10 focus:border-luxury-gold/40 rounded-lg p-2 text-xs text-neutral-200 focus:outline-none"
              >
                <option value={3}>3 relevant memories</option>
                <option value={5}>5 relevant memories</option>
                <option value={8}>8 relevant memories</option>
                <option value={10}>10 relevant memories</option>
              </select>
            </div>
          </div>
        </div>

        {/* Right Side: TTS & Emotion mappings */}
        <div className="flex flex-col gap-5">
          {/* TTS settings block */}
          <div className="glassmorphism rounded-2xl p-5 border border-luxury-gold/10 flex flex-col gap-4 shadow-gold-glow">
            <h3 className="text-sm font-bold text-luxury-gold uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Volume2 className="w-4 h-4" /> TTS Voice Synthesis
            </h3>

            <div className="flex items-center justify-between py-1">
              <label className="text-xs text-neutral-400 font-semibold">Enable Voice Output</label>
              <input
                type="checkbox"
                checked={voiceEnabled}
                onChange={(e) => setVoiceEnabled(e.target.checked)}
                className="w-4 h-4 rounded text-luxury-gold focus:ring-0 focus:outline-none cursor-pointer accent-luxury-gold"
              />
            </div>
            
            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase font-mono text-neutral-400 font-bold">Voice Model</label>
              <input
                type="text"
                value={voiceVoice}
                onChange={(e) => setVoiceVoice(e.target.value)}
                className="bg-neutral-900 border border-luxury-gold/10 focus:border-luxury-gold/40 rounded-lg p-2.5 text-xs text-neutral-200 focus:outline-none"
                placeholder="Jenny"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-mono text-neutral-400 font-bold">Speaking Speed</label>
                <input
                  type="number"
                  min="0.5"
                  max="2.0"
                  step="0.1"
                  value={voiceSpeed}
                  onChange={(e) => setVoiceSpeed(parseFloat(e.target.value))}
                  className="bg-neutral-900 border border-luxury-gold/10 focus:border-luxury-gold/40 rounded-lg p-2 text-xs text-neutral-200 focus:outline-none"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-mono text-neutral-400 font-bold">Volume</label>
                <input
                  type="number"
                  min="0.0"
                  max="1.0"
                  step="0.1"
                  value={voiceVolume}
                  onChange={(e) => setVoiceVolume(parseFloat(e.target.value))}
                  className="bg-neutral-900 border border-luxury-gold/10 focus:border-luxury-gold/40 rounded-lg p-2 text-xs text-neutral-200 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Emotion Mappings block */}
          <div className="glassmorphism rounded-2xl p-5 border border-luxury-gold/10 flex flex-col gap-4 shadow-gold-glow">
            <h3 className="text-sm font-bold text-luxury-gold uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Palette className="w-4 h-4" /> Emotion Mappings
            </h3>

            <div className="max-h-60 overflow-y-auto space-y-3 pr-1.5">
              {Object.keys(emotionMappings).map((em) => (
                <div key={em} className="p-3 bg-black/30 border border-neutral-900 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase font-mono font-bold text-luxury-gold">{em}</span>
                    <span className="text-[9px] text-neutral-600 font-mono">ID: {em}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col gap-0.5">
                      <label className="text-[8px] uppercase font-mono text-neutral-500">3D Glow Color</label>
                      <input
                        type="text"
                        value={emotionMappings[em].glow || ""}
                        onChange={(e) => handleMappingChange(em, "glow", e.target.value)}
                        className="bg-neutral-900 border border-neutral-800/80 rounded p-1 text-[10px] font-mono text-neutral-300 focus:outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <label className="text-[8px] uppercase font-mono text-neutral-500">Particle count</label>
                      <input
                        type="number"
                        value={emotionMappings[em].particle_count || 0}
                        onChange={(e) => handleMappingChange(em, "particle_count", parseInt(e.target.value))}
                        className="bg-neutral-900 border border-neutral-800/80 rounded p-1 text-[10px] font-mono text-neutral-300 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </form>

      {/* Synchronized Feedback dialog */}
      {feedback && (
        <div 
          className={`p-3.5 rounded-lg border text-xs flex items-center gap-2.5 ${
            feedback.type === "success"
              ? "bg-green-500/10 border-green-500/20 text-green-400"
              : "bg-red-500/10 border-red-500/20 text-red-400"
          }`}
        >
          <CheckCircle className="w-4.5 h-4.5" />
          <span>{feedback.message}</span>
        </div>
      )}
    </div>
  );
}
