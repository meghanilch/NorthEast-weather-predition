from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import joblib
import numpy as np
import requests
from datetime import datetime, timedelta

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

df = pd.read_csv("data/ne_weather_sample.csv")
states = sorted(df["state"].unique().tolist())

class_model = joblib.load("model/rain_classifier.pkl")
reg_model = joblib.load("model/rain_regressor.pkl")


@app.get("/api/states")
def get_states():
    return {"states": states}


@app.get("/api/history/{state}")
def history(state: str):
    data = df[df["state"] == state][["date", "rain_mm"]]
    return {"history": data.to_dict(orient="records")}


@app.post("/api/predict")
async def predict(payload: dict):
    state = payload["state"]
    features = np.array([[payload["temperature"], payload["humidity"], payload["rainfall_prev"], payload["month"]]])

    rain_class = class_model.predict(features)[0]
    rain_amount = reg_model.predict(features)[0]

    return {
        "state": state,
        "prediction": "Rain" if rain_class == 1 else "No Rain",
        "rain_mm": round(rain_amount, 2),
    }


# ⛈️ NEW — 7-DAY FORECAST API
@app.get("/api/forecast/{state}")
def forecast_7days(state: str):

    coord = df[df["state"] == state].iloc[0]
    lat = coord.get("lat", None)
    lon = coord.get("lon", None)

    # Get coordinates from default table
    for row in [
        {"state": "Assam", "lat": 26.2006, "lon": 92.9376},
        {"state": "Tripura", "lat": 23.9408, "lon": 91.9882},
        {"state": "Manipur", "lat": 24.6637, "lon": 93.9063},
        {"state": "Mizoram", "lat": 23.1645, "lon": 92.9376},
        {"state": "Nagaland", "lat": 26.1584, "lon": 94.5624},
        {"state": "Meghalaya", "lat": 25.4670, "lon": 91.3662},
        {"state": "Arunachal Pradesh", "lat": 28.2180, "lon": 94.7278},
    ]:
        if row["state"] == state:
            lat = row["lat"]
            lon = row["lon"]

    url = (
        "https://api.open-meteo.com/v1/forecast"
        f"?latitude={lat}&longitude={lon}"
        "&daily=temperature_2m_max,precipitation_sum"
        "&forecast_days=7"
        "&timezone=auto"
    )

    r = requests.get(url)
    r.raise_for_status()

    data = r.json()["daily"]

    results = []
    for i, dt in enumerate(data["time"]):
        temp = data["temperature_2m_max"][i]
        rain_prev = data["precipitation_sum"][max(i - 1, 0)]
        month = int(dt.split("-")[1])

        features = np.array([[temp, 75, rain_prev, month]])

        rain_class = class_model.predict(features)[0]
        rain_amount = reg_model.predict(features)[0]

        results.append({
            "date": dt,
            "prediction": "Rain" if rain_class == 1 else "No Rain",
            "rain_mm": round(rain_amount, 2)
        })

    return {"state": state, "forecast": results}
