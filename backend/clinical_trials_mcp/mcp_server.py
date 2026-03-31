import os
from typing import Optional, List, Dict, Any
from datetime import date
import time
import traceback

from dotenv import load_dotenv
from pydantic import BaseModel, Field

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, Session

from fastapi import FastAPI, Depends
from fastapi.responses import JSONResponse

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/postgres")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# FastAPI
app = FastAPI(title="Clinical Trials MCP Server")

# -------- DB Dependency for Endpoints --------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# -------- DB Helper Wrappers --------
def fetch_one(db: Session, sql: str, params: dict) -> Optional[Dict[str, Any]]:
    print("\n[DEBUG] fetch_one called")
    print("[DEBUG] SQL:", sql)
    print("[DEBUG] Params:", params)
    start = time.time()
    try:
        result = db.execute(text(sql), params).mappings().first()
        print(f"[DEBUG] DB query execution time: {time.time() - start:.3f} sec")
        print("[DEBUG] Result:", result)
        return dict(result) if result else None
    except Exception as e:
        print("[ERROR] Database execution failure:")
        traceback.print_exc()
        raise e

def fetch_all(db: Session, sql: str, params: dict = {}) -> List[Dict[str, Any]]:
    print("\n[DEBUG] fetch_all called")
    print("[DEBUG] SQL:", sql)
    print("[DEBUG] Params:", params)
    start = time.time()
    try:
        result = db.execute(text(sql), params).mappings().all()
        print(f"[DEBUG] DB query execution time: {time.time() - start:.3f} sec")
        print(f"[DEBUG] Result count: {len(result)}")
        return [dict(row) for row in result]
    except Exception as e:
        print("[ERROR] Database execution failure:")
        traceback.print_exc()
        raise e

# -------- Schemas --------
class TrialByConditionArgs(BaseModel):
    condition: str = Field(..., description="Medical condition or disease to search for")

class TrialByPhaseArgs(BaseModel):
    phase: str = Field(..., description="Clinical trial phase: Preclinical, Phase I, Phase II, Phase III, Phase IV")

class TrialBySponsorArgs(BaseModel):
    sponsor: str = Field(..., description="Sponsor or organization name")

class TrialByStatusArgs(BaseModel):
    status: str = Field(..., description="Trial status: Recruiting, Completed, Terminated, Withdrawn, Suspended, Active, Not Recruiting")

class TrialByLocationArgs(BaseModel):
    location: str = Field(..., description="Geographic location (country or city)")

class TrialByInterventionArgs(BaseModel):
    intervention: str = Field(..., description="Intervention or treatment type")

class TrialByDateRangeArgs(BaseModel):
    start_date: str = Field(..., description="Start date in YYYY-MM-DD format")
    end_date: str = Field(..., description="End date in YYYY-MM-DD format")

class ClinicalTrial(BaseModel):
    id: int
    trial_id: str
    title: str
    phase: Optional[str] = None
    condition: Optional[str] = None
    intervention: Optional[str] = None
    sponsor: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    status: Optional[str] = None
    location: Optional[str] = None
    enrollment: Optional[int] = None
    results_summary: Optional[str] = None
    inserted_at: Optional[str] = None

# -------- Business Logic --------
def search_trials_by_condition(args: TrialByConditionArgs, db: Session) -> List[Dict[str, Any]]:
    """Search clinical trials by medical condition"""
    print("\n[DEBUG] search_trials_by_condition called with:", args)

    sql = """
        SELECT id, trial_id::text, title, phase, condition, intervention, sponsor,
               to_char(start_date, 'YYYY-MM-DD') AS start_date,
               to_char(end_date, 'YYYY-MM-DD') AS end_date,
               status, location, enrollment, results_summary,
               to_char(inserted_at, 'YYYY-MM-DD HH24:MI:SS') AS inserted_at
        FROM clinical_trials
        WHERE lower(condition) LIKE lower(:condition)
        ORDER BY start_date DESC NULLS LAST
        LIMIT 100;
    """

    rows = fetch_all(db, sql, {"condition": f"%{args.condition}%"})

    if not rows:
        print("[DEBUG] No trials found for condition:", args.condition)
        raise ValueError(f"No clinical trials found for condition '{args.condition}'")

    print(f"[DEBUG] Found {len(rows)} trials")
    return rows

