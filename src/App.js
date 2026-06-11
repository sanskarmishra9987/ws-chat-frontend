import React, { useState } from "react";
import { useWebSocket } from "./hooks/useWebSocket.js";
import ChatWindow from "./components/ChatWindow.jsx";
import MessageInput from "./components/MessageInput.jsx";
import "./App.css";

const ONLINE_USERS = [
  { name: "Alice", status: "online", avatar: "AL" },
  { name: "Bob", status: "away", avatar: "BO" },
  { name: "Sara", status: "online", avatar: "SA" },
  { name: "Dev", status: "offline", avatar: "DV" },
];

const CHANNELS = ["general", "random", "dev-team", "announcements"];

export default function App() {
  const [username, setUsername] = useState(() => localStorage.getItem("chat_username") || "");
  const [nameInput, setNameInput] = useState("");
  const [darkMode, setDarkMode] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [activeChannel, setActiveChannel] = useState("general");

  const {
    messages, status, isTyping, pinnedId,
    send, deleteMessage, editMessage,
    addReaction, pinMessage, clearHistory
  } = useWebSocket("wss://ai-chatbot-using-websocket.onrender.com/ws");

  function handleSetName() {
    if (!nameInput.trim()) return;
    localStorage.setItem("chat_username", nameInput.trim());
    setUsername(nameInput.trim());
  }

  const pinnedMsg = messages.find(m => m.id === Number(pinnedId));

  const filteredMessages = searchQuery
    ? messages.filter(m => m.text?.toLowerCase().includes(searchQuery.toLowerCase()))
    : messages;

  if (!username) {
    return (
      <div className={`app-root ${darkMode ? "dark" : "light"}`}>
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-logo">💬</div>
            <h2>Welcome to WS Chat</h2>
            <p>Enter your name to get started</p>
            <input
              type="text"
              placeholder="Your name..."
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSetName()}
              autoFocus
            />
            <button onClick={handleSetName}>Join Chat →</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`app-root ${darkMode ? "dark" : "light"}`}>
      <div className="app">

        {/* Left Sidebar */}
        <div className="sidebar">
          <div className="sidebar-header">
            <div className="logo">
              <div className="logo-dot" />
              WS Chat
            </div>
            <button className="theme-btn" onClick={() => setDarkMode(!darkMode)}>
              {darkMode ? "☀️" : "🌙"}
            </button>
          </div>

          <div className="sidebar-section">
            <p className="sidebar-label">Channels</p>
            {CHANNELS.map(ch => (
              <div
                key={ch}
                className={`channel ${activeChannel === ch ? "active" : ""}`}
                onClick={() => setActiveChannel(ch)}
              >
                # {ch}
              </div>
            ))}
          </div>

          <div className="sidebar-section">
            <p className="sidebar-label">Direct Messages</p>
            {ONLINE_USERS.map(u => (
              <div key={u.name} className="dm">
                <span className={`status-dot ${u.status}`} />
                {u.name}
              </div>
            ))}
          </div>

          <div className="sidebar-footer">
            <div className="user-info">
              <div className="user-avatar">
                {username.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="user-name">{username}</p>
                <p className={`user-status ${status}`}>{status}</p>
              </div>
              <button className="clear-btn" onClick={clearHistory} title="Clear chat">🗑</button>
            </div>
          </div>
        </div>

        {/* Main Chat */}
        <div className="main">
          <div className="chat-header">
            <div className="header-left">
              <span className="channel-name"># {activeChannel}</span>
              <span className="channel-desc">
                {activeChannel === "general" ? "General discussion" :
                 activeChannel === "random" ? "Random stuff" :
                 activeChannel === "dev-team" ? "Dev team chat" : "Important updates"}
              </span>
            </div>
            <div className="header-right">
              <button className="icon-btn" onClick={() => { setShowSearch(!showSearch); setSearchQuery(""); }} title="Search">
                🔍
              </button>
              <div className={`status-badge ${status}`}>
                {status === "connected" ? "🟢 Live" : "🔴 Offline"}
              </div>
            </div>
          </div>

          {/* Pinned Message */}
          {pinnedMsg && (
            <div className="pinned-banner">
              📌
              <span>{pinnedMsg.senderName}: {pinnedMsg.text || "Image"}</span>
              <button onClick={() => pinMessage(pinnedMsg.id)}>✕</button>
            </div>
          )}

          {/* Search Bar */}
          {showSearch && (
            <div className="search-bar">
              <input
                type="text"
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
              {searchQuery && (
                <span className="search-count">{filteredMessages.length} results</span>
              )}
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
            username={username}
          />

          <MessageInput send={send} status={status} username={username} />
        </div>

        {/* Right Sidebar */}
        <div className="sidebar-right">
          <div className="sidebar-right-header">
            <p className="sidebar-label">Members — {ONLINE_USERS.length}</p>
          </div>
          <div className="members-list">
            <p className="members-section-label">
              Online — {ONLINE_USERS.filter(u => u.status === "online").length}
            </p>
            {ONLINE_USERS.filter(u => u.status === "online").map(u => (
              <div key={u.name} className="member">
                <div className="member-avatar">{u.avatar}</div>
                <span className="member-name">{u.name}</span>
                <span className="status-dot online" />
              </div>
            ))}
            <p className="members-section-label" style={{ marginTop: "12px" }}>
              Offline — {ONLINE_USERS.filter(u => u.status !== "online").length}
            </p>
            {ONLINE_USERS.filter(u => u.status !== "online").map(u => (
              <div key={u.name} className="member offline-member">
                <div className="member-avatar">{u.avatar}</div>
                <span className="member-name">{u.name}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}