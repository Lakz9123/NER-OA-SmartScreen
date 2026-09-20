def test_create_screening(client, normal_user_token):
    headers = {"Authorization": f"Bearer {normal_user_token}"}
    
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

def test_update_followup(client, normal_user_token):
    headers = {"Authorization": f"Bearer {normal_user_token}"}
    
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

def test_update_followup_invalid_status(client, normal_user_token):
    headers = {"Authorization": f"Bearer {normal_user_token}"}
    # Create patient & screening
    p_res = client.post("/patients/", json={"age_band": "60-70", "sex": "F", "village_code": "V002", "consent_flag": True}, headers=headers)
    scr_res = client.post("/screenings/", json={"patient_id": p_res.json()["id"], "pain_score": 5, "stiffness_score": 2, "function_score": 10}, headers=headers)
    scr_id = scr_res.json()["id"]
    
    patch_res = client.patch(f"/screenings/{scr_id}/followup", json={"followup_status": "invalid"}, headers=headers)
    assert patch_res.status_code == 422

def test_update_followup_other_worker(client, normal_user_token, normal_user2_token):
    headers_normal = {"Authorization": f"Bearer {normal_user_token}"}
    headers_normal2 = {"Authorization": f"Bearer {normal_user2_token}"}
    
    # Worker 1 creates patient and screening
    p_res = client.post("/patients/", json={"age_band": "60-70", "sex": "F", "village_code": "V002", "consent_flag": True}, headers=headers_normal)
    scr_res = client.post("/screenings/", json={"patient_id": p_res.json()["id"], "pain_score": 5, "stiffness_score": 2, "function_score": 10}, headers=headers_normal)
    scr_id = scr_res.json()["id"]
    
    # Worker 2 tries to update follow-up
    patch_res = client.patch(f"/screenings/{scr_id}/followup", json={"followup_status": "completed"}, headers=headers_normal2)
    assert patch_res.status_code == 403

def test_audit_logs_no_health_data(client, normal_user_token, admin_token):
    headers_normal = {"Authorization": f"Bearer {normal_user_token}"}
    headers_admin = {"Authorization": f"Bearer {admin_token}"}
    
    p_res = client.post("/patients/", json={"age_band": "60-70", "sex": "F", "village_code": "V002", "consent_flag": True}, headers=headers_normal)
    p_id = p_res.json()["id"]
    
    scr_res = client.post("/screenings/", json={"patient_id": p_id, "pain_score": 9, "stiffness_score": 9, "function_score": 9}, headers=headers_normal)
    s_id = scr_res.json()["id"]
    
    logs_res = client.get("/admin/audit-logs", headers=headers_admin)
    assert logs_res.status_code == 200
    logs = logs_res.json()["items"]
    
    # Check patient creation log
    patient_logs = [l for l in logs if l["action"] == "create" and l["entity_type"] == "patient" and l["entity_id"] == p_id]
    assert len(patient_logs) > 0
    # Check screening creation log
    screening_logs = [l for l in logs if l["action"] == "create" and l["entity_type"] == "screening" and l["entity_id"] == s_id]
    assert len(screening_logs) > 0
    
    # Verify no health data in the whole response
    logs_str = str(logs)
    assert "pain_score" not in logs_str
    assert "sex" not in logs_str
    assert "consent_flag" not in logs_str

def test_read_all_screenings_admin(client, normal_user_token, normal_user2_token, admin_token):
    headers_normal = {"Authorization": f"Bearer {normal_user_token}"}
    headers_normal2 = {"Authorization": f"Bearer {normal_user2_token}"}
    headers_admin = {"Authorization": f"Bearer {admin_token}"}

    # Worker 1 creates patient and screening
    p1 = client.post("/patients/", json={"age_band": "60-70", "sex": "F", "village_code": "V002", "consent_flag": True}, headers=headers_normal).json()["id"]
    s1 = client.post("/screenings/", json={"patient_id": p1, "pain_score": 5, "stiffness_score": 2, "function_score": 10}, headers=headers_normal).json()["id"]

    # Worker 2 creates patient and screening
    p2 = client.post("/patients/", json={"age_band": "60-70", "sex": "F", "village_code": "V002", "consent_flag": True}, headers=headers_normal2).json()["id"]
    s2 = client.post("/screenings/", json={"patient_id": p2, "pain_score": 5, "stiffness_score": 2, "function_score": 10}, headers=headers_normal2).json()["id"]

    # Admin reads all
    res = client.get("/screenings/", headers=headers_admin)
    assert res.status_code == 200
    ids = [s["id"] for s in res.json()]
    assert s1 in ids
    assert s2 in ids

def test_read_all_screenings_health_worker(client, normal_user_token, normal_user2_token):
    headers_normal = {"Authorization": f"Bearer {normal_user_token}"}
    headers_normal2 = {"Authorization": f"Bearer {normal_user2_token}"}

    # Worker 1 creates patient and screening
    p1 = client.post("/patients/", json={"age_band": "60-70", "sex": "F", "village_code": "V002", "consent_flag": True}, headers=headers_normal).json()["id"]
    s1 = client.post("/screenings/", json={"patient_id": p1, "pain_score": 5, "stiffness_score": 2, "function_score": 10}, headers=headers_normal).json()["id"]

    # Worker 2 creates patient and screening
    p2 = client.post("/patients/", json={"age_band": "60-70", "sex": "F", "village_code": "V002", "consent_flag": True}, headers=headers_normal2).json()["id"]
    s2 = client.post("/screenings/", json={"patient_id": p2, "pain_score": 5, "stiffness_score": 2, "function_score": 10}, headers=headers_normal2).json()["id"]

    # Worker 1 reads all
    res = client.get("/screenings/", headers=headers_normal)
    assert res.status_code == 200
    ids = [s["id"] for s in res.json()]
    assert s1 in ids
    assert s2 not in ids # Should not see worker 2's screening
