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
app = FastAPI(title="Exim MCP Server")

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
    result = db.execute(text(sql), params).mappings().all()
    return [dict(row) for row in result]

# -------- Schemas --------
class ExportTariffArgs(BaseModel):
    drug_name: str
    country: str

class ImportTariffArgs(BaseModel):
    drug_name: str
    origin_country: str
    destination_country: str

class ExportTariff(BaseModel):
    hs_code: str
    drug_name: str
    country: str
    tariff_rate: float
    basis: Optional[str] = None
    currency: Optional[str] = None
    notes: Optional[str] = None
    last_updated: Optional[str] = None
    source: Optional[str] = None

class ImportTariff(BaseModel):
    hs_code: str
    drug_name: str
    origin_country: str
    destination_country: str
    tariff_rate: float
    basis: Optional[str] = None
    currency: Optional[str] = None
    notes: Optional[str] = None
    last_updated: Optional[str] = None
    source: Optional[str] = None

# -------- Business Logic --------
def get_export_tariff(args: ExportTariffArgs, db: Session):
    print("\n[DEBUG] get_export_tariff called with:", args)

    sql = """
        SELECT hs_code, drug_name, country, tariff_rate, basis, currency, notes,
               to_char(last_updated, 'YYYY-MM-DD') AS last_updated, source
        FROM export_tariffs
        WHERE lower(drug_name) = lower(:drug_name)
          AND lower(country) = lower(:country)
        ORDER BY last_updated DESC NULLS LAST
        LIMIT 1;
    """

    row = fetch_one(db, sql, {"drug_name": args.drug_name, "country": args.country})

    if not row:
        print("[DEBUG] No export tariff result found")
        raise ValueError(f"No export tariff found for {args.drug_name} in {args.country}")

    print("[DEBUG] Final export row:", row)
    row["tariff_rate"] = float(row["tariff_rate"])
    return row

def get_import_tariff(args: ImportTariffArgs, db: Session):
    sql = """
        SELECT hs_code, drug_name, origin_country, destination_country, tariff_rate,
               basis, currency, notes, to_char(last_updated, 'YYYY-MM-DD') AS last_updated, source
        FROM import_tariffs
        WHERE lower(drug_name) = lower(:drug_name)
          AND lower(origin_country) = lower(:origin_country)
          AND lower(destination_country) = lower(:destination_country)
        ORDER BY last_updated DESC NULLS LAST
        LIMIT 1;
    """

    row = fetch_one(db, sql, {
        "drug_name": args.drug_name,
        "origin_country": args.origin_country,
        "destination_country": args.destination_country
    })

    if not row:
        raise ValueError(
            f"No import tariff found for {args.drug_name} from {args.origin_country} to {args.destination_country}"
        )

    row["tariff_rate"] = float(row["tariff_rate"])
    return row

# -------- FastAPI Endpoints --------
@app.post("/tools/get_export_tariff", response_model=ExportTariff)
def http_get_export_tariff(payload: ExportTariffArgs, db: Session = Depends(get_db)):
    try:
        return get_export_tariff(payload, db)
    except ValueError as e:
        return JSONResponse(status_code=404, content={"error": str(e)})
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

@app.post("/tools/get_import_tariff", response_model=ImportTariff)
def http_get_import_tariff(payload: ImportTariffArgs, db: Session = Depends(get_db)):
    try:
        return get_import_tariff(payload, db)
    except ValueError as e:
        return JSONResponse(status_code=404, content={"error": str(e)})
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.get("/")
def root():
    return {"message": "Exim MCP Server is running."}
if __name__ == "__main__":
    # Run the FastAPI app for testing the MCP tools locally
    import uvicorn

    port = int(os.getenv("MCP_SERVER_PORT", "8002"))
    uvicorn.run("exim_mcp.mcp-server:app", host="localhost", port=8002, reload=False)
