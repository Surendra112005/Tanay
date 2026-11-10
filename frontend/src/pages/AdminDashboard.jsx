import React, { useState, useEffect } from "react";
import { ShieldAlert, Terminal, Cpu, Database, BarChart3, Settings, LogOut, Loader2, Sparkles, KeyRound } from "lucide-react";
import CodeEditor from "../components/CodeEditor";
import DatabaseViewer from "../components/DatabaseViewer";
import AnalyticsDashboard from "../components/AnalyticsDashboard";
import SettingsPage from "../components/SettingsPage";
import { api } from "../utils/api";

export default function AdminDashboard({ onLogout }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("editor"); // editor, settings, database, analytics

  // Check if session token exists
  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError("");
    setIsLoading(true);
    try {
      const res = await api.adminLogin(username, password);
      if (res.status === "success") {
        localStorage.setItem("admin_token", res.token);
        setIsLoggedIn(true);
      }
    } catch (err) {
      setAuthError(err.message || "Failed to authenticate.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    setIsLoggedIn(false);
    if (onLogout) onLogout();
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
        {/* Background aura */}
        <div className="absolute w-96 h-96 bg-luxury-gold/5 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-md glassmorphism rounded-2xl p-8 border border-luxury-gold/15 shadow-gold-glow-lg text-left relative z-10">
          <div className="flex flex-col items-center justify-center text-center gap-2 mb-6">
            <div className="w-12 h-12 rounded-full bg-neutral-900 border border-luxury-gold flex items-center justify-center text-luxury-gold glow-gold animate-pulse">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h2 className="luxury-heading text-2xl text-gold-gradient font-bold mt-2">
              Neural Administrator
            </h2>
            <p className="text-xs text-neutral-500">
              Provide credentials to gain entry to Tanay AI's neural core.
            </p>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-mono tracking-wider text-luxury-gold/60 font-bold">
                Admin Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Configured admin username"
                required
                className="bg-neutral-900 border border-luxury-gold/10 focus:border-luxury-gold/50 rounded-lg p-3 text-xs text-neutral-200 focus:outline-none focus:ring-0"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-mono tracking-wider text-luxury-gold/60 font-bold">
                Access Token Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Configured admin password"
                required
                className="bg-neutral-900 border border-luxury-gold/10 focus:border-luxury-gold/50 rounded-lg p-3 text-xs text-neutral-200 focus:outline-none focus:ring-0"
              />
            </div>

            {authError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-[11px] font-medium flex items-center gap-2">
                <KeyRound className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="gold-btn py-3 px-6 rounded-lg text-xs font-bold text-center flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Decrypting core...</span>
                </>
              ) : (
                <span>Request Core Decryption</span>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-[10px] text-neutral-600 font-mono border-t border-luxury-gold/5 pt-4">
            Configure TANAY_ADMIN_USERNAME and TANAY_ADMIN_PASSWORD on the backend.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex relative">
      {/* Admin Operations Sub-Sidebar */}
      <aside className="w-56 bg-black/40 border-r border-luxury-gold/10 flex flex-col justify-between py-4 z-10 shrink-0">
        <div className="flex flex-col gap-4">
          <div className="px-4 pb-2 border-b border-luxury-gold/5 flex flex-col text-left">
            <span className="text-[10px] font-mono tracking-widest text-luxury-gold/40 uppercase font-bold">
              Operations Center
            </span>
            <span className="text-xs font-bold text-neutral-300 mt-1 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-red-500" />
              SYSTEM ADM
            </span>
          </div>

          {/* Tab buttons */}
          <div className="flex flex-col gap-1 px-2">
            <button
              onClick={() => setActiveTab("editor")}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-left transition-all ${
                activeTab === "editor"
                  ? "bg-luxury-gold/10 border border-luxury-gold/20 text-luxury-gold shadow-gold-glow"
                  : "text-neutral-400 hover:text-luxury-gold hover:bg-neutral-900/40 border border-transparent"
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Live Code Editor</span>
            </button>

            <button
              onClick={() => setActiveTab("settings")}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-left transition-all ${
                activeTab === "settings"
                  ? "bg-luxury-gold/10 border border-luxury-gold/20 text-luxury-gold shadow-gold-glow"
                  : "text-neutral-400 hover:text-luxury-gold hover:bg-neutral-900/40 border border-transparent"
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Live Model Control</span>
            </button>

            <button
              onClick={() => setActiveTab("database")}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-left transition-all ${
                activeTab === "database"
                  ? "bg-luxury-gold/10 border border-luxury-gold/20 text-luxury-gold shadow-gold-glow"
                  : "text-neutral-400 hover:text-luxury-gold hover:bg-neutral-900/40 border border-transparent"
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>Database Viewer</span>
            </button>

            <button
              onClick={() => setActiveTab("analytics")}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-left transition-all ${
                activeTab === "analytics"
                  ? "bg-luxury-gold/10 border border-luxury-gold/20 text-luxury-gold shadow-gold-glow"
                  : "text-neutral-400 hover:text-luxury-gold hover:bg-neutral-900/40 border border-transparent"
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Analytics Dashboard</span>
            </button>
          </div>
        </div>

        {/* Exit Operations */}
        <div className="px-2">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Lock Core console</span>
          </button>
        </div>
      </aside>

      {/* Main Tab Render Window */}
      <main className="flex-1 p-6 overflow-y-auto">
        {activeTab === "editor" && <CodeEditor />}
        {activeTab === "settings" && <SettingsPage />}
        {activeTab === "database" && <DatabaseViewer />}
        {activeTab === "analytics" && <AnalyticsDashboard />}
      </main>
    </div>
  );
}
