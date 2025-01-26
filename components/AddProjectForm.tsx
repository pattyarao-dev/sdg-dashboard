"use client";

import { addProject } from "@/app/actions/actions";
import { useState } from "react";
import { IoMdAdd } from "react-icons/io";

type Indicator = {
  indicator_id: number;
  name: string;
  // description: string;
};

type AddProjectProps = {
  indicatorsList: Indicator[];
};

export default function AddProjectForm({ indicatorsList }: AddProjectProps) {
  const [selectedIndicators, setSelectedIndicators] = useState<number[]>([]);
  const [showAddIndicatorForm, setShowAddIndicatorForm] =
    useState<boolean>(false);

  const handleIndicatorToggle = (indicatorId: number) => {
    setSelectedIndicators(
      (prev) =>
        prev.includes(indicatorId)
          ? prev.filter((id) => id !== indicatorId) // Remove if already selected
          : [...prev, indicatorId], // Add if not already selected
    );
  };
  return (
    <div className="w-[40%] px-16 py-10 bg-neutral-100 flex flex-col items-start justify-center gap-10 rounded-2xl drop-shadow-lg">
      <h1 className="text-2xl font-bold">Create a new project.</h1>
      <form
        action={async (formData) => {
          // Append each indicator individually
          selectedIndicators.forEach((indicatorId) => {
            formData.append("indicators", indicatorId.toString());
          });

          if (showAddIndicatorForm) {
            const newIndicatorName = formData.get("newIndicatorName");
            const newIndicatorDescription = formData.get(
              "newIndicatorDescription",
            );

            if (newIndicatorName && newIndicatorDescription) {
              formData.append("newIndicatorName", newIndicatorName.toString());
              formData.append(
                "newIndicatorDescription",
                newIndicatorDescription.toString(),
              );
            }
          }
          await addProject(formData);
        }}
        className="w-full flex flex-col items-start justify-center gap-6"
      >
        <div className="w-full flex flex-col">
          <p>Project Name</p>
          <input
            className="w-full p-2 text-sm rounded-md"
            type="text"
            name="name"
            placeholder="Input Project Name"
          />
        </div>
        <div className="w-full flex flex-col">
          <p>Project Description</p>
          <input
            className="w-full p-2 text-sm rounded-md"
            type="textarea"
            name="description"
            placeholder="Input Project Description"
          />
        </div>
        <div className="w-full flex flex-col">
          <p>Project Start Date</p>
          <input
            className="w-full p-2 text-sm rounded-md"
            type="date"
            name="start_date"
          />
        </div>
        <div className="w-full flex flex-col">
          <p>Project End Date</p>
          <input
            className="w-full p-2 text-sm rounded-md"
            type="date"
            name="end_date"
          />
        </div>
        <div className="w-full flex flex-col">
          <p>Project Indicators</p>
          <div className="w-full h-44 overflow-y-auto p-4 rounded-md bg-white flex flex-col gap-3">
            {indicatorsList.map((indicator) => (
              <div
                key={indicator.indicator_id}
                className="flex items-center gap-2"
              >
                <input
                  type="checkbox"
                  id={`indicator-${indicator.indicator_id}`}
                  value={indicator.indicator_id}
                  onChange={() => handleIndicatorToggle(indicator.indicator_id)}
                />
                <label
                  htmlFor={`indicator-${indicator.indicator_id}`}
                  className="font-semibold text-sm"
                >
                  {indicator.name}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="w-full flex flex-col gap-4">
          <div className="w-fit flex items-center  gap-1 justify-center px-4 py-2 bg-blue-500 text-white">
            <IoMdAdd className="text-white text-2xl" />
            <button
              type="button"
              onClick={() => setShowAddIndicatorForm(!showAddIndicatorForm)}
            >
              Create a new indicator for this project
            </button>
          </div>
          {showAddIndicatorForm && (
            <div className="w-full flex flex-col gap-2">
              <div>
                <label>Indicator Name</label>
                <input
                  type="text"
                  name="newIndicatorName"
                  placeholder="Indicator Name"
                  className="w-full p-2 text-sm rounded-md"
                />
              </div>
              <div>
                <label>Indicator Description</label>
                <input
                  type="textarea"
                  name="newIndicatorDescription"
                  placeholder="Indicator Description"
                  className="w-full p-2 text-sm rounded-md"
                />
              </div>
            </div>
          )}
        </div>

        <div className="w-full flex flex-wrap gap-4">
          {selectedIndicators.map((indicator, index) => (
            <p key={index} className="w-fit px-2 py-1 bg-neutral-50 rounded-md">
              {indicatorsList.find((ind) => ind.indicator_id === indicator)
                ?.name || ""}
            </p>
          ))}
        </div>
        <button
          type="submit"
          className="w-fit px-4 py-2 bg-blue-500 text-white"
        >
          Create Project
        </button>
      </form>
    </div>
  );
}
