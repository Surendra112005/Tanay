import React, { useState, useEffect } from "react";
import { User, Check, Globe, FileText, AlertCircle } from "lucide-react";

export default function ProfilePage({ userProfile, onSave, isSaving = false }) {
  const [displayName, setDisplayName] = useState("");
  const [language, setLanguage] = useState("english");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("/assets/default_avatar.png");
  const [success, setSuccess] = useState(false);

  // Sync state with parent profile prop on load
  useEffect(() => {
    if (userProfile) {
      setDisplayName(userProfile.display_name || "Alex Mercer");
      setLanguage(userProfile.language || "english");
      setBio(userProfile.bio || "");
      setAvatarUrl(userProfile.avatar_url || "/assets/default_avatar.png");
    }
  }, [userProfile]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      display_name: displayName,
      language,
      bio,
      avatar_url: avatarUrl
    }).then(() => {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    });
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 text-left">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col border-b border-luxury-gold/15 pb-4">
          <span className="text-[10px] font-mono tracking-widest uppercase text-luxury-gold/50 font-bold">
            Identity Node
          </span>
          <h2 className="luxury-heading text-3xl text-gold-gradient font-bold mt-1">
            Profile Settings
          </h2>
          <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
            Customize how Tanay AI addresses and communicates with you.
          </p>
        </div>

        {/* Profile Form */}
        <form onSubmit={handleSubmit} className="glassmorphism rounded-2xl p-6 border border-luxury-gold/10 flex flex-col gap-5 shadow-gold-glow">
          {/* Avatar Area */}
          <div className="flex flex-col sm:flex-row items-center gap-4 py-2">
            <div className="w-20 h-20 rounded-full bg-neutral-900 border-2 border-luxury-gold flex items-center justify-center overflow-hidden glow-gold relative group">
              <User className="w-10 h-10 text-luxury-gold" />
            </div>
            <div className="flex flex-col gap-1 text-center sm:text-left">
              <span className="text-sm font-semibold text-neutral-200">Avatar Image</span>
              <span className="text-xs text-neutral-500">Stored local asset ID. Default silhouette active.</span>
            </div>
          </div>

          {/* Form Fields */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-luxury-gold uppercase tracking-wider font-mono flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" /> Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="bg-neutral-900 border border-luxury-gold/10 focus:border-luxury-gold/50 rounded-lg p-3 text-sm text-neutral-200 placeholder-neutral-600 focus:outline-none transition-all duration-300"
              placeholder="Your name"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-luxury-gold uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5" /> Vocal Language
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-neutral-900 border border-luxury-gold/10 focus:border-luxury-gold/50 rounded-lg p-3 text-sm text-neutral-200 focus:outline-none transition-all duration-300 cursor-pointer"
            >
              <option value="english">English (US - default)</option>
              <option value="spanish">Español (Spanish)</option>
              <option value="french">Français (French)</option>
              <option value="hindi">हिन्दी (Hindi)</option>
              <option value="german">Deutsch (German)</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-luxury-gold uppercase tracking-wider font-mono flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" /> Companion Bio Info
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              className="bg-neutral-900 border border-luxury-gold/10 focus:border-luxury-gold/50 rounded-lg p-3 text-sm text-neutral-200 placeholder-neutral-600 focus:outline-none transition-all duration-300 resize-none"
              placeholder="Share details about yourself. Tanay will read this to customize behavioral alignment."
            />
          </div>

          {/* Messages */}
          {success && (
            <div className="p-3 bg-green-500/10 border border-green-500/20 text-green-400 rounded-lg text-xs flex items-center gap-2 font-medium">
              <Check className="w-4 h-4" />
              <span>Settings synchronized with AI core successfully.</span>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isSaving}
            className="gold-btn py-3 px-6 rounded-lg text-sm text-center flex items-center justify-center gap-2 cursor-pointer font-bold"
          >
            {isSaving ? "Synchronizing..." : "Save Identity Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}
