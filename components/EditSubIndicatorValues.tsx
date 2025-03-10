import { useState } from "react";
import { SubIndicator } from "./ProgressFormComponent";
import useCreateFormula from "@/hooks/useCreateFormula";

const EditSubIndicatorValues = ({ sub }: { sub: SubIndicator }) => {
  console.log(sub);
  const { success, loading, createFormula } = useCreateFormula();
  const [formula, setFormula] = useState("");

  const submitFormulaChange = () => {
    console.log(sub.goalSubIndicatorId);
    if (sub.goalSubIndicatorId) {
      createFormula(formula, sub.goalSubIndicatorId, "indicator");
    }
  };
  return (
    <div
      key={sub.subIndicatorId}
      className="w-full p-6 flex flex-col gap-4 bg-gray-100"
    >
      <p className="text-lg font-bold">{sub.subIndicatorName}</p>
      <div>
        {sub.requiredData.length > 0 ? (
          <div className="flex flex-col gap-10">
            {sub.subIndicatorComputationRule.length > 0 ? (
              <>
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
                <div className="w-full p-6 flex flex-col gap-4 border border-gray-300">
                  <div className="w-full flex flex-col gap-2">
                    <p className="text-green-800 font-semibold text-sm">
                      Sub-Indicator Required Data:
                    </p>
                    {sub.requiredData.map((data) => (
                      <div
                        key={data.requiredDataId}
                        className="w-full flex flex-col gap-2"
                      >
                        <div className="w-full flex items-center justify-between">
                          <p className="">{data.requiredDataName}</p>
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
                  <button className="w-fit bg-orange-200 px-6 py-2 rounded-md">
                    Submit Sub-Indicator Required Data Values
                  </button>
                </div>
              </>
            ) : (
              <div className="w-full p-6 flex flex-col gap-2 border border-gray-300">
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
            )}
          </div>
        ) : (
          <p className="text-gray-500 italic">No required data</p>
        )}
      </div>
    </div>
  );
};

export default EditSubIndicatorValues;
