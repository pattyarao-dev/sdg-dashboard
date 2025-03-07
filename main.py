from fastapi import FastAPI
from fastapi.routing import APIRouter
from api import extract, compute, load
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Allows requests from frontend
    allow_credentials=True,
    allow_methods=["*"],  # Allows all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],  # Allows all headers
)

# Include ETL routes
app.include_router(extract.router)
app.include_router(compute.router)
app.include_router(load.router)

for route in app.routes:
    print(route.path)

@app.get("/")
async def root():
    return {"message": "FastAPI is running!"}
