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

const AddFactorComponent = ({ goals }: ProgressFormProps) => {
  const [goalFactors, setGoalFactors] = useState<Record<number, string[]>>({});
  const [factorInputs, setFactorInputs] = useState<Record<number, string>>({});
  const [selectedGoal, setSelectedGoal] = useState<number | null>(null);

  const addFactor = (goalId: number) => {
    if (!factorInputs[goalId]?.trim()) return; // Prevent empty factors

    setGoalFactors((prev) => ({
      ...prev,
      [goalId]: [...(prev[goalId] || []), factorInputs[goalId]],
    }));

    setFactorInputs((prev) => ({
      ...prev,
      [goalId]: "",
    }));
  };

  return (
    <div className="w-full flex items-start justify-start gap-20">
      <div className="w-1/4  flex flex-col gap-4">
        {goals.map((goal) => (
          <div
            key={goal.goalId}
            className={`w-full p-4 flex flex-col gap-2 rounded-lg bg-white/80 backdrop-blur drop-shadow cursor-pointer ${
              selectedGoal === goal.goalId
                ? "bg-gradient-to-br from-green-100 to-orange-50 border-gray-400"
                : ""
            }`}
            onClick={() => setSelectedGoal(goal.goalId)}
          >
            <p className="text-lg uppercase font-semibold text-gray-600">
              {goal.goalName}
            </p>
          </div>
        ))}
      </div>

      {selectedGoal !== null && (
        <div className="w-1/2 p-10 flex flex-col gap-10 bg-white drop-shadow rounded-lg">
          <div className="flex flex-col gap-2">
            <p className="text-2xl font-semibold text-orange-300">
              Main Factors for Goal # {selectedGoal}
            </p>
            <hr className="border-[1px] border-orange-200" />
          </div>
          <div className="w-full flex items-center gap-4">
            <input
              type="text"
              value={factorInputs[selectedGoal] || ""}
              placeholder="Add Factor"
              onChange={(e) =>
                setFactorInputs((prev) => ({
                  ...prev,
                  [selectedGoal]: e.target.value,
                }))
              }
              className="w-full px-4 py-2 border-b-[2px] border-b-gray-300 focus:outline-none"
            />
            <button
              className="bg-orange-200 px-4 py-2 rounded-md"
              onClick={() => addFactor(selectedGoal)}
            >
              Add
            </button>
          </div>
          <ul className="w-full flex flex-col gap-4">
            {(goalFactors[selectedGoal] || []).map((factor, index) => (
              <li
                className={`w-full px-4 py-2 rounded-md ${index % 2 === 0 ? "bg-gray-100" : ""}`}
                key={index}
              >
                {factor}
              </li>
            ))}
          </ul>
          <button className="w-full bg-orange-300 py-2 rounded-md">
            Submit
          </button>
        </div>
      )}
    </div>
  );
};

export default AddFactorComponent;
