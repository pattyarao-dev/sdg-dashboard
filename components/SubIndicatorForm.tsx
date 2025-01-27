import React, { useState } from "react";
import { Indicator, IndicatorStatus } from "@/context/IndicatorContext";

interface SubIndicatorFormProps {
  onAddSubIndicator: (subIndicator: Indicator) => void; 
  onCancel: () => void; 
}

const SubIndicatorForm: React.FC<SubIndicatorFormProps> = ({ onAddSubIndicator, onCancel }) => {
  const [subIndicatorName, setSubIndicatorName] = useState<string>("");
  const [subIndicatorBaseline, setSubIndicatorBaseline] = useState<number | string>("0");
  const [subIndicatorTarget, setSubIndicatorTarget] = useState<number | string>("0");
  const [subIndicatorCurrent, setSubIndicatorCurrent] = useState<number | string>("0");
  const [subIndicatorDescription, setSubIndicatorDescription] = useState<string>("");

  // Handle adding the sub-indicator
  const handleSubmit = () => {
    if (!subIndicatorName) {
      alert("Please enter a name for the sub-indicator.");
      return;
    }

    const newSubIndicator: Indicator = {
      id: Math.random(), // temp id
      name: subIndicatorName,
      description: subIndicatorDescription,
      baseline: { value: parseFloat(subIndicatorBaseline as string), year: 2020 },
      target: { value: parseFloat(subIndicatorTarget as string), year: 2030 },
      current: { value: parseFloat(subIndicatorCurrent as string), year: 2025 },
      status: IndicatorStatus.Active,
      sdgs: [], 
    };

    onAddSubIndicator(newSubIndicator);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg mt-4">
      <h2 className="text-xl font-semibold text-black mb-4">Sub-Indicator Details</h2>

      <div className="space-y-4">
        {/* Sub-indicator Name */}
        <div>
          <label htmlFor="sub-indicator-name" className="block text-sm font-medium text-gray-700">
            Sub-Indicator Name
          </label>
          <input
            type="text"
            id="sub-indicator-name"
            className="w-full p-3 border border-gray-300 rounded-md text-black"
            placeholder="Enter sub-indicator name"
            value={subIndicatorName}
            onChange={(e) => setSubIndicatorName(e.target.value)}
          />
        </div>

        {/* Baseline Value */}
        <div>
          <label htmlFor="sub-indicator-baseline" className="block text-sm font-medium text-gray-700">
            Baseline Value
          </label>
          <input
            type="number"
            id="sub-indicator-baseline"
            className="w-full p-3 border border-gray-300 rounded-md text-black"
            value={subIndicatorBaseline}
            onChange={(e) => setSubIndicatorBaseline(e.target.value)}
          />
        </div>

        {/* Target Value */}
        <div>
          <label htmlFor="sub-indicator-target" className="block text-sm font-medium text-gray-700">
            Target Value
          </label>
          <input
            type="number"
            id="sub-indicator-target"
            className="w-full p-3 border border-gray-300 rounded-md text-black"
            value={subIndicatorTarget}
            onChange={(e) => setSubIndicatorTarget(e.target.value)}
          />
        </div>

        {/* Current Value */}
        <div>
          <label htmlFor="sub-indicator-current" className="block text-sm font-medium text-gray-700">
            Current Value
          </label>
          <input
            type="number"
            id="sub-indicator-current"
            className="w-full p-3 border border-gray-300 rounded-md text-black"
            value={subIndicatorCurrent}
            onChange={(e) => setSubIndicatorCurrent(e.target.value)}
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="sub-indicator-description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="sub-indicator-description"
            className="w-full p-3 border border-gray-300 rounded-md text-black"
            placeholder="Describe the sub-indicator"
            value={subIndicatorDescription}
            onChange={(e) => setSubIndicatorDescription(e.target.value)}
          ></textarea>
        </div>

        {/* Buttons */}
        <div className="flex justify-between">
          <button
            onClick={handleSubmit}
            className="mt-6 px-4 py-2 bg-yellow-500 text-white rounded-md"
          >
            Add Sub-Indicator
          </button>
          <button
            onClick={onCancel}
            className="mt-6 px-4 py-2 bg-gray-500 text-white rounded-md"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubIndicatorForm;
