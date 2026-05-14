import requests
import pandas as pd
import os
from datetime import datetime

DATA_DIR = "data"
os.makedirs(DATA_DIR, exist_ok=True)
OUT_PATH = os.path.join(DATA_DIR, "ne_weather_sample.csv")

NE_STATES = [
    {"state": "Assam", "lat": 26.2006, "lon": 92.9376},
    {"state": "Tripura", "lat": 23.9408, "lon": 91.9882},
    {"state": "Manipur", "lat": 24.6637, "lon": 93.9063},
    {"state": "Mizoram", "lat": 23.1645, "lon": 92.9376},
    {"state": "Nagaland", "lat": 26.1584, "lon": 94.5624},
    {"state": "Meghalaya", "lat": 25.4670, "lon": 91.3662},
    {"state": "Arunachal Pradesh", "lat": 28.2180, "lon": 94.7278},
]

# FIXED DATE RANGE (valid historical archive)
start_date = "2025-09-01"
end_date = "2025-11-24"

print(f"\n📅 Fetching weather from: {start_date} → {end_date}")

all_rows = []

for info in NE_STATES:
    state = info["state"]
    lat = info["lat"]
    lon = info["lon"]

    print(f"\n⏳ Loading {state} weather...")

    url = (
        "https://archive-api.open-meteo.com/v1/archive"
        f"?latitude={lat}&longitude={lon}"
        f"&start_date={start_date}&end_date={end_date}"
        "&daily=temperature_2m_mean,precipitation_sum"
        "&timezone=auto"
    )

    try:
        r = requests.get(url, timeout=60)
        r.raise_for_status()
    except Exception as e:
        print(f"⚠ API ERROR {state}: {e}")
        continue

    data = r.json()

    if "daily" not in data:
        print(f"⚠ No daily records for {state}")
        continue

    rows = data["daily"]
    for i, d in enumerate(rows["time"]):
        all_rows.append({
            "state": state,
            "date": d,
            "temperature": rows["temperature_2m_mean"][i],
            "humidity": 75,  # Default simulated humidity ✔
            "rain_mm": rows["precipitation_sum"][i],
        })

df = pd.DataFrame(all_rows)
df["date"] = pd.to_datetime(df["date"])
df["month"] = df["date"].dt.month

df = df.sort_values(["state", "date"])
df["rainfall_prev"] = df.groupby("state")["rain_mm"].shift(1).fillna(0.0)
df["rain"] = (df["rain_mm"] > 0.2).astype(int)

df.to_csv(OUT_PATH, index=False)

print(f"\n🎯 Data saved to: {OUT_PATH}")
print(df.tail())
print("\nColumns:", df.columns)
print(f"✔ Fetch complete! Total columns: {len(df.columns)}")
