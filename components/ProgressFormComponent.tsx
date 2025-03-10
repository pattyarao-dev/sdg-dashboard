"use client";

import { updateValues } from "@/app/actions/actions";
import { useState } from "react";
import EditIndicatorValues from "./EditIndicatorValues";

interface RequiredData {
  requiredDataId: number;
  requiredDataName: string;
  requiredDataValue: number;
}

export interface SubIndicator {
  goalSubIndicatorId: number;
  subIndicatorId: number;
  subIndicatorName: string;
  requiredData: RequiredData[];
}

export interface Indicator {
  goalIndicatorId: number;
  indicatorId: number;
  indicatorName: string;
  subIndicators: SubIndicator[];
  requiredData: RequiredData[];
}

interface Goal {
  goalId: number;
  goalName: string;
  indicators: Indicator[];
}

interface ProgressFormProps {
  goals: Goal[];
}

const ProgressFormComponent = ({ goals }: ProgressFormProps) => {
  const [formValues, setFormValues] = useState<Record<string, number>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: parseFloat(value) || 0, // Ensure numeric input
    }));
  };

  // const handleUpdateValuesSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();

  //   const formData = new FormData();

  //   goals.forEach((goal) => {
  //     formData.append("goalIndicatorId", goal.goalId.toString());

  //     goal.indicators.forEach((indicator) => {
  //       const indicatorValue =
  //         formValues[`indicator-${indicator.indicatorId}`] || 0;

  //       formData.append(
  //         "indicatorValues",
  //         JSON.stringify({
  //           indicator_id: indicator.indicatorId,
  //           value: indicatorValue,
  //           notes: "",
  //         }),
  //       );

  //       indicator.subIndicators.forEach((sub) => {
  //         const subIndicatorValue =
  //           formValues[`subindicator-${sub.subIndicatorId}`] || 0;

  //         formData.append(
  //           "subIndicatorValues",
  //           JSON.stringify({
  //             sub_indicator_id: sub.subIndicatorId,
  //             value: subIndicatorValue,
  //             notes: "",
  //           }),
  //         );
  //       });
  //     });
  //   });

  //   console.log("Submitting FormData:", [...formData.entries()]); // Debugging
  //   await updateValues(formData);
  // };

  return (
    <div
      // onSubmit={handleUpdateValuesSubmit}
      className="w-full border-2 border-black p-4"
    >
      {goals.map((goal) => (
        <div
          key={goal.goalId}
          className="w-full p-4 flex flex-col gap-4 border-b"
        >
          <h2 className="w-full p-4 bg-gradient-to-br from-green-50 to-orange-50 rounded-md drop-shadow text-gray-600 text-lg font-bold">
            {goal.goalName}
          </h2>

          {goal.indicators.map((indicator) => (
            <EditIndicatorValues
              indicator={indicator}
              key={indicator.indicatorId}
            />
          ))}
        </div>
      ))}

      {/* <button
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
        type="submit"
      >
        Submit
      </button> */}
    </div>
  );
};

export default ProgressFormComponent;
