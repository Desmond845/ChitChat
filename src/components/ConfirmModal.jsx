// src/components/ConfirmModal.jsx
import { Dialog } from "@headlessui/react";
import {
  ExclamationTriangleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Delete",
  cancelText = "Cancel",
}) {
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="modal-backdrop" aria-hidden="true" />
      <div className="modal-wrap">
        <Dialog.Panel className="modal-panel" style={{ maxWidth: 360 }}>
          <button
            className="modal-close-btn"
            style={{ position: "absolute", top: 16, right: 16 }}
            onClick={onClose}
          >
            <XMarkIcon style={{ width: 18, height: 18 }} />
          </button>

          <div className="confirm-icon-wrap">
            <ExclamationTriangleIcon
              style={{ width: 24, height: 24, color: "#f87171" }}
            />
          </div>

          <Dialog.Title
            className="modal-title"
            style={{ textAlign: "center", marginBottom: "0.5rem" }}
          >
            {title}
          </Dialog.Title>
          <p
            style={{
              fontSize: "0.875rem",
              color: "rgba(240,244,255,0.55)",
              textAlign: "center",
              marginBottom: "1.5rem",
              lineHeight: 1.6,
            }}
          >
            {message}
          </p>

          <div style={{ display: "flex", gap: "0.625rem" }}>
            <button onClick={onClose} className="modal-btn modal-btn-ghost">
              {cancelText}
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="modal-btn modal-btn-danger"
            >
              {confirmText}
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}

export default ConfirmModal;
