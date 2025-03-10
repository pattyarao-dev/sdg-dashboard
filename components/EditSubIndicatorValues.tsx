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
    <>
      <div key={sub.subIndicatorId} className="w-full flex flex-col gap-2">
        <p className="font-bold">{sub.subIndicatorName}</p>
        <div>
          {sub.requiredData.length > 0 ? (
            <div className="flex flex-col gap-2">
              <div>
                <p>Input the computational formula for this sub-indicator.</p>
                <div className="w-full flex items-center justify-center gap-4">
                  <input
                    type="text"
                    onChange={(e) => setFormula(e.target.value)}
                    className="grow p-2 border border-gray-300 rounded-md flex items-center"
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
              <div className="w-full flex flex-col gap-4">
                {sub.requiredData.map((data) => (
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
    </>
  );
};

export default EditSubIndicatorValues;
