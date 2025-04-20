import React, { useState, useContext, useEffect } from "react";
import api from "./api";
import ModelViewer from "./ModelViewer";
import { AuthContext, AuthProvider } from "./AuthContext";

function App() {
  // Auth state
  const { token, setToken } = useContext(AuthContext);
  const [authMode, setAuthMode] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");

  // Model state
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState(null);
  const [modelUrl, setModelUrl] = useState("");
  const [uploadError, setUploadError] = useState("");

  // AI editing
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch models after login
  useEffect(() => {
    if (token) fetchModels();
    // eslint-disable-next-line
  }, [token]);

  // Auth handlers
  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError("");
    try {
      const endpoint = authMode === "login" ? "/auth/login" : "/auth/register";
      const res = await api.post(endpoint, { username, password });
      if (authMode === "login") setToken(res.data.token);
      else setAuthMode("login");
    } catch (err) {
      setAuthError(err.response?.data?.message || "Authentication error");
    }
  };

  // Model upload handler
  const uploadModel = async (e) => {
    setUploadError("");
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("model", file);
    try {
      await api.post("/model/upload", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchModels();
    } catch (err) {
      setUploadError(err.response?.data?.message || "Upload failed");
    }
  };

  // Fetch models
  const fetchModels = async () => {
    try {
      const res = await api.get("/model/list", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setModels(res.data);
    } catch (err) {
      setModels([]);
    }
  };

  // Select model and set modelUrl for viewer
  const selectModel = (model) => {
    setSelectedModel(model);
    setModelUrl(
      `http://localhost:5000/api/model/file/${model.filename}`
    );
  };

  // AI edit handler
  const editModel = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    try {
      const res = await api.post(
        "/ai/edit",
        { modelId: selectedModel._id, prompt },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setModelUrl(
        `http://localhost:5000/api/model/file/${res.data.filename}`
      );
      fetchModels();
      setPrompt("");
    } catch (err) {
      alert(err.response?.data?.message || "Edit failed");
    }
    setLoading(false);
  };

  // Logout
  const handleLogout = () => {
    setToken("");
    setModels([]);
    setSelectedModel(null);
    setModelUrl("");
    setPrompt("");
  };

  // Render authentication form if not logged in
  if (!token) {
    return (
      <div style={{ maxWidth: 400, margin: "40px auto", padding: 24, border: "1px solid #ccc", borderRadius: 8 }}>
        <h2>{authMode === "login" ? "Login" : "Register"}</h2>
        <form onSubmit={handleAuth}>
          <input
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder="Username"
            required
            style={{ display: "block", width: "100%", marginBottom: 8, padding: 8 }}
          />
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Password"
            required
            style={{ display: "block", width: "100%", marginBottom: 8, padding: 8 }}
          />
          <button type="submit" style={{ width: "100%", padding: 10 }}>
            {authMode === "login" ? "Login" : "Register"}
          </button>
        </form>
        <button
          style={{ marginTop: 12, width: "100%" }}
          onClick={() => setAuthMode(authMode === "login" ? "register" : "login")}
        >
          {authMode === "login" ? "Need an account? Register" : "Have an account? Login"}
        </button>
        {authError && <div style={{ color: "red", marginTop: 12 }}>{authError}</div>}
      </div>
    );
  }

  // Main app UI
  return (
    <div style={{ maxWidth: 900, margin: "30px auto", fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>DoAr 3D Editor</h1>
        <button onClick={handleLogout} style={{ padding: 8 }}>Logout</button>
      </div>
      <div style={{ marginBottom: 18 }}>
        <input
          type="file"
          accept=".gltf,.glb"
          onChange={uploadModel}
          style={{ marginRight: 8 }}
        />
        {uploadError && <span style={{ color: "red" }}>{uploadError}</span>}
      </div>
      <h2>Your Models</h2>
      {models.length === 0 && <div>No models uploaded yet.</div>}
      <ul>
        {models.map(m => (
          <li key={m._id} style={{ marginBottom: 6 }}>
            <button
              style={{
                background: selectedModel && selectedModel._id === m._id ? "#e0e0e0" : "#fff",
                border: "1px solid #bbb",
                padding: "6px 12px",
                borderRadius: 4,
                cursor: "pointer"
              }}
              onClick={() => selectModel(m)}
            >
              {m.originalName} {m.edited ? "(edited)" : ""}
            </button>
          </li>
        ))}
      </ul>
      {modelUrl && (
        <>
          <div style={{ margin: "24px 0" }}>
            <ModelViewer modelUrl={modelUrl} token={token} />
          </div>
          <div style={{ marginBottom: 18 }}>
            <input
              type="text"
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder="Describe your edit (e.g. make walls blue)"
              style={{ width: 350, padding: 8, marginRight: 8 }}
              disabled={loading}
            />
            <button onClick={editModel} disabled={loading || !prompt.trim()}>
              {loading ? "Editing..." : "Apply Edit"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// Wrap with AuthProvider
export default function WrappedApp() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}
