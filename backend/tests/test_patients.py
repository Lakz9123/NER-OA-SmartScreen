def test_create_patient(client, normal_user_token):
    headers = {"Authorization": f"Bearer {normal_user_token}"}
    response = client.post(
        "/patients/",
        json={
            "age_band": "50-60",
            "sex": "M",
            "village_code": "V001",
            "consent_flag": True
        },
        headers=headers
    )
    assert response.status_code == 200
    data = response.json()
    assert data["sex"] == "M"
    assert "id" in data
