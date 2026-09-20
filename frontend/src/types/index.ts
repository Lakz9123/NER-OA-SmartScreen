export interface Patient {
  id: string;
  age_band: string;
  sex: string;
  village_code: string;
  occupation_type?: string;
  consent_flag: boolean;
  registered_by_id?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Screening {
  id: string;
  patient_id: string;
  health_worker_id?: number;
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
  risk_level?: string;
  risk_score?: number;
  model_version?: string;
  explainability_data?: any;
  created_at?: string;
  is_synced?: boolean;
}

export interface RiskResult {
  risk_level: string;
  risk_score: number;
  model_version: string;
  explainability_data?: any;
}
