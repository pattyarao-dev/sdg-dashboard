"use client";

import React from "react";
import { IndicatorStatus, useIndicators } from "@/context/IndicatorContext";
import { useRouter } from "next/navigation";

type Indicator = {
  id: number;
  name: string;
  baseline: number;
  target: number;
  current: number;
  status: IndicatorStatus;
};

type IndicatorListProps = {
  indicators: Indicator[];
  onAction: (id: number) => void;
  actionText: string;
};

const IndicatorList: React.FC<IndicatorListProps> = ({ indicators, onAction, actionText }) => {
  const router = useRouter();

  if (indicators.length === 0) {
    return (
      <div className="text-gray-500 text-center py-4">
        No indicators available.
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg mt-6">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow-md rounded-lg">
          <thead>
            <tr>
            <th className="py-2 px-4 border-b text-left text-gray-600 font-semibold">#</th>
              <th className="py-2 px-4 border-b text-left text-gray-600 font-semibold">Name</th>
              <th className="py-2 px-4 border-b text-center text-gray-600 font-semibold">Baseline</th>
              <th className="py-2 px-4 border-b text-center text-gray-600 font-semibold">Target</th>
              <th className="py-2 px-4 border-b text-center text-gray-600 font-semibold">Current</th>
              <th className="py-2 px-4 border-b text-center text-gray-600 font-semibold">Actions</th>
            </tr>
            </thead>
          <tbody>
            {indicators.map((indicator) => (
              <tr
                key={indicator.id}
                className="cursor-pointer hover:bg-gray-300"
                onClick={() => router.push(`/indicators/${indicator.id}`)}
              >
                <td className="py-2 px-4 text-black border-b">{indicator.id}</td>
                <td className="py-2 px-4 text-black border-b">{indicator.name}</td>
                <td className="py-2 px-4 text-black border-b text-center">{indicator.baseline.toFixed(2)}</td>
                <td className="py-2 px-4 text-black border-b text-center">{indicator.target.toFixed(2)}</td>
                <td className="py-2 px-4 text-black border-b text-center">{indicator.current.toFixed(2)}</td>
                <td className="py-2 px-4 border-b text-center">
                  {/* Toggle Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); 
                      onAction(indicator.id);
                    }}
                    className={`px-3 py-1 rounded-md text-white 
                      ${indicator.status === IndicatorStatus.Active ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
                  >
                    {indicator.status === IndicatorStatus.Active ? "Disable" : "Activate"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default IndicatorList;
