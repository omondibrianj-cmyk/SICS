from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from database import get_db
from fastapi.responses import Response
from modules.pdf_generator import generate_certificate

router = APIRouter()

class CertificationRequest(BaseModel):
    inspection_id: int
    certificate_decision: str
    remarks: str
    issued_by: int
    issued_date: str

@router.post("/create")
def create_certification(request: CertificationRequest):
    db = get_db()

    valid_decisions = ["Approve", "Conditional", "Reject"]
    if request.certificate_decision not in valid_decisions:
        raise HTTPException(
            status_code=400,
            detail=f"Decision must be one of: {valid_decisions}"
        )

    inspection = db.table("inspections").select("*").eq(
        "id", request.inspection_id
    ).execute()

    if not inspection.data:
        raise HTTPException(
            status_code=404,
            detail="Inspection not found"
        )

    risk = db.table("risk_assessments").select("*").eq(
        "inspection_id", request.inspection_id
    ).execute()

    if not risk.data:
        raise HTTPException(
            status_code=404,
            detail="Risk assessment not found for this inspection"
        )

    existing = db.table("certifications").select("*").eq(
        "inspection_id", request.inspection_id
    ).execute()

    if existing.data:
        raise HTTPException(
            status_code=400,
            detail="Certification already exists for this inspection"
        )

    cert_data = {
        "inspection_id": request.inspection_id,
        "certificate_decision": request.certificate_decision,
        "remarks": request.remarks,
        "issued_by": request.issued_by,
        "issued_date": request.issued_date
    }

    result = db.table("certifications").insert(cert_data).execute()

    if not result.data:
        raise HTTPException(
            status_code=500,
            detail="Failed to save certification"
        )

    return {
        "message": "Certification created successfully",
        "certification": {
            "id": result.data[0]["id"],
            "inspection_id": request.inspection_id,
            "decision": request.certificate_decision,
            "remarks": request.remarks,
            "issued_date": request.issued_date,
            "risk_level": risk.data[0]["final_risk_level"],
            "final_risk_score": risk.data[0]["final_risk_score"]
        }
    }

@router.get("/all")
def get_all_certifications():
    db = get_db()
    result = db.table("certifications").select("*").execute()
    return {"certifications": result.data}

@router.get("/{certification_id}")
def get_certification(certification_id: int):
    db = get_db()
    result = db.table("certifications").select("*").eq(
        "id", certification_id
    ).execute()

    if not result.data:
        raise HTTPException(
            status_code=404,
            detail="Certification not found"
        )

    cert = result.data[0]

    risk = db.table("risk_assessments").select("*").eq(
        "inspection_id", cert["inspection_id"]
    ).execute()

    return {
        "certification": cert,
        "risk_assessment": risk.data[0] if risk.data else None
    }

@router.get("/{certification_id}/download")
def download_certificate(certification_id: int):
    db = get_db()

    cert_result = db.table("certifications").select("*").eq(
        "id", certification_id
    ).execute()

    if not cert_result.data:
        raise HTTPException(status_code=404, detail="Certification not found")

    cert = cert_result.data[0]

    inspection = db.table("inspections").select("*").eq(
        "id", cert["inspection_id"]
    ).execute()

    risk = db.table("risk_assessments").select("*").eq(
        "inspection_id", cert["inspection_id"]
    ).execute()

    station = db.table("landing_stations").select("*").eq(
        "id", inspection.data[0]["landing_station_id"]
    ).execute()

    inspector = db.table("users").select("full_name").eq(
        "id", inspection.data[0]["inspector_id"]
    ).execute()

    issuer = db.table("users").select("full_name").eq(
        "id", cert["issued_by"]
    ).execute()

    cert_data = {
        "cert_id": certification_id,
        "inspection_id": cert["inspection_id"],
        "decision": cert["certificate_decision"],
        "remarks": cert["remarks"],
        "issued_date": cert["issued_date"],
        "inspection_date": inspection.data[0]["inspection_date"] if inspection.data else "N/A",
        "landing_station": station.data[0]["landing_station_name"] if station.data else "N/A",
        "county": station.data[0]["county"] if station.data else "N/A",
        "inspector_name": inspector.data[0]["full_name"] if inspector.data else "N/A",
        "issued_by_name": issuer.data[0]["full_name"] if issuer.data else "N/A",
        "risk_level": risk.data[0]["final_risk_level"] if risk.data else "N/A",
        "final_risk_score": risk.data[0]["final_risk_score"] if risk.data else "N/A",
    }

    pdf_bytes = generate_certificate(cert_data)

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename=KEFS-Certificate-{certification_id}.pdf"
        }
    )