from fastapi import FastAPI
from fastapi.routing import APIRoute
from api import etl
from api import compute

app = FastAPI()

# Include ETL routes
app.include_router(etl.router)
app.include_router(compute.router)

for route in app.routes:
    print(route.path)

@app.get("/")
async def root():
    return {"message": "FastAPI is running!"}
