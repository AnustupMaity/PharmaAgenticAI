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

DATABASE_URL = "postgresql://postgres:Anusrita%402022@db.lvvcipyrlorjlddiugec.supabase.co:5432/postgres"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# FastAPI
app = FastAPI(title="USPTO MCP Server")

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
class PatentByTitleArgs(BaseModel):
    title: str = Field(..., description="Patent title to search for")

class PatentByInventorArgs(BaseModel):
    inventor: str = Field(..., description="Inventor name to search for")

class PatentByAssigneeArgs(BaseModel):
    assignee: str = Field(..., description="Assignee/company name to search for")

class PatentByIPCClassArgs(BaseModel):
    ipc_class: str = Field(..., description="International Patent Classification code")

class PatentByStatusArgs(BaseModel):
    status: str = Field(..., description="Patent status: Granted, Pending, Abandoned, or Expired")

class PatentByDateRangeArgs(BaseModel):
    start_date: str = Field(..., description="Start date in YYYY-MM-DD format")
    end_date: str = Field(..., description="End date in YYYY-MM-DD format")

class Patent(BaseModel):
    id: int
    patent_id: str
    title: str
    inventor: str
    assignee: Optional[str] = None
    filing_date: Optional[str] = None
    publication_date: Optional[str] = None
    abstract: Optional[str] = None
    ipc_class: Optional[str] = None
    status: Optional[str] = None
    inserted_at: Optional[str] = None

# -------- Business Logic --------
def search_patents_by_title(args: PatentByTitleArgs, db: Session) -> List[Dict[str, Any]]:
    """Search patents by title (partial match, case-insensitive)"""
    print("\n[DEBUG] search_patents_by_title called with:", args)

    sql = """
        SELECT id, patent_id::text, title, inventor, assignee, 
               to_char(filing_date, 'YYYY-MM-DD') AS filing_date,
               to_char(publication_date, 'YYYY-MM-DD') AS publication_date,
               abstract, ipc_class, status,
               to_char(inserted_at, 'YYYY-MM-DD HH24:MI:SS') AS inserted_at
        FROM patents
        WHERE lower(title) LIKE lower(:title)
        ORDER BY publication_date DESC NULLS LAST
        LIMIT 50;
    """

    rows = fetch_all(db, sql, {"title": f"%{args.title}%"})

    if not rows:
        print("[DEBUG] No patents found for title:", args.title)
        raise ValueError(f"No patents found with title containing '{args.title}'")

    print(f"[DEBUG] Found {len(rows)} patents")
    return rows

def search_patents_by_inventor(args: PatentByInventorArgs, db: Session) -> List[Dict[str, Any]]:
    """Search patents by inventor name (partial match, case-insensitive)"""
    print("\n[DEBUG] search_patents_by_inventor called with:", args)

    sql = """
        SELECT id, patent_id::text, title, inventor, assignee, 
               to_char(filing_date, 'YYYY-MM-DD') AS filing_date,
               to_char(publication_date, 'YYYY-MM-DD') AS publication_date,
               abstract, ipc_class, status,
               to_char(inserted_at, 'YYYY-MM-DD HH24:MI:SS') AS inserted_at
        FROM patents
        WHERE lower(inventor) LIKE lower(:inventor)
        ORDER BY publication_date DESC NULLS LAST
        LIMIT 50;
    """

    rows = fetch_all(db, sql, {"inventor": f"%{args.inventor}%"})

    if not rows:
        print("[DEBUG] No patents found for inventor:", args.inventor)
        raise ValueError(f"No patents found for inventor '{args.inventor}'")

    print(f"[DEBUG] Found {len(rows)} patents")
    return rows

def search_patents_by_assignee(args: PatentByAssigneeArgs, db: Session) -> List[Dict[str, Any]]:
    """Search patents by assignee/company (partial match, case-insensitive)"""
    print("\n[DEBUG] search_patents_by_assignee called with:", args)

    sql = """
        SELECT id, patent_id::text, title, inventor, assignee, 
               to_char(filing_date, 'YYYY-MM-DD') AS filing_date,
               to_char(publication_date, 'YYYY-MM-DD') AS publication_date,
               abstract, ipc_class, status,
               to_char(inserted_at, 'YYYY-MM-DD HH24:MI:SS') AS inserted_at
        FROM patents
        WHERE lower(assignee) LIKE lower(:assignee)
        ORDER BY publication_date DESC NULLS LAST
        LIMIT 50;
    """

    rows = fetch_all(db, sql, {"assignee": f"%{args.assignee}%"})

    if not rows:
        print("[DEBUG] No patents found for assignee:", args.assignee)
        raise ValueError(f"No patents found for assignee '{args.assignee}'")

    print(f"[DEBUG] Found {len(rows)} patents")
    return rows

def search_patents_by_ipc_class(args: PatentByIPCClassArgs, db: Session) -> List[Dict[str, Any]]:
    """Search patents by IPC classification code"""
    print("\n[DEBUG] search_patents_by_ipc_class called with:", args)

    sql = """
        SELECT id, patent_id::text, title, inventor, assignee, 
               to_char(filing_date, 'YYYY-MM-DD') AS filing_date,
               to_char(publication_date, 'YYYY-MM-DD') AS publication_date,
               abstract, ipc_class, status,
               to_char(inserted_at, 'YYYY-MM-DD HH24:MI:SS') AS inserted_at
        FROM patents
        WHERE lower(ipc_class) LIKE lower(:ipc_class)
        ORDER BY publication_date DESC NULLS LAST
        LIMIT 50;
    """

    rows = fetch_all(db, sql, {"ipc_class": f"%{args.ipc_class}%"})

    if not rows:
        print("[DEBUG] No patents found for IPC class:", args.ipc_class)
        raise ValueError(f"No patents found for IPC class '{args.ipc_class}'")

    print(f"[DEBUG] Found {len(rows)} patents")
    return rows

