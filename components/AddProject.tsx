"use client";

import { addProjectIndicators } from "@/app/actions/actions";
import {
  IGoalIndicator,
  IGoalIndicatorSimple,
  IGoalProjectIndicator,
  IGoalWithIndicators,
} from "@/types/indicator.types";
import { IProject } from "@/types/project.types";
import { useEffect, useState } from "react";

const AddProject = ({
  project,
  unassignedIndicators,
}: {
  project: IProject;
  unassignedIndicators: IGoalWithIndicators[];
}) => {
  const [selectedIndicators, setSelectedIndicators] = useState<
    IGoalIndicatorSimple[]
  >([]);
  // const [selectedGoals, setSelectedGoals] = useState<string[]>([]);

  // const goals = unassignedIndicators.map((goal) => goal.name);

  // useEffect(() => {

  // }, [selectedIndicators, goals]);

  useEffect(() => {
    console.log(selectedIndicators);
  }, [selectedIndicators]);

  const handleIndicatorSelect = (indicator: IGoalIndicatorSimple) => {
    if (selectedIndicators.includes(indicator)) {
      setSelectedIndicators(
        selectedIndicators.filter(
          (i) => i.goal_indicator_id !== indicator.goal_indicator_id,
        ),
      );
    } else {
      setSelectedIndicators([...selectedIndicators, indicator]);
    }
  };

  const handleSubmit = async () => {
    const projectIndicators = await addProjectIndicators(
      selectedIndicators,
      project.project_id,
    );
    console.log(projectIndicators);
  };

  return (
    <main className="w-full min-h-screen p-10 flex flex-col gap-10">
      <div className="w-full flex justify-between items-center">
        <p className="text-3xl font-bold uppercase text-green-800">
          {project?.name}
        </p>
        <button
          onClick={handleSubmit}
          className="p-2 border-2 border-blue-400 rounded-lg font-bold"
        >
          submit
        </button>
      </div>
      <div className="w-full h-screen flex items-center justify-between gap-10">
        <div className="w-1/2 h-full flex flex-col gap-10">
          <input
            type="text"
            className="w-full p-2 bg-white shadow-inner border border-gray-200 text-sm text-gray-700"
            placeholder="Search for an indicator..."
          />
          <div className="w-full h-full overflow-scroll flex flex-col gap-10">
            {unassignedIndicators.map((goal) => (
              <div key={goal.goal_id} className="w-full flex flex-col gap-2">
                <p className="w-full p-4 bg-gray-200 text-xl font-bold uppercase">
                  {goal.name}
                </p>
                <div className="w-full flex flex-col gap-2">
                  {goal.indicators.map((indicator) => (
                    <button
                      className={`w-full text-left p-2 ${selectedIndicators.includes(indicator) ? "bg-gray-200" : ""} border border-gray-200`}
                      key={indicator.goal_indicator_id}
                      onClick={() => handleIndicatorSelect(indicator)}
                    >
                      {indicator.indicator_name}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="w-1/2 p-10 border-2 border-gray-200 h-full overflow-scroll">
          {unassignedIndicators.map((goal, key: number) => (
            <div key={key} className="w-full flex flex-col gap-2">
              <p className="w-full p-4 bg-gray-200 text-xl font-bold uppercase">
                {goal.name}
              </p>
              {goal.indicators.map((indicator, index) => (
                <>
                  {selectedIndicators.includes(indicator) ? (
                    <div key={index}>
                      <p>{indicator.indicator_name}</p>
                      <p>{indicator.indicator_target}</p>
                    </div>
                  ) : (
                    ""
                  )}
                </>
              ))}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
};

export default AddProject;
