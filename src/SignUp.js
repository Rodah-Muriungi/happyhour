// src/SignUp.js - WITHOUT react-router-dom
import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "./firebase";

function SignUp({ onSignUpSuccess }) { // Add this prop
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    username: "",
    confirmPassword: "",
    gender: ""
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    // Validation
    if (!formData.username.trim()) {
      setError("Username is required");
      setLoading(false);
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match");
      setLoading(false);
      return;
    }
    
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    try {
      // 1️⃣ Create auth user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      const user = userCredential.user;

      // 2️⃣ Create Firestore profile with HappyHour theme
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        username: formData.username.trim(),
        gender: formData.gender || "prefer-not-to-say",
        isOnline: true,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        avatarColor: formData.gender === "female" ? "pink" : 
                    formData.gender === "male" ? "blue" : "purple"
      });

      setSuccess("✨ Welcome to HappyHour! Your pulse journey begins...");
      
      // Clear form
      setFormData({
        email: "",
        password: "",
        username: "",
        confirmPassword: "",
        gender: ""
      });

      // Call parent function to handle navigation
      if (onSignUpSuccess) {
        onSignUpSuccess(user);
      }

    } catch (err) {
      console.error("Signup error:", err);
      let errorMessage = "Signup failed. ";
      
      if (err.code === 'auth/email-already-in-use') {
        errorMessage = "Email already registered. Try logging in!";
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = "Invalid email format";
      } else if (err.code === 'auth/weak-password') {
        errorMessage = "Password is too weak. Use at least 6 characters";
      } else {
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
        {/* Background pulse effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="absolute h-0.5 bg-gradient-to-r from-transparent via-happy-pulse/20 to-transparent animate-pulse-slow"
              style={{
                top: `${20 + i * 15}%`,
                width: "100%",
                animationDelay: `${i * 0.5}s`,
              }}
            />
          ))}
        </div>

        <div className="relative bg-happy-bg/80 backdrop-blur-lg rounded-2xl p-8 border border-happy-pulse/30 shadow-2xl">
          {/* Logo/Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-happy-pulse to-happy-purple rounded-full mb-4 animate-pulse">
              <span className="text-2xl font-bold text-white">✨</span>
            </div>
            <h1 className="text-3xl font-bold text-white">
              Join <span className="text-gradient">HappyHour</span>
            </h1>
            <p className="text-gray-400 mt-2">Start your pulse journey</p>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="mb-6 p-4 bg-red-900/50 border border-red-500 rounded-lg">
              <div className="flex items-center">
                <span className="text-xl mr-3">⚠️</span>
                <p className="text-red-200">{error}</p>
              </div>
            </div>
          )}
          
          {success && (
            <div className="mb-6 p-4 bg-green-900/50 border border-green-500 rounded-lg">
              <div className="flex items-center">
                <span className="text-xl mr-3">🎉</span>
                <p className="text-green-200">{success}</p>
              </div>
            </div>
          )}

          {/* Signup Form */}
          <form onSubmit={handleSignUp} className="space-y-6">
            {/* Username */}
            <div>
              <label className="block text-gray-300 mb-2">
                Username <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                placeholder="Choose a cool username"
                className="w-full p-3 bg-gray-900/70 border border-happy-pulse/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-happy-pulse focus:ring-2 focus:ring-happy-pulse/50"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-gray-300 mb-2">
                Email <span className="text-red-400">*</span>
              </label>
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
              <label className="block text-gray-300 mb-2">
                Password <span className="text-red-400">*</span>
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="At least 6 characters"
                className="w-full p-3 bg-gray-900/70 border border-happy-pulse/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-happy-pulse focus:ring-2 focus:ring-happy-pulse/50"
              />
              <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-gray-300 mb-2">
                Confirm Password <span className="text-red-400">*</span>
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="Repeat your password"
                className="w-full p-3 bg-gray-900/70 border border-happy-pulse/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-happy-pulse focus:ring-2 focus:ring-happy-pulse/50"
              />
            </div>

            {/* Gender (Optional) */}
            <div>
              <label className="block text-gray-300 mb-2">Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full p-3 bg-gray-900/70 border border-happy-pulse/30 rounded-xl text-white focus:outline-none focus:border-happy-pulse focus:ring-2 focus:ring-happy-pulse/50"
              >
                <option value="">Prefer not to say</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="non-binary">Non-binary</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Terms */}
            <div className="flex items-start">
              <input
                type="checkbox"
                id="terms"
                required
                className="h-5 w-5 text-happy-pulse bg-gray-900 border-happy-pulse/50 rounded focus:ring-happy-pulse mt-1"
              />
              <label htmlFor="terms" className="ml-2 text-gray-400 text-sm">
                I agree to the <span className="text-happy-teal cursor-pointer">Terms of Service</span> and <span className="text-happy-teal cursor-pointer">Privacy Policy</span>
              </label>
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
                  Creating your pulse...
                </div>
              ) : (
                "✨ Start Pulsing"
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-8 text-center">
            <p className="text-gray-400">
              Already have a pulse?{" "}
              <button 
                onClick={() => {
                  // Manually trigger login page via parent component
                  if (window.parent && window.parent.switchToLogin) {
                    window.parent.switchToLogin();
                  } else {
                    alert("Click the Login button in the main app");
                  }
                }}
                className="text-happy-teal hover:text-happy-pulse font-medium transition-colors"
              >
                Login here
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignUp;