"use client";

import { useState } from "react";
import { Goal, RequiredData, Indicator } from "@/types/goal.types";

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
    required_data: [] as RequiredData[],
    sub_indicators: [] as Indicator[],
  });

  const handleInputChange = (
    indicator: Indicator,
    field: keyof Indicator,
    value: string | number | RequiredData[] | Indicator[],
  ) => {
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
  };

  //const [requiredDataList, setRequiredDataList] = useState<RequiredData[]>([]);

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

  const handleAddSubIndicator = (parentIndicator: Indicator) => {
    const newSubIndicator: Indicator = {
      indicator_id: Number(Date.now()), // Unique temporary ID
      name: "",
      description: "",
      global_target_value: 0,
      global_baseline_value: 0,
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

  const travelIndicator = async (subIndicator: Indicator, key: number) => {
    // we place the logic over here!
    console.log(key + ": " + subIndicator.name);

    // exit over here!
    if (subIndicator.sub_indicators.length <= 0) {
      return;
    }

    // if there are more we keep going
    for (const sub of subIndicator.sub_indicators) {
      await travelIndicator(sub, key + 1);
    }
  };

  const handleSubmitIndicator = async () => {
    // TODO: Implement indicator submission logic

    console.log("0: " + newIndicator.name);
    if (newIndicator.sub_indicators.length > 0) {
      for (const sub of newIndicator.sub_indicators) {
        await travelIndicator(sub, 1);
      }
    }
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
        className={`w-full p-4 border ${parentIndicator ? "border-gray-300" : "border-orange-400"}`}
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
              type="text"
              placeholder="Indicator Name"
              value={indicator.name}
              onChange={(e) =>
                handleInputChange(indicator, "name", e.target.value)
              }
              className="w-full p-2 border border-gray-300"
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
                handleInputChange(indicator, "description", e.target.value)
              }
              className="w-full p-2 border border-gray-300"
            />
          </div>
          <div className="w-full flex gap-4">
            <div className="w-1/2 flex flex-col gap-4">
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
            <div className="w-1/2 flex flex-col gap-4">
              <p className="text-sm text-green-800 font-semibold uppercase">
                Baseline
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
              Input the required data to be collected for this indicator:
            </p>
            <div className="w-full h-[200px] overflow-y-scroll flex flex-col gap-2">
              {requiredData.map((data, index) => (
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
              ))}
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => handleAddSubIndicator(indicator)}
              className="px-4 py-2 bg-green-500 text-white rounded"
            >
              + Add Sub-Indicator
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

        <div className="ml-6">
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
