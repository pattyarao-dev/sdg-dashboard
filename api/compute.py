from fastapi import APIRouter, Depends
from api.extract import extract_indicators
from prisma import Prisma
import ast
import operator

router = APIRouter()
db = Prisma()

# Define allowed safe operators
SAFE_OPERATORS = {
    ast.Add: operator.add,
    ast.Sub: operator.sub,
    ast.Mult: operator.mul,
    ast.Div: operator.truediv,
    ast.Pow: operator.pow
}

# Function to safely evaluate mathematical expressions
def safe_eval(expr):
    """
    Evaluates an expression in a safe manner using AST parsing.
    Only allows basic mathematical operations.
    """
    def eval_node(node):
        if isinstance(node, ast.BinOp) and type(node.op) in SAFE_OPERATORS:
            left = eval_node(node.left)
            right = eval_node(node.right)

            # Prevent division by zero
            if isinstance(node.op, ast.Div) and right == 0:
                return 0  

            return SAFE_OPERATORS[type(node.op)](left, right)
        elif isinstance(node, ast.Constant):  
            return node.value
        else:
            raise ValueError("Unsafe expression detected!")

    try:
        tree = ast.parse(expr, mode='eval')
        return eval_node(tree.body)
    except Exception as e:
        print(f"Error evaluating expression {expr}: {e}")
        return None

@router.get("/compute-indicators")
async def compute_indicators():
    """Computes indicator values using extracted data."""
    
    await db.connect()  

    indicators_data = await extract_indicators()  
    indicators = indicators_data["indicators"]  
    computed_results = []

    print(f"Extracted {len(indicators)} indicators")

    # Fetch all created_by values for indicators
    created_by_values = await db.td_indicator_value.find_many()
    created_by_dict = {item.indicator_id: item.created_by for item in created_by_values}

    # Fetch all created_by values for sub-indicators
    sub_created_by_values = await db.td_sub_indicator_value.find_many()
    sub_created_by_dict = {item.sub_indicator_id: item.created_by for item in sub_created_by_values}

    for indicator in indicators:
        goal_indicators = indicator.td_goal_indicator or []
        sub_indicators = indicator.md_sub_indicator or []

        print(f"Processing Indicator: {indicator.indicator_id}, Goal Indicators: {len(goal_indicators)}, Sub Indicators: {len(sub_indicators)}")

        # Get created_by for indicator
        created_by = created_by_dict.get(indicator.indicator_id, 1)  # Default to `1` if not found

        # Compute values for goal indicators
        for goal_indicator in goal_indicators:
            computation_rules = goal_indicator.md_computation_rule or []
            print(f"  Goal Indicator: {goal_indicator.goal_indicator_id}, Computation Rules: {computation_rules}")

            required_data_values = {
                data.ref_required_data.name: val.value  
                    for data in goal_indicator.td_goal_indicator_required_data or []  
                    for val in goal_indicator.td_required_data_value  
                    if val.goal_indicator_id == goal_indicator.goal_indicator_id and val.required_data_id == data.required_data_id  
            }

            print(f"  Required Data Values: {required_data_values}")

            for rule in computation_rules:
                formula = rule.formula
                print(f"  Original Formula: {formula}")

                for data_name, value in required_data_values.items():
                    if value is not None:
                        print(f"Replacing {data_name} with {value} in formula {formula}")
                        formula = formula.replace(data_name, str(value))

                print(f"  Evaluating Formula: {formula}")
                try:
                    computed_value = safe_eval(formula)
                except Exception as e:
                    print(f"  Error evaluating expression {formula}: {e}")
                    computed_value = None

                print(f"  Computed Value: {computed_value}")

                if computed_value is not None:
                    existing_value = await db.td_indicator_value.find_first(
                        where={"goal_indicator_id": goal_indicator.goal_indicator_id}
                    )

                    if existing_value:
                        await db.td_indicator_value.update(
                            where={"value_id": existing_value.value_id},
                            data={"value": computed_value}
                        )
                        print(f"  Updated Computed Value for Goal Indicator {goal_indicator.goal_indicator_id}")
                    else:
                        await db.td_indicator_value.create(
                            data={
                                "goal_indicator_id": goal_indicator.goal_indicator_id,
                                "indicator_id": indicator.indicator_id,
                                "value": computed_value,
                                "created_by": created_by
                            }
                        )
                        print(f"  Inserted New Computed Value for Goal Indicator {goal_indicator.goal_indicator_id}")

                    computed_results.append({
                        "goal_indicator_id": goal_indicator.goal_indicator_id,
                        "computed_value": computed_value
                    })

        # Compute values for sub-indicators
        for sub_indicator in sub_indicators:
            goal_sub_indicators = sub_indicator.td_goal_sub_indicator or []

            # Get created_by for sub-indicator
            sub_created_by = sub_created_by_dict.get(sub_indicator.sub_indicator_id, 1)  # Default to `1` if not found

            for goal_sub_indicator in goal_sub_indicators:
                computation_rules = goal_sub_indicator.md_computation_rule or [] 

                print(f"  Computation Rules for Sub Indicator: {computation_rules}")

                print(f"  Processing Goal Sub Indicator: {goal_sub_indicator.goal_sub_indicator_id}, Computation Rules: {computation_rules}")

                required_data_values = {
                    data.ref_required_data.name: val.value  
                        for data in goal_sub_indicator.td_goal_sub_indicator_required_data or []  
                        for val in goal_sub_indicator.td_required_data_value  
                        if val.goal_sub_indicator_id == goal_sub_indicator.goal_sub_indicator_id and val.required_data_id == data.required_data_id  
                }

                print(f"  Required Data Values for Sub Indicator: {required_data_values}")

                for rule in computation_rules:
                    formula = rule.formula
                    print(f"  Original Formula: {formula}")

                    for data_name, value in required_data_values.items():
                        if value is not None:
                            print(f"Replacing {data_name} with {value} in formula {formula}")
                            formula = formula.replace(data_name, str(value))

                    print(f"  Evaluating Formula: {formula}")
                    try:
                        computed_value = safe_eval(formula)
                    except Exception as e:
                        print(f"  Error evaluating expression {formula}: {e}")
                        computed_value = None

                    print(f"  Computed Value: {computed_value}")

                    if computed_value is not None:
                        existing_value = await db.td_sub_indicator_value.find_first(
                            where={"goal_sub_indicator_id": goal_sub_indicator.goal_sub_indicator_id}
                        )

                        if existing_value:
                            await db.td_sub_indicator_value.update(
                                where={"value_id": existing_value.value_id},
                                data={"value": computed_value}
                            )
                            print(f"  Updated Computed Value for Goal Sub Indicator {goal_sub_indicator.goal_sub_indicator_id}")
                        else:
                            await db.td_sub_indicator_value.create(
                                data={
                                    "goal_sub_indicator_id": goal_sub_indicator.goal_sub_indicator_id,
                                    "sub_indicator_id": sub_indicator.sub_indicator_id,
                                    "value": computed_value,
                                    "created_by": sub_created_by
                                }
                            )
                            print(f"  Inserted New Computed Value for Goal Sub Indicator {goal_sub_indicator.goal_sub_indicator_id}")

                        computed_results.append({
                            "goal_sub_indicator_id": goal_sub_indicator.goal_sub_indicator_id,
                            "computed_value": computed_value
                        })

    await db.disconnect()  

    print(f"Total Computed Results: {len(computed_results)}")
    return {"computed_results": computed_results}
