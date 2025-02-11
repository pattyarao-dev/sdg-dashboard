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
    <div>
      {goals.map((goal) => (
        <div key={goal.goalId} className="p-4 border-b">
          <h2 className="text-lg font-bold">{goal.goalName}</h2>

          {goal.indicators.map((indicator) => (
            <div key={indicator.indicatorId} className="pl-4">
              <h3 className="text-md font-semibold">
                {indicator.indicatorName}
              </h3>
              {indicator.subIndicators.length > 0 ? (
                indicator.subIndicators.map((sub) => (
                  <p key={sub.subIndicatorId} className="pl-6 text-sm">
                    {sub.subIndicatorName}
                  </p>
                ))
              ) : (
                <p className="pl-6 text-gray-500 italic">No sub-indicators</p>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default ProgressFormComponent;
