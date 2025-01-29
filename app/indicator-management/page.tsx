"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import IndicatorList from "@/components/IndicatorList";
import { useIndicators, IndicatorStatus } from "@/context/IndicatorContext";
import { useRouter } from "next/navigation";

const IndicatorManagement = () => {
  const { indicators, updateIndicatorStatus } = useIndicators();
  const router = useRouter();
  const [activeList, setActiveList] = useState(true);

  const activeIndicators = indicators.filter((ind) => ind.status === IndicatorStatus.Active);
  const disabledIndicators = indicators.filter((ind) => ind.status === IndicatorStatus.Disabled);

  // List of SDGs
  const sdgs = [
    { id: 1, name: "No Poverty" },
    { id: 2, name: "Zero Hunger" },
    { id: 3, name: "Good Health and Well-being" },
  ];

  const handleAction = (id: number, newStatus: IndicatorStatus) => {
    updateIndicatorStatus(id, newStatus);
  };

  return (
    <div className="flex">
      <Sidebar />

      <div className="flex-1 p-7">
        <h1 className="text-2xl font-semibold mb-6">Indicator Management</h1>

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

        {/* SDG List with Indicators */}
        <IndicatorList
          indicators={activeList ? activeIndicators : disabledIndicators}
          sdgs={sdgs}
          onAction={handleAction}
        />
      </div>
    </div>
  );
};

export default IndicatorManagement;
