// src/useOnlineStatus.js - Custom hook for online status
import { useEffect } from "react";
import { doc, updateDoc, onSnapshot, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

export const useOnlineStatus = (userId) => {
  useEffect(() => {
    if (!userId) return;

    // Set user as online when component mounts
    const userRef = doc(db, "users", userId);
    
    const updateOnlineStatus = async () => {
      try {
        await updateDoc(userRef, {
          isOnline: true,
          lastSeen: serverTimestamp(),
          lastActive: new Date().toISOString()
        });
      } catch (error) {
        console.error("Error updating online status:", error);
      }
    };

    updateOnlineStatus();

    // Set up real-time listener for this user
    const unsubscribe = onSnapshot(userRef, (doc) => {
      // Keep connection alive
    });

    // Set user as offline when component unmounts
    const handleBeforeUnload = async () => {
      try {
        await updateDoc(userRef, {
          isOnline: false,
          lastSeen: serverTimestamp()
        });
      } catch (error) {
        console.error("Error setting offline status:", error);
      }
    };

    // Cleanup on unmount
    return () => {
      handleBeforeUnload();
      unsubscribe();
    };
  }, [userId]);
};

// Function to manually set offline status
export const setOffline = async (userId) => {
  if (!userId) return;
  
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      isOnline: false,
      lastSeen: serverTimestamp()
    });
  } catch (error) {
    console.error("Error setting offline:", error);
  }
};