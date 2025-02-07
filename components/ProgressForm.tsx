"use client";

import { IIndicator } from "@/types/indicator.types";

interface AddIndicatorProps {
  goalName: string;
  goalId: number;
  goalIndicators: IIndicator[];
}

const ProgressForm = ({
  goalName,
  goalId,
  goalIndicators,
}: AddIndicatorProps) => {
  return (
    <div>
      {goalIndicators.map((indicator) => (
        <div key={indicator.indicator_id}>{indicator.name}</div>
      ))}
    </div>
  );
};

export default ProgressForm;
