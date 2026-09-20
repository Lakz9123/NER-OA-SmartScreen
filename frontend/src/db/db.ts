import Dexie, { type Table } from 'dexie';

export interface PatientRecord {
  id: string; // client-generated UUID
  age_band: string;
  sex: string;
  village_code: string;
  consent_flag: boolean;
  sync_status: 'pending' | 'syncing' | 'synced' | 'failed';
  created_at: string;
}

export interface ScreeningRecord {
  id: string; // client-generated UUID
  patient_id: string;
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
  risk_score: number;
  risk_level: string;
  top_factors?: Record<string, number>;
  sync_status: 'pending' | 'syncing' | 'synced' | 'failed';
  created_at: string;
}

export interface OutboxRecord {
  id: string; // client-generated UUID
  type: 'PatientSync' | 'ScreeningSync';
  payload: any;
  status: 'pending' | 'syncing' | 'failed';
  created_at: string;
}

export class SmartScreenDB extends Dexie {
  patients!: Table<PatientRecord, string>;
  screenings!: Table<ScreeningRecord, string>;
  outbox!: Table<OutboxRecord, string>;

  constructor() {
    super('SmartScreenDB');
    this.version(1).stores({
      patients: 'id, village_code, sync_status, created_at',
      screenings: 'id, patient_id, sync_status, created_at',
      outbox: 'id, type, status, created_at'
    });
  }
}

export const db = new SmartScreenDB();
