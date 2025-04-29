import React, { useState, useContext, useEffect } from "react";
import {
  uploadModel,
  fetchModels,
  deleteModel,
  renameModel,
} from "./api";
import api from "./api";
import ModelViewer from "./components/ModelViewer/ModelViewer";
import { AuthContext, AuthProvider } from "./context/AuthContext";
import ChatBot from "./components/ChatBot/ChatBot";
import "./App.css";

function App() {
  const { token, setToken } = useContext(AuthContext);
  const [authMode, setAuthMode] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");

  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState(null);
  const [uploadError, setUploadError] = useState("");

  const [renamingId, setRenamingId] = useState(null);
  const [newName, setNewName] = useState("");

  useEffect(() => {
    if (token) loadModels();
  }, [token]);

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

  const loadModels = async () => {
    try {
      const res = await fetchModels(token);
      setModels(res.data);
    } catch {
      setModels([]);
    }
  };

  const uploadFiles = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    const formData = new FormData();
    files.forEach(file => formData.append('models', file));
    try {
      await uploadModel(formData, token);
      loadModels();
    } catch (err) {
      setUploadError("Upload failed.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this model?")) return;
    try {
      await deleteModel(id, token);
      loadModels();
      if (selectedModel && selectedModel._id === id) {
        setSelectedModel(null);
      }
    } catch (error) {
      console.error("Error deleting model:", error);
    }
  };

  const startRenaming = (id, currentName) => {
    setRenamingId(id);
    setNewName(currentName);
  };

  const handleRename = async () => {
    if (!newName.trim()) return;
    try {
      await renameModel(renamingId, newName.trim(), token);
      setRenamingId(null);
      setNewName("");
      loadModels();
    } catch (error) {
      console.error("Error renaming model:", error);
    }
  };

  const selectModel = (model) => {
    setSelectedModel(model);
  };

  const handleLogout = () => {
    setToken("");
    setModels([]);
    setSelectedModel(null);
    setUsername("");
    setPassword("");
  };

  if (!token) {
    return (
      <div className="auth-container">
        <h2>{authMode === "login" ? "Login" : "Register"}</h2>
        <form onSubmit={handleAuth}>
          <input
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder="Username"
            required
          />
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Password"
            required
          />
          <button type="submit">
            {authMode === "login" ? "Login" : "Register"}
          </button>
        </form>
        <button onClick={() => setAuthMode(authMode === "login" ? "register" : "login")}>
          {authMode === "login" ? "Need an account? Register" : "Have an account? Login"}
        </button>
        {authError && <div className="error">{authError}</div>}
      </div>
    );
  }

  return (
    <div className="container">
     
        <div className="sidebar">
          <div className="sidebar-header">
            <h2>The DoAr AI</h2>
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </div>

          <div className="upload-section">
            <input
              type="file"
              multiple
              accept=".gltf,.glb,.bin,.jpg,.jpeg,.png"
              onChange={uploadFiles}
            />
            {uploadError && <div className="error">{uploadError}</div>}

            <h4>Your Models</h4>
            {models.length === 0 && <div>No models uploaded yet.</div>}
            <ul className="model-list">
              {models.map((m) => (
                <li key={m._id} className="model-item">
                  {renamingId === m._id ? (
                    <>
                      <input
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="rename-input"
                      />
                      <button onClick={handleRename} className="save-btn">Save</button>
                      <button onClick={() => setRenamingId(null)} className="cancel-btn">Cancel</button>
                    </>
                  ) : (
                    <>
                      <button
                        className={`model-btn ${selectedModel && selectedModel._id === m._id ? 'selected' : ''}`}
                        onClick={() => selectModel(m)}
                      >
                        {m.originalName}
                      </button>
                      <button className="rename-btn" onClick={() => startRenaming(m._id, m.originalName)}>✏️</button>
                      <button className="delete-btn" onClick={() => handleDelete(m._id)}>✖</button>
                    </>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {selectedModel && <ChatBot />}
        </div>
      

      
        <div className="viewer">
          {selectedModel?.uploadId && selectedModel?.mainFile && (
            <ModelViewer
              uploadId={selectedModel.uploadId}
              mainFile={selectedModel.mainFile}
            />
          )}
        </div>
      
    </div>
  );
}

export default function WrappedApp() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}
