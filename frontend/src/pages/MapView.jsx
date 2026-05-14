import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Icon } from "leaflet";
import { NE_STATES } from "../data/neStates.js";
import { getForecast } from "../api.js";
import { WiRain, WiDaySunny, WiCloudy } from "react-icons/wi";

const markerIcon = new Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconSize: [26, 40],
  iconAnchor: [13, 40],
});

export default function MapView() {
  const [selectedState, setSelectedState] = useState(null);
  const [forecast, setForecast] = useState([]);

  async function handleSelect(stateName) {
    setSelectedState(stateName);
    const f = await getForecast(stateName);
    setForecast(f);
  }

  const getIcon = (item) => {
    if (!item) return <WiCloudy size={20} color="#6b7280" />;
    if (item.prediction === "Rain") {
      if (item.rain_mm > 30) return <WiRain size={22} color="#1d4ed8" />;
      return <WiRain size={20} color="#3b82f6" />;
    }
    return <WiDaySunny size={20} color="#f59e0b" />;
  };

  return (
    <div className="grid-2">
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <MapContainer
          center={[26, 93]}
          zoom={6}
          style={{ height: 420, width: "100%" }}
        >
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {NE_STATES.map((st) => (
            <Marker
              key={st.name}
              position={[st.lat, st.lng]}
              icon={markerIcon}
              eventHandlers={{
                click: () => handleSelect(st.name),
              }}
            >
              <Popup>
                <strong>{st.name}</strong>
                <br />
                Click marker to view 7-day forecast in the panel.
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">7-Day Forecast by State</div>
            <div className="card-subtitle">
              Click on a state marker to view forecast
            </div>
          </div>
        </div>

        <div className="chip-row" style={{ marginBottom: "0.6rem" }}>
          {NE_STATES.map((st) => (
            <button
              key={st.name}
              onClick={() => handleSelect(st.name)}
              className="chip"
              style={{
                background:
                  selectedState === st.name ? "#2563eb" : "#eff6ff",
                color: selectedState === st.name ? "white" : "#1d4ed8",
                border: "none",
                cursor: "pointer",
              }}
            >
              {st.name}
            </button>
          ))}
        </div>

        {selectedState ? (
          <>
            <div className="card-subtitle">
              Forecast for <strong>{selectedState}</strong>
            </div>
            <div className="forecast-list">
              {forecast.map((item) => (
                <div key={item.date} className="forecast-item">
                  <div className="forecast-main">
                    {getIcon(item)}
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
            </div>
          </>
        ) : (
          <div style={{ fontSize: "0.85rem", color: "#9ca3af", marginTop: "0.5rem" }}>
            Select a state from the map or chips above to see its detailed 7-day forecast.
          </div>
        )}
      </div>
    </div>
  );
}
