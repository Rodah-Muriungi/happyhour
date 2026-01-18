// src/Profile.js
import React, { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
// import { auth } from "./firebase";
import { db } from "./firebase";
import Posts from "./Posts";
import Avatar from "./Avatar";
import OnlineUsers from "./OnlineUsers"; // Already added ✓

function Profile({ user, onLogout }) {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        setProfile(snap.data());
      }
    };

    fetchProfile();
  }, [user.uid]);

  if (!profile)
    return (
      <div className="min-h-screen bg-happy-dark flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-happy-pulse border-t-transparent rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 bg-happy-pulse rounded-full animate-ping"></div>
            </div>
          </div>
          <p className="mt-4 text-happy-teal font-medium">
            Loading your pulse...
          </p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-happy-gradient bg-happy-pattern p-4 md:p-6">
      {/* Animated pulse lines in background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="absolute h-0.5 bg-gradient-to-r from-transparent via-happy-pulse/20 to-transparent animate-pulse-slow"
            style={{
              top: `${30 + i * 20}%`,
              width: "100%",
              animationDelay: `${i * 0.7}s`,
            }}
          />
        ))}
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Profile Card */}
        <div className="bg-happy-bg/80 backdrop-blur-lg rounded-2xl p-6 md:p-8 border border-happy-pulse/30 shadow-2xl mb-8">
          <div className="flex flex-col items-center">
            <div className="relative">
              <Avatar
                username={profile.username}
                gender={profile.gender}
                photoURL={profile.photoURL}
                size={120}
              />
              {/* Pulse ring animation */}
              <div className="absolute inset-0 border-4 border-happy-pulse rounded-full animate-ping opacity-30"></div>
            </div>

            <h1 className="text-3xl font-bold mt-6 text-white bg-gradient-to-r from-happy-pulse to-happy-teal bg-clip-text text-transparent">
              Welcome, {profile.username}!
            </h1>

            <div className="relative mt-3">
              <p className="text-gray-300 text-lg">{profile.email}</p>
              {/* Pulse line under email */}
              <div className="absolute -bottom-2 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-transparent via-happy-pulse to-transparent transform -translate-x-1/4"></div>
            </div>

            <button
              onClick={onLogout}
              className="mt-8 bg-gradient-to-r from-happy-pulse to-happy-purple text-white px-8 py-3 rounded-full hover:from-happy-purple hover:to-happy-pulse mb-6 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              ✨ Logout
            </button>
          </div>
        </div>

        {/* Posts Section */}
        <div className="w-full">
          {/* ADD THIS LINE HERE */}
          <OnlineUsers currentUserId={user.uid} />
          <Posts user={user} profile={profile} />
        </div>
      </div>
    </div>
  );
}

export default Profile;
