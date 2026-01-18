import React, { useState, useEffect } from "react";
import SignUp from "./SignUp";
import Login from "./Login";
import Profile from "./Profile";
import { auth } from "./firebase";

function App() {
  const [activeTab, setActiveTab] = useState("signup");
  const [user, setUser] = useState(null);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await auth.signOut();
    setUser(null);
    setActiveTab("login");
  };

  if (user) {
    return <Profile user={user} onLogout={handleLogout} />;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      {/* Header Tabs */}
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setActiveTab("signup")}
          className={`px-6 py-2 rounded-t-lg font-bold ${
            activeTab === "signup" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
        >
          Sign Up
        </button>
        <button
          onClick={() => setActiveTab("login")}
          className={`px-6 py-2 rounded-t-lg font-bold ${
            activeTab === "login" ? "bg-green-500 text-white" : "bg-gray-200"
          }`}
        >
          Login
        </button>
      </div>

      {/* Active Page */}
      <div className="w-full max-w-md">
        {activeTab === "signup" ? <SignUp /> : <Login />}
      </div>
    </div>
  );
}

export default App;
