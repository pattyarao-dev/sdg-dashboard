"use client";

import { useState } from "react";
import { Indicator } from "@/types/indicator.types";
import useCreateFormula from "@/hooks/useCreateFormula";
import EditSubIndicatorComputationRule from "./EditSubIndicatorComputationRule";

const EditIndicatorComputationRule = ({
  indicator,
}: {
  indicator: Indicator;
}) => {
  const { success, loading, createFormula, successMessage } =
    useCreateFormula();

  const [formula, setFormula] = useState("");
  function formatFormula(input: string): string {
    return input.replace(/\b[a-zA-Z\s]+\b/g, (match) => {
      // Only replace if it's not an operator/number
      if (!/^\d+$/.test(match.trim())) {
        return match.trim().replace(/\s+/g, "_").toLowerCase();
      }
      return match;
    });
  }

  const submitFormulaChange = () => {
    if (indicator.goalIndicatorId) {
      const formattedFormula = formatFormula(formula);
      createFormula(formattedFormula, indicator.goalIndicatorId, "indicator");
    }
  };

  const userId = 1;

  return (
    <div
      key={indicator.goalIndicatorId}
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
              ) : (
                <div className="w-full p-4 flex flex-col gap-4 bg-gray-100">
                  <div className="w-full flex flex-col gap-2">
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
                  <div className="w-full flex flex-col gap-1">
                    <p className="w-full text-sm font-semibold text-green-800">
                      Required Data:
                    </p>
                    <div className="w-full pl-3 flex flex-col">
                      {indicator.requiredData.map((data) => (
                        <p key={data.requiredDataId}>{data.requiredDataName}</p>
                      ))}
                    </div>
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
          <div className="w-full flex flex-col gap-2 ">
            <p className="text-lg font-bold uppercase text-green-800">
              Sub-Indicators:
            </p>
            {indicator.subIndicators.map((sub) => (
              <EditSubIndicatorComputationRule
                key={sub.subIndicatorId}
                sub={sub}
              />
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

export default EditIndicatorComputationRule;
