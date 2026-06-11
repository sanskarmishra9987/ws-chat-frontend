import React, { useState, useRef } from "react";

const ALL_EMOJIS = ["😊","😂","❤️","🔥","👍","😭","🥹","😍","🤣","😎","😤","🤔","🫡","💀","🤯","😮","🎉","🙌","💯","😢","👀","💪","🫶","✅","🚀","😅","😇","🥳","😜","😏","🤩","😴","🤗","😬","🙄","😈","👻","🫠","💅","🫣","😋","🤭","😌","🥰","😘","😆","😁","😀","🤑","😡"];

export default function MessageInput({ send, status, username }) {
  const [text, setText] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [showEmoji, setShowEmoji] = useState(false);
  const fileRef = useRef(null);

  function handleSend() {
    if (!text.trim() && !imageFile) return;
    if (imageFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        send("", username, e.target.result);
        setImageFile(null);
        setImagePreview(null);
      };
      reader.readAsDataURL(imageFile);
    } else {
      send(text, username);
    }
    setText("");
    setShowEmoji(false);
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  function removeImage() {
    setImageFile(null);
    setImagePreview(null);
    fileRef.current.value = "";
  }

  const isDisconnected = status === "disconnected";

  return (
    <div className="input-area" onClick={() => setShowEmoji(false)}>

      {/* Emoji Keyboard */}
      {showEmoji && (
        <div className="emoji-keyboard" onClick={e => e.stopPropagation()}>
          {ALL_EMOJIS.map(e => (
            <span key={e} onClick={() => { setText(t => t + e); }}>
              {e}
            </span>
          ))}
        </div>
      )}

      <div className="input-box" onClick={e => e.stopPropagation()}>

        {/* Image Preview */}
        {imagePreview && (
          <div className="image-preview">
            <img src={imagePreview} alt="preview" />
            <span className="image-preview-name">{imageFile?.name}</span>
            <button onClick={removeImage}>✕</button>
          </div>
        )}

        <div className="input-top">
          <textarea
            className="message-input"
            placeholder={isDisconnected ? "Connecting..." : `Message #general`}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isDisconnected || !!imagePreview}
            rows={1}
          />
        </div>

        <div className="input-bottom">
          <div className="input-tools">
            <button
              className="tool-btn"
              onClick={(e) => { e.stopPropagation(); setShowEmoji(!showEmoji); }}
              title="Emoji"
            >
              😊
            </button>
            <button className="tool-btn" onClick={() => fileRef.current.click()} title="Share image">
              📎
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleFile}
            />
          </div>
          <span className="hint">Enter ↵ send · Shift+Enter new line</span>
          <button
            className="send-btn"
            onClick={handleSend}
            disabled={isDisconnected || (!text.trim() && !imageFile)}
          >
            Send ➤
          </button>
        </div>
      </div>
    </div>
  );
}