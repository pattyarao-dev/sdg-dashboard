"use client";

import { useState, useRef, JSX } from "react";
import {
  Goal,
  GoalIndicator,
  RequiredData,
  Indicator,
} from "@/types/goal.types";
import {
  createMainOldIndicatorGoal,
  createNewMainSubIndicator,
  createNewSubSubIndicator,
  CreateOldMainSubIndicatorRelationship,
  createOldSubIndicatorRelationship,
} from "@/app/actions/actions_indicatormanagement";

type IndicatorType = "sub" | "main";

const AddExistingIndicator = ({
  goal,
  availableIndicators,
  requiredData,
}: {
  goal: Goal;
  availableIndicators: GoalIndicator[];
  requiredData: RequiredData[];
}) => {
  const [selectedIndicatorId, setSelectedIndicatorId] = useState<number | null>(
    null,
  );
  const [goalSpecificIndicator, setGoalSpecificIndicator] =
    useState<Indicator | null>(null);
  const focusedElementId = useRef<string | null>(null);

  const [newRequiredDataInputs, setNewRequiredDataInputs] = useState<{
    [key: number]: string;
  }>({});
  const [allRequiredData, setAllRequiredData] =
    useState<RequiredData[]>(requiredData);

  // FIXED: Convert GoalIndicator to Indicator format - start with empty sub_indicators
  const convertToIndicator = (goalIndicator: GoalIndicator): Indicator => {
    return {
      indicator_id: goalIndicator.md_indicator.indicator_id,
      name: goalIndicator.md_indicator.name,
      description: goalIndicator.md_indicator.description || "",
      global_target_value: 0, // ✅ Set default - user will input goal-specific values
      global_baseline_value: 0, // ✅ Set default - user will input goal-specific values
      required_data: goalIndicator.td_goal_indicator_required_data?.map(
        (gird) => gird.ref_required_data
      ) || [], // ✅ Extract required data from the correct structure
      sub_indicators: [], // ✅ Start with empty - let user choose what to add
      newIndicator: false, // ✅ Mark as existing indicator
    };
  };

  // FIXED: Update convertSubIndicator to handle proper Indicator type
  const convertSubIndicator = (subIndicator: Indicator): Indicator => {
    return {
      indicator_id: subIndicator.indicator_id, // ✅ Use the actual indicator_id
      name: subIndicator.name,
      description: subIndicator.description || "",
      global_target_value: 0, // ✅ Reset for goal-specific values
      global_baseline_value: 0, // ✅ Reset for goal-specific values
      required_data: [], // ✅ Start with empty for goal-specific
      sub_indicators: [], // ✅ Start with empty - let user choose what to add
      newIndicator: false, // ✅ Mark as existing indicator
    };
  };

  const handleIndicatorSelect = (goalIndicator: GoalIndicator) => {
    const indicator = convertToIndicator(goalIndicator);
    setSelectedIndicatorId(indicator.indicator_id);
    setGoalSpecificIndicator(indicator);
  };

  const handleInputChange = (
    indicator: Indicator,
    field: keyof Indicator,
    value: string | number | RequiredData[] | Indicator[],
  ) => {
    if (!goalSpecificIndicator) return;

    // Save active element's ID before state update
    if (document.activeElement) {
      focusedElementId.current = document.activeElement.id;
    }

    setGoalSpecificIndicator((prev: Indicator | null) => {
      if (!prev) return null;

      const updateIndicator = (current: Indicator): Indicator => {
        if (current.indicator_id === indicator.indicator_id) {
          return { ...current, [field]: value };
        }
        return {
          ...current,
          sub_indicators: current.sub_indicators?.map(updateIndicator) || [],
        };
      };
      return updateIndicator(prev);
    });

    // Restore focus after render
    setTimeout(() => {
      if (focusedElementId.current) {
        const element = document.getElementById(focusedElementId.current);
        if (element) {
          (element as HTMLElement).focus();
        }
      }
    }, 0);
  };

  const handleNewRequiredDataInputChange = (
    indicatorId: number,
    value: string,
  ) => {
    setNewRequiredDataInputs((prev) => ({
      ...prev,
      [indicatorId]: value,
    }));
  };

  const handleSelectRequiredData = (
    indicator: Indicator,
    data: RequiredData,
  ) => {
    if (!goalSpecificIndicator) return;

    setGoalSpecificIndicator((prev: Indicator | null) => {
      if (!prev) return null;

      const updateIndicator = (current: Indicator): Indicator => {
        if (current.indicator_id === indicator.indicator_id) {
          const isSelected = current.required_data.some(
            (rd) => rd.required_data_id === data.required_data_id,
          );

          const updatedRequiredData = isSelected
            ? current.required_data.filter(
              (rd) => rd.required_data_id !== data.required_data_id,
            )
            : [...current.required_data, data];

          return { ...current, required_data: updatedRequiredData };
        }
        return {
          ...current,
          sub_indicators: current.sub_indicators?.map(updateIndicator) || [],
        };
      };
      return updateIndicator(prev);
    });
  };

  const handleCreateNewRequiredData = (indicator: Indicator) => {
    const inputValue = newRequiredDataInputs[indicator.indicator_id]?.trim();

    if (!inputValue) {
      alert("Please enter a name for the required data");
      return;
    }

    // Check if required data with this name already exists
    const existingData = allRequiredData.find(
      (data) => data.name.toLowerCase() === inputValue.toLowerCase(),
    );

    if (existingData) {
      alert("Required data with this name already exists");
      return;
    }

    // Create new required data object
    const newRequiredData: RequiredData = {
      required_data_id: Number(Date.now()), // Temporary ID
      name: inputValue,
      newRD: true,
    };

    // Add to all required data list
    setAllRequiredData((prev) => [...prev, newRequiredData]);

    // Add to the current indicator's selected required data
    setGoalSpecificIndicator((prev: Indicator | null) => {
      if (!prev) return null;

      const updateIndicator = (current: Indicator): Indicator => {
        if (current.indicator_id === indicator.indicator_id) {
          return {
            ...current,
            required_data: [...current.required_data, newRequiredData],
          };
        }
        return {
          ...current,
          sub_indicators: current.sub_indicators?.map(updateIndicator) || [],
        };
      };
      return updateIndicator(prev);
    });

    // Clear the input
    setNewRequiredDataInputs((prev) => ({
      ...prev,
      [indicator.indicator_id]: "",
    }));
  };

  const handleRemoveRequiredData = (
    indicator: Indicator,
    dataToRemove: RequiredData,
  ) => {
    if (!goalSpecificIndicator) return;

    setGoalSpecificIndicator((prev: Indicator | null) => {
      if (!prev) return null;

      const updateIndicator = (current: Indicator): Indicator => {
        if (current.indicator_id === indicator.indicator_id) {
          return {
            ...current,
            required_data: current.required_data.filter(
              (rd) => rd.required_data_id !== dataToRemove.required_data_id,
            ),
          };
        }
        return {
          ...current,
          sub_indicators: current.sub_indicators?.map(updateIndicator) || [],
        };
      };
      return updateIndicator(prev);
    });
  };

  // Handle adding existing sub-indicators
  const handleAddExistingSubIndicator = (
    parentIndicator: Indicator,
    existingSubIndicator: Indicator,
  ) => {
    if (!goalSpecificIndicator) return;

    // Create a copy of the existing sub-indicator preserving the original indicator_id
    const goalSpecificSubIndicator: Indicator = {
      ...existingSubIndicator,
      // ✅ Preserve original indicator_id (already included in spread)
      global_target_value: 0, // Reset goal-specific values
      global_baseline_value: 0,
      required_data: [], // Start with empty required data for this goal
      newIndicator: false, // ✅ Mark as existing indicator being added
    };

    setGoalSpecificIndicator((prev: Indicator | null) => {
      if (!prev) return null;

      const updateIndicators = (indicator: Indicator): Indicator => {
        if (indicator.indicator_id === parentIndicator.indicator_id) {
          return {
            ...indicator,
            sub_indicators: [
              ...(indicator.sub_indicators ?? []),
              goalSpecificSubIndicator,
            ],
          };
        }
        return {
          ...indicator,
          sub_indicators: indicator.sub_indicators?.map(updateIndicators) ?? [],
        };
      };

      return updateIndicators(prev);
    });
  };

  // Handle adding new sub-indicators
  const handleAddNewSubIndicator = (parentIndicator: Indicator) => {
    const newSubIndicator: Indicator = {
      indicator_id: Number(Date.now()), // Unique temporary ID
      name: "",
      description: "",
      global_target_value: 0,
      global_baseline_value: 0,
      required_data: [] as RequiredData[],
      sub_indicators: [] as Indicator[],
      newIndicator: true, // ✅ Mark as new indicator
    };

    setGoalSpecificIndicator((prev: Indicator | null) => {
      if (!prev) return null;

      const updateIndicators = (indicator: Indicator): Indicator => {
        if (indicator.indicator_id === parentIndicator.indicator_id) {
          return {
            ...indicator,
            sub_indicators: [
              ...(indicator.sub_indicators ?? []),
              newSubIndicator,
            ],
          };
        }
        return {
          ...indicator,
          sub_indicators: indicator.sub_indicators?.map(updateIndicators) ?? [],
        };
      };

      return updateIndicators(prev);
    });
  };

  const handleRemoveSubIndicator = (
    parentIndicator: Indicator,
    index: number,
  ) => {
    if (!goalSpecificIndicator) return;

    setGoalSpecificIndicator((prev: Indicator | null) => {
      if (!prev) return null;

      const updateIndicators = (indicator: Indicator): Indicator => {
        if (indicator === parentIndicator) {
          return {
            ...indicator,
            sub_indicators: indicator.sub_indicators.filter(
              (_, i) => i !== index,
            ),
          };
        }
        return {
          ...indicator,
          sub_indicators: indicator.sub_indicators.map(updateIndicators),
        };
      };
      return updateIndicators(prev);
    });
  };

  // FIXED: Get only direct children sub-indicators that aren't already added
  const getAvailableSubIndicators = (
    parentIndicator: Indicator,
    originalIndicator: GoalIndicator,
  ): Indicator[] => {
    // Helper function to find direct children of a specific indicator
    const findDirectChildren = (searchIndicatorName: string): Indicator[] => {
      // Search by name instead of ID since added sub-indicators have new temporary IDs
      const searchInHierarchy = (indicators: Indicator[]): Indicator[] => {
        for (const indicator of indicators) {
          // Match by name since temporary IDs won't match original structure
          if (indicator.name === searchIndicatorName) {
            return indicator.sub_indicators || [];
          }

          // Recursively search in sub-indicators
          if (indicator.sub_indicators && indicator.sub_indicators.length > 0) {
            const found = searchInHierarchy(indicator.sub_indicators);
            if (found.length > 0) return found;
          }
        }
        return [];
      };

      // First check if it's the main indicator
      if (parentIndicator.name === originalIndicator.md_indicator.name) {
        return originalIndicator.md_indicator.sub_indicators || [];
      }

      // Otherwise search in the hierarchy
      return searchInHierarchy(
        originalIndicator.md_indicator.sub_indicators || [],
      );
    };

    // Get direct children of the parent indicator by name
    const directChildren = findDirectChildren(parentIndicator.name);

    // Filter out already added sub-indicators (compare by name since IDs are different)
    const currentSubIndicatorNames = parentIndicator.sub_indicators.map(
      (sub) => sub.name,
    );

    return directChildren.filter(
      (subInd) => !currentSubIndicatorNames.includes(subInd.name),
    );
  };

  // FIXED: Update renderSubIndicatorOptions to handle Indicator type
  const renderSubIndicatorOptions = (
    availableSubIndicators: Indicator[],
  ): JSX.Element[] => {
    return availableSubIndicators.map((subInd) => (
      <option key={subInd.indicator_id} value={subInd.indicator_id}>
        {subInd.name}
      </option>
    ));
  };

  const travelIndicator = async (
    subIndicator: Indicator,
    parentIndicatorId: number,
    goalIndicatorId: number,
    type: IndicatorType,
  ) => {
    // we place the logic over here!
    let newSubIndicator: number = -1;
    if (type === "main") {
      if (!subIndicator.newIndicator) {
        // add existing sub relationship here!
        newSubIndicator = await CreateOldMainSubIndicatorRelationship(subIndicator, parentIndicatorId, goalIndicatorId)
      } else {
        newSubIndicator = await createNewMainSubIndicator(
          subIndicator,
          parentIndicatorId,
          goalIndicatorId,
        );
      }
    } else if (type === "sub") {
      if (!subIndicator.newIndicator) {
        //gonna add old sub here!
        newSubIndicator = await createOldSubIndicatorRelationship(subIndicator, parentIndicatorId, goalIndicatorId)
      } else {
        newSubIndicator = await createNewSubSubIndicator(
          subIndicator,
          parentIndicatorId,
          goalIndicatorId,
        );
      }
    }

    // exit over here!
    if (subIndicator.sub_indicators.length <= 0) {
      return;
    }

    // if there are more we keep going
    for (const sub of subIndicator.sub_indicators) {
      await travelIndicator(sub, newSubIndicator, goalIndicatorId, "sub");
    }
  };

  const handleSubmitIndicator = async () => {
    if (!goalSpecificIndicator) {
      alert("Please select an indicator first");
      return;
    }

    try {
      // Create goal-indicator relationship with the existing indicator
      const newlyCreateIndicator = await createMainOldIndicatorGoal(
        goalSpecificIndicator,
        goal.goal_id,
      );

      if (goalSpecificIndicator.sub_indicators.length > 0) {
        for (const sub of goalSpecificIndicator.sub_indicators) {
          await travelIndicator(
            sub,
            newlyCreateIndicator.newIndicatorId,
            newlyCreateIndicator.newGoalIndicatorId,
            "main",
          );
        }
      }

      console.log("Indicator added to goal:", goalSpecificIndicator);

      // Reset form
      setSelectedIndicatorId(null);
      setGoalSpecificIndicator(null);
      setNewRequiredDataInputs({});
    } catch (error) {
      console.error("Error adding indicator to goal:", error);
      alert("Failed to add indicator to goal");
    }
  };

  const renderIndicatorForm = (
    indicator: Indicator,
    parentIndicator?: Indicator,
    originalIndicator?: GoalIndicator,
  ) => {
    const isRequiredDataSelected = (data: RequiredData) => {
      return indicator.required_data.some(
        (rd) => rd.required_data_id === data.required_data_id,
      );
    };

    // ✅ Check if this is an existing indicator (has newIndicator flag set to false)
    const isExistingIndicator = !indicator.newIndicator;
    const availableSubIndicators = originalIndicator
      ? getAvailableSubIndicators(indicator, originalIndicator)
      : [];

    return (
      <div
        key={indicator.indicator_id}
        className={`w-full p-4 border ${parentIndicator ? "border-gray-300" : "border-orange-400"}`}
      >
        <div className="flex items-center gap-2 mb-2">
          <h2
            className={`${parentIndicator ? "text-gray-600" : "text-orange-400"} font-bold`}
          >
            {parentIndicator ? "Sub-Indicator" : "Existing Indicator"}
          </h2>
          {/* ✅ Show indicator type tag */}
          <span
            className={`px-2 py-1 text-xs font-semibold rounded ${indicator.newIndicator
              ? "bg-green-100 text-green-800 border border-green-300"
              : "bg-blue-100 text-blue-800 border border-blue-300"
              }`}
          >
            {indicator.newIndicator ? "NEW" : "EXISTING"}
          </span>
        </div>
        <div className="w-full flex flex-col gap-2">
          <div className="w-full flex flex-col gap-2">
            <p className="text-sm text-green-800 font-semibold uppercase">
              Indicator Name:
            </p>
            <input
              id={`indicator-${indicator.indicator_id}-name`}
              type="text"
              placeholder="Indicator Name"
              value={indicator.name}
              onChange={(e) =>
                indicator.newIndicator &&
                handleInputChange(indicator, "name", e.target.value)
              }
              readOnly={isExistingIndicator}
              className={`w-full p-2 border border-gray-300 ${isExistingIndicator ? "bg-gray-100 cursor-not-allowed" : ""
                }`}
            />
          </div>

          <div className="w-full flex flex-col gap-4">
            <p className="text-sm text-green-800 font-semibold uppercase">
              Indicator Description:
            </p>
            <input
              type="text"
              placeholder="Indicator Description"
              value={indicator.description}
              onChange={(e) =>
                indicator.newIndicator &&
                handleInputChange(indicator, "description", e.target.value)
              }
              readOnly={isExistingIndicator}
              className={`w-full p-2 border border-gray-300 ${isExistingIndicator ? "bg-gray-100 cursor-not-allowed" : ""
                }`}
            />
          </div>

          <div className="w-full flex gap-4">
            <div className="w-1/2 flex flex-col gap-4">
              <p className="text-sm text-green-800 font-semibold uppercase">
                2030 Target (Goal-Specific)
              </p>
              <input
                type="number"
                placeholder="2030 Target"
                value={indicator.global_target_value}
                onChange={(e) =>
                  handleInputChange(
                    indicator,
                    "global_target_value",
                    Number(e.target.value),
                  )
                }
                className="w-full p-2 border border-gray-300"
              />
            </div>
            <div className="w-1/2 flex flex-col gap-4">
              <p className="text-sm text-green-800 font-semibold uppercase">
                Baseline (Goal-Specific)
              </p>
              <input
                type="number"
                placeholder="Baseline"
                value={indicator.global_baseline_value}
                onChange={(e) =>
                  handleInputChange(
                    indicator,
                    "global_baseline_value",
                    Number(e.target.value),
                  )
                }
                className="w-full p-2 border border-gray-300"
              />
            </div>
          </div>

          <div className="w-full flex flex-col flex-grow gap-4">
            <p className="text-sm text-green-800 font-semibold uppercase">
              Required data for this goal-indicator relationship:
            </p>
            <div className="w-full flex flex-col ">
              {/* New Required Data */}
              <div className="w-full flex flex-col gap-4">
                <div className="w-full flex flex-col items-start gap-2">
                  <p className="w-1/3 text-sm text-green-800 font-bold uppercase">
                    Create new required data:
                  </p>
                  <div className="w-full flex items-center justify-between gap-6">
                    <input
                      type="text"
                      placeholder="Enter required data"
                      className="flex-1 p-2 border border-gray-300"
                      value={
                        newRequiredDataInputs[indicator.indicator_id] || ""
                      }
                      onChange={(e) =>
                        handleNewRequiredDataInputChange(
                          indicator.indicator_id,
                          e.target.value,
                        )
                      }
                      onKeyUp={(e) => {
                        if (e.key === "Enter") {
                          handleCreateNewRequiredData(indicator);
                        }
                      }}
                    />
                    <button
                      onClick={() => {
                        handleCreateNewRequiredData(indicator);
                      }}
                      className="w-fit bg-green-700 text-white px-6 py-2 rounded-md uppercase font-semibold text-sm hover:bg-green-500 transition-all duration-100"
                    >
                      Add Required Data
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full h-auto overflow-y-scroll flex flex-col gap-2">
              <p className="uppercase text-sm text-green-800 font-bold">
                Select existing required data:
              </p>
              {allRequiredData.length > 0 ? (
                allRequiredData.map((data, index) => (
                  <div
                    key={index}
                    className={`w-full p-2 flex items-center gap-2 ${isRequiredDataSelected(data) ? "bg-green-50 border border-green-800" : "border border-gray-200"}`}
                  >
                    <button
                      type="button"
                      onClick={() => handleSelectRequiredData(indicator, data)}
                      className="w-full text-left"
                    >
                      {data.name}
                    </button>
                  </div>
                ))
              ) : (
                <div className="w-full p-2 flex items-center gap-2">
                  <p className="italic text-gray-600">
                    No required data available
                  </p>
                </div>
              )}
            </div>

            <div className="w-full flex flex-col gap-2">
              <p className="text-sm text-green-800 font-semibold uppercase">
                Selected Required Data:
              </p>
              {indicator.required_data.length > 0 ? (
                <div className="w-full flex flex-col gap-2">
                  {indicator.required_data.map((data, index) => (
                    <div
                      key={index}
                      className="w-full p-2 bg-gray-100 border border-gray-300 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <span className=" font-medium">{data.name}</span>
                        {/* ✅ Show required data type tag */}
                        {data.newRD && (
                          <span className="px-1.5 py-0.5 text-xs font-semibold rounded bg-green-100 text-green-800 border border-green-300">
                            NEW
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          handleRemoveRequiredData(indicator, data)
                        }
                        className="text-red-600 hover:text-red-800 font-semibold text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="w-full p-2 text-gray-500 italic">
                  No required data selected
                </div>
              )}
            </div>
          </div>

          {/* FIXED: Sub-Indicator Management */}
          <div className="mt-4 w-full flex flex-col gap-4">
            <div className="w-full flex flex-col gap-2">
              <h3 className="text-sm text-green-800 font-semibold uppercase">
                Sub-Indicator Management:
              </h3>

              {/* Show current sub-indicators if any */}
              {indicator.sub_indicators &&
                indicator.sub_indicators.length > 0 && (
                  <div className="w-full p-3 bg-gray-50 border border-gray-200 rounded">
                    <p className="text-xs text-gray-600 mb-2">
                      Current Sub-Indicators ({indicator.sub_indicators.length}
                      ):
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {indicator.sub_indicators.map((sub, index) => (
                        <div key={index} className="flex items-center gap-1">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                            {sub.name}
                          </span>
                          {/* ✅ Show sub-indicator type tag */}
                          <span
                            className={`px-1.5 py-0.5 text-xs font-semibold rounded ${sub.newIndicator
                              ? "bg-green-100 text-green-800 border border-green-300"
                              : "bg-blue-100 text-blue-800 border border-blue-300"
                              }`}
                          >
                            {sub.newIndicator ? "NEW" : "EXISTING"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>

            <div className="w-full flex gap-4 items-center justify-end">
              {/* Add New Sub-Indicator Button */}
              <button
                onClick={() => handleAddNewSubIndicator(indicator)}
                className="px-4 py-2 bg-green-800 rounded-md font-semibold text-white uppercase text-sm hover:bg-green-600 transition-colors"
              >
                Add New Sub-Indicator
              </button>

              {/* Add Existing Sub-Indicator Dropdown */}
              {availableSubIndicators.length > 0 ? (
                <div className="relative">
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        const selectedSubInd = availableSubIndicators.find(
                          (sub) =>
                            sub.indicator_id.toString() === e.target.value,
                        );
                        if (selectedSubInd) {
                          // ✅ Pass the Indicator directly, no need for originalIndicator check
                          handleAddExistingSubIndicator(
                            indicator,
                            convertSubIndicator(selectedSubInd),
                          );
                        }
                        e.target.value = ""; // Reset select
                      }
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md font-semibold uppercase text-sm appearance-none pr-8 hover:bg-blue-700 transition-colors cursor-pointer"
                  >
                    <option value="">Add Existing Sub-Indicator</option>
                    {renderSubIndicatorOptions(availableSubIndicators)}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
              ) : (
                <div className="px-4 py-2 bg-gray-300 text-gray-600 rounded-md font-semibold uppercase text-sm cursor-not-allowed">
                  No Available Sub-Indicators
                </div>
              )}

              {/* Remove Button (only for sub-indicators) */}
              {parentIndicator && (
                <button
                  onClick={() =>
                    handleRemoveSubIndicator(
                      parentIndicator,
                      parentIndicator.sub_indicators.indexOf(indicator),
                    )
                  }
                  className="px-4 py-2 bg-red-500 text-white rounded-md font-semibold uppercase text-sm hover:bg-red-600 transition-colors"
                >
                  Remove
                </button>
              )}
            </div>

            {/* Available Sub-Indicators Info */}
            {availableSubIndicators.length > 0 && (
              <div className="w-full p-3 bg-blue-50 border border-blue-200 rounded">
                <p className="text-xs text-blue-800 mb-2">
                Available Sub-Indicators for &quot;{indicator.name}&quot;:
                </p>
                <div className="flex flex-wrap gap-2">
                  {availableSubIndicators.map((sub) => (
                    <span
                      key={sub.indicator_id}
                      className="px-2 py-1 bg-white text-blue-800 text-xs rounded border"
                    >
                      {sub.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Render sub-indicators */}
        <div className="mt-6 ml-6">
          {indicator.sub_indicators.map((subIndicator, index) => (
            <div key={index}>
              {renderIndicatorForm(subIndicator, indicator, originalIndicator)}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full p-10 bg-white drop-shadow-lg flex flex-col gap-10">
      <div className="w-full flex flex-col gap-2">
        <p className="text-lg font-semibold text-orange-400">
          Add an existing indicator to this goal.
        </p>
        <hr className="w-full border border-orange-400" />
      </div>

      <div className="w-full flex items-start gap-10">
        {/* Indicator Selection Panel */}
        <div className="w-1/4 h-[600px] overflow-y-scroll flex flex-col gap-2">
          <p className="text-sm font-semibold text-gray-700 mb-2">
            Available Indicators:
          </p>
          {availableIndicators.map((indicator, index) => (
            <div
              key={index}
              className={`w-full p-3 border text-left rounded-md transition-all duration-200 ${selectedIndicatorId === indicator.md_indicator.indicator_id
                ? "border-orange-400 bg-orange-50"
                : "border-gray-300 hover:border-gray-400"
                }`}
            >
              <button
                onClick={() => handleIndicatorSelect(indicator)}
                className="w-full text-left"
              >
                <div className="font-medium">{indicator.md_indicator.name}</div>
                {indicator.md_indicator.description && (
                  <div className="text-xs text-gray-600 mt-1">
                    {indicator.md_indicator.description}
                  </div>
                )}
                {indicator.md_indicator.sub_indicators &&
                  indicator.md_indicator.sub_indicators.length > 0 && (
                    <div className="text-xs text-blue-600 mt-1">
                      {indicator.md_indicator.sub_indicators.length}{" "}
                      sub-indicator(s) available
                    </div>
                  )}
              </button>
            </div>
          ))}
        </div>

        {/* Indicator Form Panel */}
        <div className="flex-1">
          {goalSpecificIndicator ? (
            <div className="w-full flex flex-col gap-6">
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> You&apos;re adding an existing indicator to this goal.
                  this goal. The indicator name and description cannot be
                  changed, but you can set goal-specific targets, baselines,
                  required data, and add/modify sub-indicators.
                </p>
              </div>

              {renderIndicatorForm(
                goalSpecificIndicator,
                undefined,
                availableIndicators.find(
                  (ind) =>
                    ind.md_indicator.indicator_id === selectedIndicatorId,
                ),
              )}

              <button
                onClick={handleSubmitIndicator}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-md transition-all duration-200"
              >
                Add Indicator to Goal
              </button>
            </div>
          ) : (
            <div className="w-full h-[600px] flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
              <p className="text-gray-500 text-lg">
                Select an indicator from the list to configure it for this goal
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddExistingIndicator;
