from fastapi import APIRouter
import dask.dataframe as dd
import pandas as pd
import asyncio
from prisma import Prisma

router = APIRouter()
db = Prisma()

async def extract_indicators_data():
    """Extracts all indicators, sub-indicators, and goal information."""
    await db.connect()

    indicators = await db.md_indicator.find_many(
        include={
            "td_goal_indicator": {
                "include": {
                    "md_goal": True,
                    "md_computation_rule": True,
                    "td_goal_indicator_required_data": {
                        "include": {"ref_required_data": True}
                    },
                    "td_required_data_value": True,
                    "td_indicator_value": True
                }
            },
            "md_sub_indicator": {
                "include": {
                    "td_goal_sub_indicator": {
                        "include": {
                            "md_computation_rule": True,
                            "td_goal_sub_indicator_required_data": {
                                "include": {"ref_required_data": True}
                            },
                            "td_required_data_value": True,
                            "td_sub_indicator_value": True
                        }
                    }
                }
            },
            "td_indicator_value": True
        }
    )

    goals = await db.md_goal.find_many(
        include={
            "td_goal_indicator": {
                "include": {
                    "md_indicator": True,
                    "md_computation_rule": True,
                    "td_goal_indicator_required_data": {
                        "include": {"ref_required_data": True}
                    },
                    "td_required_data_value": True,
                    "td_indicator_value": True
                }
            }
        }
    )
    
    await db.disconnect()
    return {"indicators": indicators, "goals": goals}

@router.get("/extract-indicators")
async def extract_indicators():
    """API route to trigger indicator extraction, including goals."""
    data = await extract_indicators_data()
    return data
