def test_create_patient(client, admin_token):
    headers = {"Authorization": f"Bearer {admin_token}"}
    payload = {
        "age_band": "40-50",
        "sex": "M",
        "village_code": "V001",
        "consent_flag": True
    }
    response = client.post("/patients/", json=payload, headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["sex"] == "M"
    assert "id" in data
