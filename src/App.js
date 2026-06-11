import React, { useState } from "react";
import { useWebSocket } from "./hooks/useWebSocket.js";
import ChatWindow from "./components/ChatWindow.jsx";
import MessageInput from "./components/MessageInput.jsx";
import "./App.css";

export default function App() {
  const [username, setUsername] = useState(() => localStorage.getItem("chat_username") || "");
  const [nameInput, setNameInput] = useState("");
  const [darkMode, setDarkMode] = useState(true);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

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
            <div className="modal-logo">🤖</div>
            <h2>AI Chat</h2>
            <p>Enter your name to start chatting</p>
            <input
              type="text"
              placeholder="Your name..."
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSetName()}
              autoFocus
            />
            <button onClick={handleSetName}>Start Chatting →</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`app-root ${darkMode ? "dark" : "light"}`}>
      <div className="app">

        {/* Header */}
        <div className="top-header">
          <div className="header-brand">
            <div className="ai-avatar">🤖</div>
            <div>
              <div className="ai-name">Gemini AI</div>
              <div className={`ai-status ${status}`}>
                {status === "connected" ? "● Online" : "● Offline"}
              </div>
            </div>
          </div>
          <div className="header-actions">
            <button className="icon-btn" onClick={() => { setShowSearch(!showSearch); setSearchQuery(""); }} title="Search">🔍</button>
            <button className="icon-btn" onClick={clearHistory} title="Clear chat">🗑</button>
            <button className="theme-btn" onClick={() => setDarkMode(!darkMode)}>
              {darkMode ? "☀️" : "🌙"}
            </button>
            <div className="user-chip">
              <div className="user-chip-avatar">{username.slice(0, 2).toUpperCase()}</div>
              <span>{username}</span>
            </div>
          </div>
        </div>

        {/* Pinned Message */}
        {pinnedMsg && (
          <div className="pinned-banner">
            📌
            <span>{pinnedMsg.text || "Image"}</span>
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

        {/* Chat */}
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
    </div>
  );
}