// "use client";

// import { useCallback, useState } from "react";
// import EditSubIndicatorValues from "./EditSubIndicatorValues";
// import { Indicator } from "./ProgressFormComponent";
// import useCreateFormula from "@/hooks/useCreateFormula";
// import useUpdateValues from "@/hooks/useUpdateValues";
// import useCalculateValue from "@/hooks/useCalculateValue";

// const EditIndicatorValues = ({ indicator }: { indicator: Indicator }) => {
//   // console.log(indicator);
//   // const { success, loading, createFormula, successMessage } =
//   //   useCreateFormula();

//   // const [formula, setFormula] = useState("");

//   // const submitFormulaChange = () => {
//   //   if (indicator.goalIndicatorId) {
//   //     createFormula(formula, indicator.goalIndicatorId, "indicator");
//   //   }
//   // };

//   const { updateValues } = useUpdateValues();

//   const {
//     success: calculateIndicatorSuccess,
//     loading: calculateIndicatorLoading,
//     calculateValue,
//     calculatedValue,
//   } = useCalculateValue();

//   const [newValues, setNewValues] = useState<
//     Array<{
//       goalIndicatorId: number;
//       requiredDataId: number;
//       value: number;
//       createdBy: number;
//     }>
//   >([]);

//   const userId = 1; // Replace with actual user ID from your auth system

//   const [finalCalculatedValue, setFinalCalculatedValue] = useState<
//     number | null
//   >();

//   const handleValueChange = (requiredDataId: number, value: string) => {
//     const numericValue = value === "" ? 0 : parseFloat(value);

//     const existingIndex = newValues.findIndex(
//       (item) => item.requiredDataId === requiredDataId,
//     );

//     if (existingIndex >= 0) {
//       const updatedValues = [...newValues];
//       updatedValues[existingIndex] = {
//         ...updatedValues[existingIndex],
//         value: numericValue,
//       };
//       setNewValues(updatedValues);
//     } else {
//       setNewValues([
//         ...newValues,
//         {
//           goalIndicatorId: indicator.goalIndicatorId,
//           requiredDataId: requiredDataId,
//           value: numericValue,
//           createdBy: userId,
//         },
//       ]);
//     }
//   };

//   const submitNewValues = async () => {
//     const validValues = newValues.filter((item) => item.value !== null);

//     if (validValues.length === 0) {
//       alert("Please input a value.");
//       return;
//     }

//     try {
//       await updateValues(validValues, "indicator");

//       if (indicator.computationRule && indicator.computationRule.length > 0) {
//         const rule = indicator.computationRule[0];

//         const valuesToCalculate: Array<{
//           requiredDataName: string;
//           requiredDataValue: number;
//         }> = [];
//         validValues.forEach((item) => {
//           const requiredData = indicator.requiredData.find(
//             (data) => data.requiredDataId === item.requiredDataId,
//           );

//           if (requiredData) {
//             const formattedName = requiredData.requiredDataName
//               .replace(/\s+/g, "_")
//               .toLowerCase();

//             if (formattedName.trim() !== "") {
//               valuesToCalculate.push({
//                 requiredDataName: formattedName,
//                 requiredDataValue: item.value,
//               });
//             }
//           }
//         });

//         const computedResult = await calculateValue(
//           rule.ruleId,
//           valuesToCalculate,
//           userId,
//           "indicator",
//         );

