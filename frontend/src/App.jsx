import React, { useState, useEffect, useRef } from "react";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import ChatPanel from "./components/ChatPanel";
import Avatar3D from "./components/Avatar3D";
import ProfilePage from "./pages/ProfilePage";
import MemoryPage from "./pages/MemoryPage";
import SettingsPage from "./components/SettingsPage";
import AdminDashboard from "./pages/AdminDashboard";
import { api } from "./utils/api";
import { AlertCircle, X, Sparkles } from "lucide-react";

export default function App() {
  const [activePage, setActivePage] = useState("chat"); // chat, memories, profile, settings, admin-dashboard, admin-login
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [currentEmotion, setCurrentEmotion] = useState("neutral");
  const [relationshipLevel, setRelationshipLevel] = useState("Stranger");
  const [relationshipScore, setRelationshipScore] = useState(10.0);
  const [interactionsCount, setInteractionsCount] = useState(0);
  
  const [chatHistory, setChatHistory] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [userProfile, setUserProfile] = useState({
    display_name: "Alex Mercer",
    language: "english",
    bio: "A tech enthusiast exploring the frontiers of human-AI emotional connection.",
    avatar_url: "/assets/default_avatar.png"
  });

  // State flags
  const [isListening, setIsListening] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [avatarState, setAvatarState] = useState("idle"); // idle, listening, talking, happy, sad, angry, fearful
  const [selectedEmotion, setSelectedEmotion] = useState("auto"); // auto or manual id
  const [showManualEmotion, setShowManualEmotion] = useState(false);
  
  // Notification system
  const [notification, setNotification] = useState(null);
  
  // Audio references
  const audioRef = useRef(null);
  
  // Web Speech API
  const recognitionRef = useRef(null);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      
      rec.onstart = () => {
        setIsListening(true);
        setAvatarState("listening");
      };
      
      rec.onresult = (event) => {
        const text = event.results[0][0].transcript;
        setInputValue(text);
        // Automatically send voice command
        setTimeout(() => handleSendChat(text), 600);
      };
      
      rec.onerror = (e) => {
        console.error("Speech Recognition Error", e);
        showNotification("error", "Speech recognition failed or was blocked.");
        setIsListening(false);
        setAvatarState("idle");
      };
      
      rec.onend = () => {
        setIsListening(false);
        if (avatarState === "listening") {
          setAvatarState("idle");
        }
      };
      
      recognitionRef.current = rec;
    }
  }, [userProfile.language]);

  // Load profile and logs on start
  useEffect(() => {
    loadInitialData();
  }, []);

  // Auto-reconnect hook: poll backend stats every 5s if offline
  useEffect(() => {
    if (isConnected) return;
    const interval = setInterval(() => {
      loadInitialData();
    }, 5000);
    return () => clearInterval(interval);
  }, [isConnected]);

  const loadInitialData = async () => {
    try {
      // 1. Fetch chat history
      const history = await api.getHistory();
      setChatHistory(history);
      
      // Load messages into portal active state (rebuild conversation flow)
      const mapped = history.map((h) => ({
        sender: h.sender,
        text: h.text,
        emotion: h.emotion,
        language: h.language,
        timestamp: h.timestamp
      }));
      setMessages(mapped);
      
      // Update relationship level based on latest message log or DB
      if (history.length > 0) {
        const latest = history[history.length - 1];
        // Set emotion to match latest AI message
        if (latest.sender === "ai") {
          setCurrentEmotion(latest.emotion || "neutral");
        }
      }

      // 2. Fetch active settings for profile & relationship
      const dbSettings = await api.getSettings();
      // For this app, standard profile is accessed via DB directly.
      const profiles = await api.getDbTable("profiles");
      if (profiles && profiles.length > 0) {
        // Find standard user 'Alex Mercer'
        const std = profiles.find(p => p.user_id !== 1) || profiles[0];
        setUserProfile(std);
      }

      const rels = await api.getDbTable("relationships");
      if (rels && rels.length > 0) {
        const rel = rels.find(r => r.user_id !== 1) || rels[0];
        setRelationshipLevel(rel.level);
        setRelationshipScore(rel.score);
        setInteractionsCount(rel.interactions_count);
      }

      setIsConnected(true);
    } catch (err) {
      console.error("Error loading initial database stats:", err);
      setIsConnected(false);
    }
  };

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  // Trigger microphone STT
  const handleToggleListen = () => {
    if (!recognitionRef.current) {
      showNotification("error", "Web Speech STT API is not supported in this browser. Please use Chrome/Edge.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      // Stop any current audio and browser TTS
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      // Set language flag
      if (userProfile.language === "spanish") recognitionRef.current.lang = "es-ES";
      else if (userProfile.language === "french") recognitionRef.current.lang = "fr-FR";
      else if (userProfile.language === "hindi") recognitionRef.current.lang = "hi-IN";
      else if (userProfile.language === "german") recognitionRef.current.lang = "de-DE";
      else recognitionRef.current.lang = "en-US";
      
      recognitionRef.current.start();
    }
  };

  // Send Chat Pipeline
  const handleSendChat = async (textToSend = null) => {
    const text = (textToSend || inputValue).trim();
    if (!text) return;

    setInputValue("");
    setIsGenerating(true);
    setAvatarState("idle");

    // Add User message locally
    const userMsg = {
      sender: "user",
      text,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMsg]);

    try {
      const res = await api.chat(text, userProfile.language, selectedEmotion);
      
      // Update portal metrics
      const aiMsg = {
        sender: "ai",
        text: res.reply,
        emotion: res.emotion,
        language: userProfile.language,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, aiMsg]);
      setCurrentEmotion(res.emotion);
      setRelationshipLevel(res.relationship);
      setRelationshipScore(res.relationship_score);
      setInteractionsCount(prev => prev + 1);

      // Trigger avatar reactive expressions
      triggerEmotionAnimation(res.emotion);

      // Play Audio automatically if returned, otherwise fallback to browser speech synthesis
      if (res.audio) {
        playTtsAudio(api.getAudioUrl(res.audio));
      } else {
        playBrowserSpeech(res.reply, userProfile.language);
      }

      // Sync background logs list
      loadInitialData();
      setIsConnected(true);

    } catch (err) {
      console.error(err);
      setIsConnected(false);
      setShowManualEmotion(true); // Show manual fallback since backend check might have failed
      showNotification("error", "Communication relay error. Manual emotion override enabled.");
      
      // Local fallback reply to maintain luxury flow
      const fallbackText = "I am having difficulty connecting to my core brain node. Please adjust settings or select an emotion below to recalibrate me.";
      const fallbackMsg = {
        sender: "ai",
        text: fallbackText,
        emotion: "neutral",
        language: "english",
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, fallbackMsg]);
      setAvatarState("idle");
      playBrowserSpeech(fallbackText, "english");
    } finally {
      setIsGenerating(false);
    }
  };

  const triggerEmotionAnimation = (emotion) => {
    if (emotion === "joy") setAvatarState("happy");
    else if (emotion === "sadness") setAvatarState("sad");
    else if (emotion === "anger") setAvatarState("angry");
    else if (emotion === "fear") setAvatarState("fearful");
    else setAvatarState("talking");
  };

  // Play TTS audio and sync talking animations
  const playTtsAudio = (url) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }

    const audio = new Audio(url);
    audio.play()
      .then(() => {
        setAvatarState("talking");
        audioRef.current = audio;

        audio.onended = () => {
          setAvatarState("idle");
        };
      })
      .catch((err) => {
        console.error("Audio playback blocked/failed", err);
        // Fallback to brief speaking animation based on text size
        setAvatarState("talking");
        setTimeout(() => setAvatarState("idle"), 3000);
      });
  };

  // Fallback Web Speech Synthesis for when backend PyTorch TTS model is unavailable
  const playBrowserSpeech = (text, language) => {
    if (!window.speechSynthesis) {
      console.warn("Browser Speech Synthesis not supported.");
      return;
    }

    // Cancel any current speaking
    window.speechSynthesis.cancel();

    // Remove any special formatting or markdown from text
    const cleanText = text.replace(/[#*_`~]/g, "").trim();
    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);

    // Map language
    const langLower = (language || "english").toLowerCase();
    if (langLower === "spanish") utterance.lang = "es-ES";
    else if (langLower === "french") utterance.lang = "fr-FR";
    else if (langLower === "hindi") utterance.lang = "hi-IN";
    else if (langLower === "german") utterance.lang = "de-DE";
    else utterance.lang = "en-US";

    // Set voice properties for a more pleasant companion tone
    utterance.rate = 1.0;
    utterance.pitch = 1.05;

    // Find a nice companion-style voice
    const voices = window.speechSynthesis.getVoices();
    let voice = voices.find(
      (v) =>
        v.lang.startsWith(utterance.lang) &&
        (v.name.includes("Google") ||
          v.name.includes("Natural") ||
          v.name.includes("Zira") ||
          v.name.includes("Hazel") ||
          v.name.includes("Aria") ||
          v.name.includes("Microsoft"))
    );

    if (!voice) {
      voice = voices.find((v) => v.lang.startsWith(utterance.lang.substring(0, 2)));
    }

    if (voice) {
      utterance.voice = voice;
    }

    utterance.onstart = () => {
      setAvatarState("talking");
    };

    utterance.onend = () => {
      setAvatarState("idle");
    };

    utterance.onerror = (e) => {
      console.error("Speech Synthesis Error:", e);
      // Fallback: simulate speech animation based on text length if audio playback failed
      setAvatarState("talking");
      const duration = Math.min(8000, Math.max(3000, cleanText.length * 60));
      setTimeout(() => {
        setAvatarState("idle");
      }, duration);
    };

    window.speechSynthesis.speak(utterance);
  };

  // Save profile changes
  const handleSaveProfile = async (updatedData) => {
    try {
      // Fetch table records and update row
      const profiles = await api.getDbTable("profiles");
      if (profiles && profiles.length > 0) {
        const std = profiles.find(p => p.user_id !== 1) || profiles[0];
        const payload = {
          ...std,
          display_name: updatedData.display_name,
          language: updatedData.language,
          bio: updatedData.bio
        };
        await api.updateDbRow("profiles", payload);
        setUserProfile(payload);
        showNotification("success", "Neural profile identity saved!");
      }
    } catch (err) {
      showNotification("error", `Failed to save profile: ${err.message}`);
    }
  };

  // Memories CRUD triggers
  const handleAddMemory = async (memoryData) => {
    try {
      // Find standard user ID
      const users = await api.getDbTable("users");
      const stdUser = users.find(u => u.role === "user") || users[0];
      
      // Query current list length
      const list = await api.getDbTable("memories");
      const newId = list.length > 0 ? Math.max(...list.map(l => l.id)) + 1 : 1;
      
      const payload = {
        id: newId,
        user_id: stdUser.id,
        content: memoryData.content,
        importance: memoryData.importance,
        emotion: memoryData.emotion
      };
      
      // Save
      await api.updateDbRow("memories", payload);
      showNotification("success", "Fact committed to neural memory vault!");
      loadMemories();
    } catch (err) {
      showNotification("error", "Memory injection failed.");
    }
  };

  const handleDeleteMemory = async (id) => {
    try {
      await api.deleteDbRow("memories", id);
      showNotification("success", "Memory node erased successfully.");
      loadMemories();
    } catch (err) {
      showNotification("error", "Memory erasure aborted.");
    }
  };

  // Route page navigation
  const handleNavigate = (page) => {
    // Stop audio and speech if navigating away from chat
    if (page !== "chat") {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setAvatarState("idle");
    }
    setActivePage(page);
  };

  // Get active memories list
  const [activeMemories, setActiveMemories] = useState([]);

  const loadMemories = async () => {
    try {
      const data = await api.getDbTable("memories");
      setActiveMemories(data.filter(d => d.user_id !== 1));
    } catch (err) {
      console.error("Error loading memories:", err);
    }
  };

  useEffect(() => {
    if (activePage === "memories") {
      loadMemories();
    }
  }, [activePage]);

  // Is Admin Portal check
  const isAdminActive = activePage === "admin-dashboard";

  return (
    <div className="min-h-screen relative flex flex-col overflow-hidden bg-luxury-bg">
      {/* Top Navbar */}
      <Navbar
        currentEmotion={currentEmotion}
        relationshipLevel={relationshipLevel}
        relationshipScore={relationshipScore}
        userProfile={userProfile}
        isAdmin={isAdminActive}
        onNavigate={handleNavigate}
      />

      {/* Main Core Layout: Sidebar + Main Content Frame */}
      <div className="flex-1 flex pt-16 h-[calc(100vh-4rem)]">
        {/* Navigation & History Left Sidebar (hide if admin dashboard is showing) */}
        {!isAdminActive && (
          <Sidebar
            activePage={activePage}
            onNavigate={handleNavigate}
            chatHistory={chatHistory}
            onRefreshHistory={loadInitialData}
            isConnected={isConnected}
          />
        )}

        {/* Dynamic Content Panel */}
        <div className={`flex-1 transition-all ${!isAdminActive ? "pl-64" : ""}`}>
          
          {/* USER PORTAL PAGES */}
          {activePage === "chat" && (
            <div className="h-full flex flex-col md:flex-row relative">
              {/* 3D Scene View Center */}
              <div className="flex-1 h-3/5 md:h-full relative border-b md:border-b-0 md:border-r border-luxury-gold/10">
                
                {/* Gold ambient title watermark */}
                <div className="absolute left-6 top-6 text-left pointer-events-none z-10">
                  <span className={`text-[10px] tracking-widest font-mono uppercase font-bold block ${
                    isConnected ? "text-luxury-gold/50" : "text-red-500/50"
                  }`}>
                    {isConnected ? "Quantum Matrix // Online" : "Quantum Matrix // Fallback Mode Active"}
                  </span>
                  <h1 className="luxury-heading text-xl text-gold-gradient font-bold tracking-widest uppercase mt-0.5">
                    Tanay AI Core
                  </h1>
                </div>

                <Avatar3D 
                  emotion={currentEmotion} 
                  state={avatarState} 
                />
              </div>

              {/* Chat Panel Right Side */}
              <div className="w-full md:w-[420px] h-2/5 md:h-full shrink-0">
                <ChatPanel
                  messages={messages}
                  inputValue={inputValue}
                  onInputChange={setInputValue}
                  onSendMessage={() => handleSendChat()}
                  isListening={isListening}
                  onToggleListen={handleToggleListen}
                  isGenerating={isGenerating}
                  selectedEmotion={selectedEmotion}
                  onEmotionChange={setSelectedEmotion}
                  showManualEmotion={showManualEmotion}
                />
              </div>
            </div>
          )}

          {activePage === "memories" && (
            <div className="h-full overflow-y-auto">
              <MemoryPage
                memories={activeMemories}
                onAddMemory={handleAddMemory}
                onDeleteMemory={handleDeleteMemory}
                onRefresh={loadMemories}
              />
            </div>
          )}

          {activePage === "profile" && (
            <div className="h-full overflow-y-auto">
              <ProfilePage
                userProfile={userProfile}
                onSave={handleSaveProfile}
              />
            </div>
          )}

          {activePage === "settings" && (
            <div className="h-full overflow-y-auto p-6">
              {/* SettingsPage can be accessed by user too to customize experience */}
              <SettingsPage />
            </div>
          )}

          {/* ADMIN PORTAL PAGES */}
          {activePage === "admin-login" && (
            <AdminDashboard onLogout={() => handleNavigate("chat")} />
          )}

          {activePage === "admin-dashboard" && (
            <AdminDashboard onLogout={() => handleNavigate("chat")} />
          )}

        </div>
      </div>

      {/* Global Toast Notification System */}
      {notification && (
        <div 
          className={`fixed bottom-6 right-6 z-50 p-4 rounded-xl border glassmorphism shadow-gold-glow flex items-center justify-between gap-4 max-w-sm transition-all duration-300 animate-float ${
            notification.type === "error" 
              ? "border-red-500/30 text-red-400 bg-red-950/20" 
              : "border-luxury-gold/30 text-luxury-gold bg-luxury-gold/5"
          }`}
        >
          <div className="flex items-center gap-2 text-xs font-semibold">
            {notification.type === "error" ? (
              <AlertCircle className="w-4.5 h-4.5 text-red-500 shrink-0" />
            ) : (
              <Sparkles className="w-4.5 h-4.5 text-luxury-gold shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
          <button 
            onClick={() => setNotification(null)}
            className="text-neutral-500 hover:text-neutral-300 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
