"use client";

import { createIndicatorsBatch } from "@/app/actions/actions";
import { useState } from "react";
import { IIndicator } from "@/types/indicator.types";
import { IoChevronDownOutline } from "react-icons/io5";

interface AddIndicatorProps {
  goalId: number;
  indicators: IIndicator[];
}

export default function AddIndicator({
  goalId,
  indicators,
}: AddIndicatorProps) {
  const [selectedAddMethod, setSelectedAddMethod] = useState("");
  const [selectedIndicators, setSelectedIndicators] = useState<
    { indicator_id: number; name: string; description?: string }[]
  >([]);

  // State for new indicator input fields
  const [newIndicator, setNewIndicator] = useState({
    name: "",
    description: "",
  });

  // Add existing indicator to selected list
  const handleAddExistingIndicator = (id: number, name: string) => {
    if (!selectedIndicators.some((i) => i.indicator_id === id)) {
      setSelectedIndicators([
        ...selectedIndicators,
        { indicator_id: id, name },
      ]);
    }
  };

  // Add new indicator to selected list and reset input fields
  const handleCreateNewIndicator = () => {
    if (!newIndicator.name.trim()) return; // Prevent empty entries

    const newId = Date.now(); // Temporary ID for frontend tracking
    setSelectedIndicators([
      ...selectedIndicators,
      {
        indicator_id: newId, // Placeholder ID (ignored in backend)
        name: newIndicator.name,
        description: newIndicator.description,
      },
    ]);

    // Reset form fields
    setNewIndicator({ name: "", description: "" });
  };

  // Remove an indicator from the list
  const handleRemoveIndicator = (id: number) => {
    setSelectedIndicators(
      selectedIndicators.filter((i) => i.indicator_id !== id),
    );
  };

  // Edit an indicator
  const handleEditIndicator = (
    id: number,
    updatedName: string,
    updatedDescription?: string,
  ) => {
    setSelectedIndicators(
      selectedIndicators.map((indicator) =>
        indicator.indicator_id === id
          ? { ...indicator, name: updatedName, description: updatedDescription }
          : indicator,
      ),
    );
  };

  return (
    <div className="bg-gray-50 w-full p-10 flex gap-10 rounded-xl drop-shadow-md">
      <div className="flex flex-col gap-4">
        {/* Create New Indicator */}
        {selectedAddMethod === "Create New" && (
          <div>
            <input
              type="text"
              placeholder="Indicator Name"
              value={newIndicator.name}
              onChange={(e) =>
                setNewIndicator({ ...newIndicator, name: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Description"
              value={newIndicator.description}
              onChange={(e) =>
                setNewIndicator({
                  ...newIndicator,
                  description: e.target.value,
                })
              }
            />
            <button type="button" onClick={handleCreateNewIndicator}>
              Add Indicator
            </button>
          </div>
        )}

        {/* Select Existing Indicator */}
        {selectedAddMethod === "Select Existing" && (
          <div>
            <select
              onChange={(e) => {
                const id = parseInt(e.target.value, 10);
                if (id) {
                  const indicator = indicators.find(
                    (ind) => ind.indicator_id === id,
                  );
                  if (indicator) handleAddExistingIndicator(id, indicator.name);
                }
              }}
              className="p-4 appearance-none rounded-lg bg-blue-200 focus:outline-none"
            >
              <option value="">Select an Indicator</option>
              {indicators.map((indicator) => (
                <option
                  className="bg-gray-100"
                  key={indicator.indicator_id}
                  value={indicator.indicator_id}
                >
                  {indicator.name}
                </option>
              ))}
            </select>
          </div>
        )}
        <div className="w-fit flex items-center gap-10">
          <button
            type="button"
            className="w-[250px] p-2 bg-blue-100 rounded-lg font-semibold text-sm"
            onClick={() => setSelectedAddMethod("Select Existing")}
          >
            Select existing indicator
          </button>
          <button
            type="button"
            className="w-[250px] p-2 bg-blue-100 rounded-lg font-semibold text-sm"
            onClick={() => setSelectedAddMethod("Create New")}
          >
            Create a new indicator
          </button>
        </div>
      </div>

      {/* List of Selected Indicators */}
      <div className="w-full flex flex-col ">
        <h3>Selected Indicators:</h3>
        {selectedIndicators.length > 0 ? (
          <ul>
            {selectedIndicators.map((indicator) => (
              <li key={indicator.indicator_id}>
                <input
                  type="text"
                  value={indicator.name}
                  onChange={(e) =>
                    handleEditIndicator(
                      indicator.indicator_id,
                      e.target.value,
                      indicator.description,
                    )
                  }
                />
                <input
                  type="text"
                  value={indicator.description ?? ""}
                  onChange={(e) =>
                    handleEditIndicator(
                      indicator.indicator_id,
                      indicator.name,
                      e.target.value,
                    )
                  }
                  placeholder="Description"
                />
                <button
                  onClick={() => handleRemoveIndicator(indicator.indicator_id)}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p>No indicators selected.</p>
        )}
      </div>

      {/* Submit All Indicators */}
      <form action={createIndicatorsBatch}>
        <input type="hidden" name="goalId" value={goalId} />
        <input
          type="hidden"
          name="indicators"
          value={JSON.stringify(selectedIndicators)}
        />
        <button type="submit">Submit All Indicators</button>
      </form>
    </div>
  );
}
