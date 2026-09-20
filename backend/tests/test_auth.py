def test_login(client, admin_token):
    # Test valid login
    response = client.post("/auth/login", data={"username": "testadmin", "password": "testadmin"})
    assert response.status_code == 200
    assert "access_token" in response.json()

def test_login_invalid(client, db_session):
    from app.models.audit_log import AuditLog
    response = client.post("/auth/login", data={"username": "invalid_test", "password": "invalid"})
    assert response.status_code == 401
    
    # Check that audit log contains hashed username, not raw
    import hashlib
    expected_hash = hashlib.sha256(b"invalid_test").hexdigest()[:12]
    log = db_session.query(AuditLog).filter(AuditLog.action == "login_failed").order_by(AuditLog.timestamp.desc()).first()
    assert log is not None
    assert log.entity_id == expected_hash
    assert log.entity_id != "invalid_test"

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
