
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { updateUserScore, createUser } from "../api/user";
import { fetchDestination, checkDestinationAnswer } from "../api/destination";

interface Destination {
  id: string;
  clues: string[];
  options: string[];
}

export default function Game() {
  const [destination, setDestination] = useState<Destination | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  // const [showNextButton, setShowNextButton] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [score, setScore] = useState({ correct: 0, incorrect: 0 });
  const [isGameOver, setIsGameOver] = useState(false);
  const [friendName, setFriendName] = useState("");
  const [userName, setUserName] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isAnswered, setIsAnswered] = useState(false);
  const [feedbackColor, setFeedbackColor] = useState("");
  const [funFacts, setFunFacts] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    const storedUserName = localStorage.getItem("userName");
    if (!storedUserId || !storedUserName) {
      router.push("/");
      return;
    }
    setUserName(storedUserName);
    setUserId(storedUserId);

    fetchNewDestination();
  }, [router]);

  async function fetchNewDestination() {
    try {
      // setShowNextButton(false);
      setFeedback(null);
      setSelectedAnswer("");
      setIsAnswered(false);
      setFeedbackColor("");
      setFunFacts([]);

      // Add loading animation
      setDestination(null);

      const data = await fetchDestination();
      setDestination(data);
    } catch (error) {
      console.error("Error fetching destination:", error);
    }
  }

  async function checkAnswer() {
    if (!destination || !selectedAnswer || isAnswered) return;

    setIsChecking(true);

    try {
      const data = await checkDestinationAnswer(destination.id, selectedAnswer);
      if (data.correct) {
        setScore((prev) => ({ ...prev, correct: prev.correct + 1 }));
        setFeedback(`✅ Correct!`);
        setFunFacts(data.funFact);
        setFeedbackColor("text-green-600");
      } else {
        setScore((prev) => ({ ...prev, incorrect: prev.incorrect + 1 }));
        setFeedback(`❌ Wrong!`);
        setFunFacts(data.funFact);
        setFeedbackColor("text-red-600");
      }

      // setShowNextButton(true);
      setIsAnswered(true);
    } catch (error) {
      console.error("Error checking answer:", error);
    } finally {
      setIsChecking(false);
    }
  }

  async function endGame() {
    if (userId) {
      const correct = score.correct;
      await updateUserScore(userId, correct);
    }
    setIsGameOver(true);
  }

  function restartGame() {
    setScore({ correct: 0, incorrect: 0 });
    setIsGameOver(false);
    fetchNewDestination();
  }

  if (isGameOver) {
    async function handleShare() {
      if (!friendName) {
        alert("Please enter a friend's user name!");
        return;
      }

      try {
        const data = await createUser(friendName);
        if (data.user) {
          const shareLink = `${window.location.origin}/friend?toId=${data.user._id}&fromScore=${score.correct}&userName=${userName}`;
          console.log(shareLink,'shareLink');
          navigator.clipboard.writeText(shareLink);
          alert("Link copied! Share it with your friend 🎉");
        } else {
          alert("Error creating user.");
        }
      } catch (error) {
        console.error("Error adding friend:", error);
      }
    }

    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-blue-100 p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center"
        >
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-blue-700 mb-6">Game Over</h2>

            <div className="flex justify-center space-x-8 mb-8">
              <div className="text-center">
                <div className="text-5xl font-bold text-green-600 mb-2">{score.correct}</div>
                <div className="text-sm text-gray-600">Correct</div>
              </div>

              <div className="w-px bg-gray-200"></div>

              <div className="text-center">
                <div className="text-5xl font-bold text-red-500 mb-2">{score.incorrect}</div>
                <div className="text-sm text-gray-600">Incorrect</div>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <p className="text-lg text-blue-800">
                Your score: <span className="font-bold">{score.correct}</span> out of {score.correct + score.incorrect}
              </p>
              <p className="text-blue-600 mt-1">
                {score.correct > score.incorrect ? "Great job! 🎉" : "Keep practicing! 💪"}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              onClick={restartGame}
            >
              Play Again
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              onClick={() => {
                localStorage.clear();
                router.push("/");
              }}
            >
              Exit Game
            </motion.button>

            <div className="bg-white border border-gray-200 rounded-lg p-4 mt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Challenge a Friend</h3>
              <input
                type="text"
                placeholder="Friend's Name"
                value={friendName}
                onChange={(e) => setFriendName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-3 text-black"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-lg transition-colors"
                onClick={handleShare}
              >
                Share Challenge
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header with score */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-blue-700">Guess the Destination</h2>
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <span className="text-green-600 font-bold text-xl">{score.correct}</span>
                <p className="text-xs text-gray-500">Correct</p>
              </div>
              <div className="text-center">
                <span className="text-red-500 font-bold text-xl">{score.incorrect}</span>
                <p className="text-xs text-gray-500">Incorrect</p>
              </div>
            </div>
          </div>
        </div>

        {/* Question card */}
        <motion.div
          className="bg-white rounded-xl shadow-lg p-6 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {destination ? (
            <>
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-700 mb-2">Destination Clues:</h3>
                <motion.div
                  className="p-4 bg-blue-50 rounded-lg border border-blue-100"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8 }}
                >
                  {destination.clues.map((clue, index) => (
                    <motion.p
                      key={index}
                      className="text-blue-800 mb-2 last:mb-0"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.2, duration: 0.5 }}
                    >
                      • {clue}
                    </motion.p>
                  ))}
                </motion.div>
              </div>

              <h3 className="text-lg font-medium text-gray-700 mb-3">Select the destination:</h3>
              <div className="grid grid-cols-2 gap-3 mb-6">
                {destination.options.map((option) => (
                  <motion.button
                    key={option}
                    className={`p-4 rounded-lg border-2 transition-all text-black ${selectedAnswer === option
                      ? isAnswered
                        ? feedback?.includes("Correct")
                          ? "border-green-500 bg-green-50 text-green-700"
                          : "border-red-500 bg-red-50 text-red-700"
                        : "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                      } ${isAnswered && selectedAnswer !== option ? "opacity-50" : ""}`}
                    onClick={() => !isAnswered && setSelectedAnswer(option)}
                    whileHover={{ scale: isAnswered ? 1 : 1.03 }}
                    whileTap={{ scale: isAnswered ? 1 : 0.97 }}
                    disabled={isAnswered}
                  >
                    {option}
                  </motion.button>
                ))}
              </div>

              {feedback && (
                <motion.div
                  className={`p-6 rounded-lg mb-6 shadow-sm ${feedbackColor === "text-green-600"
                      ? "bg-green-50 border border-green-200"
                      : "bg-red-50 border border-red-200"
                    }`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                >
                  <p className={`${feedbackColor} text-lg font-medium mb-4`}>
                    {feedback}
                  </p>

                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">
                      Destination Fun Facts:
                    </h3>

                    <motion.div
                      className="p-5 bg-blue-50 rounded-lg border border-blue-100 shadow-inner"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.6, delay: 0.2 }}
                    >
                      {funFacts.map((fact, index) => (
                        <motion.div
                          key={index}
                          className="flex items-start mb-3 last:mb-0"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.4 + index * 0.15, duration: 0.4 }}
                        >
                          <span className="text-blue-600 mr-2 text-lg">•</span>
                          <p className="text-blue-800">
                            {fact}
                          </p>
                        </motion.div>
                      ))}
                    </motion.div>
                  </div>
                </motion.div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-3 justify-center">
                {!isAnswered ? (
                  <motion.button
                    className={`px-6 py-3 rounded-lg font-medium flex items-center justify-center ${!selectedAnswer || isChecking
                      ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                      : "bg-green-600 text-white hover:bg-green-700"
                      }`}
                    onClick={checkAnswer}
                    disabled={!selectedAnswer || isChecking}
                    whileHover={{ scale: !selectedAnswer || isChecking ? 1 : 1.05 }}
                    whileTap={{ scale: !selectedAnswer || isChecking ? 1 : 0.95 }}
                  >
                    {isChecking ? (
                      <>
                        <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-5 h-5 mr-2"></span>
                        Checking...
                      </>
                    ) : (
                      "Submit Answer"
                    )}
                  </motion.button>
                ) : (
                  <motion.button
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 flex items-center"
                    onClick={fetchNewDestination}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Next Question <span className="ml-1">→</span>
                  </motion.button>
                )}

                {!isAnswered && (
                  <motion.button
                    className="bg-yellow-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-yellow-600"
                    onClick={fetchNewDestination}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Skip
                  </motion.button>
                )}

                <motion.button
                  className="bg-red-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-600"
                  onClick={endGame}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  End Game
                </motion.button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-lg text-gray-600">Loading question...</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}