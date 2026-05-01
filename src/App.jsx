import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function App() {
  const [entries, setEntries] = useState(() => {
    const saved = localStorage.getItem("progressDataV5");
    return saved ? JSON.parse(saved) : [];
  });

  const [activeTab, setActiveTab] = useState("dsa");

  // 🎯 Weekly Goals
  const [goals, setGoals] = useState({
    dsa: 10,
    dev: 10,
    workout: 4,
  });

  const [form, setForm] = useState({
    date: "",
    dsaHours: "",
    devHours: "",
    workout: false,
    dietScore: "",
  });

  useEffect(() => {
    localStorage.setItem("progressDataV5", JSON.stringify(entries));
  }, [entries]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const calculateScore = (entry) => {
    return (
      (entry.dsaHours >= 1 ? 1 : 0) +
      (entry.devHours >= 1 ? 1 : 0) +
      (entry.workout ? 1 : 0) +
      (entry.dietScore >= 7 ? 1 : 0)
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.date) return;

    const newEntry = { ...form, score: calculateScore(form) };
    setEntries([...entries, newEntry]);

    setForm({
      date: "",
      dsaHours: "",
      devHours: "",
      workout: false,
      dietScore: "",
    });
  };

  // 📅 Current Week Data
  const getThisWeekEntries = () => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());

    return entries.filter((e) => new Date(e.date) >= startOfWeek);
  };

  const weekEntries = getThisWeekEntries();

  const weeklyDSA = weekEntries.reduce(
    (a, c) => a + Number(c.dsaHours || 0),
    0,
  );
  const weeklyDev = weekEntries.reduce(
    (a, c) => a + Number(c.devHours || 0),
    0,
  );
  const weeklyWorkout = weekEntries.filter((e) => e.workout).length;

  const totalDSA = entries.reduce((a, c) => a + Number(c.dsaHours || 0), 0);
  const totalDev = entries.reduce((a, c) => a + Number(c.devHours || 0), 0);
  const workoutDays = entries.filter((e) => e.workout).length;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <h1 className="text-2xl font-bold mb-4">🚀 Consistency Tracker</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveTab("dsa")}
          className={`px-4 py-2 rounded ${activeTab === "dsa" ? "bg-blue-500" : "bg-gray-700"}`}
        >
          💻 DSA / Dev
        </button>
        <button
          onClick={() => setActiveTab("fitness")}
          className={`px-4 py-2 rounded ${activeTab === "fitness" ? "bg-green-500" : "bg-gray-700"}`}
        >
          🏋️ Fitness
        </button>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-gray-800 p-3 rounded-xl mb-4 flex flex-wrap gap-2"
      >
        <input
          type="date"
          name="date"
          value={form.date}
          onChange={handleChange}
          className="p-2 bg-gray-700 rounded"
          required
        />
        <input
          type="number"
          name="dsaHours"
          placeholder="DSA"
          value={form.dsaHours}
          onChange={handleChange}
          className="p-2 bg-gray-700 rounded"
        />
        <input
          type="number"
          name="devHours"
          placeholder="Dev"
          value={form.devHours}
          onChange={handleChange}
          className="p-2 bg-gray-700 rounded"
        />
        <label className="flex items-center gap-1">
          🏋️
          <input
            type="checkbox"
            name="workout"
            checked={form.workout}
            onChange={handleChange}
          />
        </label>
        <input
          type="number"
          name="dietScore"
          placeholder="Diet"
          value={form.dietScore}
          onChange={handleChange}
          className="p-2 bg-gray-700 rounded"
        />
        <button className="bg-blue-500 px-3 rounded">Add</button>
      </form>

      {/* DSA Dashboard */}
      {activeTab === "dsa" && (
        <div>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <Card title="📊 Weekly DSA" value={`${weeklyDSA}/${goals.dsa}`} />
            <Card title="💻 Weekly Dev" value={`${weeklyDev}/${goals.dev}`} />
          </div>

          <div className="bg-gray-800 p-3 rounded-xl">
            <h2 className="mb-2">📊 Learning Progress</h2>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={entries}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="dsaHours" />
                <Line type="monotone" dataKey="devHours" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Fitness Dashboard */}
      {activeTab === "fitness" && (
        <div>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <Card
              title="🏋️ Weekly Workouts"
              value={`${weeklyWorkout}/${goals.workout}`}
            />
            <Card
              title="🥗 Avg Diet"
              value={(
                entries.reduce((a, c) => a + Number(c.dietScore || 0), 0) /
                  entries.length || 0
              ).toFixed(1)}
            />
          </div>

          <div className="bg-gray-800 p-3 rounded-xl mb-4">
            <h2 className="mb-2">📅 Consistency Heatmap</h2>
            <div className="grid grid-cols-7 gap-1">
              {entries.map((e, i) => (
                <div
                  key={i}
                  className={`w-6 h-6 rounded ${e.workout ? "bg-green-500" : "bg-red-500"}`}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Logs */}
      <div className="bg-gray-800 p-3 rounded-xl mt-4">
        <h2 className="mb-2">Logs</h2>
        {entries.map((e, i) => (
          <div
            key={i}
            className="flex justify-between border-b border-gray-700 py-1 text-sm"
          >
            <span>{e.date}</span>
            <span>{e.score}/4</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Card({ title, value }) {
  return (
    <div className="bg-gray-800 p-3 rounded-xl text-center">
      <div className="text-xs text-gray-400">{title}</div>
      <div className="text-lg font-bold">{value}</div>
    </div>
  );
}
