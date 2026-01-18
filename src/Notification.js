// src/Notifications.js
import React, { useState, useEffect } from "react";
import { collection, query, where, onSnapshot, orderBy, updateDoc, doc } from "firebase/firestore";
import { db, auth } from "./firebase";

function Notifications({ currentUser }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);

  // Load notifications
  useEffect(() => {
    if (!currentUser?.uid) return;

    console.log("Setting up notifications listener for user:", currentUser.uid);
    
    const notificationsRef = collection(db, "notifications");
    const q = query(
      notificationsRef,
      where("userId", "==", currentUser.uid),
      orderBy("createdAt", "desc"),
      orderBy("read", "asc") // Show unread first
    );

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        console.log("Notifications snapshot received:", snapshot.docs.length, "notifications");
        
        const notifs = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        
        console.log("Processed notifications:", notifs);
        setNotifications(notifs);
        
        const unread = notifs.filter(n => !n.read).length;
        setUnreadCount(unread);
        console.log("Unread count:", unread);
        
        // Update browser tab title
        if (unread > 0) {
          document.title = `(${unread}) HappyHour`;
        } else {
          document.title = "HappyHour";
        }
      },
      (error) => {
        console.error("Notifications error:", error);
      }
    );

    return () => {
      console.log("Cleaning up notifications listener");
      unsubscribe();
    };
  }, [currentUser?.uid]);

  // Mark single notification as read
  const markAsRead = async (notificationId) => {
    try {
      console.log("Marking notification as read:", notificationId);
      const notifRef = doc(db, "notifications", notificationId);
      await updateDoc(notifRef, { 
        read: true,
        readAt: new Date().toISOString()
      });
    } catch (err) {
      console.error("Error marking as read:", err);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      console.log("Marking all notifications as read");
      const unreadNotifications = notifications.filter(n => !n.read);
      
      await Promise.all(
        unreadNotifications.map(notif =>
          updateDoc(doc(db, "notifications", notif.id), { 
            read: true,
            readAt: new Date().toISOString()
          })
        )
      );
      
      alert("All notifications marked as read!");
    } catch (err) {
      console.error("Error marking all as read:", err);
      alert("Error: " + err.message);
    }
  };

  // Clear all notifications
  const clearAllNotifications = async () => {
    if (!window.confirm("Clear all notifications?")) return;
    
    try {
      // You'd need a cloud function to delete multiple documents
      alert("This feature requires a Cloud Function setup.");
    } catch (err) {
      console.error("Error clearing notifications:", err);
    }
  };

  // Get notification icon
  const getNotificationIcon = (type) => {
    switch(type) {
      case 'like': return '❤️';
      case 'reply': return '💬';
      case 'mention': return '@';
      case 'follow': return '👥';
      case 'welcome': return '✨';
      case 'system': return '⚙️';
      default: return '🔔';
    }
  };

  // Format time
  const formatTime = (timestamp) => {
    if (!timestamp) return "Just now";
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      
      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
      return `${Math.floor(diffMins / 1440)}d ago`;
    } catch {
      return "Recently";
    }
  };

  if (!currentUser) return null;

  return (
    <div className="relative">
      {/* Notification Bell Button */}
      <button 
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 rounded-full hover:bg-gray-800/50 transition-colors"
      >
        <span className="text-2xl">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse border-2 border-happy-dark">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Dropdown */}
      {showDropdown && (
        <>
          {/* Click outside to close */}
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setShowDropdown(false)}
          />
          
          <div className="absolute right-0 mt-2 w-96 bg-happy-bg/95 backdrop-blur-lg border border-happy-pulse/30 rounded-2xl shadow-2xl z-50">
            {/* Header */}
            <div className="p-4 border-b border-gray-800">
              <div className="flex justify-between items-center">
                <h3 className="text-white font-bold text-lg">Notifications</h3>
                <div className="flex space-x-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-sm text-happy-teal hover:text-happy-pulse px-3 py-1 rounded-full bg-happy-teal/10 hover:bg-happy-teal/20 transition-colors"
                    >
                      Mark all read
                    </button>
                  )}
                  <button
                    onClick={() => setShowDropdown(false)}
                    className="text-gray-400 hover:text-white p-1"
                  >
                    ✕
                  </button>
                </div>
              </div>
              <p className="text-gray-400 text-sm mt-1">
                {unreadCount} unread • {notifications.length} total
              </p>
            </div>
            
            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="text-5xl mb-4 opacity-30">🔔</div>
                  <p className="text-gray-400">No notifications yet</p>
                  <p className="text-gray-500 text-sm mt-2">Your notifications will appear here</p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-4 border-b border-gray-800/50 hover:bg-gray-900/50 cursor-pointer transition-colors ${
                      !notif.read ? 'bg-blue-900/10' : ''
                    }`}
                    onClick={() => {
                      markAsRead(notif.id);
                      // You can add navigation logic here
                    }}
                  >
                    <div className="flex items-start">
                      {/* Icon */}
                      <div className={`mr-3 text-2xl p-2 rounded-full ${
                        !notif.read 
                          ? 'bg-happy-pulse/20 text-happy-pulse' 
                          : 'bg-gray-800 text-gray-400'
                      }`}>
                        {getNotificationIcon(notif.type)}
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm break-words">
                          {notif.message}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            notif.type === 'like' ? 'bg-pink-900/30 text-pink-400' :
                            notif.type === 'reply' ? 'bg-teal-900/30 text-teal-400' :
                            notif.type === 'follow' ? 'bg-purple-900/30 text-purple-400' :
                            'bg-gray-800 text-gray-400'
                          }`}>
                            {notif.type}
                          </span>
                          <p className="text-gray-500 text-xs">
                            {formatTime(notif.createdAt)}
                          </p>
                        </div>
                      </div>
                      
                      {/* Unread indicator */}
                      {!notif.read && (
                        <div className="ml-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
            
            {/* Footer */}
            <div className="p-3 border-t border-gray-800">
              <div className="flex justify-between text-sm text-gray-400">
                <button
                  onClick={clearAllNotifications}
                  className="hover:text-white transition-colors"
                >
                  Clear all
                </button>
                <button
                  onClick={() => {
                    // Could link to full notifications page
                    setShowDropdown(false);
                  }}
                  className="text-happy-teal hover:text-happy-pulse transition-colors"
                >
                  View all notifications
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Notifications;