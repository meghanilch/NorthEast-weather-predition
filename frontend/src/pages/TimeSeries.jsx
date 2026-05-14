import React, { useEffect, useState } from "react";
import { fetchStates, fetchHistory } from "../api.js";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function TimeSeries() {
  const [states, setStates] = useState([]);
  const [selectedState, setSelectedState] = useState("Assam");
  const [history, setHistory] = useState([]);

  useEffect(() => {
    async function loadStates() {
      const st = await fetchStates();
      setStates(st);
    }
    loadStates();
  }, []);

  useEffect(() => {
    async function loadHistory() {
      if (!selectedState) return;
      const res = await fetchHistory(selectedState);
      setHistory(
        res.history?.map((d) => ({
          date: d.date,
          rain_mm: d.rain_mm
        })) || []
      );
    }
    loadHistory();
  }, [selectedState]);

  return (
    <div>
      <h2 style={{ marginBottom: "1rem" }}>Time Series – Rainfall by State</h2>
      <div style={{ marginBottom: "0.75rem" }}>
        <select
          value={selectedState}
          onChange={(e) => setSelectedState(e.target.value)}
          style={{ background: "#020617", color: "#e5e7eb", borderRadius: "8px", padding: "0.25rem 0.5rem" }}
        >
          {states.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="card" style={{ height: 340 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={history}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" hide />
            <YAxis />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="rain_mm"
              stroke="#22c55e"
              fill="#22c55e33"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
