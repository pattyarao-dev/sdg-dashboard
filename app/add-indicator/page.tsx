"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import SubIndicatorForm from "@/components/SubIndicatorForm";
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
  const [isSubIndicatorFormVisible, setIsSubIndicatorFormVisible] = useState(false);

  const handleAddSubIndicator = () => {
    const newSubIndicator: Indicator = {
      id: Math.random(), // temp id
      name: "Sub-indicator",
      description: "",
      baseline: { value: 0, year: 2020 },
      target: { value: 0, year: 2030 },
      current: { value: 0, year: 2025 },
      status: IndicatorStatus.Active,
      sdgs: [],
      subIndicators: [],
    };

    setSubIndicators([...subIndicators, newSubIndicator]);
    setIsSubIndicatorFormVisible(false);
  };

  const sdgsList = [
    { id: 1, name: "SDG 1" },
    { id: 2, name: "SDG 2" },
    { id: 3, name: "SDG 3" },
  ];

  const selectedSdgsWithNames = selectedSdgs.map((id) => {
    const sdg = sdgsList.find((sdg) => sdg.id === id);
    return sdg ? sdg : { id, name: `Unknown SDG ${id}` }; // default if not found
  });

  const handleAddIndicator = () => {
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
      status: IndicatorStatus.Active,
      subIndicators,
    };

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

        {/* Main Indicator Form */}
        <IndicatorForm
          name={name}
          selectedSdgs={selectedSdgs}
          baseline={baseline}
          target={target}
          current={current}
          baselineYear={baselineYear}
          targetYear={targetYear}
          currentYear={currentYear}
          description={description}
          setName={setName}
          setSelectedSdgs={setSelectedSdgs}
          setBaseline={setBaseline}
          setTarget={setTarget}
          setCurrent={setCurrent}
          setBaselineYear={setBaselineYear}
          setTargetYear={setTargetYear}
          setCurrentYear={setCurrentYear}
          setDescription={setDescription}
          subIndicators={subIndicators}
          setSubIndicators={setSubIndicators}
          handleAddSubIndicator={() => setIsSubIndicatorFormVisible(true)}
          sdgs={selectedSdgsWithNames}
        />

        {/* Sub-Indicator Form */}
        {isSubIndicatorFormVisible && (
          <SubIndicatorForm
            onAddSubIndicator={handleAddSubIndicator}
            onCancel={() => setIsSubIndicatorFormVisible(false)} // Hide the form when cancelled
          />
        )}

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
