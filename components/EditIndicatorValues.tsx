"use client";

import { useState } from "react";
import EditSubIndicatorValues from "./EditSubIndicatorValues";
import { Indicator } from "./ProgressFormComponent";
import useCreateFormula from "@/hooks/useCreateFormula";
import useUpdateValues from "@/hooks/useUpdateValues";

const EditIndicatorValues = ({ indicator }: { indicator: Indicator }) => {
  // console.log(indicator);
  const { success, loading, createFormula } = useCreateFormula();

  const [formula, setFormula] = useState("");

  const submitFormulaChange = () => {
    if (indicator.goalIndicatorId) {
      createFormula(formula, indicator.goalIndicatorId, "indicator");
    }
  };

  const {
    success: indicatorValueSuccess,
    loading: indicatorValueLoading,
    updateValues,
  } = useUpdateValues();

  const [newValues, setNewValues] = useState<
    Array<{
      goalIndicatorId: number;
      requiredDataId: number;
      value: number;
      createdBy: number;
    }>
  >([]);

  const userId = 1; // Replace with actual user ID from your auth system

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
          goalIndicatorId: indicator.goalIndicatorId,
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
      alert("Please enter at least one value");
      return;
    }

    try {
      await updateValues(validValues, "indicator");
      setNewValues([]);
    } catch (error) {
      console.error("Failed to save values:", error);
    }
  };
  return (
    <div
      key={indicator.indicatorId}
      className="w-full p-8 flex flex-col gap-10 bg-white border-2 border-gray-300"
    >
      <div className="w-full flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <div className="w-full flex items-center gap-4">
            <p>{indicator.goalIndicatorId}</p>
            <h3 className="text-xl font-semibold">{indicator.indicatorName}</h3>
          </div>
          <hr />
        </div>
        <div className="w-full">
          {indicator.requiredData.length > 0 ? (
            <div className="flex flex-col gap-10">
              {indicator.computationRule.length > 0 ? (
                <>
                  <div className="w-full p-4 flex flex-col gap-2 bg-gray-100">
                    <p className="text-sm font-semibold text-green-800">
                      Computation Rule for {indicator.indicatorName}:
                    </p>
                    {indicator.computationRule.map((rule) => (
                      <p
                        key={rule.ruleId}
                        className="w-fit font-mono bg-gray-300 py-2 px-4"
                      >
                        {rule.ruleFormula}
                      </p>
                    ))}
                  </div>
                  <div className="w-full p-6 flex flex-col gap-4 bg-gray-100">
                    <div className="w-full flex flex-col gap-2">
                      <p className="text-green-800 font-semibold text-sm">
                        Indicator Required Data:
                      </p>
                      {indicator.requiredData.map((data) => (
                        <div
                          key={data.requiredDataId}
                          className="w-full flex flex-col gap-2"
                        >
                          <div className="w-full flex items-center justify-between">
                            <p className="text-lg">{data.requiredDataName}</p>
                            <div className="flex items-center gap-2">
                              <p className="text-lg">
                                {data.requiredDataName} current value:
                              </p>
                              <input
                                type="number"
                                onChange={(e) =>
                                  handleValueChange(
                                    data.requiredDataId,
                                    parseFloat(e.target.value),
                                  )
                                }
                                value={
                                  newValues.find(
                                    (v) =>
                                      v.requiredDataId === data.requiredDataId,
                                  )?.value ?? ""
                                }
                                className="w-[100px] border border-gray-700"
                              />
                            </div>
                          </div>
                          <hr />
                        </div>
                      ))}
                    </div>
                    <button
                      className="w-fit bg-orange-300 px-6 py-2 rounded-md font-semibold"
                      onClick={submitNewValues}
                    >
                      Submit Indicator Required Data Values
                    </button>
                  </div>
                </>
              ) : (
                <div className="w-full p-4 flex flex-col gap-2 bg-gray-100">
                  <p className="text-sm font-semibold text-green-800">
                    Input the computational formula for this indicator.
                  </p>
                  <div className="w-full flex items-center justify-center gap-4">
                    <input
                      type="text"
                      className="grow p-2 border border-gray-300 rounded-md flex items-center"
                      onChange={(e) => setFormula(e.target.value)}
                      placeholder="Enter formula"
                    />
                    <button
                      onClick={submitFormulaChange}
                      className="w-fit py-2 px-4 bg-gradient-to-br from-green-200 to-orange-100 rounded-md"
                    >
                      Submit Formula
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500 italic">No required data</p>
          )}
        </div>
      </div>

      <div className="w-full flex flex-col gap-4">
        {indicator.subIndicators.length > 0 ? (
          <div className="flex flex-col gap-4">
            <p className="text-lg font-bold uppercase text-green-800">
              Sub-Indicators:
            </p>
            {indicator.subIndicators.map((sub) => (
              <EditSubIndicatorValues key={sub.subIndicatorId} sub={sub} />
            ))}
          </div>
        ) : (
          <p className="pl-6 text-gray-500 italic">
            This goal-indicator has no sub-indicators
          </p>
        )}
      </div>
    </div>
  );
};

export default EditIndicatorValues;
