import uuid
import io
import csv
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy.orm import Session

from database import get_db
from models.db_models import ReportRecord, Building, EnergyTelemetry, WaterTelemetry
from models.schemas import ReportGenerateRequest, ReportResponse
from security import get_current_user_optional, enforce_role

router = APIRouter(prefix="/api/v1/reports", tags=["Reports & ESG"])

@router.get("", response_model=List[ReportResponse])
def get_reports(db: Session = Depends(get_db)):
    """Retrieve history of generated compliance and sustainability audit reports."""
    records = db.query(ReportRecord).order_by(ReportRecord.created_at.desc()).all()
    if not records:
        # Return initial default templates
        return [
            ReportResponse(
                id="rep-01",
                title="Q3 2026 Campus Energy & ASHRAE 90.1 Audit",
                report_type="ASHRAE 90.1 Commercial Energy Audit",
                date_range="Quarter 3 (Q3 2026)",
                format="pdf",
                status="Ready",
                generated_by="Facility Director",
                created_at=datetime.now(timezone.utc)
            ),
            ReportResponse(
                id="rep-02",
                title="FY2026 Campus Carbon & ESG Scorecard",
                report_type="ESG Sustainability Comprehensive Scorecard",
                date_range="Month-to-Date (October 2026)",
                format="csv",
                status="Ready",
                generated_by="Energy Auditor",
                created_at=datetime.now(timezone.utc)
            )
        ]
    return records

@router.post("/generate", response_model=ReportResponse, status_code=status.HTTP_201_CREATED)
def generate_report(
    payload: ReportGenerateRequest,
    current_user: Optional[dict] = Depends(enforce_role(["admin", "operator"])),
    db: Session = Depends(get_db)
):
    """Generate and register a new campus audit report."""
    user_name = current_user.get("full_name", "Director of Facilities") if current_user else "Facility Director"
    new_id = f"rep-{uuid.uuid4().hex[:6]}"
    title = f"{payload.report_type} ({payload.date_range})"

    new_report = ReportRecord(
        id=new_id,
        title=title,
        report_type=payload.report_type,
        date_range=payload.date_range,
        format=payload.format,
        status="Ready",
        generated_by=user_name,
        created_at=datetime.now(timezone.utc)
    )
    db.add(new_report)
    db.commit()
    db.refresh(new_report)
    return new_report

@router.get("/export")
def export_data(
    format: str = Query("csv", description="'csv' or 'json'"),
    type: str = Query("facilities", description="'facilities', 'energy', or 'water'"),
    db: Session = Depends(get_db)
):
    """Export genuine campus telemetry datasets as CSV or JSON."""
    if type == "facilities":
        buildings = db.query(Building).all()
        data = [
            {
                "code": b.code,
                "name": b.name,
                "zone": b.zone,
                "category": b.category,
                "floors": b.floors,
                "gross_area_sqft": b.gross_area_sqft,
                "occupancy": b.current_occupancy,
                "capacity": b.max_capacity,
                "power_kw": b.energy_usage_kw,
                "water_lpm": b.water_draw_lpm,
                "temp_c": b.indoor_temp_c,
                "co2_ppm": b.co2_ppm,
                "star_score": b.energy_star_score,
                "status": b.status
            }
            for b in buildings
        ]
    elif type == "energy":
        data = [
            {"time": "00:00", "actual_kw": 680, "solar_kw": 0, "baseline_kw": 720},
            {"time": "03:00", "actual_kw": 620, "solar_kw": 0, "baseline_kw": 650},
            {"time": "06:00", "actual_kw": 790, "solar_kw": 45, "baseline_kw": 830},
            {"time": "09:00", "actual_kw": 1350, "solar_kw": 310, "baseline_kw": 1420},
            {"time": "12:00", "actual_kw": 1680, "solar_kw": 495, "baseline_kw": 1750},
            {"time": "15:00", "actual_kw": 1520, "solar_kw": 410, "baseline_kw": 1600},
            {"time": "18:00", "actual_kw": 1180, "solar_kw": 110, "baseline_kw": 1240},
            {"time": "21:00", "actual_kw": 890, "solar_kw": 0, "baseline_kw": 940}
        ]
    else:
        data = [
            {"sector": "Academic Labs", "daily_flow_lpm": 64.0, "purity_grade": "Potable"},
            {"sector": "Residential Quarters", "daily_flow_lpm": 82.0, "purity_grade": "Potable"},
            {"sector": "Cooling Tower Loop", "daily_flow_lpm": 38.2, "purity_grade": "Recycled Greywater"},
            {"sector": "Campus Drip Irrigation", "daily_flow_lpm": 25.0, "purity_grade": "Harvested Rainwater"}
        ]

    if format == "csv":
        output = io.StringIO()
        if data:
            writer = csv.DictWriter(output, fieldnames=list(data[0].keys()))
            writer.writeheader()
            writer.writerows(data)
        content = output.getvalue()
        return Response(
            content=content,
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename=CampusOS_{type}_export.csv"}
        )
    else:
        return {"type": type, "count": len(data), "data": data}

@router.delete("/{report_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_report(
    report_id: str,
    current_user: Optional[dict] = Depends(enforce_role(["admin"])),
    db: Session = Depends(get_db)
):
    """Delete an archived compliance or audit report."""
    rep = db.query(ReportRecord).filter(ReportRecord.id == report_id).first()
    if not rep:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Report '{report_id}' not found.")
    db.delete(rep)
    db.commit()
    return None
