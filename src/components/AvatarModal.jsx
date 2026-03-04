// src/components/AvatarModal.jsx
import { useState } from "react";
import { Dialog } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";
const API_BASE = import.meta.env.VITE_API_URL;

function AvatarUploadModal({ isOpen, onClose, currentAvatar, onUpload }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(currentAvatar);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (f) {
      setFile(f);
      setPreview(URL.createObjectURL(f));
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append("avatar", file);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/users/avatar`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Profile picture updated!");
      onUpload(data.avatar);
      onClose();
    } catch (err) {
      toast.error("Upload failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/users/avatar`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to remove");
      toast.success("Profile picture removed.");
      setPreview("/default-avatar.png");
      onUpload("");
      onClose();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="modal-backdrop" aria-hidden="true" />
      <div className="modal-wrap">
        <Dialog.Panel className="modal-panel">
          <div className="modal-header">
            <Dialog.Title className="modal-title">Profile Picture</Dialog.Title>
            <button className="modal-close-btn" onClick={onClose}>
              <XMarkIcon style={{ width: 18, height: 18 }} />
            </button>
          </div>

          <div className="avatar-modal-body">
            {preview && (
              <img src={preview} alt="preview" className="avatar-preview" />
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="avatar-file-input"
            />
            <div className="avatar-modal-btns">
              <button
                onClick={handleUpload}
                disabled={!file || loading}
                className="modal-btn modal-btn-primary"
              >
                {loading ? "Uploading…" : "Upload"}
              </button>
              <button
                onClick={handleRemove}
                disabled={!file || loading}
                className="modal-btn modal-btn-danger"
              >
                {loading ? "Removing…" : "Remove"}
              </button>
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}

export default AvatarUploadModal;
