import { useEffect, useRef, useState } from "react";

function playSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g);
    g.connect(ctx.destination);
    o.frequency.setValueAtTime(880, ctx.currentTime);
    o.frequency.setValueAtTime(660, ctx.currentTime + 0.1);
    g.gain.setValueAtTime(0.3, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    o.start(ctx.currentTime);
    o.stop(ctx.currentTime + 0.4);
  } catch (e) {}
}

export function useWebSocket(url) {
  const ws = useRef(null);
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem("chat_messages");
    return saved ? JSON.parse(saved) : [];
  });
  const [status, setStatus] = useState("disconnected");
  const [isTyping, setIsTyping] = useState(false);
  const [pinnedId, setPinnedId] = useState(() => {
    return localStorage.getItem("pinned_msg") || null;
  });

  useEffect(() => {
    ws.current = new WebSocket(url);
    ws.current.onopen = () => setStatus("connected");

    ws.current.onmessage = (event) => {
      let data;
      try {
        data = JSON.parse(event.data);
      } catch (e) {
        // Rust backend plain text bhejta hai
        data = {
          type: "message",
          message: {
            id: Date.now(),
            sender: "server",
            senderName: "AI",
            text: event.data,
            timestamp: new Date().toISOString(),
            reactions: {},
          }
        };
      }

      if (data.type === "typing") {
        setIsTyping(data.isTyping);
      } else if (data.type === "history") {
        setMessages(data.messages);
      } else if (data.type === "message") {
        setMessages(prev => {
          const updated = [...prev, data.message];
          localStorage.setItem("chat_messages", JSON.stringify(updated));
          return updated;
        });
        playSound();
      }
    };

    ws.current.onclose = () => setStatus("disconnected");
    ws.current.onerror = () => setStatus("disconnected");

    return () => ws.current.close();
  }, [url]);

  function send(text, senderName, image = null) {
    if (!ws.current) return;
    const newMsg = {
      id: Date.now(),
      sender: "user",
      senderName: senderName || "You",
      text: text || "",
      image: image || null,
      timestamp: new Date().toISOString(),
      reactions: {},
      edited: false,
    };
    if (ws.current.readyState === WebSocket.OPEN) {
      // Rust backend plain text expect karta hai
      ws.current.send(text);
    }
    setMessages(prev => {
      const updated = [...prev, newMsg];
      localStorage.setItem("chat_messages", JSON.stringify(updated));
      return updated;
    });
  }

  function deleteMessage(id) {
    setMessages(prev => {
      const updated = prev.filter(m => m.id !== id);
      localStorage.setItem("chat_messages", JSON.stringify(updated));
      return updated;
    });
    if (pinnedId === id) pinMessage(null);
  }

  function editMessage(id, newText) {
    setMessages(prev => {
      const updated = prev.map(m =>
        m.id === id ? { ...m, text: newText, edited: true } : m
      );
      localStorage.setItem("chat_messages", JSON.stringify(updated));
      return updated;
    });
  }

  function addReaction(id, emoji) {
    setMessages(prev => {
      const updated = prev.map(m => {
        if (m.id !== id) return m;
        const reactions = { ...m.reactions };
        reactions[emoji] = (reactions[emoji] || 0) + 1;
        return { ...m, reactions };
      });
      localStorage.setItem("chat_messages", JSON.stringify(updated));
      return updated;
    });
  }

  function pinMessage(id) {
    const newPinned = pinnedId === id ? null : id;
    setPinnedId(newPinned);
    if (newPinned) {
      localStorage.setItem("pinned_msg", newPinned);
    } else {
      localStorage.removeItem("pinned_msg");
    }
  }

  function clearHistory() {
    localStorage.removeItem("chat_messages");
    localStorage.removeItem("pinned_msg");
    setMessages([]);
    setPinnedId(null);
  }

  return {
    messages, status, isTyping, pinnedId,
    send, deleteMessage, editMessage,
    addReaction, pinMessage, clearHistory
  };
}