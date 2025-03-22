import { useState } from "react";
import { SubIndicator } from "./ProgressFormComponent";
import useCreateFormula from "@/hooks/useCreateFormula";
import useUpdateValues from "@/hooks/useUpdateValues";
import useCalculateValue from "@/hooks/useCalculateValue";
import { IProjectSubIndicator } from "@/types/project.types";

const EditSubIndicatorValues = ({ sub }: { sub: IProjectSubIndicator }) => {
  console.log(sub);
  const [formula, setFormula] = useState("");

  const {
    success: subIndicatorValueSuccess,
    loading: subIndicatorValueLoading,
    updateValues,
  } = useUpdateValues();

  const {
    success: calculateSubIndicatorSuccess,
    loading: calculateSubIndicatorLoading,
    calculateValue,
  } = useCalculateValue();

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
          goalIndicatorId: sub.goalSubIndicatorId,
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
      await updateValues(validValues, "projectSubIndicator");
      if (sub.computationRule && sub.computationRule.length > 0) {
        const rule = sub.computationRule[0];

        const valuesToCalculate: Array<{
          requiredDataName: string;
          requiredDataValue: number;
        }> = [];
        validValues.forEach((item) => {
          const requiredData = sub.requiredData.find(
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

        await calculateValue(
          rule.ruleId,
          valuesToCalculate,
          userId,
          "subIndicator",
        );
      }
      setNewValues([]);
    } catch (error) {
      console.error("Failed to save values:", error);
    }
  };

  return (
    <div
      key={sub.goalSubIndicatorId}
      className="w-full p-6 flex flex-col gap-4 bg-gray-100"
    >
      <p className="text-lg font-bold">
        <span className="font-thin text-sm">{sub.goalSubIndicatorId}</span>{" "}
        {sub.subIndicatorName}
      </p>
      <div>
        {sub.requiredData.length > 0 ? (
          <div className="flex flex-col gap-10">
            {sub.computationRule.length > 0 ? (
              <>
                <div className="w-full p-6 flex flex-col gap-2 border border-gray-300">
                  <p className="text-sm font-semibold text-green-800">
                    Computation Rule for {sub.subIndicatorName}:
                  </p>
                  {sub.computationRule.map((subRule) => (
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
                    onClick={submitNewValues}
                    className="w-fit bg-orange-200 px-6 py-2 rounded-md"
                  >
                    Submit Sub-Indicator Required Data Values and Compute
                  </button>
                </div>
              </>
            ) : (
              <div className="w-full p-6 flex flex-col gap-6 border border-gray-300">
                This sub-indicator does not have a computation rule yet.
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
