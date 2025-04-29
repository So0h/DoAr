import React, { useRef } from "react";
import axios from "axios";

export default function UploadModel({ token, onUpload, setUploadError }) {
  const fileInput = useRef();

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    const formData = new FormData();
    files.forEach(file => formData.append("files", file));
    try {
      setUploadError("");
      await axios.post(
        "http://localhost:5000/api/model/upload",
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onUpload && onUpload();
      fileInput.current.value = "";
    } catch (err) {
      setUploadError("Upload failed. " + (err.response?.data?.message || ""));
    }
  };

  return (
    <div>
      <input
        ref={fileInput}
        type="file"
        multiple
        accept=".gltf,.glb,.bin,.jpg,.jpeg,.png,.webp"
        onChange={handleUpload}
        style={{ marginBottom: 10 }}
      />
    </div>
  );
}
