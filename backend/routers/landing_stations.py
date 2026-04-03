from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from database import get_db

router = APIRouter()

class LandingStationRequest(BaseModel):
    landing_station_name: str
    county: str
    location_description: str
    active_status: bool = True

@router.post("/create")
def create_landing_station(request: LandingStationRequest):
    db = get_db()

    # Check if station already exists
    existing = db.table("landing_stations").select("*").eq(
        "landing_station_name", request.landing_station_name
    ).execute()

    if existing.data:
        raise HTTPException(
            status_code=400,
            detail="Landing station already exists"
        )

    result = db.table("landing_stations").insert(
        request.dict()
    ).execute()

    if not result.data:
        raise HTTPException(
            status_code=500,
            detail="Failed to create landing station"
        )

    return {
        "message": "Landing station created successfully",
        "landing_station": result.data[0]
    }

@router.get("/all")
def get_all_landing_stations():
    db = get_db()
    result = db.table("landing_stations").select("*").execute()
    return {"landing_stations": result.data}

@router.get("/{station_id}")
def get_landing_station(station_id: int):
    db = get_db()
    result = db.table("landing_stations").select("*").eq(
        "id", station_id
    ).execute()

    if not result.data:
        raise HTTPException(
            status_code=404,
            detail="Landing station not found"
        )

    return {"landing_station": result.data[0]}

@router.put("/{station_id}/status")
def update_station_status(station_id: int, active_status: bool):
    db = get_db()

    result = db.table("landing_stations").update(
        {"active_status": active_status}
    ).eq("id", station_id).execute()

    if not result.data:
        raise HTTPException(
            status_code=404,
            detail="Landing station not found"
        )

    return {
        "message": "Status updated successfully",
        "landing_station": result.data[0]
    }