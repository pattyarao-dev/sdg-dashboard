"use client";

import { useState } from "react";
import { Goal, RequiredData } from "@/types/goal.types";

const AddNewIndicator = ({
  goal,
  requiredData,
}: {
  goal: Goal;
  requiredData: RequiredData[];
}) => {
  const [newIndicator, setNewIndicator] = useState({
    name: "",
    description: "",
    global_target_value: 0,
    global_baseline_value: 0,
    requiredData: [{}],
    subIndicators: [{}],
  });

  // For indicator required data
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
      setNewIndicator({
        ...newIndicator,
        requiredData: [...newIndicator.requiredData, requiredData],
      });
    }
  };

  // For sub-indicators
  const [subIndicators, setSubIndicators] = useState();

  const handleSubmitIndicator = () => {
    // TODO: Implement indicator submission logic
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
        <div className="w-full flex flex-col gap-8">
          <div className="w-full flex flex-col gap-2">
            <p className="text-sm text-green-800 font-semibold uppercase">
              Indicator Name:
            </p>
            <input
              type="text"
              placeholder="Indicator Name"
              value={newIndicator.name}
              onChange={(e) =>
                setNewIndicator({
                  ...newIndicator,
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
              value={newIndicator.description}
              onChange={(e) =>
                setNewIndicator({
                  ...newIndicator,
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
                value={newIndicator.global_target_value}
                onChange={(e) =>
                  setNewIndicator({
                    ...newIndicator,
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
                value={newIndicator.global_baseline_value}
                onChange={(e) =>
                  setNewIndicator({
                    ...newIndicator,
                    global_baseline_value: Number(e.target.value),
                  })
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
                  className={`w-full p-2 flex items-center gap-2 ${requiredDataList.includes(data) ? "bg-green-50 border border-green-800" : "border border-gray-200"}`}
                >
                  <button
                    onClick={() => handleSelectRequiredData(data)}
                    className="w-full text-left"
                  >
                    {data.name}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="w-full flex flex-col gap-8">
        <div className="w-full p-4 flex items-center justify-between border border-orange-400">
          <h2 className="uppercase font-bold text-orange-400">
            Assign Sub-Indicators for this Goal
          </h2>
          <button className="w-fit px-6 py-2 button-style">
            Add a Sub-Indicator
          </button>
        </div>

        <div className="w-full flex flex-col gap-8">
          <div className="w-full flex flex-col gap-8">
            <div className="w-full flex flex-col gap-2">
              <p className="text-sm text-green-800 font-semibold uppercase">
                Indicator Name:
              </p>
              <input
                type="text"
                placeholder="Indicator Name"
                value={newIndicator.name}
                onChange={(e) =>
                  setNewIndicator({
                    ...newIndicator,
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
                value={newIndicator.description}
                onChange={(e) =>
                  setNewIndicator({
                    ...newIndicator,
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
                  value={newIndicator.global_target_value}
                  onChange={(e) =>
                    setNewIndicator({
                      ...newIndicator,
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
                  value={newIndicator.global_baseline_value}
                  onChange={(e) =>
                    setNewIndicator({
                      ...newIndicator,
                      global_baseline_value: Number(e.target.value),
                    })
                  }
                  className="w-full p-2 border border-gray-300"
                />
              </div>
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
                  className={`w-full p-2 flex items-center gap-2 ${requiredDataList.includes(data) ? "bg-green-50 border border-green-800" : "border border-gray-200"}`}
                >
                  <button
                    onClick={() => handleSelectRequiredData(data)}
                    className="w-full text-left"
                  >
                    {data.name}
                  </button>
                </div>
              ))}
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

export default AddNewIndicator;
