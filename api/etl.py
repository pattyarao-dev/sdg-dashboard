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

    computation_rule = await db.md_computation_rule.find_many()
    goal_indicators = await db.td_goal_indicator.find_many()
    indicator_values = await db.td_indicator_value.find_many()
    sub_indicator_values = await db.td_sub_indicator_value.find_many()

    await db.disconnect()  

    return {
        "computation_rules": computation_rule,
        "goal_indicators": goal_indicators,
        "indicator_values": indicator_values,
        "sub_indicator_values": sub_indicator_values
    }