def search_patents_by_status(args: PatentByStatusArgs, db: Session) -> List[Dict[str, Any]]:
    """Search patents by status (Granted, Pending, Abandoned, Expired)"""
    print("\n[DEBUG] search_patents_by_status called with:", args)

    # Validate status
    valid_statuses = ['Granted', 'Pending', 'Abandoned', 'Expired']
    if args.status not in valid_statuses:
        raise ValueError(f"Invalid status. Must be one of: {', '.join(valid_statuses)}")

    sql = """
        SELECT id, patent_id::text, title, inventor, assignee, 
               to_char(filing_date, 'YYYY-MM-DD') AS filing_date,
               to_char(publication_date, 'YYYY-MM-DD') AS publication_date,
               abstract, ipc_class, status,
               to_char(inserted_at, 'YYYY-MM-DD HH24:MI:SS') AS inserted_at
        FROM patents
        WHERE status = :status
        ORDER BY publication_date DESC NULLS LAST
        LIMIT 100;
    """

    rows = fetch_all(db, sql, {"status": args.status})

    if not rows:
        print("[DEBUG] No patents found for status:", args.status)
        raise ValueError(f"No patents found with status '{args.status}'")

    print(f"[DEBUG] Found {len(rows)} patents")
    return rows

def search_patents_by_date_range(args: PatentByDateRangeArgs, db: Session) -> List[Dict[str, Any]]:
    """Search patents by publication date range"""
    print("\n[DEBUG] search_patents_by_date_range called with:", args)

    sql = """
        SELECT id, patent_id::text, title, inventor, assignee, 
               to_char(filing_date, 'YYYY-MM-DD') AS filing_date,
               to_char(publication_date, 'YYYY-MM-DD') AS publication_date,
               abstract, ipc_class, status,
               to_char(inserted_at, 'YYYY-MM-DD HH24:MI:SS') AS inserted_at
        FROM patents
        WHERE publication_date BETWEEN :start_date::date AND :end_date::date
        ORDER BY publication_date DESC
        LIMIT 100;
    """

    rows = fetch_all(db, sql, {
        "start_date": args.start_date,
        "end_date": args.end_date
    })

    if not rows:
        print("[DEBUG] No patents found for date range:", args.start_date, "to", args.end_date)
        raise ValueError(f"No patents found between {args.start_date} and {args.end_date}")

    print(f"[DEBUG] Found {len(rows)} patents")
    return rows

# -------- FastAPI Endpoints --------
@app.post("/tools/search_patents_by_title", response_model=List[Patent])
def http_search_patents_by_title(payload: PatentByTitleArgs, db: Session = Depends(get_db)):
    """Search patents by title"""
    try:
        return search_patents_by_title(payload, db)
    except ValueError as e:
        return JSONResponse(status_code=404, content={"error": str(e)})
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

@app.post("/tools/search_patents_by_inventor", response_model=List[Patent])
def http_search_patents_by_inventor(payload: PatentByInventorArgs, db: Session = Depends(get_db)):
    """Search patents by inventor name"""
    try:
        return search_patents_by_inventor(payload, db)
    except ValueError as e:
        return JSONResponse(status_code=404, content={"error": str(e)})
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

@app.post("/tools/search_patents_by_assignee", response_model=List[Patent])
def http_search_patents_by_assignee(payload: PatentByAssigneeArgs, db: Session = Depends(get_db)):
    """Search patents by assignee/company"""
    try:
        return search_patents_by_assignee(payload, db)
    except ValueError as e:
        return JSONResponse(status_code=404, content={"error": str(e)})
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

@app.post("/tools/search_patents_by_ipc_class", response_model=List[Patent])
def http_search_patents_by_ipc_class(payload: PatentByIPCClassArgs, db: Session = Depends(get_db)):
    """Search patents by IPC classification code"""
    try:
        return search_patents_by_ipc_class(payload, db)
    except ValueError as e:
        return JSONResponse(status_code=404, content={"error": str(e)})
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

@app.post("/tools/search_patents_by_status", response_model=List[Patent])
def http_search_patents_by_status(payload: PatentByStatusArgs, db: Session = Depends(get_db)):
    """Search patents by status (Granted, Pending, Abandoned, Expired)"""
    try:
        return search_patents_by_status(payload, db)
    except ValueError as e:
        return JSONResponse(status_code=404, content={"error": str(e)})
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

@app.post("/tools/search_patents_by_date_range", response_model=List[Patent])
def http_search_patents_by_date_range(payload: PatentByDateRangeArgs, db: Session = Depends(get_db)):
    """Search patents by publication date range"""
    try:
        return search_patents_by_date_range(payload, db)
    except ValueError as e:
        return JSONResponse(status_code=404, content={"error": str(e)})
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.get("/")
def root():
    return {"message": "USPTO MCP Server is running."}

if __name__ == "__main__":
    # Run the FastAPI app for testing the MCP tools locally
    import uvicorn

    port = int(os.getenv("USPTO_MCP_PORT", "8003"))
    uvicorn.run("uspto_mcp.mcp_server:app", host="localhost", port=port, reload=False)
