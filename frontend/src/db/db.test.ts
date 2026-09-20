import { describe, it, expect, beforeEach } from 'vitest';
import 'fake-indexeddb/auto';
import { db } from './db';

describe('Local Database (Dexie)', () => {
  beforeEach(async () => {
    // Clear all tables before each test
    await db.patients.clear();
    await db.screenings.clear();
    await db.outbox.clear();
  });

  it('should store and retrieve a patient record', async () => {
    const patientId = 'test-patient-id';
    const patient = {
      id: patientId,
      age_band: '50-59',
      sex: 'female',
      village_code: 'VIL123',
      consent_flag: true,
      sync_status: 'pending' as const,
      created_at: new Date().toISOString()
    };

    await db.patients.add(patient);
    const retrieved = await db.patients.get(patientId);

    expect(retrieved).toBeDefined();
    expect(retrieved?.id).toBe(patientId);
    expect(retrieved?.village_code).toBe('VIL123');
  });

  it('should store and retrieve an outbox record', async () => {
    const outboxId = 'test-outbox-id';
    const record = {
      id: outboxId,
      type: 'PatientSync' as const,
      payload: { foo: 'bar' },
      status: 'pending' as const,
      created_at: new Date().toISOString()
    };

    await db.outbox.add(record);
    const retrieved = await db.outbox.get(outboxId);

    expect(retrieved).toBeDefined();
    expect(retrieved?.type).toBe('PatientSync');
    expect(retrieved?.status).toBe('pending');
  });

  it('should store and retrieve a screening record', async () => {
    const screeningId = 'test-screening-id';
    const screening = {
      id: screeningId,
      patient_id: 'test-patient-id',
      pain_score: 5,
      stiffness_score: 3,
      function_score: 10,
      risk_score: 0.8,
      risk_level: 'High',
      sync_status: 'pending' as const,
      created_at: new Date().toISOString()
    };

    await db.screenings.add(screening);
    const retrieved = await db.screenings.get(screeningId);

    expect(retrieved).toBeDefined();
    expect(retrieved?.risk_level).toBe('High');
    expect(retrieved?.risk_score).toBe(0.8);
  });
});
