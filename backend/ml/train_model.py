import pandas as pd
import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
import joblib
import os

# "trained on synthetic sample data, not clinically validated"
print("WARNING: This model is trained on synthetic sample data, not clinically validated.")

# Synthetic Data Generation
np.random.seed(42)
n_samples = 500

# Features: pain_score, stiffness_score, function_score, knee_angle_left, knee_angle_right, knee_rom_left, knee_rom_right, symmetry_index, cadence, step_time
data = {
    'pain_score': np.random.randint(0, 11, n_samples),
    'stiffness_score': np.random.choice([1, 2], n_samples),
    'function_score': np.random.randint(0, 13, n_samples),
    'knee_angle_left': np.random.normal(10, 5, n_samples), # Avg flex
    'knee_angle_right': np.random.normal(10, 5, n_samples),
    'knee_rom_left': np.random.normal(120, 15, n_samples),
    'knee_rom_right': np.random.normal(120, 15, n_samples),
    'symmetry_index': np.random.normal(0.9, 0.1, n_samples),
    'cadence': np.random.normal(100, 15, n_samples),
    'step_time': np.random.normal(0.6, 0.1, n_samples)
}

df = pd.DataFrame(data)

# Synthetic Risk Target (0 = Low, 1 = Moderate/High)
# Higher pain, higher stiffness, lower ROM, lower cadence = higher risk
risk_score = (
    df['pain_score'] * 0.3 + 
    (df['stiffness_score'] - 1) * 2 + 
    df['function_score'] * 0.2 - 
    (df['knee_rom_left'] - 120) * 0.05 - 
    (df['cadence'] - 100) * 0.05
)

# Threshold for binary classification
df['target'] = (risk_score > np.percentile(risk_score, 60)).astype(int)

X = df.drop('target', axis=1)
y = df['target']

pipeline = Pipeline([
    ('scaler', StandardScaler()),
    ('classifier', LogisticRegression(class_weight='balanced'))
])

pipeline.fit(X, y)

os.makedirs('ml', exist_ok=True)
joblib.dump(pipeline, 'ml/model.pkl')

print("Model saved to ml/model.pkl successfully.")
