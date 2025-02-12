"use client";

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
  return (
    <div className="w-full border-2 border-black">
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
                  <label htmlFor="indicator_current value">
                    Indicator Current Value:
                  </label>
                  <input
                    className="w-[100px] p-1 focus:outline-none border border-gray-700 rounded-md"
                    name="indicator_current_value"
                    type="number"
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
                        <label htmlFor="subindicator_current value">
                          Sub-Indicator Current Value:
                        </label>
                        <input
                          className="w-[100px] p-1 focus:outline-none border border-gray-700 rounded-md"
                          name="subindicator_current_value"
                          type="number"
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
      <form onSubmit={handleUpdateValuesSubmit}>
        <button className="mt-4 bg-blue-500 text-white px-4 py-2 rounded">
          Submit
        </button>
      </form>
    </div>
  );
};

export default ProgressFormComponent;
