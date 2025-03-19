"use client";

import { useState } from "react";
import { Goal, RequiredData } from "@/types/goal.types";
import { getRequiredDataList } from "@/app/actions/actions";
import { setRequestMeta } from "next/dist/server/request-meta";

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
    requiredData: [],
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
    }
  };

  const handleSubmitIndicator = () => {
    // TODO: Implement indicator submission logic
  };

  return (
    <div className="w-full p-10 bg-white drop-shadow-lg flex flex-col gap-6">
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
          <div className="w-full flex items-start gap-8">
            <div className="w-1/2 h-[200px] overflow-y-scroll flex flex-col gap-2">
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
            <div className="w-1/2 h-[200px] flex flex-col justify-start">
              <div className="w-full h-1/4 flex flex-col gap-2">
                <p className="text-sm">Selected Required Data</p>
                <hr className="w-full border border-green-800" />
              </div>
              <div className="w-full h-3/4 flex flex-col gap-2 overflow-y-scroll">
                {requiredDataList.map((data, index) => (
                  <p key={index} className="w-full border border-gray-200 p-2">
                    {data.name}
                  </p>
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

export default AddNewIndicator;
