import joblib
import pandas as pd
import numpy as np
import json
import os

def generate_test_cases():
    model_path = os.path.join(os.path.dirname(__file__), 'model.pkl')
    pipeline = joblib.load(model_path)
    
    # We want 5 sample inputs: at least 2 borderline (prob 0.35-0.75)
    # We'll generate a bunch and pick 5 that fit.
    
    np.random.seed(123)
    n_samples = 100
    data = {
        'pain_score': np.random.randint(0, 11, n_samples),
        'stiffness_score': np.random.choice([1, 2], n_samples),
        'function_score': np.random.randint(0, 13, n_samples),
        'knee_angle_left': np.random.normal(10, 5, n_samples),
        'knee_angle_right': np.random.normal(10, 5, n_samples),
        'knee_rom_left': np.random.normal(120, 15, n_samples),
        'knee_rom_right': np.random.normal(120, 15, n_samples),
        'symmetry_index': np.random.normal(0.9, 0.1, n_samples),
        'cadence': np.random.normal(100, 15, n_samples),
        'step_time': np.random.normal(0.6, 0.1, n_samples)
    }
    df = pd.DataFrame(data)
    
    probs = pipeline.predict_proba(df)[:, 1]
    logits = pipeline.decision_function(df)
    
    scaler = pipeline.named_steps['scaler']
    classifier = pipeline.named_steps['classifier']
    
    scaled_features = scaler.transform(df)
    
    # Select 2 borderline and 3 others
    borderline_idx = np.where((probs >= 0.35) & (probs <= 0.75))[0][:2]
    other_idx = np.where((probs < 0.35) | (probs > 0.75))[0][:3]
    
    selected_indices = list(borderline_idx) + list(other_idx)
    
    results = []
    for idx in selected_indices:
        p = probs[idx]
        if p < 0.4:
            level = "Low"
        elif p < 0.7:
            level = "Moderate"
        else:
            level = "High"
            
        contributions = (scaled_features[idx] * classifier.coef_[0]).tolist()
        
        results.append({
            "input": df.iloc[idx].to_dict(),
            "expected_score": float(p),
            "expected_logit": float(logits[idx]),
            "expected_contributions": contributions,
            "expected_level": level
        })
        
    print(json.dumps(results, indent=2))

if __name__ == "__main__":
    generate_test_cases()
