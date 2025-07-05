"use client";

import { useState } from "react";
import AddExistingIndicator from "./AddExistingIndicator";
import AddNewIndicator from "./AddNewIndicator";
import EditIndicators from "./EditIndicators";
import { Goal, RequiredData, Indicator, GoalIndicator } from "@/types/goal.types";

const IndicatorManagementComponent = ({
  goal,
  requiredData,
  availableIndicators,
}: {
  goal: Goal;
  requiredData: RequiredData[];
  availableIndicators: Indicator[];
}) => {
  const [task, setTask] = useState("");

  return (
    <div className="w-full min-h-screen flex flex-col gap-10">
      <div className="w-full flex flex-col gap-4">
        <h1 className="text-3xl font-bold uppercase">Indicator Management</h1>
        <div className="w-full flex items-center gap-10">
          <button
            onClick={() => setTask("Create a New Indicator")}
            className="w-[300px] px-6 py-2 bg-clip-text bg-gradient-to-r from-green-300 to-orange-400 text-transparent font-bold uppercase border-2 border-orange-200"
          >
            Create a New Indicator
          </button>
          <button
            onClick={() => setTask("Add an Existing Indicator")}
            className="w-[300px] px-6 py-2 bg-clip-text bg-gradient-to-r from-green-300 to-orange-400 text-transparent font-bold uppercase border-2 border-orange-200"
          >
            Add an Existing Indicator
          </button>
          <button
            onClick={() => setTask("Edit Indicators")}
            className="w-[300px] px-6 py-2 bg-clip-text bg-gradient-to-r from-green-300 to-orange-400 text-transparent font-bold uppercase border-2 border-orange-200"
          >
            Edit Indicators
          </button>
        </div>
      </div>
      <div>
        {task === "Create a New Indicator" ? (
          <AddNewIndicator goal={goal} requiredData={requiredData} />
        ) : // <AddNewIndicatorRecursive goal={goal} requiredData={requiredData} />
          task === "Add an Existing Indicator" ? (
            <AddExistingIndicator
              goal={goal}
              availableIndicators={availableIndicators as unknown as GoalIndicator[]}
              requiredData={requiredData}
            />
          ) : task === "Edit Indicators" ? (
            <EditIndicators goal={goal} />
          ) : null}
      </div>
    </div>
  );
};

export default IndicatorManagementComponent;
