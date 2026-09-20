def test_login(client, admin_token):
    # Test valid login
    response = client.post("/auth/login", data={"username": "testadmin", "password": "testadmin"})
    assert response.status_code == 200
    assert "access_token" in response.json()

def test_login_invalid(client):
    response = client.post("/auth/login", data={"username": "invalid", "password": "invalid"})
    assert response.status_code == 401

def test_login_disabled(client, admin_token):
    headers = {"Authorization": f"Bearer {admin_token}"}
    # Create a user
    res = client.post("/admin/users", json={
        "username": "disableduser", "email": "d@x.com", "password": "pw", "role": "hw"
    }, headers=headers)
    user_id = res.json()["id"]
    
    # Login works
    login_res = client.post("/auth/login", data={"username": "disableduser", "password": "pw"})
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    
    # Disable user
    client.patch(f"/admin/users/{user_id}", json={"is_active": False}, headers=headers)
    
    # Login fails
    login_res2 = client.post("/auth/login", data={"username": "disableduser", "password": "pw"})
    assert login_res2.status_code == 403
    assert "Account disabled" in login_res2.json()["detail"]
    
    # Old token fails on a protected endpoint
    # Note: get_current_active_user is now on /sync/status for example
    sync_res = client.get("/sync/status", headers={"Authorization": f"Bearer {token}"})
    assert sync_res.status_code == 400
    assert "Inactive user" in sync_res.json()["detail"]
