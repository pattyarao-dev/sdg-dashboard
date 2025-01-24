"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";

const AddIndicator = () => {
  const [name, setName] = useState("");
  const [baseline, setBaseline] = useState<number | string>(""); 
  const [target, setTarget] = useState<number | string>(""); 
  const [current, setCurrent] = useState<number | string>(""); 
  const [description, setDescription] = useState("");
  const router = useRouter();

  const handleAddIndicator = () => {
    if (!name || !description || baseline === "" || target === "" || current === "") {
      alert("Please fill out all fields.");
      return;
    }

    const newIndicator = {
      id: Date.now(),
      name,
      baseline: parseFloat(baseline as string),
      target: parseFloat(target as string), 
      current: parseFloat(current as string), 
      description,
    };

    console.log("Added Indicator:", newIndicator);

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
