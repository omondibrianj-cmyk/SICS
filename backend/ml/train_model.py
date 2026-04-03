import pandas as pd
import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, classification_report
import pickle
import os

# Generate synthetic training data
# Based on your dissertation's input variables
np.random.seed(42)
n_samples = 500

data = {
    "hygiene_score": np.random.uniform(1, 10, n_samples),
    "handling_score": np.random.uniform(1, 10, n_samples),
    "infra_score": np.random.uniform(1, 10, n_samples),
    "transport_score": np.random.uniform(1, 10, n_samples),
    "personnel_score": np.random.uniform(1, 10, n_samples),
    "records_score": np.random.uniform(1, 10, n_samples),
    "avg_temp_c": np.random.uniform(0, 15, n_samples),
    "ice_ratio_ok": np.random.randint(0, 2, n_samples),
    "temp_monitoring_records": np.random.randint(0, 2, n_samples),
    "historical_noncompliance_6m": np.random.randint(0, 10, n_samples),
    "days_since_last_inspection": np.random.randint(1, 365, n_samples),
    "boats_operating": np.random.randint(1, 50, n_samples),
}

df = pd.DataFrame(data)

# Create target variable (1 = High Risk, 0 = Not High Risk)
# Based on dissertation risk logic
df["risk_class"] = (
    (df["hygiene_score"] < 5) |
    (df["handling_score"] < 5) |
    (df["historical_noncompliance_6m"] > 5) |
    (df["ice_ratio_ok"] == 0)
).astype(int)

# Features and target
X = df.drop("risk_class", axis=1)
y = df["risk_class"]

# Split data
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Scale features
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# Train Logistic Regression model
model = LogisticRegression(random_state=42)
model.fit(X_train_scaled, y_train)

# Evaluate model
y_pred = model.predict(X_test_scaled)
accuracy = accuracy_score(y_test, y_pred)
print(f"Model Accuracy: {accuracy:.2f}")
print("\nClassification Report:")
print(classification_report(y_test, y_pred))

# Save model and scaler
os.makedirs("ml", exist_ok=True)
with open("ml/risk_model.pkl", "wb") as f:
    pickle.dump(model, f)

with open("ml/scaler.pkl", "wb") as f:
    pickle.dump(scaler, f)

print("\nModel saved successfully to ml/risk_model.pkl")
print("Scaler saved successfully to ml/scaler.pkl")