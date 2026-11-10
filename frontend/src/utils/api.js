const API_BASE = "http://localhost:8000";

export const api = {
  // Chat / User portal
  chat: async (text, language = "english", emotion = "auto") => {
    const response = await fetch(`${API_BASE}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, language, emotion }),
    });
    if (!response.ok) throw new Error("Failed to send message to Tanay AI");
    return response.json();
  },

  getHistory: async () => {
    const response = await fetch(`${API_BASE}/api/chat/history`);
    if (!response.ok) throw new Error("Failed to fetch chat history");
    return response.json();
  },

  // Admin login
  adminLogin: async (username, password) => {
    const response = await fetch(`${API_BASE}/api/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.detail || "Invalid admin credentials");
    }
    return response.json();
  },

  // Live Code Editor
  getCodeFiles: async () => {
    const response = await fetch(`${API_BASE}/api/admin/files`);
    if (!response.ok) throw new Error("Failed to fetch editable source files");
    return response.json();
  },

  saveCodeFile: async (name, content) => {
    const response = await fetch(`${API_BASE}/api/admin/files/save`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, content }),
    });
    if (!response.ok) throw new Error("Failed to save changes");
    return response.json();
  },

  // Model Controls / Settings
  getSettings: async () => {
    const response = await fetch(`${API_BASE}/api/admin/settings`);
    if (!response.ok) throw new Error("Failed to fetch system configurations");
    return response.json();
  },

  saveSettings: async (settings) => {
    const response = await fetch(`${API_BASE}/api/admin/settings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    if (!response.ok) throw new Error("Failed to update system configurations");
    return response.json();
  },

  // Database Viewer
  getDbTable: async (tableName) => {
    const response = await fetch(`${API_BASE}/api/admin/db/${tableName}`);
    if (!response.ok) throw new Error(`Failed to query database table: ${tableName}`);
    return response.json();
  },

  updateDbRow: async (tableName, rowData) => {
    const response = await fetch(`${API_BASE}/api/admin/db/${tableName}/update`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(rowData),
    });
    if (!response.ok) throw new Error("Failed to update database record");
    return response.json();
  },

  deleteDbRow: async (tableName, id) => {
    const response = await fetch(`${API_BASE}/api/admin/db/${tableName}/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete database record");
    return response.json();
  },

  exportDbTableUrl: (tableName) => {
    return `${API_BASE}/api/admin/db/${tableName}/export`;
  },

  // Analytics
  getAnalytics: async () => {
    const response = await fetch(`${API_BASE}/api/admin/analytics`);
    if (!response.ok) throw new Error("Failed to compile system analytics");
    return response.json();
  },
  
  getAudioUrl: (path) => {
    return `${API_BASE}${path}`;
  }
};
