// src/Avatar.js
import React from "react";

function Avatar({ username, photoURL, gender, size = 80, className = "" }) {
  const firstLetter = username?.charAt(0).toUpperCase();

  // HappyHour color scheme
  const bgColor =
    gender === "female"
      ? "bg-gradient-to-br from-pink-500 to-happy-pulse"
      : gender === "male"
      ? "bg-gradient-to-br from-blue-500 to-happy-teal"
      : "bg-gradient-to-br from-purple-500 to-happy-purple";

  if (photoURL) {
    return (
      <div className={`relative ${className}`}>
        <img
          src={photoURL}
          alt="avatar"
          style={{ width: size, height: size }}
          className="rounded-full object-cover border-2 border-white/20 shadow-lg"
        />
        {/* Online indicator */}
        <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-happy-dark"></div>
      </div>
    );
  }

  return (
    <div
      style={{ width: size, height: size }}
      className={`${bgColor} rounded-full flex items-center justify-center text-white font-bold border-2 border-white/20 shadow-lg ${className}`}
    >
      <span style={{ fontSize: size / 2.5 }} className="drop-shadow-md">
        {firstLetter}
      </span>
    </div>
  );
}

export default Avatar;
