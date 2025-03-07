from fastapi import APIRouter
from prisma import Prisma
from api.compute import compute_indicators

router = APIRouter()
db = Prisma()

@router.post("/load-indicators")
async def load_indicators():
    """Loads computed indicators into the database with proper created_by handling."""
    
    await db.connect()

    computed_results = await compute_indicators()
    results = computed_results["computed_results"]

    # Fetch all created_by values for indicators
    created_by_values = await db.td_indicator_value.find_many()
    created_by_dict = {item.indicator_id: item.created_by for item in created_by_values}

    # Fetch all created_by values for sub-indicators
    sub_created_by_values = await db.td_sub_indicator_value.find_many()
    sub_created_by_dict = {item.sub_indicator_id: item.created_by for item in sub_created_by_values}

    for result in results:
        if "goal_indicator_id" in result:
            goal_indicator_id = result["goal_indicator_id"]
            computed_value = result["computed_value"]

            # Fetch indicator_id and created_by
            existing_record = await db.td_indicator_value.find_first(
                where={"goal_indicator_id": goal_indicator_id}
            )

            created_by = created_by_dict.get(existing_record.indicator_id, 1) if existing_record else 1

            if existing_record:
                await db.td_indicator_value.update(
                    where={"value_id": existing_record.value_id},
                    data={"value": computed_value}
                )
                print(f"Updated Computed Value for Goal Indicator {goal_indicator_id}")
            else:
                await db.td_indicator_value.create(
                    data={
                        "goal_indicator_id": goal_indicator_id,
                        "indicator_id": existing_record.indicator_id if existing_record else None,
                        "value": computed_value,
                        "created_by": created_by
                    }
                )
                print(f"Inserted New Computed Value for Goal Indicator {goal_indicator_id}")

        elif "goal_sub_indicator_id" in result:
            goal_sub_indicator_id = result["goal_sub_indicator_id"]
            computed_value = result["computed_value"]

            # Fetch sub_indicator_id and created_by
            existing_record = await db.td_sub_indicator_value.find_first(
                where={"goal_sub_indicator_id": goal_sub_indicator_id}
            )

            sub_created_by = sub_created_by_dict.get(existing_record.sub_indicator_id, 1) if existing_record else 1

            if existing_record:
                await db.td_sub_indicator_value.update(
                    where={"value_id": existing_record.value_id},
                    data={"value": computed_value}
                )
                print(f"Updated Computed Value for Goal Sub Indicator {goal_sub_indicator_id}")
            else:
                await db.td_sub_indicator_value.create(
                    data={
                        "goal_sub_indicator_id": goal_sub_indicator_id,
                        "sub_indicator_id": existing_record.sub_indicator_id if existing_record else None,
                        "value": computed_value,
                        "created_by": sub_created_by
                    }
                )
                print(f"Inserted New Computed Value for Goal Sub Indicator {goal_sub_indicator_id}")

    await db.disconnect()

    print(f"Total Updated/Inserted Results: {len(results)}")
    return {"updated_results": results}
