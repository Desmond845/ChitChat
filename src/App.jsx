// src/App.jsx
import { useState, useEffect, useRef, useMemo } from "react";
import io from "socket.io-client";
import { Toaster, toast } from "react-hot-toast";
import Sidebar from "./components/Sidebar";
import ChatArea from "./components/ChatArea";
import MessageInput from "./components/MessageInput";
import Auth from "./components/Auth";
import AvatarUploadModal from "./components/AvatarModal";
import ProfileModal from "./components/ProfileModal";
import ConfirmModal from "./components/ConfirmModal";
import DiscoverModal from "./components/DiscoverModal";
import { formatMessageTime } from "./utils/dateHelpers";
import "./App.css";
import cleanName from "./utils/formatter";

const API_BASE = import.meta.env.VITE_API_URL;
const socket = io(API_BASE);
function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [conversations, setConversations] = useState({});
  const [contacts, setContacts] = useState([]);
  const [selectedContactId, setSelectedContactId] = useState(null);
  const [inputText, setInputText] = useState("");
  const [typingContacts, setTypingContacts] = useState({});
  const [userPresence, setUserPresence] = useState({});
  const [loading, setLoading] = useState(false);
  const [editingMessage, setEditingMessage] = useState(null);
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [pendingDeleteMessage, setPendingDeleteMessage] = useState(null);
  const [discoverModalOpen, setDiscoverModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [profileUserId, setProfileUserId] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);

  const typingTimeoutRef = useRef(null);
  const selectedContactIdRef = useRef(selectedContactId);
  const currentUserIdRef = useRef(currentUser?.userId);

  const selectedContact = contacts.find((c) => c._id === selectedContactId);
  const contactAvatar = selectedContact?.avatar || "";

  const isUpdatesChannel = (id) =>
    cleanName(contacts.find((c) => c._id === id)?.username) === "ChitChat Updates";

  // ── Unread counts ─────────────────────────────────────────
  const unreadCounts = useMemo(() => {
    const counts = {};
    contacts.forEach((contact) => {
      const msgs = conversations[contact._id] || [];
      if (!Array.isArray(msgs)) {
        counts[contact._id] = 0;
        return;
      }
      counts[contact._id] = msgs.filter(
        (m) => m.senderId !== currentUser?.userId && m.status !== "read"
      ).length;
    });
    return counts;
  }, [conversations, contacts, currentUser?.userId]);

  // ── Refs sync ──────────────────────────────────────────────
  useEffect(() => {
    selectedContactIdRef.current = selectedContactId;
  }, [selectedContactId]);
  useEffect(() => {
    currentUserIdRef.current = currentUser?.userId;
  }, [currentUser]);

  // ── Socket register ────────────────────────────────────────
  useEffect(() => {
    if (currentUser) socket.emit("register", currentUser.userId);
  }, [currentUser]);

  // ── Typing ─────────────────────────────────────────────────
  useEffect(() => {
    if (!selectedContactId || !currentUser) return;
    if (inputText.trim().length > 0) {
      socket.emit("typing", {
        senderId: currentUser.userId,
        receiverId: selectedContactId,
      });
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit("stop typing", {
          senderId: currentUser.userId,
          receiverId: selectedContactId,
        });
      }, 2000);
    } else {
      socket.emit("stop typing", {
        senderId: currentUser.userId,
        receiverId: selectedContactId,
      });
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    }
  }, [inputText, selectedContactId]);
  // ── Fetch contact details ──────────────────────────────────
  const fetchContactDetails = async (contactId) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_BASE}/api/auth/${contactId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setContacts((prev) =>
        prev.map((c) => (c._id === contactId ? { ...c, ...data } : c))
      );
      setUserPresence((prev) => {
        if (prev[contactId] === "online") return prev;
        return { ...prev, [contactId]: data.lastSeen };
      });
      return data;
    } catch {
      return null;
    }
  };

  // ── Initial data fetch ─────────────────────────────────────
  useEffect(() => {
    if (!currentUser) return;
    const fetchData = async () => {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setConversations(data);
      const ids = Object.keys(data);
      let initial = ids.map((id) => ({ _id: id }));
      for (let i = 0; i < initial.length; i++) {
        const details = await fetchContactDetails(initial[i]._id);
        if (details) initial[i] = { ...initial[i], ...details };
      }
      setContacts(initial);
      setLoading(false);
    };
    fetchData();
  }, [currentUser]);

  // ── Restore session ────────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setInitialLoading(false);
      return;
    }
    const fetchUser = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const user = await res.json();
          setCurrentUser({
            userId: user._id,
            username: user.username,
            id: user.id,
            avatar: user.avatar,
            bio: user.bio,
          });
        } else {
          localStorage.removeItem("token");
        }
      } catch {
        localStorage.removeItem("token");
      } finally {
        setInitialLoading(false);
      }
    };
    fetchUser();
  }, []);

  // ── Presence ───────────────────────────────────────────────
  useEffect(() => {
    socket.on("user online", (userId) =>
      setUserPresence((prev) => ({ ...prev, [userId]: "online" }))
    );
    socket.on("user offline", ({ userId, lastSeen }) =>
      setUserPresence((prev) => ({ ...prev, [userId]: lastSeen }))
    );
    return () => {
      socket.off("user online");
      socket.off("user offline");
    };
  }, []);

  // ── Main socket listeners ──────────────────────────────────
  useEffect(() => {
    socket.on("user profile updated", ({ userId, bio, avatar }) => {
      setContacts((prev) =>
        prev.map((c) =>
          c._id === userId
            ? {
                ...c,
                ...(bio !== undefined && { bio }),
                ...(avatar !== undefined && { avatar }),
              }
            : c
        )
      );
      if (userId === currentUser?.userId) {
        setCurrentUser((prev) => ({
          ...prev,
          ...(bio !== undefined && { bio }),
          ...(avatar !== undefined && { avatar }),
        }));
      }
    });

    socket.on("avatar updated", ({ userId, newAvatar }) => {
      setContacts((prev) =>
        prev.map((c) => (c._id === userId ? { ...c, avatar: newAvatar } : c))
      );
      if (userId === currentUser?.userId)
        setCurrentUser((prev) => ({ ...prev, avatar: newAvatar }));
    });

    socket.on("chat message", (msg) => {
      const currentUserId = currentUserIdRef.current;
      const selectedId = selectedContactIdRef.current;
      if (!currentUserId) return;
      const initialStatus =
        msg.senderId !== currentUserId && selectedId === msg.senderId
          ? "read"
          : msg.status;
      const otherId =
        msg.senderId === currentUser.userId ? msg.receiverId : msg.senderId;

      setContacts((prev) => {
        if (prev.some((c) => c._id === otherId)) return prev;
        fetchContactDetails(otherId);
        return [...prev, { _id: otherId }];
      });

      setConversations((prev) => ({
        ...prev,
        [otherId]: [
          ...(prev[otherId] || []),
          { ...msg, status: initialStatus },
        ],
      }));
      if (msg.senderId !== currentUserId && selectedId === msg.senderId) {
        socket.emit("read", {
          readerId: currentUser.userId,
          contactId: msg.senderId,
        });
      }

      // Toast for messages from other contacts
      if (
        msg.senderId !== currentUser.userId &&
        selectedContactId !== msg.senderId
      ) {
        const sender = contacts.find((c) => c._id === msg.senderId);
        const senderName = sender?.username || "Someone";
        toast.custom(
          (t) => (
            <div
              className="toast-custom"
              onClick={() => {
                setSelectedContactId(msg.senderId);
                toast.dismiss(t.id);
              }}
            >
              <div style={{ flex: 1 }}>
                <div className="toast-sender">{senderName}</div>
                <div className="toast-preview">{msg.text}</div>
              </div>
              <button
                className="toast-close"
                onClick={(e) => {
                  e.stopPropagation();
                  toast.dismiss(t.id);
                }}
              >
                ✕
              </button>
            </div>
          ),
          { duration: 4000 }
        );
      }

      const audio = new Audio("../receive.mp3");
      audio.play().catch(() => {});
    });

    socket.on("typing", ({ senderId }) =>
      setTypingContacts((prev) => ({ ...prev, [senderId]: true }))
    );
    socket.on("stop typing", ({ senderId }) =>
      setTypingContacts((prev) => ({ ...prev, [senderId]: false }))
    );

    socket.on("message delivered", ({ messageId }) => {
      setConversations((prev) => {
        const updated = { ...prev };
        Object.keys(updated).forEach((id) => {
          updated[id] = updated[id].map((m) =>
            m.id === messageId ? { ...m, status: "delivered" } : m
          );
        });
        return updated;
      });
    });

    socket.on("messages read", ({ readerId }) => {
      if (!currentUserIdRef.current) return;
      setConversations((prev) => {
        if (!prev[readerId]) return prev;
        return {
          ...prev,
          [readerId]: prev[readerId].map((m) =>
            m.senderId === currentUser.userId ? { ...m, status: "read" } : m
          ),
        };
      });
    });

    socket.on("message saved", ({ tempId, ...savedMsg }) => {
      setConversations((prev) => {
        const otherId =
          savedMsg.senderId === currentUser.userId
            ? savedMsg.receiverId
            : savedMsg.senderId;
        const msgs = prev[otherId] || [];
        const idx = msgs.findIndex((m) => m.tempId === tempId);
        if (idx === -1) return prev;
        const updated = [...msgs];
        updated[idx] = { ...savedMsg, id: savedMsg.id, status: "sent" };
        return { ...prev, [otherId]: updated };
      });
    });

    socket.on("message edited", (updated) => {
      setConversations((prev) => {
        const u = { ...prev };
        Object.keys(u).forEach((id) => {
          u[id] = u[id].map((m) =>
            m.id === updated.id ? { ...m, text: updated.text, edited: true } : m
          );
        });
        return u;
      });
    });

    socket.on("message deleted", (messageId) => {
      setConversations((prev) => {
        const u = { ...prev };
        Object.keys(u).forEach((id) => {
          u[id] = u[id].filter((m) => m.id !== messageId);
        });
        return u;
      });
    });

    return () => {
      socket.off("chat message");
      socket.off("message saved");
      socket.off("typing");
      socket.off("stop typing");
      socket.off("message edited");
      socket.off("message deleted");
      socket.off("messages read");
      socket.off("message delivered");
      socket.off("user profile updated");
      socket.off("avatar updated");
    };
  }, [currentUser, contacts]);

  // ── Lazy contact details fetch ─────────────────────────────
  useEffect(() => {
    if (!selectedContactId) return;
    const contact = contacts.find((c) => c._id === selectedContactId);
    if (contact?.username) return;
    fetchContactDetails(selectedContactId);
  }, [selectedContactId, contacts]);
  // ── Sorted contacts ────────────────────────────────────────
  const sortedContacts = [...contacts].sort((a, b) => {
    const aLast = (conversations[a._id] || []).at(-1);
    const bLast = (conversations[b._id] || []).at(-1);
    return new Date(bLast?.createdAt || 0) - new Date(aLast?.createdAt || 0);
  });

  // ── SubTexts ───────────────────────────────────────────────
  const subTexts = contacts.map((contact) => {
    let msgs = conversations[contact._id] || [];
    if (msgs === "Invalid token") msgs = [];
    const lastMsg = msgs[msgs.length - 1] || null;
    const isTyping = typingContacts[contact._id] || false;
    let displayText = "";
    if (isTyping) {
      displayText = "Typing…";
    } else if (lastMsg) {
      try {
        const truncated =
          lastMsg.text.length > 30
            ? lastMsg.text.slice(0, 27) + "…"
            : lastMsg.text;
        if (lastMsg.senderId === currentUser?.userId) {
          const icons = {
            sending: "🕒",
            sent: "✓",
            delivered: "✓✓",
            read: "✓✓",
          };
          displayText = `${icons[lastMsg.status] || ""} ${truncated}`;
        } else {
          displayText = truncated;
        }
        displayText += ` · ${formatMessageTime(lastMsg.createdAt)}`;
      } catch (err) {
        
      }
    } else {
      displayText = "No messages yet";
    }
    return {
      id: contact._id,
      text: displayText,
      isTyping,
      unread: unreadCounts[contact._id] || 0,
    };
  });

  // ── Actions ────────────────────────────────────────────────
  const handleSendMessage = () => {
    if (isUpdatesChannel(selectedContactId)) {
      toast.error("Read-only channel");
      return;
    }
    if (!inputText.trim() || !selectedContactId) return;
    if (inputText.length > 500) {
      toast.error("Message too long (max 500 chars)");
      return;
    }
    const tempId = `${Date.now()}-${Math.random().toString(36)}`;
    const newMessage = {
      tempId,
      text: inputText,
      senderId: currentUser.userId,
      receiverId: selectedContactId,
      createdAt: new Date().toISOString(),
      status: "sending",
      edited: false,
    };
    setConversations((prev) => ({
      ...prev,
      [selectedContactId]: [...(prev[selectedContactId] || []), newMessage],
    }));
    socket.emit("chat message", newMessage);
    socket.emit("stop typing", {
      senderId: currentUser.userId,
      receiverId: selectedContactId,
    });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    new Audio("../send.wav").play().catch(() => {});
    setInputText("");
  };

  const handleSelectContact = (contactId) => {
    setSelectedContactId(contactId);
    socket.emit("read", { readerId: currentUser.userId, contactId });
    setConversations((prev) => ({
      ...prev,
      [contactId]: (prev[contactId] || []).map((m) =>
        m.senderId !== currentUser.userId ? { ...m, status: "read" } : m
      ),
    }));
  };

  const handleAddContact = (user) => {
    setContacts((prev) =>
      prev.some((c) => c._id === user._id) ? prev : [...prev, user]
    );
    setSelectedContactId(user._id);
    setUserPresence((prev) =>
      prev[user._id] === "online"
        ? prev
        : { ...prev, [user._id]: user.lastSeen }
    );
  };

  const handleUpdateMessage = async (messageId, newText) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(
        `${API_BASE}/api/messages/${messageId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ text: newText }),
        }
      );
      const updated = await res.json();
      if (!res.ok) throw new Error(updated.error);
      setConversations((prev) => {
        const u = { ...prev };
        Object.keys(u).forEach((id) => {
          u[id] = u[id].map((m) =>
            m.id === messageId ? { ...m, text: updated.text, edited: true } : m
          );
        });
        return u;
      });
      socket.emit("edit message", {
        id: updated.id,
        text: updated.text,
        senderId: updated.senderId,
        receiverId: updated.receiverId,
      });
    } catch (err) {
      toast.error("Failed to edit: " + err.message);
    }
  };
  const confirmDelete = async () => {
    if (!pendingDeleteMessage) return;
    const msg = pendingDeleteMessage;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_BASE}/api/messages/${msg.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete");
      setConversations((prev) => {
        const u = { ...prev };
        Object.keys(u).forEach((id) => {
          u[id] = u[id].filter((m) => m.id !== msg.id);
        });
        return u;
      });
      socket.emit("delete message", {
        id: msg.id,
        senderId: msg.senderId,
        receiverId: msg.receiverId,
      });
    } catch (err) {
      toast.error("Failed to delete: " + err.message);
    } finally {
      setPendingDeleteMessage(null);
    }
  };

  const emitProfileUpdate = (updates) =>
    socket.emit("profile updated", { userId: currentUser.userId, ...updates });

  const handleAvatarUpload = (url) => {
    setCurrentUser((prev) => ({ ...prev, avatar: url }));
    emitProfileUpdate({ avatar: url });
  };

  const handleBioUpdate = (newBio) => {
    setCurrentUser((prev) => ({ ...prev, bio: newBio }));
    emitProfileUpdate({ bio: newBio });
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("username");
    setTimeout(() => window.location.reload(), 800);
  };

  const openProfile = (userId) => {
    setProfileUserId(userId);
    setProfileModalOpen(true);
  };

  // ── Render ──────────────────────────────────────────────────

  if (initialLoading) {
    return (
      <div className="app-loading">
        <div className="app-loading-logo">
          <img src="/icon.jpg" alt="Chit Chat" className="app-loading-img" />
        </div>
        <div className="app-loading-dots">
          <span />
          <span />
          <span />
        </div>
      </div>
    );
  }
  if (!currentUser) return <Auth onLogin={setCurrentUser} />;

  const currentMessages = conversations[selectedContactId] || [];
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: "transparent", boxShadow: "none", padding: 0 },
        }}
      />

      <div className="app-shell">
        <Sidebar
          contacts={sortedContacts}
          selectedContactId={selectedContactId}
          onSelectContact={handleSelectContact}
          onAddContact={handleAddContact}
          ownId={currentUser.id}
          subTexts={subTexts}
          unreadCounts={unreadCounts}
          currentUserAvatar={currentUser.avatar}
          onAvatarClick={() => setAvatarModalOpen(true)}
          onViewProfile={() => openProfile(currentUser.userId)}
          onLogout={handleLogout}
          ownName={currentUser.username}
          onDiscoverClick={() => setDiscoverModalOpen(true)}
          mobileHidden={!!selectedContactId}
                  contactsLoading={initialLoading}

        />

        <div
          className={`chat-wrapper ${
            selectedContactId ? "mobile-visible" : ""
          }`}
        >
          <ChatArea
            messages={currentMessages}
            contactName={
              selectedContactId
                ? contacts.find((c) => c._id === selectedContactId)?.username ||
                  selectedContactId
                : ""
            }
            contactStatus={userPresence[selectedContactId] || "online"}
            currentUserId={currentUser.userId}
            editingMessage={editingMessage}
            onUpdateMessage={handleUpdateMessage}
            onEditMessage={setEditingMessage}
            onDeleteMessage={(msg) => {
              setPendingDeleteMessage(msg);
              setConfirmModalOpen(true);
            }}
            contactAvatar={contactAvatar}
            onNameClick={() => openProfile(selectedContactId)}
            onOpenProfile={() => openProfile(selectedContactId)}
            onLogout={handleLogout}
            onBack={() => setSelectedContactId(null)}
            isTyping={typingContacts[selectedContactId]}
          />
          {selectedContactId && (
            <MessageInput
              value={inputText}
              onChange={setInputText}
              onSend={handleSendMessage}
              disabled={isUpdatesChannel(selectedContactId)}
            />
          )}
        </div>
        <AvatarUploadModal
          isOpen={avatarModalOpen}
          onClose={() => setAvatarModalOpen(false)}
          currentAvatar={currentUser.avatar}
          onUpload={handleAvatarUpload}
        />

        <ProfileModal
          isOpen={profileModalOpen}
          onClose={() => setProfileModalOpen(false)}
          userId={profileUserId}
          currentUserId={currentUser.userId}
          onAvatarClick={() => {
            setProfileModalOpen(false);
            setAvatarModalOpen(true);
          }}
          onBioUpdate={handleBioUpdate}
        />

        <ConfirmModal
          isOpen={confirmModalOpen}
          onClose={() => {
            setConfirmModalOpen(false);
            setPendingDeleteMessage(null);
          }}
          onConfirm={confirmDelete}
          title="Delete Message"
          message="Are you sure you want to delete this message? This action cannot be undone."
          confirmText="Delete"
        />

        <DiscoverModal
          isOpen={discoverModalOpen}
          onClose={() => setDiscoverModalOpen(false)}
          onAddContact={handleAddContact}
        />
      </div>
    </>
  );
}

export default App;