//         if (computedResult?.computedValue !== undefined) {
//           setFinalCalculatedValue(computedResult.computedValue);
//         }
//       }
//       setNewValues([]);
//     } catch (error) {
//       console.error("Failed to save values:", error);
//     }
//   };
//   return (
//     <div
//       key={indicator.indicatorId}
//       className="w-full p-8 flex flex-col gap-10 bg-white border-2 border-gray-300"
//     >
//       <div className="w-full flex flex-col gap-6">
//         <div className="flex flex-col gap-2">
//           <div className="w-full flex items-center gap-4">
//             <p>{indicator.goalIndicatorId}</p>
//             <h3 className="text-xl font-semibold">{indicator.indicatorName}</h3>
//           </div>
//           <hr />
//         </div>
//         <div className="w-full">
//           {indicator.requiredData.length > 0 ? (
//             <div className="flex flex-col gap-10">
//               {indicator.computationRule.length > 0 ? (
//                 <>
//                   <div className="w-full p-4 flex flex-col gap-2 bg-gray-100">
//                     <p className="text-sm font-semibold text-green-800">
//                       Computation Rule for {indicator.indicatorName}:
//                     </p>
//                     {indicator.computationRule.map((rule) => (
//                       <p
//                         key={rule.ruleId}
//                         className="w-fit font-mono bg-gray-300 py-2 px-4"
//                       >
//                         {rule.ruleFormula}
//                       </p>
//                     ))}
//                   </div>
//                   <div className="w-full p-6 flex flex-col gap-4 bg-gray-100">
//                     <div className="w-full flex flex-col gap-2">
//                       <p className="text-green-800 font-semibold text-sm">
//                         Indicator Required Data:
//                       </p>
//                       {indicator.requiredData.map((data) => (
//                         <div
//                           key={data.requiredDataId}
//                           className="w-full flex flex-col gap-2"
//                         >
//                           <div className="w-full flex items-center justify-between">
//                             <p className="text-lg">{data.requiredDataName}</p>
//                             <div className="flex items-center gap-2">
//                               <p className="text-lg">
//                                 {data.requiredDataName} current value:
//                               </p>
//                               <input
//                                 type="number"
//                                 onChange={(e) =>
//                                   handleValueChange(
//                                     data.requiredDataId,
//                                     parseFloat(e.target.value),
//                                   )
//                                 }
//                                 value={
//                                   newValues.find(
//                                     (v) =>
//                                       v.requiredDataId === data.requiredDataId,
//                                   )?.value ?? ""
//                                 }
//                                 className="w-[100px] border border-gray-700"
//                               />
//                             </div>
//                           </div>
//                           <hr />
//                         </div>
//                       ))}
//                     </div>
//                     <div className="w-full flex justify-end">
//                       <button
//                         className="w-fit bg-orange-300 px-6 py-2 rounded-md font-semibold"
//                         onClick={submitNewValues}
//                       >
//                         Submit Indicator Required Data Values and Compute
//                       </button>
//                       <div className="w-full ">
//                         {calculateIndicatorLoading ? (
//                           <p className="text-right">Calculating...</p>
//                         ) : finalCalculatedValue !== null ? (
//                           <div className="w-full p-4 bg-gray-200">
//                             <p className="font-bold text-green-800">
//                               Computed Value:
//                             </p>
//                             <p className="text-xl font-mono">
//                               {finalCalculatedValue}
//                             </p>
//                           </div>
//                         ) : null}
//                       </div>
//                     </div>
//                   </div>
//                 </>
//               ) : (
//                 <div className="w-full p-4 flex flex-col gap-2 bg-gray-100">
//                   This indicator has no computation rule yet. Identify a rule
//                   for this indicator first.
//                 </div>
//               )}
//             </div>
//           ) : (
//             <p className="text-gray-500 italic">No required data</p>
//           )}
//         </div>
//       </div>

//       <div className="w-full flex flex-col gap-4">
//         {indicator.subIndicators.length > 0 ? (
//           <div className="flex flex-col gap-4">
//             <p className="text-lg font-bold uppercase text-green-800">
//               Sub-Indicators:
//             </p>
//             {indicator.subIndicators.map((sub) => (
//               <EditSubIndicatorValues key={sub.subIndicatorId} sub={sub} />
//             ))}
//           </div>
//         ) : (
//           <p className="pl-6 text-gray-500 italic">
//             This goal-indicator has no sub-indicators
//           </p>
//         )}
//       </div>
//     </div>
//   );
// };

