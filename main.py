from fastapi import FastAPI
from fastapi.routing import APIRouter
from api import extract, compute


app = FastAPI()

# Include ETL routes
app.include_router(extract.router)
app.include_router(compute.router)

for route in app.routes:
    print(route.path)

@app.get("/")
async def root():
    return {"message": "FastAPI is running!"}
