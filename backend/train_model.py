import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier, DecisionTreeRegressor
from sklearn.metrics import accuracy_score, mean_squared_error
from math import sqrt
import joblib
import os

# Load data
df = pd.read_csv("data/ne_weather_sample.csv")

features = ["temperature", "humidity", "rainfall_prev", "month"]
X = df[features]
y_class = df["rain"]
y_reg = df["rain_mm"]

# Data split (same indices for both models)
X_train, X_test, y_class_train, y_class_test, y_reg_train, y_reg_test = train_test_split(
    X, y_class, y_reg, test_size=0.25, random_state=42
)

# Classification model
class_model = DecisionTreeClassifier(max_depth=5)
class_model.fit(X_train, y_class_train)

y_class_pred = class_model.predict(X_test)
accuracy = accuracy_score(y_class_test, y_class_pred)
print(f"Classification accuracy: {accuracy * 100:.2f}%")

# Regression model
reg_model = DecisionTreeRegressor(max_depth=6)
reg_model.fit(X_train, y_reg_train)

y_reg_pred = reg_model.predict(X_test)
rmse = sqrt(mean_squared_error(y_reg_test, y_reg_pred))
print(f"Rain amount RMSE: {rmse:.2f} mm")

# Save models
os.makedirs("model", exist_ok=True)
joblib.dump(class_model, "model/rain_classifier.pkl")
joblib.dump(reg_model, "model/rain_regressor.pkl")

print("✔ Models saved successfully!")
