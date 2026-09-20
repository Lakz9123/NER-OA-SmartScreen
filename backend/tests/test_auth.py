def test_login(client, admin_token):
    # Test valid login
    response = client.post("/auth/login", data={"username": "testadmin", "password": "testadmin"})
    assert response.status_code == 200
    assert "access_token" in response.json()

def test_login_invalid(client):
    response = client.post("/auth/login", data={"username": "invalid", "password": "invalid"})
    assert response.status_code == 401
