// src/OnlineUsers.js
import React, { useState, useEffect } from "react";
import { collection, query, onSnapshot, orderBy } from "firebase/firestore";
import { db } from "./firebase";
import Avatar from "./Avatar";

function OnlineUsers({ currentUserId }) {
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("online"); // "online" or "all"

  useEffect(() => {
    // Fetch all users from Firestore
    const usersCollection = collection(db, "users");
    const q = query(usersCollection, orderBy("isOnline", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const usersList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setAllUsers(usersList);

      // Filter online users (exclude current user)
      const online = usersList.filter(
        (user) => user.id !== currentUserId && user.isOnline === true
      );
      setOnlineUsers(online);

      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUserId]);

  // Format last seen time
  const formatLastSeen = (timestamp) => {
    if (!timestamp) return "Never";

    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      const now = new Date();
      const diffMinutes = Math.floor((now - date) / (1000 * 60));

      if (diffMinutes < 1) return "Just now";
      if (diffMinutes < 60) return `${diffMinutes}m ago`;
      if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
      return `${Math.floor(diffMinutes / 1440)}d ago`;
    } catch {
      return "Recently";
    }
  };

  if (loading) {
    return (
      <div className="bg-happy-bg/60 backdrop-blur-md p-6 rounded-2xl border border-happy-pulse/20 shadow-xl">
        <div className="flex items-center justify-center py-8">
          <div className="w-8 h-8 border-2 border-happy-pulse border-t-transparent rounded-full animate-spin"></div>
          <p className="ml-3 text-gray-400">Loading users...</p>
        </div>
      </div>
    );
  }

  const displayUsers =
    activeTab === "online"
      ? onlineUsers
      : allUsers.filter((u) => u.id !== currentUserId);

  return (
    <div className="bg-happy-bg/60 backdrop-blur-md p-6 rounded-2xl border border-happy-pulse/20 shadow-xl">
      {/* Header with Tabs */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-white flex items-center">
            <span className="mr-3">👥</span>
            {activeTab === "online" ? "Live Pulse" : "Community"}
          </h2>
          <div className="px-3 py-1 bg-happy-pulse/20 text-happy-teal rounded-full text-sm font-medium">
            {activeTab === "online"
              ? `${onlineUsers.length} online`
              : `${allUsers.length - 1} total`}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 mb-6">
          <button
            onClick={() => setActiveTab("online")}
            className={`px-4 py-2 rounded-full font-medium transition-all ${
              activeTab === "online"
                ? "bg-gradient-to-r from-happy-pulse to-happy-purple text-white"
                : "bg-gray-800/50 text-gray-400 hover:text-white"
            }`}
          >
            <span className="flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
              Online ({onlineUsers.length})
            </span>
          </button>
          <button
            onClick={() => setActiveTab("all")}
            className={`px-4 py-2 rounded-full font-medium transition-all ${
              activeTab === "all"
                ? "bg-gradient-to-r from-happy-pulse to-happy-purple text-white"
                : "bg-gray-800/50 text-gray-400 hover:text-white"
            }`}
          >
            All Users ({allUsers.length - 1})
          </button>
        </div>
      </div>

      {/* Users List */}
      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
        {displayUsers.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-5xl mb-4 opacity-50">👻</div>
            <p className="text-gray-400 text-lg">
              {activeTab === "online"
                ? "No one else is online right now"
                : "No other users found"}
            </p>
            <p className="text-gray-500 mt-2">
              {activeTab === "online"
                ? "Be the pulse of the party!"
                : "Invite friends to join"}
            </p>
          </div>
        ) : (
          displayUsers.map((user) => (
            <div
              key={user.id}
              className={`flex items-center p-3 rounded-xl transition-all hover:scale-[1.02] ${
                user.isOnline
                  ? "bg-gradient-to-r from-green-900/20 to-emerald-900/10 border-l-4 border-green-500"
                  : "bg-gray-900/50 border-l-4 border-gray-600"
              }`}
            >
              <div className="relative">
                <Avatar
                  username={user.username}
                  gender={user.gender}
                  photoURL={user.photoURL}
                  size={45}
                />
                {user.isOnline && (
                  <div className="absolute -top-1 -right-1">
                    <div className="w-3 h-3 bg-green-500 rounded-full border-2 border-happy-dark"></div>
                    <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-75"></div>
                  </div>
                )}
              </div>

              <div className="ml-4 flex-1">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-white">
                    {user.username}
                    {user.id === currentUserId && " (You)"}
                  </h3>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      user.isOnline
                        ? "bg-green-900/30 text-green-400"
                        : "bg-gray-800 text-gray-400"
                    }`}
                  >
                    {user.isOnline ? "🟢 Live" : "⚫ Offline"}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <p className="text-sm text-gray-400 truncate max-w-[150px]">
                    {user.bio || "HappyHour user"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {user.isOnline
                      ? "Active now"
                      : `Last seen ${formatLastSeen(user.lastSeen)}`}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Stats Footer */}
      <div className="mt-6 pt-4 border-t border-gray-800">
        <div className="flex justify-between text-sm text-gray-400">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
            <span>{onlineUsers.length} online now</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-gray-500 rounded-full mr-2"></div>
            <span>{allUsers.length - onlineUsers.length - 1} offline</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OnlineUsers;
