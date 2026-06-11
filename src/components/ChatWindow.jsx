import React, { useEffect, useRef, useState } from "react";

const EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🔥", "🎉", "👀"];

export default function ChatWindow({ messages, isTyping, deleteMessage, addReaction, editMessage, pinMessage, pinnedId, username }) {
  const bottomRef = useRef(null);
  const [hoveredId, setHoveredId] = useState(null);
  const [pickerOpenId, setPickerOpenId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [lightboxImg, setLightboxImg] = useState(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  function formatTime(timestamp) {
    return new Date(timestamp).toLocaleTimeString("en-IN", {
      hour: "2-digit", minute: "2-digit",
    });
  }

  function formatDate(timestamp) {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
    return date.toLocaleDateString("en-IN", { day: "numeric", month: "long" });
  }

  function getInitials(name) {
    return name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "?";
  }

  function showDateDivider(index) {
    if (index === 0) return true;
    const curr = new Date(messages[index].timestamp).toDateString();
    const prev = new Date(messages[index - 1].timestamp).toDateString();
    return curr !== prev;
  }

  function startEdit(msg) {
    setEditingId(msg.id);
    setEditText(msg.text);
    setHoveredId(null);
  }

  function saveEdit(id) {
    if (editText.trim()) editMessage(id, editText.trim());
    setEditingId(null);
  }

  return (
    <div className="chat-window" onClick={() => setPickerOpenId(null)}>
      {messages.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">💬</div>
          <p>No messages yet. Say hello!</p>
        </div>
      ) : (
        messages.map((msg, i) => (
          <React.Fragment key={msg.id || i}>
            {showDateDivider(i) && (
              <div className="date-divider">
                <span>{formatDate(msg.timestamp)}</span>
              </div>
            )}

            <div
              className={`message-row ${msg.sender === "user" ? "user" : "server"}`}
              onMouseEnter={() => setHoveredId(msg.id)}
              onMouseLeave={() => { setHoveredId(null); }}
            >
              {msg.sender !== "user" && (
                <div className="avatar server-avatar">{getInitials(msg.senderName || "Alice")}</div>
              )}

              <div className="bubble-wrap">
                {msg.sender !== "user" && (
                  <div className="sender-name">{msg.senderName || "Alice"}</div>
                )}

                {/* Edit mode */}
                {editingId === msg.id ? (
                  <div>
                    <input
                      className="edit-input"
                      value={editText}
                      onChange={e => setEditText(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === "Enter") saveEdit(msg.id);
                        if (e.key === "Escape") setEditingId(null);
                      }}
                      autoFocus
                    />
                    <div className="edit-actions">
                      <button className="edit-save" onClick={() => saveEdit(msg.id)}>Save</button>
                      <button className="edit-cancel" onClick={() => setEditingId(null)}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div className={`bubble ${msg.edited ? "edited" : ""} ${msg.id === pinnedId ? "pinned-msg" : ""}`}>
                    {/* Image message */}
                    {msg.image ? (
                      <img
                        src={msg.image}
                        alt="shared"
                        className="msg-image"
                        onClick={() => setLightboxImg(msg.image)}
                      />
                    ) : msg.text}

                    {/* Reactions */}
                    {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                      <div className="reactions">
                        {Object.entries(msg.reactions).map(([emoji, count]) => (
                          <span key={emoji} className="reaction" onClick={() => addReaction(msg.id, emoji)}>
                            {emoji} {count}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="meta">{formatTime(msg.timestamp)}</div>
              </div>

              {msg.sender === "user" && (
                <div className="avatar user-avatar">{getInitials(username)}</div>
              )}

              {/* Hover Actions */}
              {hoveredId === msg.id && editingId !== msg.id && (
                <div className={`msg-actions ${msg.sender === "user" ? "actions-left" : "actions-right"}`}>
                  <button onClick={(e) => { e.stopPropagation(); setPickerOpenId(pickerOpenId === msg.id ? null : msg.id); }} title="React">😊</button>
                  <button onClick={() => pinMessage(msg.id)} title="Pin">📌</button>
                  {msg.sender === "user" && (
                    <>
                      <button onClick={() => startEdit(msg)} title="Edit">✏️</button>
                      <button onClick={() => deleteMessage(msg.id)} title="Delete">🗑️</button>
                    </>
                  )}
                </div>
              )}

              {/* Emoji Picker */}
              {pickerOpenId === msg.id && (
                <div className={`emoji-picker ${msg.sender === "user" ? "picker-left" : "picker-right"}`} onClick={e => e.stopPropagation()}>
                  {EMOJIS.map(emoji => (
                    <span key={emoji} onClick={() => { addReaction(msg.id, emoji); setPickerOpenId(null); }}>
                      {emoji}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </React.Fragment>
        ))
      )}

      {/* Typing Indicator */}
      {isTyping && (
        <div className="message-row server">
          <div className="avatar server-avatar">A</div>
          <div className="bubble-wrap">
            <div className="typing-indicator">
              <span /><span /><span />
            </div>
          </div>
        </div>
      )}

      <div ref={bottomRef} />

      {/* Image Lightbox */}
      {lightboxImg && (
        <div className="lightbox" onClick={() => setLightboxImg(null)}>
          <img src={lightboxImg} alt="full" />
        </div>
      )}
    </div>
  );
}