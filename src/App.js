import React, { useState } from "react";
import { useWebSocket } from "./hooks/useWebSocket.js";
import ChatWindow from "./components/ChatWindow.jsx";
import MessageInput from "./components/MessageInput.jsx";
import "./App.css";

const THEMES = [
  { name: "purple", color: "linear-gradient(135deg, #7c5cbf, #a855f7)" },
  { name: "blue",   color: "linear-gradient(135deg, #3b82f6, #06b6d4)" },
  { name: "green",  color: "linear-gradient(135deg, #10b981, #3b82f6)" },
  { name: "red",    color: "linear-gradient(135deg, #ef4444, #f97316)" },
  { name: "pink",   color: "linear-gradient(135deg, #ec4899, #a855f7)" },
  { name: "orange", color: "linear-gradient(135deg, #f97316, #eab308)" },
];

export default function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("nex_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [authMode, setAuthMode] = useState("login");
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [authError, setAuthError] = useState("");
  const [darkMode, setDarkMode] = useState(true);
  const [theme, setTheme] = useState(() => localStorage.getItem("nex_theme") || "purple");
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const {
    messages, status, isTyping, pinnedId,
    send, deleteMessage, editMessage,
    addReaction, pinMessage, clearHistory
  } = useWebSocket("wss://ai-chatbot-using-websocket.onrender.com/ws");

  function handleAuth() {
    setAuthError("");
    if (authMode === "signup" && !formData.name.trim()) {
      setAuthError("Name required!"); return;
    }
    if (!formData.email.trim()) {
      setAuthError("Email required!"); return;
    }
    if (!formData.password.trim() || formData.password.length < 4) {
      setAuthError("Password min 4 characters!"); return;
    }
    if (authMode === "signup") {
      const users = JSON.parse(localStorage.getItem("nex_users") || "[]");
      if (users.find(u => u.email === formData.email)) {
        setAuthError("Email already exists!"); return;
      }
      const newUser = { name: formData.name, email: formData.email, password: formData.password };
      users.push(newUser);
      localStorage.setItem("nex_users", JSON.stringify(users));
      localStorage.setItem("nex_user", JSON.stringify(newUser));
      setUser(newUser);
    } else {
      const users = JSON.parse(localStorage.getItem("nex_users") || "[]");
      const found = users.find(u => u.email === formData.email && u.password === formData.password);
      if (!found) { setAuthError("Invalid email or password!"); return; }
      localStorage.setItem("nex_user", JSON.stringify(found));
      setUser(found);
    }
  }

  function handleLogout() {
    localStorage.removeItem("nex_user");
    setUser(null);
    setFormData({ name: "", email: "", password: "" });
  }

  function changeTheme(t) {
    setTheme(t);
    localStorage.setItem("nex_theme", t);
    setShowThemePicker(false);
  }

  const pinnedMsg = messages.find(m => m.id === Number(pinnedId));
  const filteredMessages = searchQuery
    ? messages.filter(m => m.text?.toLowerCase().includes(searchQuery.toLowerCase()))
    : messages;

  if (!user) {
    return (
      <div className={`app-root dark theme-${theme}`}>
        <div className="auth-bg">
          <div className="auth-card">
            <div className="auth-logo">✦</div>
            <h1 className="auth-title">NexChat</h1>
            <p className="auth-sub">AI-powered conversations</p>
            <div className="auth-tabs">
              <button className={authMode === "login" ? "active" : ""} onClick={() => { setAuthMode("login"); setAuthError(""); }}>Login</button>
              <button className={authMode === "signup" ? "active" : ""} onClick={() => { setAuthMode("signup"); setAuthError(""); }}>Sign Up</button>
            </div>
            {authMode === "signup" && (
              <input className="auth-input" type="text" placeholder="Your name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
            )}
            <input className="auth-input" type="email" placeholder="Email address" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
            <input className="auth-input" type="password" placeholder="Password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} onKeyDown={e => e.key === "Enter" && handleAuth()} />
            {authError && <p className="auth-error">{authError}</p>}
            <button className="auth-btn" onClick={handleAuth}>
              {authMode === "login" ? "Login →" : "Create Account →"}
            </button>
            <p className="auth-switch">
              {authMode === "login" ? "Don't have an account? " : "Already have an account? "}
              <span onClick={() => { setAuthMode(authMode === "login" ? "signup" : "login"); setAuthError(""); }}>
                {authMode === "login" ? "Sign Up" : "Login"}
              </span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`app-root ${darkMode ? "dark" : "light"} theme-${theme}`} onClick={() => setShowThemePicker(false)}>
      <div className="app">

        {/* Header */}
        <div className="top-header">
          <div className="header-brand">
            <div className="ai-avatar">✦</div>
            <div>
              <div className="ai-name">NexChat AI</div>
              <div className={`ai-status ${status}`}>
                {status === "connected" ? "● Online" : "● Offline"}
              </div>
            </div>
          </div>
          <div className="header-actions">
            <button className="icon-btn" onClick={() => { setShowSearch(!showSearch); setSearchQuery(""); }}>🔍</button>
            <button className="icon-btn" onClick={clearHistory}>🗑</button>

            {/* Theme Picker Button */}
            <button className="icon-btn" onClick={(e) => { e.stopPropagation(); setShowThemePicker(!showThemePicker); }} title="Change theme">🎨</button>

            <button className="theme-btn" onClick={() => setDarkMode(!darkMode)}>
              {darkMode ? "☀️" : "🌙"}
            </button>

            <div className="user-chip" onClick={handleLogout} title="Click to logout">
              <div className="user-chip-avatar">{user.name.slice(0, 2).toUpperCase()}</div>
              <span>{user.name}</span>
              <span className="logout-icon">↗</span>
            </div>
          </div>

          {/* Theme Picker Dropdown */}
          {showThemePicker && (
            <div className="theme-picker" onClick={e => e.stopPropagation()}>
              <p>Choose Theme</p>
              <div className="theme-options">
                {THEMES.map(t => (
                  <div
                    key={t.name}
                    className={`theme-dot ${theme === t.name ? "active" : ""}`}
                    style={{ background: t.color }}
                    onClick={() => changeTheme(t.name)}
                    title={t.name}
                  />
                ))}
              </div>
              <div className="dark-toggle" onClick={() => setDarkMode(!darkMode)}>
                <span>{darkMode ? "🌙 Dark" : "☀️ Light"}</span>
                <span>{darkMode ? "→ Light" : "→ Dark"}</span>
              </div>
            </div>
          )}
        </div>

        {/* Pinned */}
        {pinnedMsg && (
          <div className="pinned-banner">
            📌 <span>{pinnedMsg.text || "Image"}</span>
            <button onClick={() => pinMessage(pinnedMsg.id)}>✕</button>
          </div>
        )}

        {/* Search */}
        {showSearch && (
          <div className="search-bar">
            <input type="text" placeholder="Search messages..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} autoFocus />
            {searchQuery && <span className="search-count">{filteredMessages.length} results</span>}
            <button onClick={() => { setShowSearch(false); setSearchQuery(""); }}>✕</button>
          </div>
        )}

        <ChatWindow
          messages={filteredMessages}
          isTyping={isTyping}
          deleteMessage={deleteMessage}
          editMessage={editMessage}
          addReaction={addReaction}
          pinMessage={pinMessage}
          pinnedId={pinnedId}
          username={user.name}
        />

        <MessageInput send={send} status={status} username={user.name} />
      </div>
    </div>
  );
}