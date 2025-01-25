"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import IndicatorList from "@/components/IndicatorList";
import { useIndicators } from "@/context/IndicatorContext";

const IndicatorManagement = () => {
  const { indicators, updateIndicatorStatus } = useIndicators();
  const router = useRouter();
  const [activeList, setActiveList] = useState(true);

  const activeIndicators = indicators.filter((ind) => ind.status === "active");
  const disabledIndicators = indicators.filter((ind) => ind.status === "disabled");

  const handleAction = (id: number, newStatus: "active" | "disabled") => {
    updateIndicatorStatus(id, newStatus);
  };

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
            className={`cursor-pointer text-m font-semibold ${
              activeList ? "text-yellow-500" : "text-gray-500"
            }`}
          >
            Active ({activeIndicators.length})
          </span>

          <span
            onClick={() => setActiveList(false)}
            className={`cursor-pointer text-m font-semibold ${
              !activeList ? "text-yellow-500" : "text-gray-500"
            }`}
          >
            Disabled ({disabledIndicators.length})
          </span>
        </div>

        {/* Indicator List */}
        {activeList ? (
          <IndicatorList
            indicators={activeIndicators}
            onAction={(id) => handleAction(id, "disabled")}
            actionText="Disable"
          />
        ) : (
          <IndicatorList
            indicators={disabledIndicators}
            onAction={(id) => handleAction(id, "active")}
            actionText="Enable"
          />
        )}
      </div>
    </div>
  );
};

export default IndicatorManagement;
