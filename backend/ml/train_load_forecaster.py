"""
CampusOS AI - Scikit-learn Electrical Demand Forecaster Training Pipeline
Model: HistGradientBoostingRegressor
Features: Diurnal cycle, day of week, seasonal temperature, solar irradiance, occupancy density.
"""

import os
import json
import numpy as np
import pandas as pd
from sklearn.ensemble import HistGradientBoostingRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import root_mean_squared_error, mean_absolute_error, r2_score
import joblib

ML_DIR = os.path.dirname(os.path.abspath(__file__))

def generate_synthetic_timeseries(n_samples: int = 8760, random_state: int = 42) -> pd.DataFrame:
    """Generate 1 full academic year (8,760 hourly readings) of labeled campus telemetry."""
    np.random.seed(random_state)
    hours = np.arange(n_samples)

    hour_of_day = hours % 24
    day_of_week = (hours // 24) % 7
    is_weekend = (day_of_week >= 5).astype(int)

    # Ambient outdoor temperature (°C)
    seasonal_temp = 18.0 + 10.0 * np.sin(2 * np.pi * hours / 8760 - np.pi / 2)
    daily_temp = 5.0 * np.sin(2 * np.pi * (hour_of_day - 9) / 24)
    ambient_temp = seasonal_temp + daily_temp + np.random.normal(0, 1.2, n_samples)

    # Solar surface irradiance (W/m²)
    solar_irradiance = np.maximum(0, 800 * np.sin(np.pi * (hour_of_day - 6) / 12) + np.random.normal(0, 40, n_samples))
    solar_irradiance[hour_of_day < 6] = 0
    solar_irradiance[hour_of_day > 18] = 0

    # Campus occupancy (%)
    base_occ = np.where(is_weekend, 20.0, 75.0)
    hour_curve = np.maximum(0, np.sin(np.pi * (hour_of_day - 7) / 12))
    occupancy_pct = np.clip(base_occ * hour_curve + np.random.normal(0, 4.0, n_samples), 5, 100)

    # Physics-informed synthetic demand (kW)
    cooling_load = np.maximum(0, ambient_temp - 18.0) * 31.5
    occupancy_load = occupancy_pct * 4.9
    plug_and_base_load = 660.0
    noise = np.random.normal(0, 11.5, n_samples)
    target_kw = plug_and_base_load + cooling_load + occupancy_load + noise

    return pd.DataFrame({
        "hour_of_day": hour_of_day,
        "day_of_week": day_of_week,
        "is_weekend": is_weekend,
        "ambient_temp_c": np.round(ambient_temp, 2),
        "solar_irradiance_wm2": np.round(solar_irradiance, 1),
        "occupancy_pct": np.round(occupancy_pct, 1),
        "actual_demand_kw": np.round(target_kw, 2)
    })

def train_and_save():
    print(">>> Training Scikit-learn Campus Load Forecaster...")
    df = generate_synthetic_timeseries()
    
    feature_cols = ["hour_of_day", "day_of_week", "is_weekend", "ambient_temp_c", "solar_irradiance_wm2", "occupancy_pct"]
    X = df[feature_cols]
    y = df["actual_demand_kw"]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    model = HistGradientBoostingRegressor(
        max_iter=160,
        learning_rate=0.08,
        max_leaf_nodes=31,
        random_state=42
    )
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    rmse = float(root_mean_squared_error(y_test, y_pred))
    mae = float(mean_absolute_error(y_test, y_pred))
    r2 = float(r2_score(y_test, y_pred))

    model_path = os.path.join(ML_DIR, "load_forecaster.joblib")
    metrics_path = os.path.join(ML_DIR, "forecaster_metrics.json")

    joblib.dump(model, model_path)

    metrics = {
        "model_name": "Campus Grid Load Forecaster",
        "version": "v2.4.1",
        "algorithm": "HistGradientBoostingRegressor",
        "framework": "Scikit-learn 1.5.2",
        "training_samples": len(X_train),
        "test_samples": len(X_test),
        "rmse_kw": round(rmse, 2),
        "mae_kw": round(mae, 2),
        "r2_score": round(r2, 4),
        "feature_names": feature_cols,
        "features_count": len(feature_cols)
    }

    with open(metrics_path, "w") as f:
        json.dump(metrics, f, indent=2)

    print(f"✓ Trained successfully: RMSE={rmse:.2f} kW, MAE={mae:.2f} kW, R²={r2:.4f}")
    return metrics

if __name__ == "__main__":
    train_and_save()
