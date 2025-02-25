from fastapi import FastAPI
from api import etl  

app = FastAPI()

# Include ETL routes
app.include_router(etl.router)

@app.get("/")
async def root():
    return {"message": "FastAPI is running!"}
