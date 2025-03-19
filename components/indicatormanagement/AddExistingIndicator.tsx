"use client";

import { useState } from "react";
import { Goal, GoalIndicator, RequiredData } from "@/types/goal.types";

const AddExistingIndicator = ({
  goal,
  availableIndicators,
  requiredData,
}: {
  goal: Goal;
  availableIndicators: GoalIndicator[];
  requiredData: RequiredData[];
}) => {
  const [selectedIndicator, setSelectedIndicator] = useState({
    name: "",
    description: "",
    global_target_value: 0,
    global_baseline_value: 0,
    requiredData: [{}],
  });

  const [requiredDataList, setRequiredDataList] = useState<RequiredData[]>([]);

  const handleSelectRequiredData = (requiredData: RequiredData) => {
    if (requiredDataList.includes(requiredData)) {
      setRequiredDataList(
        requiredDataList.filter(
          (rd) => rd.required_data_id !== requiredData.required_data_id,
        ),
      );
    } else {
      setRequiredDataList([...requiredDataList, requiredData]);
      setSelectedIndicator({
        ...selectedIndicator,
        requiredData: [...selectedIndicator.requiredData, requiredData],
      });
    }
  };

  const handleSubmitIndicator = () => {
    // TODO: Implement indicator submission logic
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
        <div className="w-1/4 h-[600px] overflow-y-scroll flex flex-col gap-2">
          {availableIndicators.map((indicator, index) => (
            <button
              key={index}
              className="w-full p-2 border border-gray-300 text-left"
            >
              {indicator.md_indicator.name}
            </button>
          ))}
        </div>
        <div className="w-3/4 h-full overflow-y-scroll flex flex-col gap-6">
          <div className="w-full h-1/4 flex flex-col gap-2">
            <h1 className="uppercase font-bold text-green-800">
              Selected Indicator
            </h1>
            <hr />
          </div>
          <div className="w-full flex flex-col gap-8">
            <div className="w-full flex flex-col gap-2">
              <p className="text-sm text-green-800 font-semibold uppercase">
                Indicator Name:
              </p>
              <input
                type="text"
                placeholder="Indicator Name"
                value={selectedIndicator.name}
                onChange={(e) =>
                  setSelectedIndicator({
                    ...selectedIndicator,
                    name: e.target.value,
                  })
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
                value={selectedIndicator.description}
                onChange={(e) =>
                  setSelectedIndicator({
                    ...selectedIndicator,
                    description: e.target.value,
                  })
                }
                className="w-full p-2 border border-gray-300"
              />
            </div>

            <div className="w-full flex items-center justify-between gap-8">
              <div className="w-1/2 flex flex-col gap-4">
                <p className="text-sm text-green-800 font-semibold uppercase">
                  2030 Target
                </p>
                <input
                  type="number"
                  placeholder="2030 Target"
                  value={selectedIndicator.global_target_value}
                  onChange={(e) =>
                    setSelectedIndicator({
                      ...selectedIndicator,
                      global_target_value: Number(e.target.value),
                    })
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
                  value={selectedIndicator.global_baseline_value}
                  onChange={(e) =>
                    setSelectedIndicator({
                      ...selectedIndicator,
                      global_baseline_value: Number(e.target.value),
                    })
                  }
                  className="w-full p-2 border border-gray-300"
                />
              </div>
            </div>
            <div className="w-full flex flex-col flex-grow gap-4">
              <p className="text-sm text-green-800 font-semibold uppercase">
                Select the required data to be collected for this indicator:
              </p>
              <div className="w-full h-[200px] overflow-y-scroll flex flex-col gap-2">
                {requiredData.map((data, index) => (
                  <button
                    key={index}
                    onClick={() => handleSelectRequiredData(data)}
                    className={`w-full p-2 flex items-center gap-2 text-left ${requiredDataList.includes(data) ? "bg-green-50 border border-green-800" : "border border-gray-200"}`}
                  >
                    {data.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <form onSubmit={handleSubmitIndicator}>
        <button className="button-style">Submit Indicator</button>
      </form>
    </div>
  );
};

export default AddExistingIndicator;
