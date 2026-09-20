def test_sync_unauthenticated(client):
    response = client.post("/sync/batch", json={"patients": [], "screenings": []})
    assert response.status_code == 401

def test_sync_new_records_and_duplicates(client, normal_user_token):
    headers = {"Authorization": f"Bearer {normal_user_token}"}
    payload = {
        "patients": [
            {
                "id": "pat-1",
                "age_band": "50-59",
                "sex": "female",
                "village_code": "V01",
                "occupation_type": "agriculture",
                "consent_flag": True,
                "created_at": "2023-10-01T10:00:00Z"
            }
        ],
        "screenings": [
            {
                "id": "scr-1",
                "patient_id": "pat-1",
                "pain_score": 5,
                "stiffness_score": 5,
                "function_score": 5,
                "knee_angle_left": 10.0,
                "knee_angle_right": 10.0,
                "knee_rom_left": 120.0,
                "knee_rom_right": 120.0,
                "symmetry_index": 0.9,
                "cadence": 100.0,
                "step_time": 0.6,
                "risk_level": "Low", # Client sent this
                "risk_score": 0.1,
                "model_version": "v1.0-client",
                "created_at": "2023-10-01T10:05:00Z"
            }
        ]
    }
    
    # First sync: should create new records
    response = client.post("/sync/batch", json=payload, headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["synced_patients"] == 1
    assert data["synced_screenings"] == 1
    
    pat_res = next(r for r in data["results"] if r["type"] == "patient")
    assert pat_res["status"] == "created"
    
    scr_res = next(r for r in data["results"] if r["type"] == "screening")
    assert scr_res["status"] == "created"
    assert scr_res["server_risk_level"] is not None
    assert scr_res["server_risk_score"] is not None
    
    # Second sync: should be duplicates
    response2 = client.post("/sync/batch", json=payload, headers=headers)
    assert response2.status_code == 200
    data2 = response2.json()
    assert data2["synced_patients"] == 0
    assert data2["synced_screenings"] == 0
    
    pat_res2 = next(r for r in data2["results"] if r["type"] == "patient")
    assert pat_res2["status"] == "already_synced"
    
def test_sync_unknown_patient(client, normal_user_token):
    headers = {"Authorization": f"Bearer {normal_user_token}"}
    payload = {
        "patients": [],
        "screenings": [
            {
                "id": "scr-unknown",
                "patient_id": "pat-unknown",
                "pain_score": 5,
                "stiffness_score": 5,
                "function_score": 5,
                "risk_level": "Low",
                "risk_score": 0.1,
                "model_version": "v1.0-client",
                "created_at": "2023-10-01T10:05:00Z"
            }
        ]
    }
    response = client.post("/sync/batch", json=payload, headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["synced_screenings"] == 0
    
    scr_res = next(r for r in data["results"] if r["type"] == "screening")
    assert scr_res["status"] == "failed"
    assert "Patient not found" in scr_res["reason"]

def test_sync_status(client, normal_user_token):
    headers = {"Authorization": f"Bearer {normal_user_token}"}
    response = client.get("/sync/status", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert "total_patients" in data
    assert "total_screenings" in data

def test_sync_created_at_and_risk_override(client, normal_user_token, db_session):
    from app.models.patient import Patient
    from app.models.screening import Screening
    import datetime

    headers = {"Authorization": f"Bearer {normal_user_token}"}
    payload = {
        "patients": [
            {
                "id": "pat-override",
                "age_band": "50-59",
                "sex": "female",
                "village_code": "V01",
                "consent_flag": True,
                "created_at": "2023-10-01T10:00:00Z"
            }
        ],
        "screenings": [
            {
                "id": "scr-override",
                "patient_id": "pat-override",
                "pain_score": 10, # Very high pain
                "stiffness_score": 2, # High stiffness
                "function_score": 10, # High difficulty
                "knee_angle_left": 15.0,
                "knee_angle_right": 15.0,
                "knee_rom_left": 90.0,
                "knee_rom_right": 90.0,
                "symmetry_index": 0.8,
                "cadence": 80.0,
                "step_time": 0.8,
                "risk_level": "Low", # Intentionally wrong to test override
                "risk_score": 0.1,   # Intentionally wrong
                "model_version": "v1.0-client",
                "created_at": "2023-10-01T10:05:00Z"
            }
        ]
    }
    
    response = client.post("/sync/batch", json=payload, headers=headers)
    assert response.status_code == 200
    
    # Check DB for created_at parsing
    pat = db_session.query(Patient).filter(Patient.id == "pat-override").first()
    assert pat.created_at.year == 2023
    assert pat.created_at.month == 10
    
    scr = db_session.query(Screening).filter(Screening.id == "scr-override").first()
    assert scr.created_at.year == 2023
    assert scr.created_at.minute == 5
    
    # Check that server risk level overrides the client's "Low"
    assert scr.risk_level != "Low"
    assert scr.risk_score != 0.1
