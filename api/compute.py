from fastapi import APIRouter, Depends
from api.extract import extract_indicators
import ast
import operator

router = APIRouter()

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
    
    indicators_data = await extract_indicators()  
    indicators = indicators_data["indicators"]  
    computed_results = []

    print(f"Extracted {len(indicators)} indicators")

    for indicator in indicators:
        goal_indicators = indicator.td_goal_indicator or []
        sub_indicators = indicator.md_sub_indicator or []

        print(f"Processing Indicator: {indicator.indicator_id}, Goal Indicators: {len(goal_indicators)}, Sub Indicators: {len(sub_indicators)}")

        # Compute values for goal indicators
        for goal_indicator in goal_indicators:
            computation_rules = goal_indicator.md_computation_rule or []
            required_data_values = {
                data.ref_required_data.name: val.value  
                for data in goal_indicator.td_goal_indicator_required_data or []  
                for val in goal_indicator.td_required_data_value  
                if val.goal_indicator_id == goal_indicator.goal_indicator_id and val.required_data_id == data.required_data_id  
            }

            for rule in computation_rules:
                formula = rule.formula
                for data_name, value in required_data_values.items():
                    if value is not None:
                        formula = formula.replace(data_name, str(value))

                try:
                    computed_value = safe_eval(formula)
                except Exception as e:
                    print(f"Error evaluating expression {formula}: {e}")
                    computed_value = None

                if computed_value is not None:
                    computed_results.append({
                        "goal_indicator_id": goal_indicator.goal_indicator_id,
                        "computed_value": computed_value
                    })

        # Compute values for sub-indicators
        for sub_indicator in sub_indicators:
            goal_sub_indicators = sub_indicator.td_goal_sub_indicator or []

            for goal_sub_indicator in goal_sub_indicators:
                computation_rules = goal_sub_indicator.md_computation_rule or [] 
                required_data_values = {
                    data.ref_required_data.name: val.value  
                    for data in goal_sub_indicator.td_goal_sub_indicator_required_data or []  
                    for val in goal_sub_indicator.td_required_data_value  
                    if val.goal_sub_indicator_id == goal_sub_indicator.goal_sub_indicator_id and val.required_data_id == data.required_data_id  
                }

                for rule in computation_rules:
                    formula = rule.formula
                    for data_name, value in required_data_values.items():
                        if value is not None:
                            formula = formula.replace(data_name, str(value))

                    try:
                        computed_value = safe_eval(formula)
                    except Exception as e:
                        print(f"Error evaluating expression {formula}: {e}")
                        computed_value = None

                    if computed_value is not None:
                        computed_results.append({
                            "goal_sub_indicator_id": goal_sub_indicator.goal_sub_indicator_id,
                            "computed_value": computed_value
                        })

    print(f"Total Computed Results: {len(computed_results)}")
    return {"computed_results": computed_results}
