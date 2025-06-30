import {
  updateIndicatorComputationRule,
  updateSubIndicatorComputationRule,
} from "@/app/actions/actions";
import { useState } from "react";

const useCreateFormula = () => {
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const createFormula = async (
    formula: string,
    goalIndicatorId: number,
    indicatorType: "subIndicator" | "indicator",
    includeSubIndicators: boolean = false,
  ) => {
    setLoading(true);
    if (indicatorType === "subIndicator") {
      const formulaTable = await updateSubIndicatorComputationRule(
        goalIndicatorId,
        formula,
        includeSubIndicators,
      );
      setSuccess(true);
      return formulaTable;
    } else if (indicatorType === "indicator") {
      const formulaTable = await updateIndicatorComputationRule(
        goalIndicatorId,
        formula,
        includeSubIndicators,
      );
      setSuccess(true);
      return formulaTable;
    }
  };
  return { success, loading, createFormula };
};

export default useCreateFormula;
