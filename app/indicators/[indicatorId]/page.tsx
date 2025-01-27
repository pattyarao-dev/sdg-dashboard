"use client";

import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import { useIndicators } from "@/context/IndicatorContext";
import { Indicator } from "@/context/IndicatorContext";

const IndicatorDetails = () => {
  const params = useParams();
  const router = useRouter();
  const indicatorId = params?.indicatorId;

  const { indicators, updateIndicator } = useIndicators(); // Assume updateIndicator is available
  const [indicator, setIndicator] = useState<Indicator | null>(null);
  const [isEditing, setIsEditing] = useState(false); // Toggle edit mode

  // Local state for editing
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [baseline, setBaseline] = useState<number | string>("");
  const [baselineYear, setBaselineYear] = useState<number | string>("");
  const [target, setTarget] = useState<number | string>("");
  const [targetYear, setTargetYear] = useState<number | string>("");
  const [current, setCurrent] = useState<number | string>("");
  const [currentYear, setCurrentYear] = useState<number | string>("");

  useEffect(() => {
    if (indicatorId) {
      const fetchedIndicator = getIndicatorById(Number(indicatorId));
      if (fetchedIndicator) {
        setIndicator(fetchedIndicator);
        populateEditFields(fetchedIndicator); 
      }
    }
  }, [indicatorId, indicators]);

  const getIndicatorById = (id: number): Indicator | null => {
    return indicators.find((indicator) => indicator.id === id) || null;
  };

  const populateEditFields = (indicator: Indicator) => {
    setName(indicator.name);
    setDescription(indicator.description);
    setBaseline(indicator.baseline.value);
    setBaselineYear(indicator.baseline.year);
    setTarget(indicator.target.value);
    setTargetYear(indicator.target.year);
    setCurrent(indicator.current.value);
    setCurrentYear(indicator.current.year);
  };

  const handleSave = () => {
    if (!name || !baseline || !target || !current || !baselineYear || !targetYear || !currentYear) {
      alert("Please fill out all fields.");
      return;
    }

    const updatedIndicator: Indicator = {
      ...indicator!,
      name,
      description,
      baseline: { value: parseFloat(baseline as string), year: parseInt(baselineYear as string) },
      target: { value: parseFloat(target as string), year: parseInt(targetYear as string) },
      current: { value: parseFloat(current as string), year: parseInt(currentYear as string) },
    };

    updateIndicator(updatedIndicator); 
    setIndicator(updatedIndicator); 
    setIsEditing(false); 
  };

  const handleCancel = () => {
    if (indicator) {
      populateEditFields(indicator); 
    }
    setIsEditing(false); 
  };

  if (!indicator) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="flex-1 p-7">Loading indicator...</div>
      </div>
    );
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-7">
        <h1 className="text-2xl font-semibold mb-6">Indicator Details</h1>
        <button
          className="flex items-center hover:text-yellow-500 mb-4"
          onClick={() => router.push("/indicator-management")}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
            className="w-5 h-5 mr-2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Indicator List
        </button>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          {isEditing ? (
            <>
              <h2 className="text-xl text-black font-semibold mb-4">Edit Indicator</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    className="w-full p-3 border border-gray-300 rounded-md text-black"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    className="w-full p-3 border border-gray-300 rounded-md text-black"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
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
                <div>
                  <label className="block text-sm font-medium text-gray-700">Target Value</label>
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
                <div>
                  <label className="block text-sm font-medium text-gray-700">Current Value</label>
                  <input
                    type="number"
                    className="w-full p-3 border border-gray-300 rounded-md text-black"
                    value={current}
                    onChange={(e) => setCurrent(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Current Year</label>
                  <input
                    type="number"
                    className="w-full p-3 border border-gray-300 rounded-md text-black"
                    value={currentYear}
                    onChange={(e) => setCurrentYear(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <button onClick={handleCancel} className="px-4 py-2 mr-2 bg-gray-300 text-black rounded-md">
                  Cancel
                </button>
                <button onClick={handleSave} className="px-4 py-2 bg-yellow-500 text-white rounded-md">
                  Save
                </button>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-xl text-black font-semibold">{indicator.name}</h2>
              <p className="text-gray-600">{indicator.description}</p>
              <div className="mt-4 text-black">
                <h3 className="text-lg font-semibold">Values</h3>
                <p className="text-sm text-gray-700">
                  Baseline: {indicator.baseline.value.toFixed(2)} ({indicator.baseline.year})
                </p>
                <p className="text-sm text-gray-700">
                  Target: {indicator.target.value.toFixed(2)} ({indicator.target.year})
                </p>
                <p className="text-sm text-gray-700">
                  Current: {indicator.current.value.toFixed(2)} ({indicator.current.year})
                </p>
              </div>
              <div className="flex justify-end mt-4">
                <button onClick={() => setIsEditing(true)} className="px-4 py-2 bg-yellow-500 text-white rounded-md">
                  Edit
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default IndicatorDetails;
