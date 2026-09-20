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

# Synthetic Risk Target
# Combine all features to represent realistic risk factors
# Higher pain/stiffness/function, lower ROM, lower cadence, higher step time, lower symmetry = higher risk
raw_score = (
    df['pain_score'] * 0.3 + 
    (df['stiffness_score'] - 1) * 2 + 
    df['function_score'] * 0.2 - 
    (df['knee_rom_left'] - 120) * 0.02 - 
    (df['knee_rom_right'] - 120) * 0.02 +
    (10 - df['knee_angle_left']) * 0.05 +
    (10 - df['knee_angle_right']) * 0.05 -
    (df['symmetry_index'] - 0.9) * 10 -
    (df['cadence'] - 100) * 0.03 +
    (df['step_time'] - 0.6) * 5
)

# Standardize raw_score and apply sigmoid to get a true probability
mean_score = raw_score.mean()
std_score = raw_score.std()
scaled_score = (raw_score - mean_score) / (std_score + 1e-6)

# Shift and scale sigmoid to get a good spread
probabilities = 1 / (1 + np.exp(-scaled_score * 1.5))

# Sample the target label based on the probabilities to introduce realistic noise
df['target'] = np.random.binomial(1, probabilities)

X = df.drop('target', axis=1)
y = df['target']

pipeline = Pipeline([
    ('scaler', StandardScaler()),
    ('classifier', LogisticRegression(C=0.5, class_weight='balanced'))
])

pipeline.fit(X, y)

os.makedirs('ml', exist_ok=True)
joblib.dump(pipeline, 'ml/model.pkl')

print("Model saved to ml/model.pkl successfully.")

# Evaluate distribution on the synthetic data
predicted_probs = pipeline.predict_proba(X)[:, 1]
low = np.sum(predicted_probs < 0.4)
moderate = np.sum((predicted_probs >= 0.4) & (predicted_probs < 0.7))
high = np.sum(predicted_probs >= 0.7)

total = len(predicted_probs)
print("\nRisk Distribution on Synthetic Data:")
print(f"Low (<0.4):      {low} ({low/total*100:.1f}%)")
print(f"Moderate (0.4-0.7): {moderate} ({moderate/total*100:.1f}%)")
print(f"High (>=0.7):    {high} ({high/total*100:.1f}%)")
