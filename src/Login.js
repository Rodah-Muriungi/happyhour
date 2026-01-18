// src/Login.js - WITHOUT react-router-dom
import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase";

function Login({ onLoginSuccess }) { // Add this prop
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 1️⃣ Sign in with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      const user = userCredential.user;
      console.log("User logged in:", user.uid);

      // 2️⃣ Update user's online status in Firestore
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        // Update existing user
        await updateDoc(userRef, {
          isOnline: true,
          lastLogin: new Date().toISOString()
        });
      } else {
        // Create basic profile if doesn't exist
        await updateDoc(userRef, {
          uid: user.uid,
          email: user.email,
          username: user.email?.split('@')[0] || "User",
          isOnline: true,
          lastLogin: new Date().toISOString(),
          createdAt: new Date().toISOString()
        }, { merge: true });
      }

      console.log("✅ Online status updated");

      // 3️⃣ Notify parent component
      if (onLoginSuccess) {
        onLoginSuccess(user);
      }
      
    } catch (err) {
      console.error("Login error:", err);
      let errorMessage = "Login failed. ";
      
      switch (err.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          errorMessage = "Invalid email or password";
          break;
        case 'auth/too-many-requests':
          errorMessage = "Too many attempts. Try again later.";
          break;
        case 'auth/user-disabled':
          errorMessage = "Account disabled. Contact support.";
          break;
        case 'auth/invalid-email':
          errorMessage = "Invalid email format";
          break;
        default:
          errorMessage += err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-purple-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Background pulse lines */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="absolute h-0.5 bg-gradient-to-r from-transparent via-happy-pulse/20 to-transparent animate-pulse-slow"
              style={{
                top: `${40 + i * 10}%`,
                width: "100%",
                animationDelay: `${i * 0.3}s`,
              }}
            />
          ))}
        </div>

        <div className="relative bg-happy-bg/80 backdrop-blur-lg rounded-2xl p-8 border border-happy-pulse/30 shadow-2xl">
          {/* Logo/Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-happy-pulse to-happy-purple rounded-full mb-4 animate-heartbeat">
              <span className="text-2xl font-bold text-white">💓</span>
            </div>
            <h1 className="text-3xl font-bold text-white">
              Welcome to <span className="text-gradient">HappyHour</span>
            </h1>
            <p className="text-gray-400 mt-2">Sync your pulse with others</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-900/50 border border-red-500 rounded-lg">
              <div className="flex items-center">
                <span className="text-xl mr-2">⚠️</span>
                <p className="text-red-200">{error}</p>
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-gray-300 mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="your@email.com"
                className="w-full p-3 bg-gray-900/70 border border-happy-pulse/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-happy-pulse focus:ring-2 focus:ring-happy-pulse/50"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-gray-300 mb-2">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Enter your password"
                className="w-full p-3 bg-gray-900/70 border border-happy-pulse/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-happy-pulse focus:ring-2 focus:ring-happy-pulse/50"
              />
            </div>

            {/* Remember me & Forgot password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="remember"
                  className="h-4 w-4 text-happy-pulse bg-gray-900 border-happy-pulse/50 rounded focus:ring-happy-pulse"
                />
                <label htmlFor="remember" className="ml-2 text-gray-400 text-sm">
                  Remember me
                </label>
              </div>
              <button
                type="button"
                className="text-sm text-happy-teal hover:text-happy-pulse transition-colors"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 ${
                loading
                  ? "bg-gray-800 text-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-happy-pulse to-happy-purple text-white hover:shadow-lg hover:scale-[1.02] active:scale-100"
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                  Syncing pulse...
                </div>
              ) : (
                "✨ Sync Pulse"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-8 flex items-center">
            <div className="flex-1 h-px bg-gray-700"></div>
            <span className="px-4 text-gray-500 text-sm">OR</span>
            <div className="flex-1 h-px bg-gray-700"></div>
          </div>

          {/* Signup Link */}
          <div className="text-center">
            <p className="text-gray-400">
              New to HappyHour?{" "}
              <button 
                onClick={() => {
                  if (window.parent && window.parent.switchToSignup) {
                    window.parent.switchToSignup();
                  } else {
                    alert("Click the Sign Up button in the main app");
                  }
                }}
                className="text-happy-teal hover:text-happy-pulse font-medium transition-colors"
              >
                Create an account
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;