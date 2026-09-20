from fastapi.testclient import TestClient

def test_admin_analytics_403(client: TestClient, normal_user_token):
    headers = {"Authorization": f"Bearer {normal_user_token}"}
    response = client.get("/admin/analytics/summary", headers=headers)
    assert response.status_code == 403
    response2 = client.get("/admin/audit-logs", headers=headers)
    assert response2.status_code == 403
    response3 = client.get("/admin/users", headers=headers)
    assert response3.status_code == 403

def test_admin_analytics_success(client: TestClient, admin_token):
    headers = {"Authorization": f"Bearer {admin_token}"}
    response = client.get("/admin/analytics/summary", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert "total_screenings" in data
    assert "referrals" in data

def test_admin_audit_logs_success(client: TestClient, admin_token):
    headers = {"Authorization": f"Bearer {admin_token}"}
    response = client.get("/admin/audit-logs", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert "total" in data

def test_admin_create_user(client: TestClient, admin_token):
    headers = {"Authorization": f"Bearer {admin_token}"}
    response = client.post("/admin/users", json={
        "username": "new_admin_worker",
        "email": "new_admin@test.com",
        "password": "testpassword",
        "full_name": "Test User",
        "role": "health_worker",
        "facility": "Test Facility"
    }, headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == "new_admin_worker"
    assert data["facility"] == "Test Facility"
    assert "password" not in data
    assert "hashed_password" not in data

def test_admin_disable_self(client: TestClient, admin_token):
    headers = {"Authorization": f"Bearer {admin_token}"}
    # First get self
    me_resp = client.get("/auth/me", headers=headers)
    admin_id = me_resp.json()["id"]
    
    # Try to disable
    patch_resp = client.patch(f"/admin/users/{admin_id}", json={"is_active": False}, headers=headers)
    assert patch_resp.status_code == 400
    assert "Cannot disable own account" in patch_resp.json()["detail"]
    
    # Try to remove role
    patch_resp2 = client.patch(f"/admin/users/{admin_id}", json={"role": "hw"}, headers=headers)
    assert patch_resp2.status_code == 400
    assert "Cannot remove own admin role" in patch_resp2.json()["detail"]

def test_admin_analytics_counts(client: TestClient, admin_token):
    headers = {"Authorization": f"Bearer {admin_token}"}
    
    # Create patient and screening
    p_res = client.post("/patients/", json={
        "age_band": "60-70", "sex": "F", "village_code": "V999", "consent_flag": True
    }, headers=headers)
    assert p_res.status_code == 200
    
    client.post("/screenings/", json={
        "patient_id": p_res.json()["id"], "pain_score": 5, "stiffness_score": 2, "function_score": 10
    }, headers=headers)
    
    res = client.get("/admin/analytics/summary", headers=headers)
    data = res.json()
    assert data["total_screenings"] >= 1
    assert data["screenings_by_village"]["V999"] >= 1
