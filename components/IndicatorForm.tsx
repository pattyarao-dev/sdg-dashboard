import React, { useState } from "react";
import { Indicator } from "@/context/IndicatorContext";
import SubIndicatorForm from "./SubIndicatorForm";

interface IndicatorFormProps {
  name: string;
  selectedSdgs: number[];
  baseline: string | number;
  target: string | number;
  current: string | number;
  baselineYear: string | number;
  targetYear: string | number;
  currentYear: string | number;
  description: string;
  setName: React.Dispatch<React.SetStateAction<string>>;
  setSelectedSdgs: React.Dispatch<React.SetStateAction<number[]>>;
  setBaseline: React.Dispatch<React.SetStateAction<string | number>>;
  setTarget: React.Dispatch<React.SetStateAction<string | number>>;
  setCurrent: React.Dispatch<React.SetStateAction<string | number>>;
  setBaselineYear: React.Dispatch<React.SetStateAction<string | number>>;
  setTargetYear: React.Dispatch<React.SetStateAction<string | number>>;
  setCurrentYear: React.Dispatch<React.SetStateAction<string | number>>;
  setDescription: React.Dispatch<React.SetStateAction<string>>;
  sdgs: { id: number; name: string }[];
  subIndicators: Indicator[];
  setSubIndicators: React.Dispatch<React.SetStateAction<Indicator[]>>;
  handleAddSubIndicator: () => void;
}

