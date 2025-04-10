"use client";

import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { updateFirestoreNetworkStatus } from "@/app/utils/network-utils";
import { listenerManager } from "@/app/utils/listener-manager";

export function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    async function handleOnline() {
      setIsOnline(true);
      try {
        // Enable Firestore network when we go online
        await updateFirestoreNetworkStatus(true);
        toast({
          title: "Connection Restored",
          description: "You are now back online.",
          variant: "default",
        });

        // Refresh the page to reset all listeners
        window.location.reload();
      } catch (error) {
        console.error("Error handling online status:", error);
      }
    }

    async function handleOffline() {
      setIsOnline(false);
      try {
        // Disable Firestore network when we go offline
        await updateFirestoreNetworkStatus(false);
        toast({
          title: "Connection Lost",
          description:
            "You are currently offline. Some features may be limited.",
          variant: "destructive",
          duration: 5000,
        });
      } catch (error) {
        console.error("Error handling offline status:", error);
      }
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Initial check and setup
    const initialOnline = navigator.onLine;
    setIsOnline(initialOnline);

    // Set initial Firestore network status
    updateFirestoreNetworkStatus(initialOnline).catch((error) => {
      console.error("Error setting initial network status:", error);
    });

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Only render something when offline
  if (isOnline) return null;

  const handleClearListeners = () => {
    try {
      // Clear all Firestore listeners
      listenerManager.unregisterAll();
      toast({
        title: "Listeners Cleared",
        description: "All Firestore listeners have been cleared.",
        variant: "default",
      });

      // Refresh the page after a short delay
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      console.error("Error clearing listeners:", error);
      toast({
        title: "Error",
        description:
          "Failed to clear listeners. Please refresh the page manually.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="fixed z-50 px-4 py-3 text-yellow-700 bg-yellow-100 border border-yellow-400 rounded-md shadow-lg bottom-4 right-4">
      <p className="font-medium">You&apos;re offline</p>
      <p className="text-sm">
        Working in offline mode. Some features may be limited until connection
        is restored.
      </p>
      <p className="text-xs mt-1 text-yellow-600">
        Firebase is using cached data. New changes will sync when you&apos;re
        back online.
      </p>
      <div className="flex space-x-2 mt-2">
        <button
          onClick={() => window.location.reload()}
          className="px-3 py-1 text-xs bg-yellow-200 hover:bg-yellow-300 text-yellow-800 rounded-md transition-colors"
        >
          Refresh Page
        </button>
        <button
          onClick={handleClearListeners}
          className="px-3 py-1 text-xs bg-red-200 hover:bg-red-300 text-red-800 rounded-md transition-colors"
        >
          Clear Listeners
        </button>
      </div>
    </div>
  );
}
