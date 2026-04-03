from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth, inspections, certifications, landing_stations, dashboard

app = FastAPI(
    title="KEFS Inspection System",
    description="Kenya Fisheries Service Risk-Based Inspection and Certification System",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(inspections.router, prefix="/api/inspections", tags=["Inspections"])
app.include_router(certifications.router, prefix="/api/certifications", tags=["Certifications"])
app.include_router(landing_stations.router, prefix="/api/landing-stations", tags=["Landing Stations"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])

@app.get("/")
def root():
    return {"message": "KEFS Inspection System API is running", "version": "1.0.0"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}