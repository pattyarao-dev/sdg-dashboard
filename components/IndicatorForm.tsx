import React, { useState } from "react";
import { Indicator } from "@/context/IndicatorContext";
import SubIndicatorForm from "./SubIndicatorForm";

interface IndicatorFormProps {
  name: string;
  baseline: string | number;
  target: string | number;
  current: string | number;
  baselineYear: string | number;
  targetYear: string | number;
  currentYear: string | number;
  description: string;
  setName: React.Dispatch<React.SetStateAction<string>>;
  setBaseline: React.Dispatch<React.SetStateAction<string | number>>;
  setTarget: React.Dispatch<React.SetStateAction<string | number>>;
  setCurrent: React.Dispatch<React.SetStateAction<string | number>>;
  setBaselineYear: React.Dispatch<React.SetStateAction<string | number>>;
  setTargetYear: React.Dispatch<React.SetStateAction<string | number>>;
  setCurrentYear: React.Dispatch<React.SetStateAction<string | number>>;
  setDescription: React.Dispatch<React.SetStateAction<string>>;
  subIndicators: Indicator[];
  setSubIndicators: React.Dispatch<React.SetStateAction<Indicator[]>>;
  handleAddSubIndicator: () => void;
}

const IndicatorForm: React.FC<IndicatorFormProps> = ({
  name,
  baseline,
  target,
  current,
  baselineYear,
  targetYear,
  currentYear,
  description,
  setName,
  setBaseline,
  setTarget,
  setCurrent,
  setBaselineYear,
  setTargetYear,
  setCurrentYear,
  setDescription,
  subIndicators,
  setSubIndicators,
  handleAddSubIndicator,
}) => {
  const [showSubIndicatorForm, setShowSubIndicatorForm] = useState(false);

  const handleAddSubIndicatorForm = () => setShowSubIndicatorForm(true);

  const handleSubIndicatorAdded = (subIndicator: Indicator) => {
    const isDuplicate = subIndicators.some((existing) => existing.name === subIndicator.name);

    if (!isDuplicate) {
      setSubIndicators([...subIndicators, subIndicator]);
      setShowSubIndicatorForm(false);
    } else {
      alert("Sub-indicator with the same name already exists.");
    }
  };

  const handleCancel = () => setShowSubIndicatorForm(false);

  const handleAddIndicator = () => {
    if (!name || baseline === "" || target === "" || current === "") {
      alert("Please fill out all required fields.");
      return;
    }

    const newIndicator = {
      name,
      description,
      baseline: { value: parseFloat(baseline as string), year: parseInt(baselineYear as string) },
      target: { value: parseFloat(target as string), year: parseInt(targetYear as string) },
      current: { value: parseFloat(current as string), year: parseInt(currentYear as string) },
      status: "Active",
      subIndicators, // Sub-indicators are optional
    };

    console.log("Main Indicator added:", newIndicator);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg mt-4">
      <h2 className="text-xl font-semibold text-black mb-4">Indicator Details</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Indicator Name</label>
          <input
            type="text"
            className="w-full p-3 border border-gray-300 rounded-md text-black"
            placeholder="Enter indicator name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        {/* Baseline, Target, Current Values and Years */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Baseline Value</label>
            <input
              type="number"
              className="w-full p-3 border border-gray-300 rounded-md text-black"
              value={baseline}
              onChange={(e) => setBaseline(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Baseline Year</label>
            <input
              type="number"
              className="w-full p-3 border border-gray-300 rounded-md text-black"
              value={baselineYear}
              onChange={(e) => setBaselineYear(e.target.value)}
            />
          </div>
        </div>

          <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Baseline Value</label>
            <input
              type="number"
              className="w-full p-3 border border-gray-300 rounded-md text-black"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Target Year</label>
            <input
              type="number"
              className="w-full p-3 border border-gray-300 rounded-md text-black"
              value={targetYear}
              onChange={(e) => setTargetYear(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            className="w-full p-3 border border-gray-300 rounded-md text-black"
            placeholder="Describe the indicator"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Add Sub-Indicator Button */}
        <button
          type="button"
          onClick={handleAddSubIndicatorForm}
          className="mt-6 px-4 py-2 bg-yellow-500 text-white rounded-md"
        >
          Add Sub-Indicator
        </button>

        {showSubIndicatorForm && (
          <SubIndicatorForm onAddSubIndicator={handleSubIndicatorAdded} onCancel={handleCancel} />
        )}

        {/* Display Sub-Indicators if Added */}
        {subIndicators.length > 0 && (
          <ul className="mt-4 space-y-2">
            {subIndicators.map((subIndicator) => (
              <li key={subIndicator.id} className="text-sm text-gray-700">{subIndicator.name}</li>
            ))}
          </ul>
        )}

      </div>
    </div>
  );
};

export default IndicatorForm;


