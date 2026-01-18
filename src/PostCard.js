// src/PostCard.js - FIXED VERSION (NO RELOAD)
import React, { useState } from "react";
import Avatar from "./Avatar";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "./firebase";
import { auth } from "./firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

function PostCard({ post, onUpdate }) {
  // Add onUpdate prop
  // ========== HOOKS MUST COME FIRST ==========
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replying, setReplying] = useState(false);
  const [showReplies, setShowReplies] = useState(false);

  const currentUser = auth.currentUser;
  // ===========================================

  // ========== SAFETY CHECK AFTER HOOKS ==========
  if (!post) {
    console.warn("PostCard received undefined post");
    return null;
  }
  // ==============================================

  // ========== NOTIFICATION FUNCTION ==========
  const createNotification = async (type, targetUserId, data) => {
    try {
      if (!currentUser || currentUser.uid === targetUserId) return;

      const notificationsRef = collection(db, "notifications");

      let message = "";
      switch (type) {
        case "like":
          message = `${currentUser.displayName || currentUser.email?.split("@")[0]} liked your post`;
          break;
        case "reply":
          message = `${currentUser.displayName || currentUser.email?.split("@")[0]} replied to your post`;
          break;
        default:
          message = "You have a new notification";
      }

      await addDoc(notificationsRef, {
        userId: targetUserId,
        type: type,
        message: message,
        read: false,
        createdAt: serverTimestamp(),
        fromUserId: currentUser.uid,
        postId: post.id,
      });
    } catch (err) {
      console.error("Error creating notification:", err);
    }
  };
  // ===========================================

  // ========== FORMAT TIME FUNCTION ==========
  const formatTime = (timestamp) => {
    if (!timestamp) return "Just now";
    try {
      const date = timestamp.toDate();
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Recently";
    }
  };
  // ==========================================

  // ========== HANDLE LIKE FUNCTION ==========
  const handleLike = async () => {
    if (!currentUser) {
      alert("Please login to like posts!");
      return;
    }

    try {
      const postRef = doc(db, "posts", post.id);
      const likes = post.likes || [];

      if (likes.includes(currentUser.uid)) {
        // Unlike
        await updateDoc(postRef, {
          likes: likes.filter((id) => id !== currentUser.uid),
        });
        console.log("👍 Unliked post");
      } else {
        // Like
        await updateDoc(postRef, {
          likes: arrayUnion(currentUser.uid),
        });
        console.log("❤️ Liked post");

        // Create notification for post owner
        if (post.userId && post.userId !== currentUser.uid) {
          await createNotification("like", post.userId, {});
        }
      }

      // Call parent to refresh data
      if (onUpdate) {
        onUpdate();
      }
    } catch (err) {
      console.error("❌ Error liking post:", err);
    }
  };
  // ==========================================

  // ========== HANDLE REPLY FUNCTION ==========
  const handleReply = async () => {
    if (!replyText.trim() || !currentUser) {
      alert("Please type a reply and make sure you're logged in!");
      return;
    }

    try {
      setReplying(true);
      const postRef = doc(db, "posts", post.id);

      const replyData = {
        id: Date.now().toString(),
        text: replyText.trim(),
        userId: currentUser.uid,
        username:
          currentUser.displayName ||
          currentUser.email?.split("@")[0] ||
          "Anonymous",
        createdAt: new Date().toISOString(),
      };

      await updateDoc(postRef, {
        replies: arrayUnion(replyData),
      });

      console.log("✅ Reply added!");

      // Create notification for post owner
      if (post.userId && post.userId !== currentUser.uid) {
        await createNotification("reply", post.userId, {});
      }

      setReplyText("");
      setShowReplyBox(false);
      setShowReplies(true);

      // Call parent to refresh data
      if (onUpdate) {
        onUpdate();
      }
    } catch (err) {
      console.error("❌ Error adding reply:", err);
      alert("Failed to post reply: " + err.message);
    } finally {
      setReplying(false);
    }
  };
  // ==========================================

  // ========== HANDLE RESONATE FUNCTION ==========
  const handleResonate = () => {
    if (!currentUser) {
      alert("Please login to share posts!");
      return;
    }

    navigator.clipboard
      .writeText(post.text)
      .then(() => alert("Post copied to clipboard! Share it with friends."))
      .catch((err) => console.error("Copy failed:", err));
  };
  // ==============================================

  const likes = post.likes || [];
  const replies = post.replies || [];
  const hasLiked = currentUser && likes.includes(currentUser.uid);

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-5 border-l-4 border-happy-pulse hover:border-happy-teal transition-all duration-300 group hover:bg-gray-900/70">
      <div className="flex items-start space-x-4">
        {/* User Avatar */}
        <div className="flex-shrink-0">
          <Avatar
            username={post.username}
            gender={post.userGender}
            photoURL={post.userPhoto}
            size={50}
          />
        </div>

        {/* Post Content */}
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold text-white group-hover:text-happy-teal transition-colors">
                {post.username}
              </h3>
              <p className="text-gray-400 text-sm">
                {formatTime(post.createdAt)}
              </p>
            </div>
            {/* Pulse indicator */}
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-happy-pulse rounded-full animate-pulse"></div>
              <span className="text-xs text-gray-500">Live</span>
            </div>
          </div>

          {/* Post Text */}
          <p className="mt-3 text-gray-200 text-lg leading-relaxed">
            {post.text}
          </p>

          {/* Stats */}
          <div className="mt-3 flex items-center space-x-4 text-sm text-gray-400">
            <span className="flex items-center">
              ❤️ <span className="ml-1">{likes.length}</span>
            </span>
            <span
              className="flex items-center cursor-pointer hover:text-happy-teal"
              onClick={() => setShowReplies(!showReplies)}
            >
              💬 <span className="ml-1">{replies.length} replies</span>
            </span>
          </div>

          {/* Interaction Bar */}
          <div className="mt-4 pt-3 border-t border-gray-800 flex space-x-4">
            {/* Like Button */}
            <button
              onClick={handleLike}
              className={`flex items-center space-x-2 transition-colors ${
                hasLiked
                  ? "text-happy-pulse"
                  : "text-gray-400 hover:text-happy-pulse"
              }`}
            >
              <span className="text-xl">{hasLiked ? "❤️" : "🤍"}</span>
              <span className="text-sm">Pulse</span>
            </button>

            {/* Reply Button */}
            <button
              onClick={() => setShowReplyBox(!showReplyBox)}
              className="flex items-center space-x-2 text-gray-400 hover:text-happy-teal transition-colors"
            >
              <span className="text-xl">💬</span>
              <span className="text-sm">Reply</span>
            </button>

            {/* Share Button */}
            <button
              onClick={handleResonate}
              className="flex items-center space-x-2 text-gray-400 hover:text-happy-purple transition-colors"
            >
              <span className="text-xl">🔄</span>
              <span className="text-sm">Resonate</span>
            </button>
          </div>

          {/* Reply Input Box */}
          {showReplyBox && (
            <div className="mt-4 p-3 bg-gray-800/50 rounded-lg">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type your reply..."
                rows="2"
                className="w-full p-3 bg-gray-900/70 border border-happy-pulse/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-happy-pulse resize-none"
              />
              <div className="flex justify-end space-x-2 mt-2">
                <button
                  onClick={() => setShowReplyBox(false)}
                  className="px-4 py-2 text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReply}
                  disabled={replying || !replyText.trim()}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    replying || !replyText.trim()
                      ? "bg-gray-800 text-gray-400"
                      : "bg-gradient-to-r from-happy-teal to-cyan-500 text-white hover:shadow-lg"
                  }`}
                >
                  {replying ? "Posting..." : "Post Reply"}
                </button>
              </div>
            </div>
          )}

          {/* Replies Section */}
          {showReplies && replies.length > 0 && (
            <div className="mt-4 space-y-3">
              <h4 className="text-gray-300 font-medium text-sm">
                💬 Replies ({replies.length})
              </h4>
              {replies.map((reply, index) => (
                <div
                  key={reply.id || index}
                  className="ml-4 pl-4 border-l-2 border-gray-700"
                >
                  <div className="bg-gray-800/30 p-3 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-6 h-6 rounded-full bg-happy-teal/20 flex items-center justify-center text-xs text-happy-teal mr-2">
                        {reply.username?.charAt(0) || "U"}
                      </div>
                      <span className="text-sm text-white font-medium">
                        {reply.username}
                      </span>
                      <span className="text-xs text-gray-500 ml-2">
                        {reply.createdAt
                          ? new Date(reply.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "Just now"}
                      </span>
                    </div>
                    <p className="mt-2 text-gray-200 text-sm">{reply.text}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom pulse line */}
      <div className="mt-4 h-0.5 bg-gradient-to-r from-transparent via-happy-pulse/10 to-transparent"></div>
    </div>
  );
}

export default PostCard;
