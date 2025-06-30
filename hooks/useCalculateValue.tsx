import { useState, useEffect } from "react";

const useCalculateValue = () => {
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [calculatedValue, setCalculatedValue] = useState<number | null>(null);

  useEffect(() => {
    console.log("Updated Calculated Value:", calculatedValue);
  }, [calculatedValue]); // Logs when calculatedValue changes

  const calculateValue = async (
    ruleId: number,
    values: Array<{ requiredDataName: string; requiredDataValue: number }>,
    createdBy: number,
    indicatorType: "subIndicator" | "indicator" | "projectIndicator" | "projectSubIndicator",
    withDependencies: boolean = false,
    projectIndicatorId?: number,
    projectSubIndicatorId?: number,
  ) => {
    setLoading(true);
    setSuccess(false);
    setCalculatedValue(null);

    // Build the endpoint based on withDependencies flag
    let endpoint;
    if (withDependencies) {
      endpoint = `/calculate_${indicatorType}_with_dependencies`;
    } else {
      if (indicatorType === "subIndicator") {
        endpoint = "/sub_indicator_value";
      } else if (indicatorType === "indicator") {
        endpoint = "/indicator_value";
      } else if (indicatorType === "projectIndicator") {
        endpoint = "/project_indicator_value";
      } else if (indicatorType === "projectSubIndicator") {
        endpoint = "/project_sub_indicator_value";
      }
    }

    try {
      if (!process.env.NEXT_PUBLIC_API_BASE_URL) {
        throw new Error("API base URL is not defined in environment variables");
      }

      const valuesObject = values.reduce(
        (acc, item) => {
          acc[item.requiredDataName] = item.requiredDataValue;
          return acc;
        },
        {} as Record<string, number>,
      );

      // Build request body based on indicator type
      let requestBody: any = {
        rule_id: ruleId,
        values: valuesObject,
        created_by: createdBy,
      };

      if (indicatorType === "projectIndicator") {
        requestBody.project_indicator_id = Number(projectIndicatorId);
      } else if (indicatorType === "projectSubIndicator") {
        requestBody.project_sub_indicator_id = Number(projectSubIndicatorId);
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}${endpoint}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        },
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const result = await response.json();
      setSuccess(true);

      // Handle different response formats
      if (result.computedValue !== undefined) {
        setCalculatedValue(result.computedValue);
      } else if (result.value !== undefined) {
        setCalculatedValue(result.value);
      }

      setLoading(false);
      return result;
    } catch (error) {
      console.error(`Failed to calculate ${indicatorType} value:`, error);
      setLoading(false);
      return null;
    }
  };

  return { success, loading, calculatedValue, calculateValue };
};

export default useCalculateValue;
