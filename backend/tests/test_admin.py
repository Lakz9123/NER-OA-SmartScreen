from fastapi.testclient import TestClient

def test_admin_analytics_403(client: TestClient, normal_user_token):
    headers = {"Authorization": f"Bearer {normal_user_token}"}
    response = client.get("/admin/analytics/summary", headers=headers)
    assert response.status_code == 403

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
