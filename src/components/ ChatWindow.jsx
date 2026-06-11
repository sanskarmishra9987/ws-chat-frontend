import React, { useEffect, useRef } from "react";

export default function ChatWindow({ messages, status }) {
  const bottomRef = useRef(null);

  // Naya message aaye toh auto scroll karo neeche
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function formatTime(timestamp) {
    return new Date(timestamp).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div className="chat-window">
      {messages.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">💬</div>
          <p>No messages yet. Say hello!</p>
        </div>
      ) : (
        messages.map((msg, i) => (
          <div
            key={i}
            className={`message-row ${msg.sender === "user" ? "user" : "server"}`}
          >
            {msg.sender !== "user" && (
              <div className="avatar">S</div>
            )}
            <div className="bubble-wrap">
              <div className="bubble">{msg.text}</div>
              <div className="meta">{formatTime(msg.timestamp)}</div>
            </div>
            {msg.sender === "user" && (
              <div className="avatar user-avatar">U</div>
            )}
          </div>
        ))
      )}
      <div ref={bottomRef} />
    </div>
  );
}