// export default EditIndicatorValues;

"use client";

import { useState } from "react";
import EditSubIndicatorValues from "./EditSubIndicatorValues";
import { Indicator } from "./ProgressFormComponent";
import useUpdateValues from "@/hooks/useUpdateValues";
import useCalculateValue from "@/hooks/useCalculateValue";
import { Session } from "next-auth";

const EditIndicatorValues = ({
  indicator,
  session,
}: {
  indicator: Indicator;
  session: Session;
}) => {
  const { updateValues } = useUpdateValues();

  const { loading: calculateIndicatorLoading, calculateValue } =
    useCalculateValue();

  const [newValues, setNewValues] = useState<
    Array<{
      goalIndicatorId: number;
      requiredDataId: number;
      value: number;
      createdBy: number;
    }>
  >([]);
  const [notes, setNotes] = useState<string>("");

  const userId = (session.user as any).id as number; // Replace with actual user ID from your auth system

  const [finalCalculatedValue, setFinalCalculatedValue] = useState<
    number | null
  >(null);

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

  const submitNotes = async () => {
    if (!notes.trim()) {
      alert("Please enter a description before submitting.");
      return;
    }
    console.log((session.user as any).id);
    try {
      const response = await fetch("/api/goal_description", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          goalIndicatorId: indicator.goalIndicatorId,
          explanation: notes,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Description created successfully:", result);
        setNotes(""); // Clear the form
        alert("Description submitted successfully!");
      } else {
        const errorData = await response.json();
        console.error("Failed to submit notes:", errorData);
        alert(`Failed to submit: ${errorData.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error submitting notes:", error);
      alert("Network error occurred. Please try again.");
    }
  };

  const submitNewValues = async () => {
    const validValues = newValues.filter((item) => item.value !== null);

    console.log(indicator);
    if (validValues.length === 0) {
      alert("Please input a value.");
      return;
    }

    try {
      await updateValues(validValues, "indicator");

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
        console.log("I'M THE RULE!:");
        console.log(rule);
        const computedResult = await calculateValue(
          rule.ruleId,
          valuesToCalculate,
          userId,
          "indicator",
          (rule as any).includeSubIndicators, // Add this - use the flag from the computation rule
        );

        console.log("Raw computed result:", computedResult);
        console.log(
          "Computed value from result:",
          computedResult?.computedValue,
        );

        if (computedResult?.computedValue !== undefined) {
          setFinalCalculatedValue(computedResult.computedValue);
        }

        setNewValues([]);
      }
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
                                    e.target.value,
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
                    <div className="w-full flex flex-col gap-4">
                      <div className="w-full flex justify-end">
                        <button
                          className="w-fit bg-orange-300 px-6 py-2 rounded-md font-semibold"
                          onClick={submitNewValues}
                        >
                          Submit Indicator Required Data Values and Compute
                        </button>
                      </div>

                      {calculateIndicatorLoading ? (
                        <p className="text-right">Calculating...</p>
                      ) : finalCalculatedValue !== null ? (
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
                <div className="w-full p-4 flex flex-col gap-2 bg-gray-100">
                  This indicator has no computation rule yet. Identify a rule
                  for this indicator first.
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500 italic">No required data</p>
          )}
        </div>
      </div>
      <div className="w-full p-8 bg-gray-100 flex flex-col gap-4">
        <h1 className="uppercase text-green-800 font-bold text-sm">
          Indicator Progress Summary:
        </h1>
        <div className="w-full flex flex-col items-end gap-4">
          <textarea
            onChange={(e) => setNotes(e.target.value)}
            value={notes}
            className="w-full border-2 border-gray-200 rounded-md p-2"
          />
          <button
            onClick={submitNotes}
            className="w-fit bg-orange-300 px-4 py-1 rounded-md font-bold"
          >
            Submit
          </button>
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
