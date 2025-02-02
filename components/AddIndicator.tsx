"use client";

import { createIndicatorsBatch } from "@/app/actions/actions";
import { useState } from "react";
import { IIndicator } from "@/types/indicator.types";

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
    {
      indicator_id: number;
      name: string;
      description?: string;
      target?: number;
    }[]
  >([]);

  const [newIndicator, setNewIndicator] = useState({
    name: "",
    description: "",
  });

  const [message, setMessage] = useState("");
  const [addedIndicators, setAddedIndicators] = useState<string[]>([]);
  const [duplicateIndicators, setDuplicateIndicators] = useState<string[]>([]);

  const handleAddExistingIndicator = (id: number, name: string) => {
    if (!selectedIndicators.some((i) => i.indicator_id === id)) {
      setSelectedIndicators([
        ...selectedIndicators,
        { indicator_id: id, name, target: 0 },
      ]);
    }
  };

  const handleCreateNewIndicator = () => {
    if (!newIndicator.name.trim()) return;

    const newId = Date.now();
    setSelectedIndicators([
      ...selectedIndicators,
      {
        indicator_id: newId,
        name: newIndicator.name,
        description: newIndicator.description,
        target: 0,
      },
    ]);

    setNewIndicator({ name: "", description: "" });
  };

  const handleUpdateIndicatorValues = (id: number, value: number) => {
    setSelectedIndicators(
      selectedIndicators.map((indicator) =>
        indicator.indicator_id === id
          ? { ...indicator, target: value }
          : indicator,
      ),
    );
  };

  const handleRemoveIndicator = (id: number) => {
    setSelectedIndicators(
      selectedIndicators.filter((i) => i.indicator_id !== id),
    );
  };

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

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData();
    formData.append("goalId", goalId.toString());
    formData.append("indicators", JSON.stringify(selectedIndicators));

    const result = await createIndicatorsBatch(formData);

    console.log("Server Response:", result);

    setMessage(result.message || "❌ No indicators were added.");
    setAddedIndicators(result.addedIndicators || []);
    setDuplicateIndicators(result.duplicateIndicators || []);
  };

  return (
    <div className="w-full p-10 flex gap-10 rounded-xl drop-shadow-md">
      <div className="w-3/5 p-10 bg-gray-200 flex flex-col gap-10">
        <div className="w-full bg-gray-400 flex items-center">
          <button
            type="button"
            className={`w-1/2 px-2 py-1 text-center border border-gray-600 ${
              selectedAddMethod === "Select Existing"
                ? "bg-gray-500 text-white"
                : ""
            }`}
            onClick={() => setSelectedAddMethod("Select Existing")}
          >
            Select existing indicator
          </button>
          <button
            type="button"
            className={`w-1/2 px-2 py-1 text-center border border-gray-600 ${
              selectedAddMethod === "Create New" ? "bg-gray-500 text-white" : ""
            }`}
            onClick={() => setSelectedAddMethod("Create New")}
          >
            Create a new indicator
          </button>
        </div>

        {selectedAddMethod === "Create New" && (
          <div className="w-full flex flex-col items-start gap-10">
            <div className="w-full flex flex-col gap-6">
              <div className="w-full flex flex-col gap-1">
                <p className="text-sm font-semibold text-gray-600">
                  Indicator Name
                </p>
                <input
                  type="text"
                  placeholder="Indicator Name"
                  className="w-full p-2 text-xs text-gray-400 rounded-md"
                  value={newIndicator.name}
                  onChange={(e) =>
                    setNewIndicator({ ...newIndicator, name: e.target.value })
                  }
                />
              </div>
              <div className="w-full flex flex-col gap-1">
                <p className="text-sm font-semibold text-gray-600">
                  Indicator Description (Optional)
                </p>
                <input
                  type="text"
                  placeholder="Description"
                  className="w-full p-2 text-xs text-gray-400 rounded-md"
                  value={newIndicator.description}
                  onChange={(e) =>
                    setNewIndicator({
                      ...newIndicator,
                      description: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <button
              type="button"
              className="w-fit border-2 border-green-600 px-6 py-1 rounded-md text-green-600 font-bold"
              onClick={handleCreateNewIndicator}
            >
              Add Indicator
            </button>
          </div>
        )}

        {selectedAddMethod === "Select Existing" && (
          <div className="w-full flex flex-col items-start gap-4">
            <p className="text-sm font-semibold text-gray-600">
              Click to Select an Indicator:
            </p>
            <div className="border border-gray-300 p-4 rounded-lg max-h-60 overflow-y-auto w-full">
              {indicators.map((indicator) => (
                <p
                  key={indicator.indicator_id}
                  className={`p-2 rounded-lg cursor-pointer ${
                    selectedIndicators.some(
                      (i) => i.indicator_id === indicator.indicator_id,
                    )
                      ? "bg-blue-500 text-white"
                      : "hover:bg-gray-200"
                  }`}
                  onClick={() =>
                    handleAddExistingIndicator(
                      indicator.indicator_id,
                      indicator.name,
                    )
                  }
                >
                  {indicator.name}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="w-full flex flex-col gap-10">
        <div className="w-full flex flex-col gap-6">
          <h3 className="font-semibold">Selected Indicators:</h3>
          {selectedIndicators.length > 0 ? (
            <ul className="flex flex-col gap-4">
              {selectedIndicators.map((indicator) => (
                <li
                  key={indicator.indicator_id}
                  className="flex flex-col gap-2 bg-gray-100 p-4 rounded-lg"
                >
                  <input
                    type="text"
                    className="bg-transparent font-semibold"
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
                    className="bg-transparent text-sm p-2"
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
                  <input
                    type="number"
                    className="w-1/3 p-2 text-xs border rounded-md"
                    placeholder="Target"
                    value={indicator.target ?? ""}
                    onChange={(e) =>
                      handleUpdateIndicatorValues(
                        indicator.indicator_id,
                        Number(e.target.value),
                      )
                    }
                  />
                  <button
                    className="text-red-500 text-sm mt-1"
                    onClick={() =>
                      handleRemoveIndicator(indicator.indicator_id)
                    }
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-sm">No indicators selected.</p>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          <button
            type="submit"
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg"
          >
            Submit All Indicators
          </button>
        </form>

        {message && <p className="mt-4 text-green-600">{message}</p>}
      </div>
    </div>
  );
}
