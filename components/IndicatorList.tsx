"use client";

import React from "react";
import { IndicatorStatus, useIndicators } from "@/context/IndicatorContext";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Indicator = {
  id: number;
  name: string;
  baseline: { value: number; year: number };
  target: { value: number; year: number };
  current: { value: number; year: number };
  description: string;
  status: IndicatorStatus;
  sdgs: number[];
};

type SDG = {
  id: number;
  name: string;
};

type IndicatorListProps = {
  indicators: Indicator[];
  sdgs: SDG[];
  onAction: (id: number, newStatus: IndicatorStatus) => void;
};

const groupIndicatorsBySDG = (indicators: Indicator[], sdgs: SDG[]) => {
  return sdgs.map((sdg) => ({
    sdg,
    indicators: indicators.filter((indicator) => indicator.sdgs.includes(sdg.id)),
  }));
};

const IndicatorList: React.FC<IndicatorListProps> = ({ indicators, sdgs, onAction }) => {
  const router = useRouter();
  const [expandedSDGs, setExpandedSDGs] = useState<Record<number, boolean>>({});

  const groupedIndicators = groupIndicatorsBySDG(indicators, sdgs);

  const toggleExpand = (sdgId: number) => {
    setExpandedSDGs((prev) => ({
      ...prev,
      [sdgId]: !prev[sdgId],
    }));
  };

  console.log("Grouped Indicators:", groupIndicatorsBySDG(indicators, sdgs));
  console.log("Indicators received in IndicatorList:", indicators);
  console.log("SDGs received in IndicatorList:", sdgs);



  return (
    <div>
      {groupedIndicators.map(({ sdg, indicators: sdgIndicators }) => {
        const isExpanded = expandedSDGs[sdg.id] ?? true;

        return (
          <div key={sdg.id} className="min-w-full bg-white shadow-md rounded-lg mb-4">
            {/* SDG Header */}
            <div className="flex items-center justify-between p-4">
              <h2 className="text-xl font-bold text-black">
                {sdg.id}. {sdg.name}
              </h2>
              <button onClick={() => toggleExpand(sdg.id)} className="text-xl text-gray-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="black"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`transform ${isExpanded ? "rotate-180" : ""}`}
                >
                  <path d="M6 9l6 6 6-6"></path>
                </svg>
              </button>
            </div>

            {/* Indicators Table */}
            {isExpanded && (
              <div className="overflow-x-auto">
                {sdgIndicators && sdgIndicators.length > 0 ? (
                  <table className="min-w-full bg-white shadow-md rounded-lg">
                    <thead>
                      <tr>
                        <th className="py-2 px-4 border-b text-left text-gray-600 font-semibold">#</th>
                        <th className="py-2 px-4 border-b text-left text-gray-600 font-semibold">Name</th>
                        <th className="py-2 px-4 border-b text-center text-gray-600 font-semibold">Baseline (Year)</th>
                        <th className="py-2 px-4 border-b text-center text-gray-600 font-semibold">Current (Year)</th>
                        <th className="py-2 px-4 border-b text-center text-gray-600 font-semibold">Target (Year)</th>
                        <th className="py-2 px-4 border-b text-center text-gray-600 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sdgIndicators.map((indicator) => (
                        <tr
                          key={indicator.id}
                          className="cursor-pointer hover:bg-gray-300"
                          onClick={() => router.push(`/indicators/${indicator.id}`)}
                        >
                          <td className="py-2 px-4 text-black border-b">{indicator.id}</td>
                          <td className="py-2 px-4 text-black border-b">{indicator.name}</td>
                          <td className="py-2 px-4 text-black border-b text-center">
                            {indicator.baseline.value.toFixed(2)} ({indicator.baseline.year})
                          </td>
                          <td className="py-2 px-4 text-black border-b text-center">
                            {indicator.current.value.toFixed(2)} ({indicator.current.year})
                          </td>
                          <td className="py-2 px-4 text-black border-b text-center">
                            {indicator.target.value.toFixed(2)} ({indicator.target.year})
                          </td>
                          <td className="py-2 px-4 border-b text-center">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onAction(
                                  indicator.id,
                                  indicator.status === IndicatorStatus.Active ? IndicatorStatus.Disabled : IndicatorStatus.Active
                                );
                              }}
                              className={`px-3 py-1 rounded-md text-white 
                                ${indicator.status === IndicatorStatus.Active ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"}`}
                            >
                              {indicator.status === IndicatorStatus.Active ? "Disable" : "Enable"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="p-4 text-gray-700">No indicators yet.</p>
                )}
              </div>
            )}

            {/* Add Indicator Button */}
            <button
              onClick={() => router.push(`/add-indicator?sdg=${sdg.id}`)}
              className="m-4 px-4 py-2 bg-yellow-500 text-white rounded-md"
            >
              + Add Indicator
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default IndicatorList;
