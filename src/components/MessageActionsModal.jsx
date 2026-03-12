// components/MessageActionsModal.jsx
import { useState } from "react";

function MessageActionsModal({ message, onClose, onEdit, onDelete }) {
  const [editMode, setEditMode] = useState(false);
  const [editText, setEditText] = useState(message.text);

  if (editMode) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-80">
          <h3 className="text-lg font-bold mb-4">Edit Message</h3>
          <textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className="w-full border rounded p-2 mb-4"
            rows="3"
          />
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setEditMode(false)}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onEdit(message, editText);
                setEditMode(false);
                onClose();
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-64">
        <h3 className="text-lg font-bold mb-4">Message Options</h3>
        <button
          onClick={() => {
            setEditMode(true);
          }}
          className="block w-full text-left px-4 py-2 hover:bg-gray-100"
        >
          Edit
        </button>
        <button
          onClick={() => {
            onDelete(message);
            onClose();
          }}
          className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
        >
          Delete
        </button>
        <button
          onClick={onClose}
          className="block w-full text-left px-4 py-2 hover:bg-gray-100 mt-2"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default MessageActionsModal;
