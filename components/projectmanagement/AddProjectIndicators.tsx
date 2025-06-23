"use client";

import { useEffect, useState } from "react";
import {
  IGoalWithIndicators,
  IGoalIndicatorSimple,
  IGoalSubIndicatorSimple,
} from "@/types/indicator.types";
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from "react-icons/md";
import { addProjectIndicator, addProjectSubIndicators } from "@/app/actions/actions_projectmanagement";

// Recursive component for rendering nested sub-indicators (max 3 levels deep)
const SubIndicatorRenderer = ({
  subIndicators,
  selectedSubIndicators,
  onSubIndicatorSelect,
  parentIndicatorId,
  level = 1,
}: {
  subIndicators: IGoalSubIndicatorSimple[];
  selectedSubIndicators: IGoalSubIndicatorSimple[];
  onSubIndicatorSelect: (subIndicator: IGoalSubIndicatorSimple, parentIndicatorId: number) => void;
  parentIndicatorId: number;
  level?: number;
}) => {
  const [openSubIndicators, setOpenSubIndicators] = useState<Record<number, boolean>>({});

  const toggleSubIndicator = (subIndicatorId: number) => {
    setOpenSubIndicators((prev) => ({
      ...prev,
      [subIndicatorId]: !prev[subIndicatorId],
    }));
  };

  const getIndentClass = (level: number) => {
    switch (level) {
      case 1: return "ml-0";
      case 2: return "ml-4";
      case 3: return "ml-8";
      default: return "ml-0";
    }
  };

  return (
    <div className="w-full flex flex-col gap-2">
      {subIndicators.map((sub) => {
        const isLeafNode = !sub.sub_indicators || sub.sub_indicators.length === 0 || level === 3;
        const isSelected = selectedSubIndicators.some(
          (selected) => selected.goal_sub_indicator_id === sub.goal_sub_indicator_id
        );

        return (
          <div key={sub.goal_sub_indicator_id} className="w-full flex flex-col">
            <div className={`w-full flex ${getIndentClass(level)}`}>
              {/* Expand/collapse button */}
              {sub.sub_indicators && sub.sub_indicators.length > 0 && level < 3 && (
                <button
                  onClick={() => toggleSubIndicator(sub.goal_sub_indicator_id)}
                  className="p-2 bg-gray-300 text-sm flex items-center justify-center min-w-[32px]"
                >
                  {openSubIndicators[sub.goal_sub_indicator_id] ? (
                    <MdKeyboardArrowUp />
                  ) : (
                    <MdKeyboardArrowDown />
                  )}
                </button>
              )}

              {/* Selection button/div - only clickable if it's a leaf node */}
              {isLeafNode ? (
                <button
                  className={`flex-1 p-2 flex items-center justify-between ${isSelected ? "bg-green-200" : "bg-gray-200"
                    } ${sub.sub_indicators && sub.sub_indicators.length > 0 && level < 3 ? '' : 'w-full'}`}
                  onClick={() => onSubIndicatorSelect(sub, parentIndicatorId)}
                >
                  <p className="font-bold text-sm text-left">
                    {level === 1 && "• "}
                    {level === 2 && "  ◦ "}
                    {level === 3 && "    ▪ "}
                    {sub.indicator_name}
                  </p>
                  <p className="font-bold text-sm">
                    {sub.indicator_target}
                  </p>
                </button>
              ) : (
                <div
                  className={`flex-1 p-2 bg-gray-100 flex items-center justify-between cursor-default ${sub.sub_indicators && sub.sub_indicators.length > 0 && level < 3 ? '' : 'w-full'
                    }`}
                >
                  <p className="font-bold text-sm text-left text-gray-600">
                    {level === 1 && "• "}
                    {level === 2 && "  ◦ "}
                    {level === 3 && "    ▪ "}
                    {sub.indicator_name}
                  </p>
                  <p className="font-bold text-sm text-gray-600">
                    {sub.indicator_target}
                  </p>
                </div>
              )}
            </div>

            {/* Recursively render nested sub-indicators */}
            {sub.sub_indicators &&
              sub.sub_indicators.length > 0 &&
              level < 3 &&
              openSubIndicators[sub.goal_sub_indicator_id] && (
                <SubIndicatorRenderer
                  subIndicators={sub.sub_indicators}
                  selectedSubIndicators={selectedSubIndicators}
                  onSubIndicatorSelect={onSubIndicatorSelect}
                  parentIndicatorId={parentIndicatorId}
                  level={level + 1}
                />
              )}
          </div>
        );
      })}
    </div>
  );
};

