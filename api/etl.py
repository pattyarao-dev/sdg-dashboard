from fastapi import APIRouter
import dask.dataframe as dd
import pandas as pd
import asyncio
from prisma import Prisma

router = APIRouter()
db = Prisma()

@router.get("/extract-data")
async def extract_data():
    await db.connect()

    indicator_values = await db.td_indicator_value.find_many()
    sub_indicator_values = await db.td_sub_indicator_value.find_many()

    await db.disconnect()  

    return {
        "indicator_values": indicator_values,
        "sub_indicator_values": sub_indicator_values
    }
