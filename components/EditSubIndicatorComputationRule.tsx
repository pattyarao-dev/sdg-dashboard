"use client";

import { SubIndicator } from "@/types/indicator.types";
import { useState } from "react";
import useCreateFormula from "@/hooks/useCreateFormula";

const EditSubIndicatorComputationRule = ({ sub }: { sub: SubIndicator }) => {
  const { success, loading, createFormula, successMessage } =
    useCreateFormula();

  const [formula, setFormula] = useState("");

  const submitFormulaChange = () => {
    if (sub.goalSubIndicatorId) {
      createFormula(formula, sub.goalSubIndicatorId, "subIndicator");
    }
  };

  const userId = 1;

  return (
    <div className="w-full p-6 flex flex-col gap-4 bg-gray-100">
      <p className="text-lg font-bold">
        <span className="font-thin text-sm">{sub.goalSubIndicatorId}</span>{" "}
        {sub.subIndicatorName}
      </p>
      {sub.requiredData.length > 0 ? (
        <div className="flex flex-col gap-10">
          {sub.subIndicatorComputationRule.length > 0 ? (
            <div className="w-full p-6 flex flex-col gap-2 border border-gray-300">
              <p className="text-sm font-semibold text-green-800">
                Computation Rule for {sub.subIndicatorName}:
              </p>
              {sub.subIndicatorComputationRule.map((subRule) => (
                <p
                  key={subRule.ruleId}
                  className="w-fit font-mono bg-gray-300 py-2 px-4"
                >
                  {subRule.ruleFormula}
                </p>
              ))}
            </div>
          ) : (
            <div className="w-full p-6 flex flex-col gap-6 border border-gray-300">
              <div className="w-full flex flex-col gap-2">
                <p className="text-sm font-semibold text-green-800">
                  Input the computational formula for this sub-indicator.
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
              <div className="w-full flex flex-col">
                <p className="w-full text-sm font-semibold text-green-800">
                  Required Data:
                </p>
                <div className="w-full pl-3 flex flex-col">
                  {sub.requiredData.map((data) => (
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
  );
};

export default EditSubIndicatorComputationRule;
