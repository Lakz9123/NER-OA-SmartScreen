export interface RiskModelData {
  features: string[];
  scaler: {
    mean: number[];
    scale: number[];
  };
  classifier: {
    coef: number[];
    intercept: number;
    classes: number[];
  };
  thresholds: {
    low_moderate: number;
    moderate_high: number;
  };
  model_version: string;
  notice: string;
}

export interface RiskInput {
  pain_score: number;
  stiffness_score: number;
  function_score: number;
  knee_angle_left?: number;
  knee_angle_right?: number;
  knee_rom_left?: number;
  knee_rom_right?: number;
  symmetry_index?: number;
  cadence?: number;
  step_time?: number;
}

export interface RiskResult {
  risk_level: string;
  risk_score: number;
  model_version: string;
  explainability_data: {
    warning: string;
    top_factors: Record<string, number>;
  };
  debug?: {
    logit: number;
    contributions: number[];
  };
}

let cachedModel: RiskModelData | null = null;

export async function loadModel(): Promise<RiskModelData> {
  if (cachedModel) return cachedModel;
  try {
    const res = await fetch('/model.json');
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    cachedModel = await res.json();
    return cachedModel as RiskModelData;
  } catch (error) {
    console.error("Failed to load model.json", error);
    throw error;
  }
}

export function computeRisk(data: RiskInput, model: RiskModelData): RiskResult {
  // Apply defaults identical to ml_service.py
  const inputFeatures: Record<string, number> = {
    pain_score: data.pain_score,
    stiffness_score: data.stiffness_score,
    function_score: data.function_score,
    knee_angle_left: data.knee_angle_left ?? 10.0,
    knee_angle_right: data.knee_angle_right ?? 10.0,
    knee_rom_left: data.knee_rom_left ?? 120.0,
    knee_rom_right: data.knee_rom_right ?? 120.0,
    symmetry_index: data.symmetry_index ?? 0.9,
    cadence: data.cadence ?? 100.0,
    step_time: data.step_time ?? 0.6
  };

  // Convert to array in exact order
  const featureArray = model.features.map(f => inputFeatures[f]);

  // StandardScaler: (x - mean) / scale
  const scaledFeatures = featureArray.map((val, i) => {
    return (val - model.scaler.mean[i]) / model.scaler.scale[i];
  });

  // Logistic Regression dot product
  let logit = model.classifier.intercept;
  for (let i = 0; i < scaledFeatures.length; i++) {
    logit += scaledFeatures[i] * model.classifier.coef[i];
  }

  // Sigmoid function for probability
  const prob = 1 / (1 + Math.exp(-logit));

  let risk_level = "Low";
  if (prob >= model.thresholds.moderate_high) {
    risk_level = "High";
  } else if (prob >= model.thresholds.low_moderate) {
    risk_level = "Moderate";
  }

  // Explainability: coefficient * scaled_value
  const impact = scaledFeatures.map((val, i) => val * model.classifier.coef[i]);
  
  // Sort and get top 3 positive contributors
  const impactObjs = model.features.map((feature, i) => ({
    feature,
    value: impact[i]
  }));
  
  impactObjs.sort((a, b) => b.value - a.value);
  const topFactors = impactObjs.slice(0, 3).filter(obj => obj.value > 0);

  const top_factors_dict: Record<string, number> = {};
  for (const factor of topFactors) {
    top_factors_dict[factor.feature] = factor.value;
  }

  return {
    risk_level,
    risk_score: prob,
    model_version: model.model_version,
    explainability_data: {
      warning: model.notice,
      top_factors: top_factors_dict
    },
    debug: {
      logit,
      contributions: impact
    }
  };
}

export async function analyzeRisk(data: RiskInput): Promise<RiskResult> {
  const model = await loadModel();
  return computeRisk(data, model);
}
