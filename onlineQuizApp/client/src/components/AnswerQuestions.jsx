import { useState, useEffect } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:8000");

function StudentPanel() {
  const [name, setName] = useState("");
  const [joined, setJoined] = useState(false);
  const [question, setQuestion] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [answer, setAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [showLeaderboard, setShowLeaderboard] = useState(true);

  useEffect(() => {
    socket.on("student:newQuestion", ({ question, time }) => {
      setQuestion(question);
      setTimeLeft(time);
      setAnswer("");
      setSubmitted(false);

      // Countdown timer
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    });

    socket.on("student:timeUp", () => {
      setQuestion(null);
      setTimeLeft(0);
      setSubmitted(true);
    });

    socket.on("student:leaderboard", (students) => {
      console.log("🏆 Leaderboard update received:", students);
      console.log("Current leaderboard state:", leaderboard);
      setLeaderboard(students);
      console.log("Leaderboard state updated");
    });

    return () => {
      socket.off("student:newQuestion");
      socket.off("student:timeUp");
      socket.off("student:leaderboard");
    };
  }, []);

  const joinQuiz = () => {
    if (!name.trim()) return alert("Please enter your name");
    socket.emit("student:join", name);
    setJoined(true);
  };

  const submitAnswer = () => {
    if (!answer) return alert("Please select an answer");
    socket.emit("student:answer", answer);
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 flex flex-col items-center py-12 px-6">
      <div className="w-full max-w-2xl">
        {!joined ? (
          <div className="bg-white shadow-2xl rounded-3xl p-8 text-center">
            <div className="mb-8">
              <div className="w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🎓</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Join Live Quiz</h2>
              <p className="text-gray-600">Enter your name to start participating</p>
            </div>
            
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl text-lg focus:border-indigo-500 focus:outline-none transition-colors"
                onKeyPress={(e) => e.key === 'Enter' && joinQuiz()}
              />
              <button
                onClick={joinQuiz}
                className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold text-lg rounded-xl hover:from-indigo-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
              >
                Join Quiz 🚀
              </button>
            </div>
          </div>
        ) : question ? (
          <div className="bg-white shadow-2xl rounded-3xl p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-green-600">Live Question</span>
              </div>
              <div className={`px-4 py-2 rounded-full font-bold text-lg ${
                timeLeft > 10 ? 'bg-green-100 text-green-700' : 
                timeLeft > 5 ? 'bg-yellow-100 text-yellow-700' : 
                'bg-red-100 text-red-700'
              }`}>
                ⏱ {timeLeft}s
              </div>
            </div>

            <h3 className="text-2xl font-bold text-gray-800 mb-8 leading-relaxed">
              {question.text}
            </h3>

            <div className="space-y-3 mb-8">
              {question.options.map((opt, idx) => (
                <label
                  key={idx}
                  className={`block p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md ${
                    answer === opt.text
                      ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200'
                      : 'border-gray-200 hover:border-indigo-300'
                  } ${submitted ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="flex items-center gap-4">
                    <input
                      type="radio"
                      name="answer"
                      value={opt.text}
                      checked={answer === opt.text}
                      onChange={(e) => setAnswer(e.target.value)}
                      disabled={submitted}
                      className="w-5 h-5 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-lg font-medium text-gray-700">
                      {opt.text}
                    </span>
                  </div>
                </label>
              ))}
            </div>

            {submitted ? (
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">✅</span>
                </div>
                <h4 className="text-xl font-semibold text-green-700 mb-2">Answer Submitted!</h4>
                <p className="text-gray-600">Thank you for participating</p>
              </div>
            ) : (
              <button
                onClick={submitAnswer}
                disabled={!answer || timeLeft === 0}
                className={`w-full py-4 font-semibold text-lg rounded-xl transition-all duration-200 ${
                  answer && timeLeft > 0
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 transform hover:scale-105 shadow-lg'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {timeLeft === 0 ? 'Time Up!' : 'Submit Answer 🎯'}
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white shadow-2xl rounded-3xl p-12 text-center">
              <div className="mb-8">
                <div className="w-24 h-24 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                  <span className="text-4xl">⏳</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Waiting for Next Question</h3>
                <p className="text-gray-600 text-lg">The teacher will send a new question soon</p>
              </div>
              
              <div className="flex justify-center">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce"></div>
                  <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
              </div>
            </div>

            {/* Leaderboard Section */}
            {leaderboard.length > 0 && (
              <div className="bg-white shadow-2xl rounded-3xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    🏆 Leaderboard
                  </h3>
                  <button
                    onClick={() => setShowLeaderboard(!showLeaderboard)}
                    className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors text-sm"
                  >
                    {showLeaderboard ? 'Hide' : 'Show'}
                  </button>
                </div>
                
                {showLeaderboard && (
                  <div className="space-y-3">
                    {leaderboard.map((student, index) => (
                      <div
                        key={index}
                        className={`flex items-center justify-between p-4 rounded-xl transition-all duration-300 ${
                          index === 0
                            ? 'bg-gradient-to-r from-yellow-100 to-yellow-50 border-2 border-yellow-300 shadow-lg'
                            : index === 1
                            ? 'bg-gradient-to-r from-gray-100 to-gray-50 border-2 border-gray-300'
                            : index === 2
                            ? 'bg-gradient-to-r from-orange-100 to-orange-50 border-2 border-orange-300'
                            : 'bg-gray-50 border border-gray-200'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                            index === 0
                              ? 'bg-yellow-400 text-yellow-800'
                              : index === 1
                              ? 'bg-gray-400 text-gray-800'
                              : index === 2
                              ? 'bg-orange-400 text-orange-800'
                              : 'bg-gray-300 text-gray-700'
                          }`}>
                            {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                          </div>
                          <div>
                            <div className={`font-semibold ${
                              index === 0
                                ? 'text-yellow-800'
                                : index === 1
                                ? 'text-gray-800'
                                : index === 2
                                ? 'text-orange-800'
                                : 'text-gray-700'
                            }`}>
                              {student.name}
                            </div>
                            {student.name === name && (
                              <div className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                                You
                              </div>
                            )}
                          </div>
                        </div>
                        <div className={`text-lg font-bold ${
                          index === 0
                            ? 'text-yellow-600'
                            : index === 1
                            ? 'text-gray-600'
                            : index === 2
                            ? 'text-orange-600'
                            : 'text-gray-500'
                        }`}>
                          {student.score} pts
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default StudentPanel;
