"use client";

import { useEffect, useState } from "react";
import {
  IGoalWithIndicators,
  IGoalIndicatorSimple,
  IGoalSubIndicatorSimple,
} from "@/types/indicator.types";
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from "react-icons/md";

const AddProjectIndicators = ({
  gols,
  id,
}: {
  gols: IGoalWithIndicators[];
  id: number;
}) => {
  const [goals, setGoals] = useState<IGoalWithIndicators[]>();
  const [openGoals, setOpenGoals] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setGoals(gols)
  }, [gols]);

  const toggleGoal = (goalId: number) => {
    setOpenGoals((prev) => ({
      ...prev,
      [goalId]: !prev[goalId],
    }));
  };

  const [selectedIndicators, setSelectedIndicators] = useState<
    IGoalIndicatorSimple[]
  >([]);

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

  const [selectedSubIndicators, setSelectedSubIndicators] = useState<
    IGoalSubIndicatorSimple[]
  >([]);

  const handleSubIndicatorSelect = (indicator: IGoalSubIndicatorSimple) => {
    if (selectedSubIndicators.includes(indicator)) {
      setSelectedSubIndicators(
        selectedSubIndicators.filter(
          (i) => i.goal_sub_indicator_id !== indicator.goal_sub_indicator_id,
        ),
      );
    } else {
      setSelectedSubIndicators([...selectedSubIndicators, indicator]);
    }
  };

  const handleSubmit = async () => {
    try {
      if (selectedIndicators.length === 0) {
        alert("Please select at least one indicator.");
        return;
      }
      console.log(id)
      // Assuming `projectId` is available
      // const projectId = id; // Replace this with the actual project ID

      // Prepare indicators with selected sub-indicators
      const indicatorsWithSubs = selectedIndicators.map((indicator) => ({
        ...indicator,
        sub_indicators: selectedSubIndicators.filter(
          (sub) => sub.sub_indicator_id === indicator.goal_indicator_id,
        ),
      }));

      console.log(indicatorsWithSubs)
      // Call the addProjectIndicators function
      // await addProjectIndicators(indicatorsWithSubs, projectId);

      alert("Indicators successfully added!");
    } catch (error) {
      console.error("Error submitting indicators:", error);
      alert("Failed to add indicators. Please try again.");
    }
  };
  return (
    <>
      <div className="w-full min-h-screen p-10 flex items-center justify-center bg-green-50">
        <div className="w-full p-10 flex flex-col gap-10 bg-white drop-shadow-lg">
          <div>
            <h1>Add Project Indicators</h1>
          </div>
          <div className="w-full flex items-start justify-between gap-10">
            <div className="w-[40%] border-2 border-gray-300 flex flex-col">
              {goals?.map((goal) => (
                <div key={goal.goal_id} className="w-full flex flex-col gap-2">
                  <div className="w-full p-4 flex items-center justify-between bg-gray-200">
                    <h1 className="text-lg font-bold text-green-800">
                      {goal.name}
                    </h1>
                    <button onClick={() => toggleGoal(goal.goal_id)}>
                      {" "}
                      {openGoals[goal.goal_id] ? (
                        <MdKeyboardArrowUp className="text-xl" />
                      ) : (
                        <MdKeyboardArrowDown className="text-xl" />
                      )}
                    </button>
                  </div>
                  {openGoals[goal.goal_id] && (
                    <div className="w-full p-2 flex flex-col gap-4">
                      {goal.indicators.map((indicator) => (
                        <button
                          key={indicator.goal_indicator_id}
                          className={`w - full p-2 text-start ${selectedIndicators.includes(indicator) ? "bg-gradient-to-r from-green-100 to-orange-50" : "bg-gray-100"}`}
                          onClick={() => handleIndicatorSelect(indicator)}
                        >
                          {indicator.indicator_name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="w-[60%]">
              {selectedIndicators.length > 0 ? (
                <>
                  {goals?.map((goal, index) => {
                    const goalIndicators = selectedIndicators.filter(
                      (indicator) =>
                        goal.indicators.some(
                          (goalIndicator) =>
                            goalIndicator.goal_indicator_id ===
                            indicator.goal_indicator_id
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
                              className="w-full py-2 px-4 flex flex-col items-start justify-center gap-4 border border-gray-300"
                            >
                              <div className="w-full flex flex-col gap-2">
                                <div className="w-full flex items-center justify-between">
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
                                <hr className="w-full border border-gray-200" />
                              </div>
                              <div className="w-full flex flex-col gap-2">
                                <div className="w-full flex items-center justify-between">
                                  <p className="text-green-800 font-bold text-sm">
                                    Sub-Indicators:
                                  </p>
                                  <p className="text-green-800 font-bold text-sm">
                                    2030 Target
                                  </p>
                                </div>
                                <div className="w-full flex flex-col gap-4">
                                  {indicator.sub_indicators.map((sub) => (
                                    <button
                                      key={sub.goal_sub_indicator_id}
                                      className={`w - full p-2 bg-gray-200 flex items-center justify-between ${selectedSubIndicators.includes(sub) ? "bg-green-200" : ""}`}
                                      onClick={() =>
                                        handleSubIndicatorSelect(sub)
                                      }
                                    >
                                      <p className="font-bold text-sm">
                                        {sub.indicator_name}
                                      </p>
                                      <p className="font-bold text-sm">
                                        {sub.indicator_target}
                                      </p>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          ))}
                          <div className="w-full flex justify-end">
                            <button
                              className="mt-2 button-style"
                              onClick={() => handleSubmit()}
                            >
                              submit
                            </button>
                          </div>
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
        </div>
      </div>
      ) : {""}
    </>
  );
};

export default AddProjectIndicators;
