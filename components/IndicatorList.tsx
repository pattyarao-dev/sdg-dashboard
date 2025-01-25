"use client";

import React from "react";
import { useIndicators } from "@/context/IndicatorContext";

type Indicator = {
  id: number;
  name: string;
  baseline: number; 
  target: number;   
  current: number; 
};

type IndicatorListProps = {
  indicators: Indicator[]; 
  onAction: (id: number) => void;
  actionText: string; 
};

const IndicatorList: React.FC<IndicatorListProps> = ({ indicators, onAction, actionText }) => {
  if (indicators.length === 0) {
    return (
      <div className="text-gray-500 text-center py-4">
        No indicators have been created.
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg mt-6">
      <h2 className="text-xl font-semibold text-black mb-4">Indicators</h2>
      <ul className="space-y-4">
        {indicators.map((indicator) => (
          <li key={indicator.id} className="p-4 border rounded-md flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-black">{indicator.name}</h3>
              <p className="text-gray-600">
                Baseline: {indicator.baseline.toFixed(2)}, 
                Target: {indicator.target.toFixed(2)}, 
                Current: {indicator.current.toFixed(2)}
              </p>
            </div>
            {onAction && actionText && (
              <button
                onClick={() => onAction(indicator.id)}
                className="text-sm px-3 py-1 bg-yellow-500 text-white rounded-md"
              >
                {actionText}
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default IndicatorList;
