from fastapi import FastAPI

app = FastAPI(title="SMART-ECOMMERCE AI Service", version="0.1.0")

@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "ai-service"}

@app.post("/recommend")
async def recommend():
    # Placeholder for recommendation logic
    return {"productIds": [], "scores": []}
