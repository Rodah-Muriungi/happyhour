// src/Posts.js - SIMPLIFIED FIXED VERSION
import React, { useState, useEffect } from "react";
import PostCard from "./PostCard";
import { db } from "./firebase";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";

function Posts({ user, profile }) {
  const [postText, setPostText] = useState("");
  const [posts, setPosts] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const postsCollection = collection(db, "posts");
    const q = query(postsCollection, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPosts(postsList);
    });

    return () => unsubscribe();
  }, []);

  const handlePost = async (e) => {
    e.preventDefault();

    if (!postText.trim()) {
      alert("Please type something before sending!");
      return;
    }

    const textToSend = postText.trim();

    try {
      setIsSubmitting(true);
      setPostText(""); // Clear immediately

      const postsCollection = collection(db, "posts");
      const postData = {
        text: textToSend,
        userId: user?.uid || "unknown",
        username: profile?.username || "Anonymous",
        createdAt: serverTimestamp(),
        timestamp: new Date().toISOString(),
        likes: [],
        replies: [],
      };

      await addDoc(postsCollection, postData);
      console.log("Post sent");
    } catch (err) {
      console.error("Error:", err);
      alert("Failed to send");
      setPostText(textToSend); // Restore on error
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-happy-bg/60 backdrop-blur-md p-6 rounded-2xl border border-happy-pulse/20 shadow-xl">
      <form onSubmit={handlePost} className="mb-8">
        <div className="relative">
          <input
            type="text"
            placeholder="What's pulsing through your mind?"
            value={postText}
            onChange={(e) => setPostText(e.target.value)}
            className="w-full p-4 pl-6 pr-32 bg-gray-900/70 border-2 border-happy-pulse/40 rounded-2xl text-white placeholder-gray-400"
          />

          <button
            type="submit"
            disabled={!postText.trim() || isSubmitting}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 px-6 py-2.5 rounded-full font-semibold bg-gradient-to-r from-happy-pulse to-happy-purple text-white disabled:bg-gray-800 disabled:text-gray-400"
          >
            {isSubmitting ? "Pulsing..." : "Pulse It"}
          </button>
        </div>
      </form>

      <div className="flex items-center mb-6">
        <h2 className="text-2xl font-bold text-white mr-4">
          📬 Activity Pulse
        </h2>
        <div className="flex-1 h-1 bg-gradient-to-r from-happy-pulse via-happy-teal to-transparent rounded-full"></div>
        <span className="ml-4 px-3 py-1 bg-happy-pulse/20 text-happy-teal rounded-full text-sm">
          {posts.length} pulse{posts.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="space-y-4">
        {posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No pulses yet</p>
          </div>
        ) : (
          posts
            .filter((post) => post && post.id && post.text)
            .map((post) => <PostCard key={post.id} post={post} />)
        )}
      </div>
    </div>
  );
}

export default Posts;
