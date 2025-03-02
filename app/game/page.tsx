"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

export default function GamePage() {
  return <Suspense fallback={<div>Loading...</div>}>
     <Component />
  </Suspense>
}

const Component = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  // const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let storedUserId = localStorage.getItem("userId");
    const storedUserName = localStorage.getItem("userName");
    const queryUserId = searchParams.get("userId");

    if (!storedUserId && queryUserId) {
      localStorage.setItem("userId", queryUserId);
      storedUserId = queryUserId;
    }

    if (!storedUserId) {
      router.push("/");
      return;
    }
    
    setUserName(storedUserName || storedUserId);
    // setUserId(storedUserId);
    
    // Simulate brief loading for smoother transition
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, [searchParams, router]);

  const handleStartPlaying = () => {
    // Add a slight animation effect before navigation
    const element = document.getElementById("game-container");
    if (element) {
      element.classList.add("scale-95", "opacity-80");
      setTimeout(() => {
        router.push("/play");
      }, 200);
    } else {
      router.push("/play");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-blue-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-xl text-blue-800 font-medium">Preparing your adventure...</p>
        </div>
      </div>
    );
  }

  return (
    <div id="game-container" className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-blue-100 p-6 transition-all duration-300">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-blue-700 mb-3">Travel Quiz Adventure</h1>
          <div className="w-20 h-1 bg-blue-500 mx-auto rounded-full mb-6"></div>
          
          <div className="bg-blue-50 p-4 rounded-lg inline-block">
            <p className="text-gray-600 mb-1 text-sm">EXPLORER</p>
            <p className="text-2xl font-semibold text-blue-800">{userName}</p>
          </div>
        </div>
        
        <div className="space-y-6">
          <p className="text-gray-600">Your global adventure awaits! Test your knowledge of world destinations, cultures, and landmarks in this exciting travel quiz.</p>
          <button 
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 shadow-lg"
            onClick={handleStartPlaying}
          >
            Begin Your Journey
          </button>
        </div>
      </div>
      
      <p className="mt-6 text-sm text-gray-500">Ready to become a travel master?</p>
    </div>
  );
}