"use client";

import { useState, useRef } from "react";
import { Goal, RequiredData, Indicator } from "@/types/goal.types";
import {
  createNewIndicator,
  createNewMainSubIndicator,
  createNewSubSubIndicator,
} from "@/app/actions/actions_indicatormanagement";

type IndicatorType = "sub" | "main";

const AddNewIndicator = ({
  goal,
  requiredData,
}: {
  goal: Goal;
  requiredData: RequiredData[];
}) => {
  const [newIndicator, setNewIndicator] = useState<Indicator>({
    indicator_id: Number(Date.now()), // Unique temporary ID
    name: "",
    description: "",
    global_target_value: 0,
    global_baseline_value: 0,
    baseline_year: new Date().getFullYear(), // Add default current year
    required_data: [] as RequiredData[],
    sub_indicators: [] as Indicator[],
  });
  const focusedElementId = useRef<string | null>(null);

  const [newRequiredDataInputs, setNewRequiredDataInputs] = useState<{
    [key: number]: string;
  }>({});
  const [allRequiredData, setAllRequiredData] =
    useState<RequiredData[]>(requiredData);

  const handleInputChange = (
    indicator: Indicator,
    field: keyof Indicator,
    value: string | number | RequiredData[] | Indicator[],
  ) => {
    // Save active element's ID before state update
    if (document.activeElement) {
      focusedElementId.current = document.activeElement.id;
    }

    setNewIndicator((prev: Indicator) => {
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

  //const [requiredDataList, setRequiredDataList] = useState<RequiredData[]>([]);

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
    setNewIndicator((prev: Indicator) => {
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
      // Add other properties as needed based on your RequiredData type
    };

    // Add to all required data list
    setAllRequiredData((prev) => [...prev, newRequiredData]);

    // Add to the current indicator's selected required data
    setNewIndicator((prev: Indicator) => {
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

  const handleAddSubIndicator = (parentIndicator: Indicator) => {
    const newSubIndicator: Indicator = {
      indicator_id: Number(Date.now()), // Unique temporary ID
      name: "",
      description: "",
      global_target_value: 0,
      global_baseline_value: 0,
      baseline_year: 0,
      required_data: [] as RequiredData[],
      sub_indicators: [] as Indicator[],
    };

    setNewIndicator((prev: Indicator) => {
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

  const handleRemoveRequiredData = (
    indicator: Indicator,
    dataToRemove: RequiredData,
  ) => {
    setNewIndicator((prev: Indicator) => {
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

  const handleRemoveSubIndicator = (
    parentIndicator: Indicator,
    index: number,
  ) => {
    setNewIndicator((prev: Indicator) => {
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

  const travelIndicator = async (
    subIndicator: Indicator,
    parentIndicatorId: number,
    goalIndicatorId: number,
    type: IndicatorType,
  ) => {
    // we place the logic over here!
    let newSubIndicator: number = -1;
    if (type === "main") {
      newSubIndicator = await createNewMainSubIndicator(
        subIndicator,
        parentIndicatorId,
        goalIndicatorId,
      );
    } else if (type === "sub") {
      newSubIndicator = await createNewSubSubIndicator(
        subIndicator,
        parentIndicatorId,
        goalIndicatorId,
      );
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
    //TODO: Implement indicator submission logic

    const newlyCreateIndicator = await createNewIndicator(
      newIndicator,
      goal.goal_id,
    );

    if (newIndicator.sub_indicators.length > 0) {
      for (const sub of newIndicator.sub_indicators) {
        await travelIndicator(
          sub,
          newlyCreateIndicator.newIndicatorId,
          newlyCreateIndicator.newGoalIndicatorId,
          "main",
        );
      }
    }
    console.log(newIndicator);
  };

  const renderIndicatorForm = (
    indicator: Indicator,
    parentIndicator?: Indicator,
  ) => {
    const isRequiredDataSelected = (data: RequiredData) => {
      return indicator.required_data.some(
        (rd) => rd.required_data_id === data.required_data_id,
      );
    };
    return (
      <div
        key={indicator.name}
        className={`w-full p-4 border flex flex-col gap-6 ${parentIndicator ? "border-gray-300" : "border-orange-400"}`}
      >
        <h2
          className={`${parentIndicator ? "text-gray-600" : "text-orange-400"} font-bold`}
        >
          {parentIndicator ? "Sub-Indicator" : "Indicator"}
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
              onChange={(e) =>
                handleInputChange(indicator, "name", e.target.value)
              }
              className="w-full p-2 border border-gray-300"
            />
          </div>

          <div className="w-full flex flex-col gap-2">
            <p className="text-sm text-green-800 font-semibold uppercase">
              Indicator Description:
            </p>
            <input
              type="text"
              placeholder="Indicator Description"
              value={indicator.description}
              onChange={(e) =>
                handleInputChange(indicator, "description", e.target.value)
              }
              className="w-full p-2 border border-gray-300"
            />
          </div>
          <div className="w-full flex gap-4">
            <div className="w-1/2 flex flex-col gap-2">
              <p className="text-sm text-green-800 font-semibold uppercase">
                2030 Target
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
            <div className="w-1/2 flex flex-col gap-2">
              <p className="text-sm text-green-800 font-semibold uppercase">
                Baseline
              </p>
              <div className="flex items-center gap-2">
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
                <input
                  type="number"
                  placeholder="Baseline Year"
                  value={indicator.baseline_year}
                  className="w-full p-2 border border-gray-300"
                  onChange={(e) =>
                    handleInputChange(
                      indicator,
                      "baseline_year",
                      Number(e.target.value),
                    )
                  }
                />
              </div>
            </div>
          </div>
          <div className="w-full flex flex-col flex-grow gap-4">
            <p className="text-sm text-green-800 font-semibold uppercase">
              Input the required data to be collected for this indicator:
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
                <div className="w-full flex justify-end"></div>
              </div>
            </div>
            <div className="w-full flex flex-col gap-2">
              <p className="uppercase text-sm text-green-800 font-bold">
                Select existing required data:
              </p>
              <div className="w-full h-[265px] overflow-y-scroll flex flex-col gap-2">
                {requiredData.length > 0 ? (
                  requiredData.map((data, index) => (
                    <div
                      key={index}
                      className={`w-full p-2 flex items-center gap-2 ${isRequiredDataSelected(data) ? "bg-green-50 border border-green-800" : "border border-gray-200"}`}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          handleSelectRequiredData(indicator, data)
                        }
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

          <div className="mt-4 w-full flex gap-4 items-center justify-end">
            <button
              onClick={() => handleAddSubIndicator(indicator)}
              className="px-4 py-2 bg-green-800 rounded-md  font-semibold text-white uppercase text-sm"
            >
              Add Sub-Indicator
            </button>
            {parentIndicator && (
              <button
                onClick={() =>
                  handleRemoveSubIndicator(
                    parentIndicator,
                    parentIndicator.sub_indicators.indexOf(indicator),
                  )
                }
                className="px-4 py-2 bg-red-500 text-white rounded"
              >
                Remove
              </button>
            )}
          </div>
        </div>

        <div className="mt-6 ml-6">
          {indicator.sub_indicators.map((subIndicator, index) => (
            <div key={index}>
              {renderIndicatorForm(subIndicator, indicator)}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full p-10 bg-white drop-shadow-lg flex flex-col gap-16">
      <div className="w-full flex flex-col gap-8">
        <div className="w-full flex flex-col gap-2">
          <p className="text-lg font-semibold text-orange-400">
            Add a new indicator for this goal.
          </p>
          <hr className="w-full border border-orange-400" />
        </div>
        {renderIndicatorForm(newIndicator)}
      </div>

      {/* <form onSubmit={handleSubmitIndicator}> */}
      <button onClick={() => handleSubmitIndicator()} className="button-style">
        Submit Indicator
      </button>
      {/* </form> */}
    </div>
  );
};

export default AddNewIndicator;
