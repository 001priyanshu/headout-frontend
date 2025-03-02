"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { fetchUserById } from "../api/user";
import { motion } from "framer-motion";

export default function FriendPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Component />
    </Suspense>
  );
}



const Component = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const toId = searchParams.get("toId");
  const fromScore = searchParams.get("fromScore");
  const sharedFriend = searchParams.get("userName");

  const [friendName, setFriendName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!toId || !sharedFriend) {
      setError("Invalid invite link!");
      setTimeout(() => {
        router.push("/");
      }, 2000);
      return;
    }

    // Clear LocalStorage before adding new user data
    localStorage.clear();

    async function fetchUser() {
      try {
        setIsLoading(true);
        if (!toId) {
          setError("Invalid user ID!");
          setTimeout(() => {
            router.push("/");
          }, 2000);
          return;
        }

        const data = await fetchUserById(toId);
        if (!data || !data.user) {
          alert("No user found! Redirecting to home page.");
          router.push("/"); // Redirect to home page
          return;
        }
        const user = data.user;
        console.log(user, 'user');

        // Store user details in LocalStorage
        localStorage.setItem("userId", user._id);
        localStorage.setItem("userName", user.userName);
        setFriendName(user.userName);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching user:", error);
        setError("Something went wrong!");
        setTimeout(() => {
          router.push("/");
        }, 2000);
      }
    }

    fetchUser();
  }, [toId, sharedFriend, router]);

  function handleStartGame() {
    router.push("/play");
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-red-50 to-red-100 p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center"
        >
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-red-700 mb-2">Oops!</h2>
          <p className="text-lg text-gray-700 mb-6">{error} Redirecting...</p>
          <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 2 }}
              className="bg-red-500 h-full"
            />
          </div>
        </motion.div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-blue-100 p-6">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="flex justify-center mb-6">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
          <h2 className="text-xl font-medium text-gray-700">Loading your game...</h2>
          <p className="text-gray-500 mt-2">This will just take a moment</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-blue-100 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-block p-4 bg-blue-100 rounded-full text-blue-600 text-3xl mb-4"
          >
            🏆
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Challenge from {sharedFriend}</h2>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-6"
          >
            <div className="text-sm text-blue-600 uppercase font-semibold tracking-wider mb-1">
              Friend&apos;s Score
            </div>
            <div className="text-4xl font-bold text-blue-700">
              {fromScore} <span className="text-xl">points</span>
            </div>
            <div className="text-blue-600 mt-2">Can you beat it?</div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="space-y-4"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-lg transition-colors flex items-center justify-center"
            onClick={handleStartGame}
          >
            <span className="mr-2">🎮</span> Accept Challenge
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-3 px-6 rounded-lg transition-colors"
            onClick={() => router.push("/")}
          >
            No Thanks
          </motion.button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="mt-8 text-center text-gray-500 text-sm"
        >
          Playing as <span className="font-medium text-blue-600">{friendName}</span>
        </motion.div>
      </motion.div>
    </div>
  );
}