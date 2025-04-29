import React, { useState, useContext } from "react";
import api from "../../api";
import { AuthContext } from "../../context/AuthContext";

export default function ChatBot() {
  const { token } = useContext(AuthContext);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const sendPrompt = async () => {
    const prompt = input.trim();
    if (!prompt) return;

    setLoading(true);
    setInput("");

    try {
      const canvas = document.querySelector("canvas");
      if (!canvas) throw new Error("Canvas not found!");

      // 📸 Convert canvas to Blob
      const blob = await new Promise(resolve => canvas.toBlob(resolve, "image/png"));

      const formData = new FormData();
      formData.append("prompt", prompt);
      formData.append("image", blob, "capture.png");

      const res = await api.post(
        "/edit",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          }
        }
      );

      const base64Image = res.data.image;

      setMessages(prev => [...prev, {
        user: prompt,
        bot: "✅ Enhanced view ready!",
        image: base64Image
      }]);
    } catch (err) {
      alert("Render error: " + (err.response?.data?.message || err.message));
    }

    setLoading(false);
  };

  return (
    <div style={{ padding: 20, overflowY: "auto", height: "100vh" }}>
      <h3>The DoAr AI - Render Chat</h3>
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g., Render photorealistic sunset view"
          style={{ flex: 1, padding: 10 }}
          disabled={loading}
        />
        <button onClick={sendPrompt} disabled={loading} style={{ padding: "10px 20px" }}>
          {loading ? "Rendering..." : "Send"}
        </button>
      </div>

      <div>
        {messages.map((m, i) => (
          <div key={i} style={{ marginBottom: 32 }}>
            <div><strong>You:</strong> {m.user}</div>
            <div><strong>The DoAr Ai:</strong> {m.bot}</div>
            {m.image && (
              <div style={{ marginTop: 12 }}>
                <img src={`data:image/png;base64,${m.image}`} alt="Render" style={{ maxWidth: "100%" }} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
