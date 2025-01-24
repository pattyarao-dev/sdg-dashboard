"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";

const IndicatorManagement = () => {
  const [activeList, setActiveList] = useState(true);
  const router = useRouter();

  const activeIndicators = [
    { id: 1, name: "Indicator 1", description: "Description of Indicator 1" },
    { id: 2, name: "Indicator 2", description: "Description of Indicator 2" },
  ];

  const disabledIndicators = [
    { id: 3, name: "Disabled Indicator 1", description: "Description of Disabled Indicator 1" },
    { id: 4, name: "Disabled Indicator 2", description: "Description of Disabled Indicator 2" },
  ];

  const indicators = activeList ? activeIndicators : disabledIndicators;

  return (
    <div className="flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 p-7">
        <h1 className="text-2xl font-semibold mb-6">Indicator Management</h1>

        <button
            onClick={() => router.push("/add-indicator")}
            className="mt-6 px-4 py-2 bg-yellow-500 text-white rounded-md"
          >
            + Add Indicator
          </button>
        
        {/* Toggle Buttons */}
        <div className="mt-6 mb-4 flex gap-4">
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
        <div className="bg-white p-6 rounded-lg shadow-lg mt-6">
          <h2 className="text-xl font-semibold text-black mb-4">Indicators</h2>
          <ul className="space-y-4">
            {indicators.map((indicator) => (
              <li key={indicator.id} className="p-4 border rounded-md">
                <h3 className="font-semibold">{indicator.name}</h3>
                <p className="text-gray-600">{indicator.description}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default IndicatorManagement;
