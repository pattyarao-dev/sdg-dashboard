import {
  updateIndicatorRequiredDataValue,
  updateSubIndicatorRequiredDataValue,
} from "@/app/actions/actions";
import { useState } from "react";

const useUpdateValues = () => {
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const updateValues = async (
    values: Array<{
      goalIndicatorId: number;
      requiredDataId: number;
      value: number;
      createdBy: number;
    }>,
    indicatorType: "subIndicator" | "indicator",
  ) => {
    setLoading(true);
    try {
      if (indicatorType === "subIndicator") {
        const updatedValues = await updateSubIndicatorRequiredDataValue(values);
        setSuccess(true);
        return updatedValues;
      } else if (indicatorType === "indicator") {
        const updatedValues = await updateIndicatorRequiredDataValue(values);
        setSuccess(true);
        return updatedValues;
      }
    } catch (error) {
      setLoading(false);
      console.error(error);
      return null;
    }
  };

  return { updateValues, success, loading };
};

export default useUpdateValues;
