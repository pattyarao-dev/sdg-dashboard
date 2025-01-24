"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import IndicatorList from "@/components/IndicatorList";

const IndicatorManagement = () => {
  const router = useRouter();

  // test indicators
  const [activeIndicators, setActiveIndicators] = useState([
    {
      id: 1,
      name: "Indicator 1",
      description: "Description of Indicator 1",
      baseline: 10.5,
      target: 15.0,
      current: 12.3,
      createdAt: Date.now() - 1000,
    },
    {
      id: 2,
      name: "Indicator 2",
      description: "Description of Indicator 2",
      baseline: 20.5,
      target: 30.0,
      current: 25.4,
      createdAt: Date.now(),
    },
  ]);

  const [disabledIndicators, setDisabledIndicators] = useState([
    {
      id: 3,
      name: "Disabled Indicator 1",
      description: "Description of Disabled Indicator 1",
      baseline: 5.0,
      target: 10.0,
      current: 7.5,
      createdAt: Date.now() - 2000,
    },
    {
      id: 4,
      name: "Disabled Indicator 2",
      description: "Description of Disabled Indicator 2",
      baseline: 3.5,
      target: 7.0,
      current: 5.2,
      createdAt: Date.now() - 3000,
    },
  ]);

  const [activeList, setActiveList] = useState(true);

  const disableIndicator = (id: number) => {
    const indicatorToDisable = activeIndicators.find((indicator) => indicator.id === id);
    if (indicatorToDisable) {
      setActiveIndicators(activeIndicators.filter((indicator) => indicator.id !== id));
      setDisabledIndicators([...disabledIndicators, indicatorToDisable]);
    }
  };

  const enableIndicator = (id: number) => {
    const indicatorToEnable = disabledIndicators.find((indicator) => indicator.id === id);
    if (indicatorToEnable) {
      setDisabledIndicators(disabledIndicators.filter((indicator) => indicator.id !== id));
      setActiveIndicators([...activeIndicators, indicatorToEnable]);
    }
  };

  const sortedActiveIndicators = activeIndicators.sort((a, b) => a.createdAt - b.createdAt);
  const sortedDisabledIndicators = disabledIndicators.sort((a, b) => a.createdAt - b.createdAt);

  return (
    <div className="flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 p-7">
        <h1 className="text-2xl font-semibold mb-6">Indicator Management</h1>

        {/* Add Indicator Button */}
        <button
          onClick={() => router.push("/add-indicator")}
          className="mt-6 px-4 py-2 bg-yellow-500 text-white rounded-md"
        >
          + Add Indicator
        </button>

        {/* Toggle Tabs */}
        <div className="mt-6 mb-4 flex gap-6">
          <span
            onClick={() => setActiveList(true)}
            className={`cursor-pointer text-m font-semibold ${activeList ? "text-yellow-500" : "text-gray-500"}`}
          >
            Active ({activeIndicators.length})
          </span>

          <span
            onClick={() => setActiveList(false)}
            className={`cursor-pointer text-m font-semibold ${!activeList ? "text-yellow-500" : "text-gray-500"}`}
          >
            Disabled ({disabledIndicators.length})
          </span>
        </div>

        {/* Indicator List */}
        {activeList ? (
          <IndicatorList
            indicators={activeIndicators}
            onAction={disableIndicator}
            actionText="Disable"
          />
        ) : (
          <IndicatorList
            indicators={disabledIndicators}
            onAction={enableIndicator}
            actionText="Enable"
          />
        )}
      </div>
    </div>
  );
};

export default IndicatorManagement;
