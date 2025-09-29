import { useState, useEffect } from "react";
import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_SERVER_URL);

function Teacher() {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [pollResults, setPollResults] = useState({});
  const [timer, setTimer] = useState(0);
  const [questionActive, setQuestionActive] = useState(false);
  const [questionHistory, setQuestionHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    socket.on("teacher:pollUpdate", (results) => {
      console.log("📊 Poll update received:", results);
      setPollResults(results);
    });

    socket.on("teacher:timerUpdate", (timeLeft) => {
      setTimer(timeLeft);
    });

    socket.on("teacher:questionEnded", (finalResults) => {
      console.log("🏁 Question ended with results:", finalResults);
      setQuestionActive(false);
      
      // Update poll results with final results
      if (finalResults) {
        setPollResults(finalResults);
      }
      
      // Save question to history when it ends
      if (question && options.length > 0) {
        const historyItem = {
          id: Date.now(),
          question: question,
          options: options,
          correctAnswer: correctAnswer,
          results: finalResults || { ...pollResults },
          timestamp: new Date().toLocaleTimeString(),
          totalVotes: Object.values(finalResults || pollResults).reduce((a, b) => a + b, 0)
        };
        setQuestionHistory(prev => [historyItem, ...prev]);
        console.log("📜 Added to history:", historyItem);
      }
    });

    return () => {
      socket.off("teacher:pollUpdate");
      socket.off("teacher:timerUpdate");
      socket.off("teacher:questionEnded");
    };
  }, []);

  const submitQuestion = () => {
    if (!question || options.some(opt => !opt.trim())) {
      alert("Please enter question and all options");
      return;
    }
    if (!correctAnswer) {
      alert("Please select the correct answer");
      return;
    }

    const questionData = {
      text: question,
      options: options.map((opt) => ({ text: opt })),
      correctAnswer: correctAnswer,
    };
    
    console.log("🚀 Sending question:", questionData);
    socket.emit("teacher:sendQuestion", questionData);
    setPollResults({});
    setQuestionActive(true);
  };

  const endQuestion = () => {
    console.log("🔚 End question called manually");
    console.log("Current state:", { question, options, correctAnswer, pollResults });
    
    if (question && options.length > 0) {
      const historyItem = {
        id: Date.now(),
        question: question,
        options: options,
        correctAnswer: correctAnswer,
        results: { ...pollResults },
        timestamp: new Date().toLocaleTimeString(),
        totalVotes: Object.values(pollResults).reduce((a, b) => a + b, 0)
      };
      console.log("📜 Adding to history manually:", historyItem);
      setQuestionHistory(prev => [historyItem, ...prev]);
    }
    setQuestionActive(false);
    setQuestion("");
    setOptions(["", ""]);
    setCorrectAnswer("");
    setPollResults({});
  };

  const clearHistory = () => {
    setQuestionHistory([]);
  };

  return (
    <div className="min-h-screen bg-yellow-100 flex flex-col items-center py-12 px-6">
      <div className="w-full max-w-4xl bg-white shadow-lg rounded-2xl p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-yellow-700">Teacher Panel</h2>
          <div className="flex gap-3">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
            >
              {showHistory ? 'Hide History' : 'Show History'} 📊
            </button>
            {questionHistory.length > 0 && (
              <button
                onClick={clearHistory}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Clear History 🗑️
              </button>
            )}
          </div>
        </div>
        
        {!questionActive ? (
          <div className="space-y-6">
            {/* Question Input Section */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">1</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Enter Your Question</h3>
              </div>
              
              <textarea
                placeholder="What would you like to ask your students?"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="w-full border-2 border-gray-200 rounded-xl p-4 text-lg focus:border-blue-500 focus:outline-none transition-colors resize-none"
                rows={3}
              />
              <div className="mt-2 text-sm text-gray-500">
                {question.length}/200 characters
              </div>
            </div>

            {/* Options Section */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">2</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Add Answer Options</h3>
                <span className="text-sm text-gray-500">({options.filter(opt => opt.trim()).length} options)</span>
              </div>
              
              <div className="space-y-3">
              {options.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-sm font-medium text-gray-600">
                      {String.fromCharCode(65 + idx)}
                    </div>
                    <input
                      type="text"
                      placeholder={`Option ${idx + 1}`}
                      value={opt}
                      onChange={(e) => {
                        const newOpts = [...options];
                        newOpts[idx] = e.target.value;
                        setOptions(newOpts);
                      }}
                      className="flex-1 border-2 border-gray-200 rounded-lg p-3 focus:border-green-500 focus:outline-none transition-colors"
                    />
                    {options.length > 2 && (
                      <button
                        onClick={() => {
                          const newOpts = options.filter((_, i) => i !== idx);
                          setOptions(newOpts);
                        }}
                        className="w-8 h-8 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors flex items-center justify-center"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="flex gap-3 mt-4">
                <button 
                  onClick={() => setOptions([...options, ""])}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
                >
                  <span>+</span> Add Option
                </button>
                {options.length > 2 && (
                  <button
                    onClick={() => setOptions(options.slice(0, -1))}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Remove Last
                  </button>
                )}
              </div>
            </div>

            {/* Correct Answer Selection */}
            {options.filter(opt => opt.trim()).length >= 2 && (
              <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6 border border-orange-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">✓</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">Select Correct Answer</h3>
                </div>
                
                <div className="space-y-3">
                  {options.filter(opt => opt.trim()).map((opt, idx) => (
                    <label key={idx} className="flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:bg-orange-50">
                      <input
                        type="radio"
                        name="correctAnswer"
                        value={opt}
                        checked={correctAnswer === opt}
                        onChange={(e) => setCorrectAnswer(e.target.value)}
                        className="w-5 h-5 text-orange-600 focus:ring-orange-500"
                      />
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-sm font-medium text-gray-600">
                          {String.fromCharCode(65 + idx)}
                        </div>
                        <span className="text-gray-700 font-medium">{opt}</span>
                      </div>
                    </label>
                  ))}
                </div>
                
                {correctAnswer && (
                  <div className="mt-4 p-3 bg-green-100 border border-green-300 rounded-lg">
                    <div className="flex items-center gap-2 text-green-700">
                      <span className="text-lg">✅</span>
                      <span className="font-semibold">Correct answer selected: {correctAnswer}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Preview Section */}
            {question.trim() && options.some(opt => opt.trim()) && (
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">👁</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">Question Preview</h3>
                </div>
                
                <div className="bg-white rounded-lg p-4 border">
                  <h4 className="font-semibold text-gray-800 mb-3">{question}</h4>
                  <div className="space-y-2">
                    {options.filter(opt => opt.trim()).map((opt, idx) => (
                      <div key={idx} className={`flex items-center gap-3 p-2 rounded ${
                        correctAnswer === opt 
                          ? 'bg-green-50 border border-green-200' 
                          : 'bg-gray-50'
                      }`}>
                        <div className={`w-5 h-5 border-2 rounded-full ${
                          correctAnswer === opt 
                            ? 'border-green-500 bg-green-100' 
                            : 'border-gray-300'
                        }`}>
                          {correctAnswer === opt && (
                            <div className="w-full h-full flex items-center justify-center">
                              <span className="text-green-600 text-xs">✓</span>
                            </div>
                          )}
                        </div>
                        <span className={`font-medium ${
                          correctAnswer === opt ? 'text-green-700' : 'text-gray-700'
                        }`}>
                          {opt}
                        </span>
                        {correctAnswer === opt && (
                          <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">
                            Correct
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button 
                onClick={submitQuestion}
                disabled={!question.trim() || options.filter(opt => opt.trim()).length < 2 || !correctAnswer}
                className={`flex-1 py-4 rounded-xl font-semibold text-lg transition-all duration-200 ${
                  question.trim() && options.filter(opt => opt.trim()).length >= 2 && correctAnswer
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 transform hover:scale-105 shadow-lg'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                🚀 Send Question to Students
              </button>
              
              <button
                onClick={() => {
                  setQuestion("");
                  setOptions(["", ""]);
                  setCorrectAnswer("");
                }}
                className="px-6 py-4 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-colors"
              >
                Clear All
              </button>
            </div>
            
            {/* Validation Messages */}
            {!question.trim() && (
              <div className="text-red-600 text-sm flex items-center gap-2">
                <span>⚠️</span>
                <span>Please enter a question</span>
              </div>
            )}
            {question.trim() && options.filter(opt => opt.trim()).length < 2 && (
              <div className="text-red-600 text-sm flex items-center gap-2">
                <span>⚠️</span>
                <span>Please add at least 2 options</span>
              </div>
            )}
            {question.trim() && options.filter(opt => opt.trim()).length >= 2 && !correctAnswer && (
              <div className="text-red-600 text-sm flex items-center gap-2">
                <span>⚠️</span>
                <span>Please select the correct answer</span>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">{question}</h3>
              <div className="flex items-center gap-2">
                <span className="text-red-500 font-bold">⏱ {timer}s</span>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-600">Live</span>
              </div>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                Total votes: {Object.values(pollResults).reduce((a, b) => a + b, 0)}
              </p>
            </div>
            
            {options.map((opt, idx) => {
              const totalVotes = Object.values(pollResults).reduce((a, b) => a + b, 0);
              const votes = pollResults[opt] || 0;
              const percent = totalVotes ? Math.round((votes / totalVotes) * 100) : 0;
              
              return (
                <div key={idx} className="relative border rounded-lg overflow-hidden mb-2">
                  <div 
                    style={{ width: `${percent}%` }} 
                    className="absolute top-0 left-0 h-full bg-blue-400 transition-all duration-500"
                  ></div>
                  <div className="relative p-3 flex justify-between">
                    <span className="font-medium">{opt}</span>
                    <span className="font-bold">{votes} votes ({percent}%)</span>
                  </div>
                </div>
              );
            })}
            
            <div className="mt-6 flex gap-3">
              <button
                onClick={endQuestion}
                className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-semibold"
              >
                End Question ⏹️
              </button>
            </div>
          </>
        )}

        {/* Question History Section */}
        {showHistory && (
          <div className="mt-8 border-t pt-8">
            <h3 className="text-xl font-bold mb-6 text-gray-700 flex items-center gap-2">
              📜 Question History ({questionHistory.length} questions)
            </h3>
            
            {/* Debug Info */}
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Debug:</strong> History length: {questionHistory.length}, Show history: {showHistory.toString()}
              </p>
              {questionHistory.length > 0 && (
                <p className="text-sm text-blue-600 mt-1">
                  Latest item: {JSON.stringify(questionHistory[0], null, 2)}
                </p>
              )}
              <button
                onClick={() => {
                  const testItem = {
                    id: Date.now(),
                    question: "Test Question",
                    options: ["Option A", "Option B", "Option C"],
                    correctAnswer: "Option A",
                    results: { "Option A": 5, "Option B": 3, "Option C": 2 },
                    timestamp: new Date().toLocaleTimeString(),
                    totalVotes: 10
                  };
                  setQuestionHistory(prev => [testItem, ...prev]);
                  console.log("🧪 Added test history item");
                }}
                className="mt-2 px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
              >
                Add Test History Item
              </button>
            </div>
            
            {questionHistory.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">📝</div>
                <p>No questions asked yet</p>
                <p className="text-sm">Start asking questions to see the history here</p>
                </div>
            ) : (
              <div className="space-y-6 max-h-96 overflow-y-auto">
                {questionHistory.map((item, index) => (
                  <div key={item.id} className="bg-gray-50 rounded-xl p-6 border">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-semibold text-lg text-gray-800 mb-2">
                          Q{questionHistory.length - index}: {item.question}
                        </h4>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                          <span>🕒 {item.timestamp}</span>
                          <span>👥 {item.totalVotes} total votes</span>
                          {item.correctAnswer && (
                            <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">
                              ✓ Correct: {item.correctAnswer}
                            </span>
                          )}
          </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      {item.options.map((option, optIdx) => {
                        const totalVotes = Object.values(item.results).reduce((a, b) => a + b, 0);
                        const votes = item.results[option] || 0;
                        const percent = totalVotes ? Math.round((votes / totalVotes) * 100) : 0;
                        const isCorrect = item.correctAnswer === option;
                        
                    return (
                          <div key={optIdx} className={`relative p-3 rounded-lg border ${
                            isCorrect ? 'bg-green-50 border-green-200' : 'bg-gray-50'
                          }`}>
                            <div className="flex justify-between items-center mb-1">
                              <div className="flex items-center gap-2">
                                <span className={`font-medium ${
                                  isCorrect ? 'text-green-700' : 'text-gray-700'
                                }`}>
                                  {option}
                                </span>
                                {isCorrect && (
                                  <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">
                                    ✓ Correct Answer
                                  </span>
                                )}
                              </div>
                              <span className={`text-sm font-bold ${
                                isCorrect ? 'text-green-600' : 'text-gray-600'
                              }`}>
                                {votes} votes ({percent}%)
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3">
                              <div 
                                className={`h-3 rounded-full transition-all duration-500 ${
                                  isCorrect 
                                    ? 'bg-gradient-to-r from-green-400 to-green-600' 
                                    : 'bg-gradient-to-r from-blue-400 to-blue-600'
                                }`}
                                style={{ width: `${percent}%` }}
                              ></div>
                            </div>
                      </div>
                    );
                  })}
                    </div>
                </div>
              ))}
            </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Teacher;
