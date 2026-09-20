import joblib
import pandas as pd
import numpy as np
import os
from ..schemas.screening import ScreeningCreate

MODEL_PATH = os.path.join(os.path.dirname(__file__), '../../ml/model.pkl')
try:
    model_pipeline = joblib.load(MODEL_PATH)
except FileNotFoundError:
    model_pipeline = None

# "trained on synthetic sample data, not clinically validated"

def analyze_risk(data: ScreeningCreate) -> dict:
    if model_pipeline is None:
        # Fallback if no model is generated yet
        return {
            "risk_level": "Moderate",
            "risk_score": 0.5,
            "model_version": "fallback-v0.1",
            "explainability_data": {"note": "Model not found. Fallback used."}
        }
    
    # Feature array matches training:
    # pain_score, stiffness_score, function_score, knee_angle_left, knee_angle_right, knee_rom_left, knee_rom_right, symmetry_index, cadence, step_time
    features = {
        'pain_score': [data.pain_score],
        'stiffness_score': [data.stiffness_score],
        'function_score': [data.function_score],
        'knee_angle_left': [data.knee_angle_left or 10.0],
        'knee_angle_right': [data.knee_angle_right or 10.0],
        'knee_rom_left': [data.knee_rom_left or 120.0],
        'knee_rom_right': [data.knee_rom_right or 120.0],
        'symmetry_index': [data.symmetry_index or 0.9],
        'cadence': [data.cadence or 100.0],
        'step_time': [data.step_time or 0.6]
    }
    
    df = pd.DataFrame(features)
    
    # Probability of class 1 (High/Moderate risk)
    risk_score = float(model_pipeline.predict_proba(df)[0][1])
    
    if risk_score < 0.4:
        risk_level = "Low"
    elif risk_score < 0.7:
        risk_level = "Moderate"
    else:
        risk_level = "High"
        
    # Extract coefficients for explainability
    classifier = model_pipeline.named_steps['classifier']
    scaler = model_pipeline.named_steps['scaler']
    
    feature_names = df.columns
    coefs = classifier.coef_[0]
    scaled_input = scaler.transform(df)[0]
    
    # Impact = coefficient * scaled_value
    impact = coefs * scaled_input
    
    explainability_data = {
        "warning": "trained on synthetic sample data, not clinically validated",
        "top_factors": []
    }
    
    # Get top 3 factors driving the risk up
    impact_series = pd.Series(impact, index=feature_names)
    top_factors = impact_series.sort_values(ascending=False).head(3)
    
    for feature, value in top_factors.items():
        if value > 0:
            explainability_data["top_factors"].append({
                "feature": feature,
                "contribution": float(value)
            })
            
    return {
        "risk_level": risk_level,
        "risk_score": risk_score,
        "model_version": "v1.0-synthetic",
        "explainability_data": explainability_data
    }
