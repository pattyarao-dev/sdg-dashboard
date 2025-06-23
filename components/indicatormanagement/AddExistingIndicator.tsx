// "use client";

// import { useState } from "react";
// import { Goal, GoalIndicator, RequiredData } from "@/types/goal.types";

// const AddExistingIndicator = ({
//   availableIndicators,
//   requiredData,
// }: {
//   goal: Goal;
//   availableIndicators: GoalIndicator[];
//   requiredData: RequiredData[];
// }) => {
//   const [selectedIndicator, setSelectedIndicator] = useState({
//     name: "",
//     description: "",
//     global_target_value: 0,
//     global_baseline_value: 0,
//     requiredData: [{}],
//     sub_indicators: [{}],
//   });

//   console.log(availableIndicators.map((ind) => ind.md_indicator.name));

//   return (
//     <div className="w-full p-10 bg-white drop-shadow-lg flex flex-col gap-10">
//       <div className="w-full flex flex-col gap-2">
//         <p className="text-lg font-semibold text-orange-400">
//           Add an existing indicator to this goal.
//         </p>
//         <hr className="w-full border border-orange-400" />
//       </div>
//       <div className="w-full flex items-start gap-10">
//         <div className="w-1/4 h-[600px] overflow-y-scroll flex flex-col gap-2">
//           {availableIndicators.map((indicator, index) => (
//             <div
//               key={index}
//               className="w-full p-2 border border-gray-300 text-left"
//             >
//               <button>{indicator.md_indicator.name}</button>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AddExistingIndicator;

"use client";

import { useState, useRef } from "react";
import {
  Goal,
  GoalIndicator,
  RequiredData,
  Indicator,
} from "@/types/goal.types";
import {
  createNewIndicator,
  createNewMainSubIndicator,
  createNewSubSubIndicator,
} from "@/app/actions/actions_indicatormanagement";

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

  // Convert GoalIndicator to Indicator format for consistency
  const convertToIndicator = (goalIndicator: GoalIndicator): Indicator => {
    return {
      indicator_id: goalIndicator.md_indicator.indicator_id,
      name: goalIndicator.md_indicator.name,
      description: goalIndicator.md_indicator.description || "",
      global_target_value: goalIndicator.target_value || 0,
      global_baseline_value: goalIndicator.baseline_value || 0,
      required_data: goalIndicator.md_indicator.required_data || [],
      sub_indicators:
        goalIndicator.md_indicator.sub_indicators?.map(convertSubIndicator) ||
        [],
    };
  };

  const convertSubIndicator = (subIndicator: any): Indicator => {
    return {
      indicator_id: subIndicator.indicator_id,
      name: subIndicator.name,
      description: subIndicator.description || "",
      global_target_value: subIndicator.target_value || 0,
      global_baseline_value: subIndicator.baseline_value || 0,
      required_data: subIndicator.required_data || [],
      sub_indicators:
        subIndicator.sub_indicators?.map(convertSubIndicator) || [],
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

  const handleSubmitIndicator = async () => {
    if (!goalSpecificIndicator) {
      alert("Please select an indicator first");
      return;
    }

    try {
      // Create goal-indicator relationship with the existing indicator
      // You'll need to create a new action for this specific case
      // For now, using the existing createNewIndicator but you might want a different action
      await createNewIndicator(goalSpecificIndicator, goal.goal_id);

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
    isReadOnly: boolean = false,
  ) => {
    const isRequiredDataSelected = (data: RequiredData) => {
      return indicator.required_data.some(
        (rd) => rd.required_data_id === data.required_data_id,
      );
    };

    return (
      <div
        key={indicator.indicator_id}
        className={`w-full p-4 border ${parentIndicator ? "border-gray-300" : "border-orange-400"}`}
      >
        <h2
          className={`${parentIndicator ? "text-gray-600" : "text-orange-400"} font-bold`}
        >
          {parentIndicator ? "Sub-Indicator" : "Existing Indicator"}
        </h2>
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
              readOnly={true}
              className="w-full p-2 border border-gray-300 bg-gray-100 cursor-not-allowed"
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
              readOnly={true}
              className="w-full p-2 border border-gray-300 bg-gray-100 cursor-not-allowed"
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
                      <span className=" font-medium">{data.name}</span>
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
        </div>

        {/* Render sub-indicators (read-only) */}
        <div className="mt-6 ml-6">
          {indicator.sub_indicators.map((subIndicator, index) => (
            <div key={index}>
              {renderIndicatorForm(subIndicator, indicator, true)}
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
              className={`w-full p-3 border text-left rounded-md transition-all duration-200 ${
                selectedIndicatorId === indicator.md_indicator.indicator_id
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
                  <strong>Note:</strong> You're adding an existing indicator to
                  this goal. The indicator name and description cannot be
                  changed, but you can set goal-specific targets, baselines, and
                  required data.
                </p>
              </div>

              {renderIndicatorForm(goalSpecificIndicator)}

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
