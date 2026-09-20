def test_create_screening(client, admin_token):
    headers = {"Authorization": f"Bearer {admin_token}"}
    
    # Create patient first
    patient_res = client.post("/patients/", json={
        "age_band": "60-70", "sex": "F", "village_code": "V002", "consent_flag": True
    }, headers=headers)
    patient_id = patient_res.json()["id"]
    
    # Create screening
    payload = {
        "patient_id": patient_id,
        "pain_score": 5,
        "stiffness_score": 2,
        "function_score": 10,
        "knee_angle_left": 45.0,
        "knee_angle_right": 45.0,
        "knee_rom_left": 120.0,
        "knee_rom_right": 120.0,
        "symmetry_index": 0.95,
        "cadence": 100.0,
        "step_time": 0.6
    }
    
    response = client.post("/screenings/", json=payload, headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["risk_level"] in ["Low", "Moderate", "High"]
    assert data["symmetry_index"] == 0.95

def test_update_followup(client, admin_token):
    headers = {"Authorization": f"Bearer {admin_token}"}
    
    # Create patient
    patient_res = client.post("/patients/", json={
        "age_band": "60-70", "sex": "F", "village_code": "V002", "consent_flag": True
    }, headers=headers)
    patient_id = patient_res.json()["id"]
    
    # Create screening
    scr_res = client.post("/screenings/", json={
        "patient_id": patient_id, "pain_score": 5, "stiffness_score": 2, "function_score": 10
    }, headers=headers)
    scr_id = scr_res.json()["id"]
    
    # Update followup
    patch_res = client.patch(f"/screenings/{scr_id}/followup", json={
        "followup_status": "referred",
        "followup_note": "Needs physio"
    }, headers=headers)
    
    assert patch_res.status_code == 200
    data = patch_res.json()
    assert data["followup_status"] == "referred"
    assert data["followup_note"] == "Needs physio"
