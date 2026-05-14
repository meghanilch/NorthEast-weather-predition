import React, { useEffect, useState } from "react";
import { getStates, getForecast } from "../api.js";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function Forecast() {
  const [states, setStates] = useState([]);
  const [selectedState, setSelectedState] = useState("Assam");
  const [forecast, setForecast] = useState([]);

  useEffect(() => {
    async function loadStates() {
      const s = await getStates();
      setStates(s);
    }
    loadStates();
  }, []);

  useEffect(() => {
    async function loadForecast() {
      if (!selectedState) return;
      const f = await getForecast(selectedState);
      setForecast(f);
    }
    loadForecast();
  }, [selectedState]);

  return (
    <div className="grid-2">
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">7-Day Rainfall Pattern</div>
            <div className="card-subtitle">Selected state: {selectedState}</div>
          </div>
          <select
            className="state-select"
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
          >
            {states.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div style={{ height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={forecast}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={(d) =>
                  new Date(d).toLocaleDateString("en-IN", { weekday: "short" })
                }
                tick={{ fontSize: 10 }}
              />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip
                formatter={(value) => [`${value.toFixed(1)} mm`, "Rain"]}
                labelFormatter={(label) =>
                  new Date(label).toLocaleDateString("en-IN", {
                    weekday: "long",
                    day: "2-digit",
                    month: "short",
                  })
                }
              />
              <Area
                type="monotone"
                dataKey="rain_mm"
                stroke="#22c55e"
                fill="#bbf7d0"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Day-wise Details</div>
            <div className="card-subtitle">Prediction and expected rainfall</div>
          </div>
        </div>

        <div className="forecast-list">
          {forecast.map((item) => (
            <div key={item.date} className="forecast-item">
              <div className="forecast-main">
                <span className="forecast-date">
                  {new Date(item.date).toLocaleDateString("en-IN", {
                    weekday: "short",
                    day: "2-digit",
                    month: "short",
                  })}
                </span>
                <span className="forecast-status">
                  {item.prediction === "Rain" ? "Rainy" : "Clear"}
                </span>
              </div>
              <div className="forecast-rain">
                {item.rain_mm.toFixed(1)} mm
              </div>
            </div>
          ))}
          {forecast.length === 0 && (
            <div style={{ fontSize: "0.85rem", color: "#9ca3af" }}>
              No forecast data available.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
