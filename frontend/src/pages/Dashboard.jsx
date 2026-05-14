import React, { useEffect, useState } from "react";
import { fetchStates, fetchHistory } from "../api.js";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function Dashboard() {
  const [states, setStates] = useState([]);
  const [selectedState, setSelectedState] = useState("Assam");
  const [history, setHistory] = useState([]);

  useEffect(() => {
    async function load() {
      const st = await fetchStates();
      setStates(st);
    }
    load();
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

  const avgRain =
    history.length > 0
      ? (history.reduce((sum, d) => sum + d.rain_mm, 0) / history.length).toFixed(1)
      : 0;

  return (
    <div>
      <h2 style={{ marginBottom: "1rem" }}>Dashboard</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "1rem" }}>
        <div className="card">
          <div className="card-title">Selected State</div>
          <div className="card-value">{selectedState}</div>
        </div>
        <div className="card">
          <div className="card-title">Avg Rain (last 30 days)</div>
          <div className="card-value">{avgRain} mm</div>
        </div>
        <div className="card">
          <div className="card-title">Total Days</div>
          <div className="card-value">{history.length}</div>
        </div>
      </div>

      <div style={{ marginTop: "1.5rem" }} className="card">
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.75rem" }}>
          <span className="card-title">Rainfall Time Series (last 30 days)</span>
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
        <div style={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={history}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" hide />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="rain_mm" stroke="#38bdf8" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
