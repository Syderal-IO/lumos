"""
Green-Ledger Intelligence Service — FastAPI Application
Serves TimesFM 2.5 forecasting and Graphify matching.
Runs on localhost:8000 alongside the Next.js dev server.
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from forecaster import forecast_solar
from matcher import find_best_buyer

# ─── Logging ───
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("intelligence")


# ─── Lifecycle ───
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🔆 Green-Ledger Intelligence Service starting...")
    logger.info("   TimesFM 2.5 will lazy-load on first forecast request")
    logger.info("   Graphify graph will load if graphify-out/graph.json exists")
    yield
    logger.info("Intelligence Service shutting down.")


# ─── App ───
app = FastAPI(
    title="Green-Ledger Intelligence Service",
    description="TimesFM 2.5 solar forecasting + Graphify micro-grid matching",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS for Next.js dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Request/Response Models ───

class ForecastRequest(BaseModel):
    history: list[float] = Field(
        ...,
        min_length=1,
        description="Array of historical kWh readings (hourly)",
        json_schema_extra={"example": [0.0, 0.5, 1.2, 2.8, 3.5, 4.1, 3.8, 2.5]},
    )
    horizon: int = Field(
        default=6,
        ge=1,
        le=24,
        description="Number of hours to forecast",
    )


class ForecastResponse(BaseModel):
    mean_predictions: list[float]
    quantiles_p10: list[float]
    quantiles_p90: list[float]
    horizon_hours: int
    model: str


class MatchRequest(BaseModel):
    prosumer_id: str = Field(
        ...,
        description="ID of the selling prosumer",
        json_schema_extra={"example": "prosumer_001"},
    )
    surplus_kwh: float = Field(
        ...,
        gt=0,
        description="Available surplus in kWh",
        json_schema_extra={"example": 2.8},
    )


class MatchResponse(BaseModel):
    buyer_id: str
    buyer_name: str
    distance_m: float
    demand_kwh: float
    max_price: float
    confidence: float
    neighborhood: str
    source: str


# ─── Endpoints ───

@app.get("/api/health")
async def health_check():
    return {"status": "ok", "service": "green-ledger-intelligence"}


@app.post("/api/forecast", response_model=ForecastResponse)
async def forecast_endpoint(request: ForecastRequest):
    """Predict solar generation using TimesFM 2.5."""
    try:
        result = forecast_solar(request.history, request.horizon)
        return ForecastResponse(**result)
    except Exception as e:
        logger.error(f"Forecast error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/match", response_model=MatchResponse)
async def match_endpoint(request: MatchRequest):
    """Find the best buyer for a prosumer's surplus energy."""
    try:
        result = find_best_buyer(request.prosumer_id, request.surplus_kwh)
        return MatchResponse(**result)
    except Exception as e:
        logger.error(f"Match error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ─── Run ───

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
