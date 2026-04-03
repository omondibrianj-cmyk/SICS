from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from database import get_db
from modules.risk_engine import (
    calculate_rule_based_score,
    calculate_final_risk_score,
    classify_risk_level
)
from modules.ml_predictor import predict_ml_risk

router = APIRouter()

class InspectionRequest(BaseModel):
    landing_station_id: int
    inspector_id: int
    inspection_date: str
    reason_for_inspection: str
    avg_temp_c: float
    ice_ratio_ok: bool
    temp_monitoring_records: bool
    infra_score: float
    handling_score: float
    transport_score: float
    hygiene_score: float
    personnel_score: float
    records_score: float
    boats_operating: int
    historical_noncompliance_6m: int
    days_since_last_inspection: int

@router.post("/create")
def create_inspection(request: InspectionRequest):
    db = get_db()

    # Step 1 - Save inspection record
    inspection_data = request.dict()
    result = db.table("inspections").insert(inspection_data).execute()

    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to save inspection")

    inspection_id = result.data[0]["id"]

    # Step 2 - Calculate rule based score
    rule_score = calculate_rule_based_score(request.dict())

    # Step 3 - Calculate ML probability
    ml_probability = predict_ml_risk(request.dict())

    # Step 4 - Calculate final hybrid score
    final_score = calculate_final_risk_score(rule_score, ml_probability)

    # Step 5 - Classify risk level
    risk_level = classify_risk_level(final_score)

    # Step 6 - Save risk assessment
    risk_data = {
        "inspection_id": inspection_id,
        "regulatory_risk_score": rule_score,
        "ml_risk_probability": ml_probability,
        "final_risk_score": final_score,
        "final_risk_level": risk_level
    }
    db.table("risk_assessments").insert(risk_data).execute()

    return {
        "message": "Inspection created successfully",
        "inspection_id": inspection_id,
        "risk_assessment": {
            "rule_based_score": rule_score,
            "ml_probability": ml_probability,
            "final_risk_score": final_score,
            "risk_level": risk_level
        }
    }

@router.get("/all")
def get_all_inspections():
    db = get_db()
    result = db.table("inspections").select("*").execute()
    return {"inspections": result.data}

@router.get("/{inspection_id}")
def get_inspection(inspection_id: int):
    db = get_db()
    result = db.table("inspections").select("*").eq(
        "id", inspection_id
    ).execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="Inspection not found")

    risk = db.table("risk_assessments").select("*").eq(
        "inspection_id", inspection_id
    ).execute()

    return {
        "inspection": result.data[0],
        "risk_assessment": risk.data[0] if risk.data else None
    }