const AddProjectIndicators = ({
  gols,
  id,
}: {
  gols: IGoalWithIndicators[];
  id: number;
}) => {
  const [goals, setGoals] = useState<IGoalWithIndicators[]>([]);
  const [openGoals, setOpenGoals] = useState<Record<number, boolean>>({});
  const [selectedIndicators, setSelectedIndicators] = useState<IGoalIndicatorSimple[]>([]);
  const [selectedSubIndicatorsByIndicator, setSelectedSubIndicatorsByIndicator] = useState<
    Record<number, IGoalSubIndicatorSimple[]>
  >({});

  useEffect(() => {
    if (gols) {
      setGoals(gols);
    }
  }, [gols]);

  const toggleGoal = (goalId: number) => {
    setOpenGoals((prev) => ({
      ...prev,
      [goalId]: !prev[goalId],
    }));
  };

  const handleIndicatorSelect = (indicator: IGoalIndicatorSimple) => {
    const isSelected = selectedIndicators.some(
      (selected) => selected.goal_indicator_id === indicator.goal_indicator_id
    );

    if (isSelected) {
      // Remove indicator and its sub-indicators
      setSelectedIndicators((prev) =>
        prev.filter((i) => i.goal_indicator_id !== indicator.goal_indicator_id)
      );
      setSelectedSubIndicatorsByIndicator((prev) => {
        const newState = { ...prev };
        delete newState[indicator.goal_indicator_id];
        return newState;
      });
    } else {
      // Add indicator
      setSelectedIndicators((prev) => [...prev, indicator]);
    }
  };

  const handleSubIndicatorSelect = (subIndicator: IGoalSubIndicatorSimple, parentIndicatorId: number) => {
    setSelectedSubIndicatorsByIndicator((prev) => {
      const currentSelections = prev[parentIndicatorId] || [];
      const isSelected = currentSelections.some(
        (selected) => selected.goal_sub_indicator_id === subIndicator.goal_sub_indicator_id
      );

      if (isSelected) {
        // Remove sub-indicator
        return {
          ...prev,
          [parentIndicatorId]: currentSelections.filter(
            (selected) => selected.goal_sub_indicator_id !== subIndicator.goal_sub_indicator_id
          ),
        };
      } else {
        // Add sub-indicator
        return {
          ...prev,
          [parentIndicatorId]: [...currentSelections, subIndicator],
        };
      }
    });
  };

  const isSubmitDisabled = (indicator: IGoalIndicatorSimple): boolean => {
    // If indicator has sub-indicators, at least one must be selected
    if (indicator.sub_indicators && indicator.sub_indicators.length > 0) {
      const subSelections = selectedSubIndicatorsByIndicator[indicator.goal_indicator_id] || [];
      return subSelections.length === 0;
    }
    // If no sub-indicators, can submit
    return false;
  };

  const handleSubmit = async (indicator: IGoalIndicatorSimple) => {
    try {
      const selectedSubIndicators = selectedSubIndicatorsByIndicator[indicator.goal_indicator_id] || [];

      // Case 1: No sub-indicators selected - submitting main indicator only
      if (selectedSubIndicators.length === 0) {
        // Check if this is actually a main indicator (not a sub-indicator)
        const isMainIndicator = goals.some(goal =>
          goal.indicators.some(mainIndicator =>
            mainIndicator.goal_indicator_id === indicator.goal_indicator_id
          )
        );

        if (!isMainIndicator) {
          alert("Error: Only main indicators can be submitted, not sub-indicators.");
          return;
        }

        // await addProjectIndicator(indicator, id);
        await addProjectIndicator(indicator, id)
        alert(`successfully added indicator!`)
      }
      // Case 2: Sub-indicators selected - submitting only the selected sub-indicators
      else {
        await addProjectSubIndicators(selectedSubIndicators, id)
        alert(`Successfully added indicators!`)
      }
    } catch (error) {
      console.error("Error submitting:", error);
      alert("Failed to add selections. Please try again.");
    }
  };

  const isIndicatorSelected = (indicator: IGoalIndicatorSimple): boolean => {
    return selectedIndicators.some(
      (selected) => selected.goal_indicator_id === indicator.goal_indicator_id
    );
  };

  return (
    <div className="w-full min-h-screen p-10 flex items-center justify-center bg-green-50">
      <div className="w-full p-10 flex flex-col gap-10 bg-white drop-shadow-lg">
        <div>
          <h1>Add Project Indicators</h1>
        </div>
        <div className="w-full flex items-start justify-between gap-10">
          {/* Left side - Goal and Indicator selection */}
          <div className="w-[40%] border-2 border-gray-300 flex flex-col">
            {goals.map((goal) => (
              <div key={goal.goal_id} className="w-full flex flex-col gap-2">
                <div className="w-full p-4 flex items-center justify-between bg-gray-200">
                  <h1 className="text-lg font-bold text-green-800">
                    {goal.name}
                  </h1>
                  <button onClick={() => toggleGoal(goal.goal_id)}>
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
                        className={`w-full p-2 text-start ${isIndicatorSelected(indicator)
                          ? "bg-gradient-to-r from-green-100 to-orange-50"
                          : "bg-gray-100"
                          }`}
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

          {/* Right side - Selected indicators with sub-indicators */}
          <div className="w-[60%]">
            {selectedIndicators.length > 0 ? (
              <div className="w-full flex flex-col gap-6">
                {goals.map((goal) => {
                  const goalIndicators = selectedIndicators.filter((indicator) =>
                    goal.indicators.some(
                      (goalIndicator) =>
                        goalIndicator.goal_indicator_id === indicator.goal_indicator_id
                    )
                  );

                  if (goalIndicators.length === 0) return null;

                  return (
                    <div key={goal.goal_id} className="w-full flex flex-col gap-4">
                      <p className="w-full p-4 bg-gray-200 text-xl font-bold uppercase">
                        {goal.name}
                      </p>
                      {goalIndicators.map((indicator) => (
                        <div key={indicator.goal_indicator_id} className="w-full flex flex-col gap-4">
                          <div className="w-full py-2 px-4 flex flex-col items-start justify-center gap-4 border border-gray-300">
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
                                <div className="w-1/4 text-end">
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

                            {indicator.sub_indicators && indicator.sub_indicators.length > 0 && (
                              <div className="w-full flex flex-col gap-2">
                                <div className="w-full flex items-center justify-between">
                                  <p className="text-green-800 font-bold text-sm">
                                    Sub-Indicators:
                                  </p>
                                  <p className="text-green-800 font-bold text-sm">
                                    2030 Target
                                  </p>
                                </div>
                                <SubIndicatorRenderer
                                  subIndicators={indicator.sub_indicators}
                                  selectedSubIndicators={selectedSubIndicatorsByIndicator[indicator.goal_indicator_id] || []}
                                  onSubIndicatorSelect={handleSubIndicatorSelect}
                                  parentIndicatorId={indicator.goal_indicator_id}
                                />
                              </div>
                            )}
                          </div>

                          <div className="w-full flex justify-end">
                            <button
                              className={`px-4 py-2 rounded font-semibold ${isSubmitDisabled(indicator)
                                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                : "bg-green-600 text-white hover:bg-green-700 cursor-pointer"
                                }`}
                              onClick={() => handleSubmit(indicator)}
                              disabled={isSubmitDisabled(indicator)}
                            >
                              Submit {indicator.indicator_name}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="w-full text-lg font-semibold text-gray-500">
                Select indicators for this project
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProjectIndicators;
