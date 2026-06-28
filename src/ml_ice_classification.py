"""
ml_ice_classification.py
========================
Machine Learning architecture for classifying Subsurface Ice Probability
at the Chandrayaan-3 Shiv Shakti Point (Lunar South Pole).

This script uses a Random Forest Classifier trained on simulated DFSAR
L-band and S-band parameters (CPR, DOP), along with thermophysical
data (Surface Temp) and topographical data (Slope, Roughness) to
predict the probability of ice deposits.
"""

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score
import json

def generate_synthetic_training_data(n_samples=5000):
    """Generates synthetic dataset mimicking DFSAR polarimetry for training."""
    np.random.seed(42)
    
    # Feature generation
    cpr = np.random.uniform(0.1, 1.2, n_samples)
    dop = np.random.uniform(0.2, 0.9, n_samples)
    temp_k = np.random.uniform(40, 250, n_samples)
    slope_deg = np.random.uniform(0, 30, n_samples)
    roughness = np.random.uniform(0.01, 0.15, n_samples)
    
    # Logic for ground truth 'Ice Presence'
    # High CPR (>0.8) + Low DOP (<0.5) + Temp (< 110K) -> High likelihood of ice
    ice_condition = (cpr > 0.75) & (dop < 0.55) & (temp_k < 120) & (slope_deg < 15)
    
    # Introduce some noise (5% random flip)
    noise = np.random.random(n_samples) < 0.05
    labels = np.logical_xor(ice_condition, noise).astype(int)
    
    df = pd.DataFrame({
        'cpr': cpr,
        'dop': dop,
        'temperature_k': temp_k,
        'slope_deg': slope_deg,
        'roughness': roughness,
        'ice_present': labels
    })
    return df

def train_ice_classifier():
    """Trains the Random Forest model and returns the pipeline."""
    print("Generating synthetic L-band DFSAR training data...")
    df = generate_synthetic_training_data()
    
    X = df[['cpr', 'dop', 'temperature_k', 'slope_deg', 'roughness']]
    y = df['ice_present']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    print("Training Random Forest Classifier...")
    model = RandomForestClassifier(n_estimators=100, max_depth=8, random_state=42)
    model.fit(X_train, y_train)
    
    # Evaluate
    predictions = model.predict(X_test)
    accuracy = accuracy_score(y_test, predictions)
    print(f"Model Accuracy: {accuracy:.2%}")
    print("\nClassification Report:")
    print(classification_report(y_test, predictions))
    
    return model

def predict_current_telemetry(model, telemetry):
    """Infers ice probability from live telemetry data."""
    X_live = pd.DataFrame([telemetry])
    probability = model.predict_proba(X_live)[0][1] # Probability of class 1 (Ice)
    return probability

if __name__ == "__main__":
    # Train the model
    rf_model = train_ice_classifier()
    
    # Simulate a live reading exactly at Shiv Shakti Point (PSR crater edge)
    live_data = {
        'cpr': 0.88,
        'dop': 0.42,
        'temperature_k': 95.0, # Deep shadow
        'slope_deg': 8.5,
        'roughness': 0.04
    }
    
    ice_prob = predict_current_telemetry(rf_model, live_data)
    
    output = {
        "status": "success",
        "model": "RandomForestClassifier",
        "live_telemetry": live_data,
        "ice_probability_percent": round(ice_prob * 100, 2),
        "confidence": "High" if ice_prob > 0.8 else "Medium"
    }
    
    print("\n[LIVE INFERENCE RESULT]")
    print(json.dumps(output, indent=2))
