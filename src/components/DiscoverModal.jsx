// src/components/DiscoverModal.jsx
import { useState, useEffect } from "react";
import { Dialog } from "@headlessui/react";
import { XMarkIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";
import Avatar from "./Avatar";
const API_BASE = import.meta.env.VITE_API_URL;
import cleanName from './utils/formatter';

function DiscoverModal({ isOpen, onClose, onAddContact }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    if (isOpen) fetchUsers(1, debouncedSearch);
  }, [isOpen, debouncedSearch]);

  const fetchUsers = async (pageNum, query) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${API_BASE}/api/auth/discover?page=${pageNum}&limit=20&search=${encodeURIComponent(
          query
        )}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      if (res.ok) {
        setUsers(data.users);
        setTotalPages(data.totalPages);
        setPage(data.page);
      } else toast.error(data.error);
    } catch (err) {
      toast.error(`Failed to load users ${err}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="modal-backdrop" aria-hidden="true" />
      <div className="modal-wrap">
        <Dialog.Panel className="modal-panel modal-panel-wide">
          <div className="modal-header">
            <Dialog.Title className="modal-title">Discover People</Dialog.Title>
            <button className="modal-close-btn" onClick={onClose}>
              <XMarkIcon style={{ width: 18, height: 18 }} />
            </button>
          </div>

          {/* Search */}
          <div className="discover-search-wrap">
            <MagnifyingGlassIcon className="discover-search-icon" />
            <input
              type="text"
              placeholder="Search by username or ID…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="discover-input"
            />
          </div>

          {/* List */}
          {loading ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                padding: "2rem",
              }}
            >
              <div className="loading-spinner" />
            </div>
          ) : (
            <div className="discover-list">
              {users.length === 0 ? (
                <p
                  style={{
                    textAlign: "center",
                    color: "rgba(240,244,255,0.4)",
                    padding: "2rem 0",
                  }}
                >
                  No users found
                </p>
              ) : (
                users.map((user) => (
                  <div key={user._id} className="discover-user-row">
                    <div className="discover-user-info">
                      <Avatar
                        src={user.avatar}
                        username={cleanName(user.username)}
                        size={40}
                      />
                      <div>
                        <div className="discover-user-name">
  {cleanName(user.username)}
                          {cleanName(user.username) === 'Chitchat Updates' || cleanName(user.username) === 'Chitchat Official' ? (
                                               <span className="verified-badge"> ✅</span>
                                            ) : null}                        </div>
                        <div className="discover-user-id">ID: {user.id}</div>
                      </div>
                    </div>
                    <button
                      className="discover-msg-btn"
                      onClick={() => {
                        onAddContact(user);
                        toast.success(`${cleanName(user.username)} added!`);
                      }}
                    >
                      Message
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="discover-pagination">
              <button
                className="discover-page-btn"
                onClick={() => fetchUsers(page - 1, debouncedSearch)}
                disabled={page === 1}
              >
                ← Prev
              </button>
              <span className="discover-page-label">
                Page {page} of {totalPages}
              </span>
              <button
                className="discover-page-btn"
                onClick={() => fetchUsers(page + 1, debouncedSearch)}
                disabled={page === totalPages}
              >
                Next →
              </button>
            </div>
          )}
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}

export default DiscoverModal;
