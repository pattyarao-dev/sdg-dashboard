"use client";

import { updateValues } from "@/app/actions/actions";
import { useState } from "react";

interface SubIndicator {
  subIndicatorId: number;
  subIndicatorName: string;
}

interface Indicator {
  indicatorId: number;
  indicatorName: string;
  subIndicators: SubIndicator[];
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

  const handleUpdateValuesSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();

    goals.forEach((goal) => {
      formData.append("goalIndicatorId", goal.goalId.toString());

      goal.indicators.forEach((indicator) => {
        const indicatorValue =
          formValues[`indicator-${indicator.indicatorId}`] || 0;

        formData.append(
          "indicatorValues",
          JSON.stringify({
            indicator_id: indicator.indicatorId,
            value: indicatorValue,
            notes: "",
          }),
        );

        indicator.subIndicators.forEach((sub) => {
          const subIndicatorValue =
            formValues[`subindicator-${sub.subIndicatorId}`] || 0;

          formData.append(
            "subIndicatorValues",
            JSON.stringify({
              sub_indicator_id: sub.subIndicatorId,
              value: subIndicatorValue,
              notes: "",
            }),
          );
        });
      });
    });

    console.log("Submitting FormData:", [...formData.entries()]); // Debugging
    await updateValues(formData);
  };

  return (
    <form
      onSubmit={handleUpdateValuesSubmit}
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
            <div
              key={indicator.indicatorId}
              className="w-full flex flex-col gap-4"
            >
              <div className="w-full px-4 py-2 flex items-center justify-between gap-10 bg-orange-50 rounded-md">
                <h3 className="text-md font-semibold">
                  {indicator.indicatorName}
                </h3>
                <div className="flex items-center gap-4">
                  <label htmlFor={`indicator-${indicator.indicatorId}`}>
                    Indicator Current Value:
                  </label>
                  <input
                    className="w-[100px] p-1 focus:outline-none border border-gray-700 rounded-md"
                    name={`indicator-${indicator.indicatorId}`}
                    type="number"
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="w-full p-4 flex flex-col gap-4">
                {indicator.subIndicators.length > 0 ? (
                  indicator.subIndicators.map((sub) => (
                    <div
                      key={sub.subIndicatorId}
                      className="w-full flex items-center justify-between"
                    >
                      <p className="text-sm">{sub.subIndicatorName}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <label htmlFor={`subindicator-${sub.subIndicatorId}`}>
                          Sub-Indicator Current Value:
                        </label>
                        <input
                          className="w-[100px] p-1 focus:outline-none border border-gray-700 rounded-md"
                          name={`subindicator-${sub.subIndicatorId}`}
                          type="number"
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="pl-6 text-gray-500 italic">No sub-indicators</p>
                )}
              </div>
            </div>
          ))}
        </div>
      ))}

      <button
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
        type="submit"
      >
        Submit
      </button>
    </form>
  );
};

export default ProgressFormComponent;
