from fastapi import APIRouter
from database import get_db

router = APIRouter()

@router.get("/stats")
def get_dashboard_stats():
    db = get_db()

    users = db.table("users").select("id").execute()
    inspections = db.table("inspections").select("id").execute()
    certifications = db.table("certifications").select("id, certificate_decision").execute()
    stations = db.table("landing_stations").select("id").execute()
    risk = db.table("risk_assessments").select("final_risk_level").execute()

    approved = len([c for c in certifications.data if c["certificate_decision"] == "Approve"])
    conditional = len([c for c in certifications.data if c["certificate_decision"] == "Conditional"])
    rejected = len([c for c in certifications.data if c["certificate_decision"] == "Reject"])

    high_risk = len([r for r in risk.data if r["final_risk_level"] == "High"])
    medium_risk = len([r for r in risk.data if r["final_risk_level"] == "Medium"])
    low_risk = len([r for r in risk.data if r["final_risk_level"] == "Low"])

    return {
        "total_users": len(users.data),
        "total_inspections": len(inspections.data),
        "total_certifications": len(certifications.data),
        "total_landing_stations": len(stations.data),
        "certifications_breakdown": {
            "approved": approved,
            "conditional": conditional,
            "rejected": rejected
        },
        "risk_breakdown": {
            "high": high_risk,
            "medium": medium_risk,
            "low": low_risk
        }
    }

@router.get("/recent-inspections")
def get_recent_inspections():
    db = get_db()
    result = db.table("inspections").select("*").limit(10).execute()
    return {"recent_inspections": result.data}

@router.get("/recent-certifications")
def get_recent_certifications():
    db = get_db()
    result = db.table("certifications").select("*").limit(10).execute()
    return {"recent_certifications": result.data}