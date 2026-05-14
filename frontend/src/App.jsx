import React from "react";
import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import { WiDaySunnyOvercast } from "react-icons/wi";
import Home from "./pages/Home.jsx";
import MapView from "./pages/MapView.jsx";
import Forecast from "./pages/Forecast.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <header className="app-header">
          <div className="app-title">
            <WiDaySunnyOvercast size={28} color="#2563eb" />
            <span>NE India Weather Intelligence</span>
          </div>
          <nav className="app-nav">
            <NavLink
              to="/"
              className={({ isActive }) => (isActive ? "active-link" : "")}
              end
            >
              Overview
            </NavLink>
            <NavLink
              to="/map"
              className={({ isActive }) => (isActive ? "active-link" : "")}
            >
              Map
            </NavLink>
            <NavLink
              to="/forecast"
              className={({ isActive }) => (isActive ? "active-link" : "")}
            >
              7-Day Forecast
            </NavLink>
          </nav>
        </header>

        <main className="app-main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/map" element={<MapView />} />
            <Route path="/forecast" element={<Forecast />} />
          </Routes>
        </main>

        <footer className="app-footer">
          Remote sensing for notheast india weather prediction · BCA Project
        </footer>
      </div>
    </BrowserRouter>
  );
}
