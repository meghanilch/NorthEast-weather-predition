import React, { useEffect, useState } from "react";
import { getStates, getForecast } from "../api.js";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { WiRain, WiDaySunny, WiCloudy } from "react-icons/wi";

export default function Home() {
  const [states, setStates] = useState([]);
  const [selectedState, setSelectedState] = useState("Assam");
  const [forecast, setForecast] = useState([]);

  useEffect(() => {
    async function loadStates() {
      const s = await getStates();
      setStates(s);
      if (!selectedState && s.length > 0) {
        setSelectedState(s[0]);
      }
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

  const today = forecast[0];
  const totalRain = forecast.reduce((sum, d) => sum + (d.rain_mm || 0), 0);

  let badgeText = "Calm conditions";
  let badgeClass = "badge badge-green";
  if (totalRain > 80) {
    badgeText = "Heavy rain expected this week";
    badgeClass = "badge badge-red";
  } else if (totalRain > 30) {
    badgeText = "Moderate rainfall week";
    badgeClass = "badge badge-yellow";
  }

  const getIcon = (item) => {
    if (!item) return <WiCloudy size={32} color="#6b7280" />;
    if (item.prediction === "Rain") {
      if (item.rain_mm > 30) return <WiRain size={36} color="#1d4ed8" />;
      return <WiRain size={32} color="#3b82f6" />;
    }
    return <WiDaySunny size={34} color="#f59e0b" />;
  };

  return (
    <div className="grid-2">
      {/* Left: Today + Summary */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Today & Weekly Overview</div>
            <div className="card-subtitle">North-East India · {selectedState}</div>
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

        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginTop: "0.5rem" }}>
          <div style={{ padding: "0.75rem", borderRadius: "16px", background: "#eff6ff" }}>
            {getIcon(today)}
          </div>
          <div>
            <div style={{ fontSize: "1.6rem", fontWeight: 700 }}>
              {today ? `${today.rain_mm.toFixed(1)} mm` : "--"}
            </div>
            <div style={{ fontSize: "0.85rem", color: "#4b5563" }}>
              {today
                ? `${today.prediction === "Rain" ? "Rain expected" : "Mostly clear"} today`
                : "Forecast loading..."}
            </div>
          </div>
        </div>

        <div style={{ marginTop: "0.8rem" }}>
          <span className={badgeClass}>{badgeText}</span>
        </div>

        <div style={{ marginTop: "0.9rem", fontSize: "0.85rem", color: "#4b5563" }}>
          Total expected rainfall next 7 days:{" "}
          <strong>{totalRain.toFixed(1)} mm</strong>
        </div>

        <div style={{ marginTop: "1rem" }}>
          <div className="card-subtitle">Day-wise outlook</div>
          <div className="forecast-list">
            {forecast.slice(0, 4).map((item) => (
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
                <div className="forecast-rain">{item.rain_mm.toFixed(1)} mm</div>
              </div>
            ))}
            {forecast.length === 0 && (
              <div style={{ fontSize: "0.8rem", color: "#9ca3af" }}>No forecast data yet.</div>
            )}
          </div>
        </div>
      </div>

      {/* Right: 7-Day Chart */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">7-Day Rainfall Forecast</div>
            <div className="card-subtitle">Rainfall trend in mm</div>
          </div>
        </div>
        <div style={{ height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={forecast}>
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
              <Line
                type="monotone"
                dataKey="rain_mm"
                stroke="#2563eb"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