def search_trials_by_phase(args: TrialByPhaseArgs, db: Session) -> List[Dict[str, Any]]:
    """Search clinical trials by phase"""
    print("\n[DEBUG] search_trials_by_phase called with:", args)

    # Validate phase
    valid_phases = ['Preclinical', 'Phase I', 'Phase II', 'Phase III', 'Phase IV']
    if args.phase not in valid_phases:
        raise ValueError(f"Invalid phase. Must be one of: {', '.join(valid_phases)}")

    sql = """
        SELECT id, trial_id::text, title, phase, condition, intervention, sponsor,
               to_char(start_date, 'YYYY-MM-DD') AS start_date,
               to_char(end_date, 'YYYY-MM-DD') AS end_date,
               status, location, enrollment, results_summary,
               to_char(inserted_at, 'YYYY-MM-DD HH24:MI:SS') AS inserted_at
        FROM clinical_trials
        WHERE phase = :phase
        ORDER BY start_date DESC NULLS LAST
        LIMIT 100;
    """

    rows = fetch_all(db, sql, {"phase": args.phase})

    if not rows:
        print("[DEBUG] No trials found for phase:", args.phase)
        raise ValueError(f"No clinical trials found for phase '{args.phase}'")

    print(f"[DEBUG] Found {len(rows)} trials")
    return rows

def search_trials_by_sponsor(args: TrialBySponsorArgs, db: Session) -> List[Dict[str, Any]]:
    """Search clinical trials by sponsor"""
    print("\n[DEBUG] search_trials_by_sponsor called with:", args)

    sql = """
        SELECT id, trial_id::text, title, phase, condition, intervention, sponsor,
               to_char(start_date, 'YYYY-MM-DD') AS start_date,
               to_char(end_date, 'YYYY-MM-DD') AS end_date,
               status, location, enrollment, results_summary,
               to_char(inserted_at, 'YYYY-MM-DD HH24:MI:SS') AS inserted_at
        FROM clinical_trials
        WHERE lower(sponsor) LIKE lower(:sponsor)
        ORDER BY start_date DESC NULLS LAST
        LIMIT 100;
    """

    rows = fetch_all(db, sql, {"sponsor": f"%{args.sponsor}%"})

    if not rows:
        print("[DEBUG] No trials found for sponsor:", args.sponsor)
        raise ValueError(f"No clinical trials found for sponsor '{args.sponsor}'")

    print(f"[DEBUG] Found {len(rows)} trials")
    return rows

def search_trials_by_status(args: TrialByStatusArgs, db: Session) -> List[Dict[str, Any]]:
    """Search clinical trials by status"""
    print("\n[DEBUG] search_trials_by_status called with:", args)

    # Validate status
    valid_statuses = ['Recruiting', 'Completed', 'Terminated', 'Withdrawn', 'Suspended', 'Active, Not Recruiting']
    if args.status not in valid_statuses:
        raise ValueError(f"Invalid status. Must be one of: {', '.join(valid_statuses)}")

    sql = """
        SELECT id, trial_id::text, title, phase, condition, intervention, sponsor,
               to_char(start_date, 'YYYY-MM-DD') AS start_date,
               to_char(end_date, 'YYYY-MM-DD') AS end_date,
               status, location, enrollment, results_summary,
               to_char(inserted_at, 'YYYY-MM-DD HH24:MI:SS') AS inserted_at
        FROM clinical_trials
        WHERE status = :status
        ORDER BY start_date DESC NULLS LAST
        LIMIT 100;
    """

    rows = fetch_all(db, sql, {"status": args.status})

    if not rows:
        print("[DEBUG] No trials found for status:", args.status)
        raise ValueError(f"No clinical trials found with status '{args.status}'")

    print(f"[DEBUG] Found {len(rows)} trials")
    return rows

def search_trials_by_location(args: TrialByLocationArgs, db: Session) -> List[Dict[str, Any]]:
    """Search clinical trials by location"""
    print("\n[DEBUG] search_trials_by_location called with:", args)

    sql = """
        SELECT id, trial_id::text, title, phase, condition, intervention, sponsor,
               to_char(start_date, 'YYYY-MM-DD') AS start_date,
               to_char(end_date, 'YYYY-MM-DD') AS end_date,
               status, location, enrollment, results_summary,
               to_char(inserted_at, 'YYYY-MM-DD HH24:MI:SS') AS inserted_at
        FROM clinical_trials
        WHERE lower(location) LIKE lower(:location)
        ORDER BY start_date DESC NULLS LAST
        LIMIT 100;
    """

    rows = fetch_all(db, sql, {"location": f"%{args.location}%"})

    if not rows:
        print("[DEBUG] No trials found for location:", args.location)
        raise ValueError(f"No clinical trials found in location '{args.location}'")

    print(f"[DEBUG] Found {len(rows)} trials")
    return rows

def search_trials_by_intervention(args: TrialByInterventionArgs, db: Session) -> List[Dict[str, Any]]:
    """Search clinical trials by intervention/treatment"""
    print("\n[DEBUG] search_trials_by_intervention called with:", args)

    sql = """
        SELECT id, trial_id::text, title, phase, condition, intervention, sponsor,
               to_char(start_date, 'YYYY-MM-DD') AS start_date,
               to_char(end_date, 'YYYY-MM-DD') AS end_date,
               status, location, enrollment, results_summary,
               to_char(inserted_at, 'YYYY-MM-DD HH24:MI:SS') AS inserted_at
        FROM clinical_trials
        WHERE lower(intervention) LIKE lower(:intervention)
        ORDER BY start_date DESC NULLS LAST
        LIMIT 100;
    """

    rows = fetch_all(db, sql, {"intervention": f"%{args.intervention}%"})

    if not rows:
        print("[DEBUG] No trials found for intervention:", args.intervention)
        raise ValueError(f"No clinical trials found for intervention '{args.intervention}'")

    print(f"[DEBUG] Found {len(rows)} trials")
    return rows