const IndicatorForm: React.FC<IndicatorFormProps> = ({
  name,
  selectedSdgs,
  baseline,
  target,
  current,
  baselineYear,
  targetYear,
  currentYear,
  description,
  setName,
  setSelectedSdgs,
  setBaseline,
  setTarget,
  setCurrent,
  setBaselineYear,
  setTargetYear,
  setCurrentYear,
  setDescription,
  sdgs,
  subIndicators,
  setSubIndicators,
  handleAddSubIndicator,
}) => {
  const handleCheckboxChange = (sdgId: number) => {
    setSelectedSdgs((prev) =>
      prev.includes(sdgId) ? prev.filter((id) => id !== sdgId) : [...prev, sdgId]
    );
  };

  const [showSubIndicatorForm, setShowSubIndicatorForm] = useState(false); 

  const handleAddSubIndicatorForm = () => {
    setShowSubIndicatorForm(true);
  };

  const handleSubIndicatorAdded = (subIndicator: Indicator) => {
    const isDuplicate = subIndicators.some(
      (existingSubIndicator) => existingSubIndicator.name === subIndicator.name
    );

    if (!isDuplicate) {
      setSubIndicators((prev) => [...prev, subIndicator]); 
      setShowSubIndicatorForm(false);
    } else {
      alert("Sub-indicator with the same name already exists.");
    }
  };

  const handleCancel = () => {
    setShowSubIndicatorForm(false); 
  };

  const handleAddIndicator = () => {
    // Handle adding the main indicator here
    if (!name || selectedSdgs.length === 0 || baseline === "" || target === "" || current === "") {
      alert("Please fill out all fields.");
      return;
    }

    const newIndicator = {
      name,
      sdgs: selectedSdgs,
      description,
      baseline: { value: parseFloat(baseline as string), year: parseInt(baselineYear as string) },
      target: { value: parseFloat(target as string), year: parseInt(targetYear as string) },
      current: { value: parseFloat(current as string), year: parseInt(currentYear as string) },
      status: "Active", 
      subIndicators, 
    };

    console.log("Main Indicator added:", newIndicator);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg mt-4">
      <h2 className="text-xl font-semibold text-black mb-4">Indicator Details</h2>
  
      <div className="space-y-4">
        {/* Indicator Name */}
        <div>
          <label htmlFor="indicator-name" className="block text-sm font-medium text-gray-700">
            Indicator Name
          </label>
          <input
            type="text"
            id="indicator-name"
            className="w-full p-3 border border-gray-300 rounded-md text-black"
            placeholder="Enter indicator name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
  
        {/* SDGs Checkbox */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Sustainable Development Goal/s</label>
          {sdgs.map((sdgOption) => (
            <div key={sdgOption.id} className="flex items-center space-x-2">
              <input
                type="checkbox"
                id={`sdg-${sdgOption.id}`}
                value={sdgOption.id}
                checked={selectedSdgs.includes(sdgOption.id)}
                onChange={() => handleCheckboxChange(sdgOption.id)}
                className="h-5 w-5 text-yellow-500"
              />
              <label htmlFor={`sdg-${sdgOption.id}`} className="text-sm">{sdgOption.name}</label>
            </div>
          ))}
        </div>
  
        {/* Baseline Value */}
        <div>
          <label htmlFor="indicator-baseline" className="block text-sm font-medium text-gray-700">
            Baseline Value
          </label>
          <input
            type="number"
            id="indicator-baseline"
            className="w-full p-3 border border-gray-300 rounded-md text-black"
            value={baseline}
            onChange={(e) => setBaseline(e.target.value)}
          />
        </div>
  
        {/* Baseline Year */}
        <div>
          <label htmlFor="indicator-baseline-year" className="block text-sm font-medium text-gray-700">
            Baseline Year
          </label>
          <input
            type="number"
            id="indicator-baseline-year"
            className="w-full p-3 border border-gray-300 rounded-md text-black"
            value={baselineYear}
            onChange={(e) => setBaselineYear(e.target.value)}
          />
        </div>
  
        {/* Target Value */}
        <div>
          <label htmlFor="indicator-target" className="block text-sm font-medium text-gray-700">
            Target Value
          </label>
          <input
            type="number"
            id="indicator-target"
            className="w-full p-3 border border-gray-300 rounded-md text-black"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
          />
        </div>
  
        {/* Target Year */}
        <div>
          <label htmlFor="indicator-target-year" className="block text-sm font-medium text-gray-700">
            Target Year
          </label>
          <input
            type="number"
            id="indicator-target-year"
            className="w-full p-3 border border-gray-300 rounded-md text-black"
            value={targetYear}
            onChange={(e) => setTargetYear(e.target.value)}
          />
        </div>
  
        {/* Current Value */}
        <div>
          <label htmlFor="indicator-current" className="block text-sm font-medium text-gray-700">
            Current Value
          </label>
          <input
            type="number"
            id="indicator-current"
            className="w-full p-3 border border-gray-300 rounded-md text-black"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
          />
        </div>
  
        {/* Current Year */}
        <div>
          <label htmlFor="indicator-current-year" className="block text-sm font-medium text-gray-700">
            Current Year
          </label>
          <input
            type="number"
            id="indicator-current-year"
            className="w-full p-3 border border-gray-300 rounded-md text-black"
            value={currentYear}
            onChange={(e) => setCurrentYear(e.target.value)}
          />
        </div>
  
        {/* Description */}
        <div>
          <label htmlFor="indicator-description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="indicator-description"
            className="w-full p-3 border border-gray-300 rounded-md text-black"
            placeholder="Describe the indicator"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
  
        {/* Sub-Indicators */}
        <div>
          <button
            type="button"
            onClick={handleAddSubIndicatorForm}
            className="mt-6 px-4 py-2 bg-yellow-500 text-white rounded-md"
          >
            Add Sub-Indicator
          </button>
          {showSubIndicatorForm && (
            <SubIndicatorForm
              onAddSubIndicator={handleSubIndicatorAdded} 
              onCancel={handleCancel} 
            />
          )}

          {/* Displaying added sub-indicators */}
          <ul className="mt-4 space-y-2">
            {subIndicators.map((subIndicator) => (
              <li key={subIndicator.id} className="text-sm text-gray-700">
                {subIndicator.name}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default IndicatorForm;
