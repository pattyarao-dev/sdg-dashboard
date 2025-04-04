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
    indicatorType:
      | "subIndicator"
      | "indicator"
      | "projectIndicator"
      | "projectSubIndicator",
    projectIndicatorId?: number,
    projectSubIndicatorId?: number,
  ) => {
    setLoading(true);
    setSuccess(false);
    setCalculatedValue(null);

    try {
      if (!process.env.NEXT_PUBLIC_API_BASE_URL) {
        throw new Error("API base URL is not defined in environment variables");
      }

      if (indicatorType === "indicator") {
        const valuesObject = values.reduce(
          (acc, item) => {
            acc[item.requiredDataName] = item.requiredDataValue;
            return acc;
          },
          {} as Record<string, number>,
        );
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/indicator_value`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              rule_id: ruleId,
              values: valuesObject,
              created_by: createdBy,
            }),
          },
        );

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }

        const result = await response.json();
        setSuccess(true);
        if (result.computedValue !== undefined) {
          setCalculatedValue(result.computedValue);
        }
        setLoading(false);
        return result;
      } else if (indicatorType === "subIndicator") {
        const valuesObject = values.reduce(
          (acc, item) => {
            acc[item.requiredDataName] = item.requiredDataValue;
            return acc;
          },
          {} as Record<string, number>,
        );
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/sub_indicator_value`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              rule_id: ruleId,
              values: valuesObject,
              created_by: createdBy,
            }),
          },
        );

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }

        const result = await response.json();
        setSuccess(true);

        if (result.value !== undefined) {
          setCalculatedValue(result.value);
        }
        setLoading(false);
        return result;
      } else if (indicatorType === "projectIndicator") {
        const valuesObject = values.reduce(
          (acc, item) => {
            acc[item.requiredDataName] = item.requiredDataValue;
            return acc;
          },
          {} as Record<string, number>,
        );
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/project_indicator_value`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              rule_id: ruleId,
              values: valuesObject,
              created_by: createdBy,
              project_indicator_id: Number(projectIndicatorId),
            }),
          },
        );

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }

        const result = await response.json();
        console.log("API Response:", result);
        setSuccess(true);

        if (result.computedValue !== undefined) {
          setCalculatedValue(result.computedValue);
        }
        setLoading(false);
        return result;
      } else if (indicatorType === "projectSubIndicator") {
        const valuesObject = values.reduce(
          (acc, item) => {
            acc[item.requiredDataName] = item.requiredDataValue;
            return acc;
          },
          {} as Record<string, number>,
        );
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/project_sub_indicator_value`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              rule_id: ruleId,
              values: valuesObject,
              created_by: createdBy,
              project_indicator_id: Number(projectSubIndicatorId),
            }),
          },
        );

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }

        const result = await response.json();
        console.log("API Response:", result);
        setSuccess(true);

        if (result.computedValue !== undefined) {
          setCalculatedValue(result.computedValue);
        }
        setLoading(false);
        return result;
      }
    } catch (error) {
      console.error(`Failed to calculate ${indicatorType} value:`, error);
      setLoading(false);
      return null;
    }
  };

  return { success, loading, calculatedValue, calculateValue };
};

export default useCalculateValue;
