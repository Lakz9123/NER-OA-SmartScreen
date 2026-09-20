from app.schemas.screening import ScreeningCreate
from app.services.ml_service import analyze_risk

def test_analyze_risk():
    data = ScreeningCreate(
        patient_id="test",
        pain_score=0,
        stiffness_score=0,
        function_score=0,
        knee_angle_left=20.0,
        knee_angle_right=20.0,
        knee_rom_left=140.0,
        knee_rom_right=140.0,
        symmetry_index=1.0,
        cadence=110.0,
        step_time=0.5
    )
    result = analyze_risk(data)
    assert "risk_level" in result
    assert "risk_score" in result
    assert "explainability_data" in result
    assert isinstance(result["explainability_data"]["top_factors"], dict)
