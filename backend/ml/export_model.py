import joblib
import json
import os

def export():
    # Load model
    model_path = os.path.join(os.path.dirname(__file__), 'model.pkl')
    try:
        pipeline = joblib.load(model_path)
    except FileNotFoundError:
        print(f"Model not found at {model_path}")
        return

    scaler = pipeline.named_steps['scaler']
    classifier = pipeline.named_steps['classifier']

    # Features order exactly as in train_model.py and ml_service.py
    features = [
        'pain_score',
        'stiffness_score',
        'function_score',
        'knee_angle_left',
        'knee_angle_right',
        'knee_rom_left',
        'knee_rom_right',
        'symmetry_index',
        'cadence',
        'step_time'
    ]

    model_data = {
        "features": features,
        "scaler": {
            "mean": scaler.mean_.tolist(),
            "scale": scaler.scale_.tolist()
        },
        "classifier": {
            "coef": classifier.coef_[0].tolist(),
            "intercept": float(classifier.intercept_[0]),
            "classes": classifier.classes_.tolist()
        },
        "thresholds": {
            "low_moderate": 0.4,
            "moderate_high": 0.7
        },
        "model_version": "v1.0-synthetic",
        "notice": "trained on synthetic sample data, not clinically validated"
    }

    # Save to frontend/public
    public_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../frontend/public'))
    os.makedirs(public_dir, exist_ok=True)
    out_path = os.path.join(public_dir, 'model.json')
    
    with open(out_path, 'w') as f:
        json.dump(model_data, f, indent=2)
        
    print(f"Model exported successfully to {out_path}")

if __name__ == "__main__":
    export()
