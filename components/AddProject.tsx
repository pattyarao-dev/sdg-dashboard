"use client";

import { addProjectIndicators } from "@/app/actions/actions";
import {
  IGoalIndicatorSimple,
  IGoalWithIndicators,
} from "@/types/indicator.types";
import { IProject } from "@/types/project.types";
import { useState } from "react";

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

  // useEffect(() => {
  //   console.log(selectedIndicators);
  // }, [selectedIndicators]);

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
    setSelectedIndicators([]);
  };

  return (
    <main className="w-full min-h-screen p-10 flex flex-col gap-10">
      <div className="w-full flex justify-between items-center">
        <p className="text-3xl font-bold uppercase text-green-800">
          {project?.name}
        </p>
        <button
          onClick={handleSubmit}
          className="w-[300px] py-2 px-6 bg-gradient-to-br from-green-100 to-orange-100 rounded-lg uppercase font-bold text-center"
        >
          submit indicators
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
                      className={`w-full text-left p-2 ${selectedIndicators.includes(indicator) ? "border-4 border-green-600 text-green-600 font-bold" : ""} border border-gray-200`}
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
        <div className="w-1/2 p-10 border-2 border-gray-200 h-full overflow-scroll flex flex-col gap-6">
          {/* {unassignedIndicators.map((goal, key: number) => (
            <div key={key} className="w-full flex flex-col">
              <p className="w-full p-4 bg-gray-200 text-xl font-bold uppercase">
                {goal.name}
              </p>
              {selectedIndicators.map((indicator, index) => (
                <div key={index}>{indicator.indicator_name}</div>
              ))}
            </div>
          ))} */}

          {selectedIndicators.length > 0 ? (
            <>
              {unassignedIndicators.map((goal, index) => {
                const goalIndicators = selectedIndicators.filter((indicator) =>
                  goal.indicators.some(
                    (goalIndicator) =>
                      goalIndicator.goal_indicator_id ===
                      indicator.goal_indicator_id,
                  ),
                );

                return (
                  goalIndicators.length > 0 && (
                    <div key={index} className="w-full flex flex-col gap-2">
                      <p className="w-full p-4 bg-gray-200 text-xl font-bold uppercase">
                        {goal.name}
                      </p>
                      {goalIndicators.map((indicator, index) => (
                        <div
                          key={index}
                          className="w-full py-2 px-4 flex items-start justify-between border border-gray-300"
                        >
                          <div className="w-3/4">
                            <p className="text-sm font-semibold text-green-800">
                              Indicator:
                            </p>
                            <p className="font-black uppercase text-gray-700">
                              {indicator.indicator_name}
                            </p>
                          </div>
                          <div className="w-1/4 text-end ">
                            <p className="text-sm font-semibold text-green-800">
                              2030 Target
                            </p>
                            <p className="text-lg font-black">
                              {indicator.indicator_target}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                );
              })}
            </>
          ) : (
            <div className="w-full text-lg font-semibold text-gray-500">
              Select indicators for this project
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default AddProject;
