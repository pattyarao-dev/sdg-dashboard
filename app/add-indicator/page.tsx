"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import IndicatorForm from "@/components/IndicatorForm";
import { Indicator, useIndicators, IndicatorStatus } from "@/context/IndicatorContext";

const AddIndicator = () => {
  const { addIndicator } = useIndicators();
  const router = useRouter();

  const [name, setName] = useState("");
  const [selectedSdgs, setSelectedSdgs] = useState<number[]>([]);
  const [description, setDescription] = useState("");
  const [baseline, setBaseline] = useState<number | string>("");
  const [target, setTarget] = useState<number | string>("");
  const [current, setCurrent] = useState<number | string>("");
  const [baselineYear, setBaselineYear] = useState<number | string>("");
  const [targetYear, setTargetYear] = useState<number | string>("");
  const [currentYear, setCurrentYear] = useState<number | string>("");
  const [subIndicators, setSubIndicators] = useState<Indicator[]>([]);

  const handleAddIndicator = () => {
    if (!name) {
      alert("Please enter a name for the indicator.");
      return;
    }

    const newIndicator: Indicator = {
      id: Math.random(), // Temporary ID
      name,
      sdgs: selectedSdgs,
      description,
      baseline: { value: parseFloat(baseline as string), year: parseInt(baselineYear as string) },
      target: { value: parseFloat(target as string), year: parseInt(targetYear as string) },
      current: { value: parseFloat(current as string), year: parseInt(currentYear as string) },
      status: IndicatorStatus.Active,
      subIndicators,
    };

    console.log("Adding new indicator:", newIndicator); // ✅ Debugging log
    addIndicator(newIndicator);

    router.push("/indicator-management");
  };

  return (
    <div className="flex">
      <Sidebar />

      <div className="flex-1 p-7">
        <h1 className="text-2xl font-semibold mb-6">Add New Indicator</h1>

        <button
          className="flex items-center hover:text-yellow-500 mb-4"
          onClick={() => router.push("/indicator-management")}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5 mr-2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Indicator List
        </button>

        <IndicatorForm
          name={name}
          baseline={baseline}
          target={target}
          current={current}
          baselineYear={baselineYear}
          targetYear={targetYear}
          currentYear={currentYear}
          description={description}
          setName={setName}
          setBaseline={setBaseline}
          setTarget={setTarget}
          setCurrent={setCurrent}
          setBaselineYear={setBaselineYear}
          setTargetYear={setTargetYear}
          setCurrentYear={setCurrentYear}
          setDescription={setDescription}
          subIndicators={subIndicators}
          setSubIndicators={setSubIndicators}
        />

        <button
          onClick={handleAddIndicator}
          className="mt-6 px-4 py-2 bg-yellow-500 text-white rounded-md"
        >
          Add Indicator
        </button>
      </div>
    </div>
  );
};

export default AddIndicator;
