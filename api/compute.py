from fastapi import APIRouter
from prisma import Prisma
import re
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
            return SAFE_OPERATORS[type(node.op)](left, right)
        elif isinstance(node, ast.Num):  # Numeric literals
            return node.n
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
    if not db.is_connected():
        await db.connect()

    # Fetch all required data values
    required_data_values = await db.td_required_data_value.find_many()

    # Organize required data into a dictionary
    required_data_dict = {}
    for data in required_data_values:
        key = (data.goal_indicator_id, data.goal_sub_indicator_id, data.required_data_id) 
        required_data_dict[key] = data.value  

    # Fetch computation rules
    computation_rules = await db.md_computation_rule.find_many()

    computed_results = []
    for rule in computation_rules:
        formula = rule.formula  
        goal_indicator_id = rule.goal_indicator_id
        goal_sub_indicator_id = rule.goal_sub_indicator_id

        # Fetch required data mappings for both indicators and sub-indicators
        if goal_indicator_id:
            rule_required_data = await db.td_goal_indicator_required_data.find_many(
                where={"goal_indicator_id": goal_indicator_id}
            )
        elif goal_sub_indicator_id:
            rule_required_data = await db.td_goal_sub_indicator_required_data.find_many(
                where={"goal_sub_indicator_id": goal_sub_indicator_id}
            )
        else:
            continue  # Skip invalid rules

        # Replace placeholders with values
        for req_data in rule_required_data:
            placeholder = f"{{{req_data.required_data_id}}}" 
            value = required_data_dict.get(
                (goal_indicator_id, goal_sub_indicator_id, req_data.required_data_id), 0  
            )
            formula = formula.replace(placeholder, str(value))

        try:
            computed_value = safe_eval(formula)

            if computed_value is not None:
                if goal_indicator_id:
                    await db.td_indicator_value.create(
                        data={
                            "goal_indicator_id": goal_indicator_id,
                            "indicator_id": (await db.td_goal_indicator.find_unique(
                                where={"goal_indicator_id": goal_indicator_id},
                                select={"indicator_id": True}
                            )).indicator_id,  # ✅ Use attribute access
                            "value": computed_value
                        }
                    )
                elif goal_sub_indicator_id:
                    await db.td_sub_indicator_value.create(
                        data={
                            "goal_sub_indicator_id": goal_sub_indicator_id,
                            "sub_indicator_id": (await db.td_goal_sub_indicator.find_unique(
                                where={"goal_sub_indicator_id": goal_sub_indicator_id},
                                select={"sub_indicator_id": True}
                            )).sub_indicator_id,  
                            "value": computed_value
                        }
                    )

                computed_results.append({
                    "goal_indicator_id": goal_indicator_id,
                    "goal_sub_indicator_id": goal_sub_indicator_id,
                    "computed_value": computed_value
                })

        except Exception as e:
            print(f"Error computing rule {rule.rule_id}: {e}")

    await db.disconnect()
    return {"computed_results": computed_results}

