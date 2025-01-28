"use client";

// import { addIndicator } from "@/app/actions/actions";
import { IGoal } from "@/types/indicator.types";
import { useState } from "react";

type GoalsProps = {
  goalsList: IGoal[];
};

export default function AddIndicatorForm({ goalsList }: GoalsProps) {
  // const [selectedGoals, setSelectedGoals] = useState<number[]>([]);

  /*
  KEEP FOR SUBINDICATORS
  const handleGoalToggle = (goalId: number) => {
    setSelectedGoals(
      (prev) =>
        prev.includes(goalId)
          ? prev.filter((id) => id !== goalId) // Remove if already selected
          : [...prev, goalId], // Add if not already selected
    );
  };
  */

  return (
    <div className="w-[40%] px-16 py-10 bg-neutral-100 flex flex-col items-start justify-center gap-10 rounded-2xl drop-shadow-lg">
      <h1 className="text-2xl font-bold">Create a new indicator.</h1>
      <form
        action={async (formData) => {
          // Append each indicator individually
          selectedGoals.forEach((goalId) => {
            formData.append("goals", goalId.toString());
          });
          await addIndicator(formData);
        }}
        className="w-full flex flex-col items-start justify-center gap-10"
      >
        <div className="w-full flex flex-col items-start">
          <label>Indicator Name</label>
          <input
            type="text"
            name="name"
            placeholder="Indicator Name"
            className="w-full p-2 text-sm rounded-md"
          />
        </div>

        <div className="w-full flex flex-col items-start">
          <label>Indicator Description</label>
          <input
            type="textarea"
            name="description"
            placeholder="Indicator Description"
            className="w-full p-2 text-sm rounded-md"
          />
        </div>

        {/* <div className="w-full flex flex-col items-start">
          <label>Goals</label>
          <div className="w-full h-44 overflow-y-auto p-4 rounded-md bg-white flex flex-col gap-3">
            {goalsList.map((goal) => (
              <div key={goal.goal_id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id={`goal-${goal.goal_id}`}
                  value={goal.name}
                  onChange={() => handleGoalToggle(goal.goal_id)}
                />
                <label
                  htmlFor={`goal-${goal.goal_id}`}
                  className="font-semibold text-sm"
                >
                  {goal.name}
                </label>
              </div>
            ))}
          </div>
        </div> */}

        <button
          type="submit"
          className="w-fit px-4 py-2 bg-pink-500 text-white rounded-lg"
        >
          Add Indicator
        </button>
      </form>
    </div>
  );
}