def search_trials_by_date_range(args: TrialByDateRangeArgs, db: Session) -> List[Dict[str, Any]]:
    """Search clinical trials by start date range"""
    print("\n[DEBUG] search_trials_by_date_range called with:", args)

    sql = """
        SELECT id, trial_id::text, title, phase, condition, intervention, sponsor,
               to_char(start_date, 'YYYY-MM-DD') AS start_date,
               to_char(end_date, 'YYYY-MM-DD') AS end_date,
               status, location, enrollment, results_summary,
               to_char(inserted_at, 'YYYY-MM-DD HH24:MI:SS') AS inserted_at
        FROM clinical_trials
        WHERE start_date BETWEEN :start_date::date AND :end_date::date
        ORDER BY start_date DESC
        LIMIT 100;
    """

    rows = fetch_all(db, sql, {
        "start_date": args.start_date,
        "end_date": args.end_date
    })

    if not rows:
        print("[DEBUG] No trials found for date range:", args.start_date, "to", args.end_date)
        raise ValueError(f"No clinical trials found between {args.start_date} and {args.end_date}")

    print(f"[DEBUG] Found {len(rows)} trials")
    return rows

# -------- FastAPI Endpoints --------
@app.post("/tools/search_trials_by_condition", response_model=List[ClinicalTrial])
def http_search_trials_by_condition(payload: TrialByConditionArgs, db: Session = Depends(get_db)):
    """Search clinical trials by medical condition"""
    try:
        return search_trials_by_condition(payload, db)
    except ValueError as e:
        return JSONResponse(status_code=404, content={"error": str(e)})
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

@app.post("/tools/search_trials_by_phase", response_model=List[ClinicalTrial])
def http_search_trials_by_phase(payload: TrialByPhaseArgs, db: Session = Depends(get_db)):
    """Search clinical trials by phase"""
    try:
        return search_trials_by_phase(payload, db)
    except ValueError as e:
        return JSONResponse(status_code=404, content={"error": str(e)})
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

@app.post("/tools/search_trials_by_sponsor", response_model=List[ClinicalTrial])
def http_search_trials_by_sponsor(payload: TrialBySponsorArgs, db: Session = Depends(get_db)):
    """Search clinical trials by sponsor"""
    try:
        return search_trials_by_sponsor(payload, db)
    except ValueError as e:
        return JSONResponse(status_code=404, content={"error": str(e)})
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

@app.post("/tools/search_trials_by_status", response_model=List[ClinicalTrial])
def http_search_trials_by_status(payload: TrialByStatusArgs, db: Session = Depends(get_db)):
    """Search clinical trials by status"""
    try:
        return search_trials_by_status(payload, db)
    except ValueError as e:
        return JSONResponse(status_code=404, content={"error": str(e)})
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

@app.post("/tools/search_trials_by_location", response_model=List[ClinicalTrial])
def http_search_trials_by_location(payload: TrialByLocationArgs, db: Session = Depends(get_db)):
    """Search clinical trials by location"""
    try:
        return search_trials_by_location(payload, db)
    except ValueError as e:
        return JSONResponse(status_code=404, content={"error": str(e)})
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

@app.post("/tools/search_trials_by_intervention", response_model=List[ClinicalTrial])
def http_search_trials_by_intervention(payload: TrialByInterventionArgs, db: Session = Depends(get_db)):
    """Search clinical trials by intervention"""
    try:
        return search_trials_by_intervention(payload, db)
    except ValueError as e:
        return JSONResponse(status_code=404, content={"error": str(e)})
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

@app.post("/tools/search_trials_by_date_range", response_model=List[ClinicalTrial])
def http_search_trials_by_date_range(payload: TrialByDateRangeArgs, db: Session = Depends(get_db)):
    """Search clinical trials by date range"""
    try:
        return search_trials_by_date_range(payload, db)
    except ValueError as e:
        return JSONResponse(status_code=404, content={"error": str(e)})
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.get("/")
def root():
    return {"message": "Clinical Trials MCP Server is running."}

if __name__ == "__main__":
    # Run the FastAPI app for testing the MCP tools locally
    import uvicorn

    port = int(os.getenv("CLINICAL_TRIALS_MCP_PORT", "8004"))
    uvicorn.run("clinical_trials_mcp.mcp_server:app", host="localhost", port=port, reload=False)
