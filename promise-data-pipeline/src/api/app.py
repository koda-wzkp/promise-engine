"""FastAPI application for the Promise Data Pipeline API."""

from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routes import networks, promises, analysis, predict, export

app = FastAPI(
    title="Promise Data Pipeline API",
    description="API for accessing promise networks, analysis results, and predictions.",
    version="0.1.0",
    docs_url="/v1/docs",
    redoc_url="/v1/redoc",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(networks.router, prefix="/v1")
app.include_router(promises.router, prefix="/v1")
app.include_router(analysis.router, prefix="/v1")
app.include_router(predict.router, prefix="/v1")
app.include_router(export.router, prefix="/v1")


@app.get("/v1/health")
async def health_check():
    return {"status": "ok", "version": "0.1.0"}
