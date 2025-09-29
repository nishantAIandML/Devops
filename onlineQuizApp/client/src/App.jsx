import { useState } from "react";
import { Routes, Route, Link } from "react-router-dom";
import TeacherPanel from "./components/CreateQuestions.jsx";
import StudentPanel from "./components/AnswerQuestions.jsx";

function App() {
  const [role, setRole] = useState(null);

  const RoleCard = ({ value, title, desc }) => {
    const selected = role === value;
    return (
      <button
        type="button"
        onClick={() => setRole(value)}
        className={[
          "w-full text-left rounded-2xl border px-8 py-8 transition bg-white",
          selected
            ? "border-indigo-400 ring-4 ring-indigo-200/50"
            : "border-zinc-200 hover:shadow-md"
        ].join(" ")}
      >
        <h3 className="text-2xl font-semibold text-zinc-900">{title}</h3>
        <p className="mt-3 text-zinc-500 leading-6">{desc}</p>
      </button>
    );
  };

  return (
    <Routes>
      {/* Role Selection Page */}
      <Route
        path="/"
        element={
          <main className="min-h-screen bg-white text-zinc-900">
            <div className="mx-auto max-w-5xl px-6 pt-10 pb-20">
              {/* Headline */}
              <h1 className="mt-8 text-center text-5xl sm:text-6xl font-bold tracking-tight">
                Welcome to the <span className="text-zinc-900">Live Polling System</span>
              </h1>

              {/* Subtitle */}
              <p className="mt-4 text-center text-lg text-zinc-500 max-w-3xl mx-auto">
                Please select the role that best describes you to begin using the live polling system
              </p>

              {/* Role cards */}
              <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
                <RoleCard value="student" title="I’m a Student" desc="Answer live polls" />
                <RoleCard value="teacher" title="I’m a Teacher" desc="Create and manage questions" />
              </div>

              {/* Continue button */}
              <div className="mt-12 flex justify-center">
                {role ? (
                  <Link
                    to={role === "teacher" ? "/create-question" : "/answer-question"}
                    className="h-16 w-[320px] flex items-center justify-center rounded-full text-white text-xl font-semibold transition bg-gradient-to-r from-indigo-500 to-indigo-700 shadow-lg shadow-indigo-500/30 hover:from-indigo-600 hover:to-indigo-800"
                  >
                    Continue
                  </Link>
                ) : (
                  <button
                    disabled
                    className="h-16 w-[320px] rounded-full text-white text-xl font-semibold bg-indigo-300 cursor-not-allowed"
                  >
                    Continue
                  </button>
                )}
              </div>
            </div>
          </main>
        }
      />

      {/* Teacher Page */}
      <Route
        path="/create-question"
        element={<TeacherPanel />}
      />

      {/* Student Page */}
      <Route
        path="/answer-question"
        element={<StudentPanel />}
      />
    </Routes>
  );
}

export default App;
