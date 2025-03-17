"use client";

import { useState } from "react";
import { IProjectIndicator } from "@/types/project.types";
import useUpdateValues from "@/hooks/useUpdateValues";
import useCalculateValue from "@/hooks/useCalculateValue";

const EditProjectIndicatorValues = ({
  indicator,
}: {
  indicator: IProjectIndicator;
}) => {
  const {
    success: indicatorValueSuccess,
    loading: indicatorValueLoading,
    updateValues,
  } = useUpdateValues();

  const {
    success: calculateIndicatorSuccess,
    loading: calculateIndicatorLoading,
    calculateValue,
    calculatedValue,
  } = useCalculateValue();

  const [newValues, setNewValues] = useState<
    Array<{
      goalIndicatorId: number;
      requiredDataId: number;
      value: number;
      createdBy: number;
    }>
  >([]);

  const userId = 1;

  const [finalCalculatedValue, setFinalCalculatedValue] = useState<
    number | null
  >();

  const handleValueChange = (requiredDataId: number, value: string) => {
    const numericValue = value === "" ? 0 : parseFloat(value);

    const existingIndex = newValues.findIndex(
      (item) => item.requiredDataId === requiredDataId,
    );

    if (existingIndex >= 0) {
      const updatedValues = [...newValues];
      updatedValues[existingIndex] = {
        ...updatedValues[existingIndex],
        value: numericValue,
      };
      setNewValues(updatedValues);
    } else {
      setNewValues([
        ...newValues,
        {
          goalIndicatorId: indicator.projectIndicatorId,
          requiredDataId: requiredDataId,
          value: numericValue,
          createdBy: userId,
        },
      ]);
    }
  };

  const submitNewValues = async () => {
    const validValues = newValues.filter((item) => item.value !== null);

    if (validValues.length === 0) {
      alert("Please input a value.");
      return;
    }

    try {
      await updateValues(validValues, "projectIndicator");

      if (indicator.computationRule && indicator.computationRule.length > 0) {
        const rule = indicator.computationRule[0];

        const valuesToCalculate: Array<{
          requiredDataName: string;
          requiredDataValue: number;
        }> = [];
        validValues.forEach((item) => {
          const requiredData = indicator.requiredData.find(
            (data) => data.requiredDataId === item.requiredDataId,
          );

          if (requiredData) {
            const formattedName = requiredData.requiredDataName
              .replace(/\s+/g, "_")
              .toLowerCase();

            if (formattedName.trim() !== "") {
              valuesToCalculate.push({
                requiredDataName: formattedName,
                requiredDataValue: item.value,
              });
            }
          }
        });

        // await calculateValue(
        //   rule.ruleId,
        //   valuesToCalculate,
        //   userId,
        //   "projectIndicator",
        //   indicator.projectIndicatorId,
        // );

        const computedResult = await calculateValue(
          rule.ruleId,
          valuesToCalculate,
          userId,
          "projectIndicator",
          indicator.projectIndicatorId,
        );

        if (computedResult?.computedValue !== undefined) {
          setFinalCalculatedValue(computedResult.computedValue);
        }

        // if (computedResult?.calculatedValue !== undefined) {
        //   setFinalCalculatedValue(computedResult.calculatedValue);
        // }
        // console.log("Calculated Value:", computedResult?.computedValue);
        // console.log("Final Calculated Value:", finalCalculatedValue);
      }

      setNewValues([]);
    } catch (error) {
      console.error("Failed to save values:", error);
    }
  };

  return (
    <div className="w-full">
      {indicator.requiredData.length > 0 ? (
        <div className="w-full flex flex-col gap-6">
          {indicator.computationRule.length > 0 ? (
            <>
              <div className="w-full p-4 bg-gray-300 flex flex-col gap-2">
                <p className="text-sm font-bold text-green-800">
                  Computation Rule for {indicator.indicatorName}:
                </p>
                {indicator.computationRule.map((rule) => (
                  <p
                    key={rule.ruleId}
                    className="w-full font-black font-mono text-xl"
                  >
                    {rule.ruleFormula}
                  </p>
                ))}
              </div>
              <div className="w-full p-4 flex flex-col gap-6">
                <div className="w-full flex flex-col gap-2">
                  {indicator.requiredData.map((data) => (
                    <div
                      key={data.requiredDataId}
                      className="w-full flex items-start justify-between"
                    >
                      <p>{data.requiredDataName}</p>
                      <div className="flex items-center gap-4">
                        <p>Current value for {data.requiredDataName}</p>
                        <input
                          type="number"
                          className="w-[100px] border border-gray-700"
                          onChange={(e) =>
                            handleValueChange(
                              data.requiredDataId,
                              parseFloat(e.target.value),
                            )
                          }
                          value={
                            newValues.find(
                              (v) => v.requiredDataId === data.requiredDataId,
                            )?.value ?? ""
                          }
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="w-full flex justify-end">
                  <button
                    onClick={submitNewValues}
                    className="w-fit px-4 py-2 bg-orange-200 font-bold"
                  >
                    Submit Values and Compute
                  </button>
                </div>
                <div className="w-full ">
                  {calculateIndicatorLoading ? (
                    <p>Calculating...</p>
                  ) : calculatedValue !== null ? (
                    <div className="w-full p-4 bg-gray-200">
                      <p className="font-bold text-green-800">
                        Computed Value:
                      </p>
                      <p className="text-xl font-mono">
                        {finalCalculatedValue}
                      </p>
                    </div>
                  ) : null}
                </div>
              </div>
            </>
          ) : (
            <div>No computation rule identified for this indicator.</div>
          )}
        </div>
      ) : (
        <div>No required data identified for this indicator.</div>
      )}
    </div>
  );
};

export default EditProjectIndicatorValues;
