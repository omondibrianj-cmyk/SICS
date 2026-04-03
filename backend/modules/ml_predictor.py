import pickle
import numpy as np
import os

# Load the trained model and scaler
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_PATH = os.path.join(BASE_DIR, "ml", "risk_model.pkl")
SCALER_PATH = os.path.join(BASE_DIR, "ml", "scaler.pkl")

with open(MODEL_PATH, "rb") as f:
    model = pickle.load(f)

with open(SCALER_PATH, "rb") as f:
    scaler = pickle.load(f)


def predict_ml_risk(data: dict) -> float:
    """
    Predict ML risk probability for a landing site
    Returns probability between 0 and 1
    """
    features = np.array([[
        data.get("hygiene_score", 0),
        data.get("handling_score", 0),
        data.get("infra_score", 0),
        data.get("transport_score", 0),
        data.get("personnel_score", 0),
        data.get("records_score", 0),
        data.get("avg_temp_c", 0),
        1 if data.get("ice_ratio_ok", False) else 0,
        1 if data.get("temp_monitoring_records", False) else 0,
        data.get("historical_noncompliance_6m", 0),
        data.get("days_since_last_inspection", 0),
        data.get("boats_operating", 0),
    ]])

    # Scale features
    features_scaled = scaler.transform(features)

    # Get probability of high risk (class 1)
    probability = model.predict_proba(features_scaled)[0][1]

    return round(float(probability), 4)