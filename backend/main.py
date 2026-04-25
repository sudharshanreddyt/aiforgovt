from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from database import engine
import models

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="PermitFlow API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("./uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="./uploads"), name="uploads")

from routers import applications, findings, reviews, ai_engine
app.include_router(applications.router, prefix="/api/applications", tags=["applications"])
app.include_router(findings.router, prefix="/api/findings", tags=["findings"])
app.include_router(reviews.router, prefix="/api/reviews", tags=["reviews"])
app.include_router(ai_engine.router, prefix="/api/ai", tags=["ai_engine"])

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "permitflow-api"}
