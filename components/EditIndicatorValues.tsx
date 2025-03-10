"use client";

import { useState } from "react";
import EditSubIndicatorValues from "./EditSubIndicatorValues";
import { Indicator } from "./ProgressFormComponent";
import useCreateFormula from "@/hooks/useCreateFormula";

const EditIndicatorValues = ({ indicator }: { indicator: Indicator }) => {
  // console.log(indicator);
  const { success, loading, createFormula } = useCreateFormula();
  const [formula, setFormula] = useState("");

  const submitFormulaChange = () => {
    if (indicator.goalIndicatorId) {
      createFormula(formula, indicator.goalIndicatorId, "indicator");
    }
  };

  return (
    <>
      <div key={indicator.indicatorId} className="w-full flex flex-col gap-4">
        <div className="w-full p-6 flex flex-col gap-6 bg-orange-50 rounded-md">
          <div className="flex flex-col gap-2">
            <h3 className="text-md font-semibold">{indicator.indicatorName}</h3>
            <hr />
          </div>
          <div className="pl-4">
            {indicator.requiredData.length > 0 ? (
              <div className="flex flex-col gap-1">
                <div>
                  <p>Input the computational formula for this indicator.</p>
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
                <p className="font-semibold text-sm">Required Data:</p>
                <div className="flex flex-col gap-2">
                  {indicator.requiredData.map((data) => (
                    <div
                      key={data.requiredDataId}
                      className="flex flex-col gap-2"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-sm">{data.requiredDataName}</p>
                        <div className="flex items-center gap-2">
                          <p className="text-sm">
                            {data.requiredDataName} current value:
                          </p>
                          <input
                            type="number"
                            className="w-[100px] border border-gray-700"
                          />
                        </div>
                      </div>
                      <hr />
                    </div>
                  ))}
                </div>
                <button className="bg-blue-300 p-2 rounded-md w-fit">
                  Submit
                </button>
              </div>
            ) : (
              <p className="text-gray-500 italic">No required data</p>
            )}
          </div>
        </div>

        <div className="w-full p-4 flex flex-col gap-4">
          {indicator.subIndicators.length > 0 ? (
            <div className="flex flex-col gap-4">
              <p>Sub-Indicators:</p>
              {indicator.subIndicators.map((sub) => (
                <EditSubIndicatorValues key={sub.subIndicatorId} sub={sub} />
              ))}
            </div>
          ) : (
            <p className="pl-6 text-gray-500 italic">No sub-indicators</p>
          )}
        </div>
      </div>
    </>
  );
};

export default EditIndicatorValues;
