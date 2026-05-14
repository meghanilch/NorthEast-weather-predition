import axios from "axios";

const API_BASE = "http://127.0.0.1:8000";

export async function getStates() {
  const res = await axios.get(`${API_BASE}/api/states`);
  return res.data.states;
}

export async function getHistory(state) {
  const res = await axios.get(`${API_BASE}/api/history/${state}`);
  return res.data.history || [];
}

export async function getForecast(state) {
  const res = await axios.get(`${API_BASE}/api/forecast/${state}`);
  return res.data.forecast || [];
}
