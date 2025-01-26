"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { useIndicators } from "@/context/IndicatorContext";
import { IndicatorStatus } from "@/context/IndicatorContext";

const AddIndicator = () => {
  const { addIndicator } = useIndicators();
  const [name, setName] = useState("");
  const [selectedSdgs, setSelectedSdgs] = useState<number[]>([]);
  const [description, setDescription] = useState("");
  
  const [baseline, setBaseline] = useState<number | string>("");
  const [target, setTarget] = useState<number | string>("");
  const [current, setCurrent] = useState<number | string>("");

  const [baselineYear, setBaselineYear] = useState<number | string>("");
  const [targetYear, setTargetYear] = useState<number | string>("");
  const [currentYear, setCurrentYear] = useState<number | string>("");

  const router = useRouter();

  // Dummy SDGs list
  const sdgs = [
    { id: 1, name: "No Poverty" },
    { id: 2, name: "Zero Hunger" },
    { id: 3, name: "Good Health and Well-being" },
  ];

  // Handle checkbox change
  const handleCheckboxChange = (sdgId: number) => {
    setSelectedSdgs((prev) =>
      prev.includes(sdgId)
        ? prev.filter((id) => id !== sdgId) 
        : [...prev, sdgId] 
    );
  };

  const handleAddIndicator = () => {
    if (
      !name ||
      selectedSdgs.length === 0 || 
      baseline === "" ||
      target === "" ||
      current === "" ||
      baselineYear === "" ||
      targetYear === "" ||
      currentYear === ""
    ) {
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
      status: IndicatorStatus.Active,
    };

    addIndicator(newIndicator);
    router.push("/indicator-management");
  };

  return (
    <div className="flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 p-7">
        <h1 className="text-2xl font-semibold mb-6">Add New Indicator</h1>

        {/* Content Section */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold text-black mb-4">Manage Your Indicators</h2>

          {/* Add an Indicator Form */}
          <div className="space-y-4">
            <div>
              <label htmlFor="indicator-name" className="block text-sm font-medium text-gray-700">
                Indicator Name
              </label>
              <input
                type="text"
                id="indicator-name"
                className="w-full p-3 border border-gray-300 rounded-md text-black"
                placeholder="Enter the indicator name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="my-4 text-black">
              <h3>Sustainable Development Goal/s</h3>
              {sdgs.map((sdgOption) => (
                <div key={sdgOption.id}>
                  <label>
                    <input
                      type="checkbox"
                      value={sdgOption.id}
                      checked={selectedSdgs.includes(sdgOption.id)}
                      onChange={() => handleCheckboxChange(sdgOption.id)}
                    />
                    {sdgOption.name}
                  </label>
                </div>
              ))}
            </div>

            <div>
              <label htmlFor="indicator-baseline" className="block text-sm font-medium text-gray-700">
                Baseline Value
              </label>
              <input
                type="number"
                id="indicator-baseline"
                className="w-full p-3 border border-gray-300 rounded-md text-black"
                placeholder="Enter the baseline value"
                value={baseline}
                onChange={(e) => setBaseline(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="indicator-baseline-year" className="block text-sm font-medium text-gray-700">
                Baseline Year
              </label>
              <input
                type="number"
                id="indicator-baseline-year"
                className="w-full p-3 border border-gray-300 rounded-md text-black"
                placeholder="Enter the baseline year"
                value={baselineYear}
                onChange={(e) => setBaselineYear(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="indicator-target" className="block text-sm font-medium text-gray-700">
                Target Value
              </label>
              <input
                type="number"
                id="indicator-target"
                className="w-full p-3 border border-gray-300 rounded-md text-black"
                placeholder="Enter the target value"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="indicator-target-year" className="block text-sm font-medium text-gray-700">
                Target Year
              </label>
              <input
                type="number"
                id="indicator-target-year"
                className="w-full p-3 border border-gray-300 rounded-md text-black"
                placeholder="Enter the target year"
                value={targetYear}
                onChange={(e) => setTargetYear(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="indicator-current" className="block text-sm font-medium text-gray-700">
                Current Value
              </label>
              <input
                type="number"
                id="indicator-current"
                className="w-full p-3 border border-gray-300 rounded-md text-black"
                placeholder="Enter the current value"
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="indicator-current-year" className="block text-sm font-medium text-gray-700">
                Current Year
              </label>
              <input
                type="number"
                id="indicator-current-year"
                className="w-full p-3 border border-gray-300 rounded-md text-black"
                placeholder="Enter the current year"
                value={currentYear}
                onChange={(e) => setCurrentYear(e.target.value)}
              />
            </div>

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
              ></textarea>
            </div>

            <button
              onClick={handleAddIndicator}
              className="mt-6 px-4 py-2 bg-yellow-500 text-white rounded-md"
            >
              Add Indicator
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddIndicator;
