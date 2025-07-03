"use client";

import { useState } from "react";
import { ILocation, IProjectIndicator } from "@/types/project.types";
import { saveProjectIndicatorValues } from "@/app/actions/actions_projectmanagement";
const EditProjectIndicatorValues = ({
  indicator,
  assignedLocations,
}: {
  indicator: IProjectIndicator;
  assignedLocations: ILocation[];
}) => {
  const [newValues, setNewValues] = useState<
    Array<{
      requiredDataId: number;
      value: number;
      measurementDate: string;
      location: string;
      notes: string;
    }>
  >([]);

  const [isLoading, setIsLoading] = useState(false);
  const userId = 1; // You might want to get this from context or props

  const handleValueChange = (
    requiredDataId: number,
    field: string,
    value: string,
  ) => {
    const existingIndex = newValues.findIndex(
      (item) => item.requiredDataId === requiredDataId,
    );

    const updatedValue = {
      requiredDataId,
      value: field === "value" ? (value === "" ? 0 : parseFloat(value)) : 0,
      measurementDate: field === "measurementDate" ? value : "",
      location: field === "location" ? value : "",
      notes: field === "notes" ? value : "",
    };

    if (existingIndex >= 0) {
      const updatedValues = [...newValues];
      updatedValues[existingIndex] = {
        ...updatedValues[existingIndex],
        [field]:
          field === "value" ? (value === "" ? 0 : parseFloat(value)) : value,
      };
      setNewValues(updatedValues);
    } else {
      setNewValues([...newValues, updatedValue]);
    }
  };

  const submitNewValues = async () => {
    const validValues = newValues.filter(
      (item) => item.value !== null && item.value !== 0,
    );

    if (validValues.length === 0) {
      alert("Please input at least one value.");
      return;
    }

    setIsLoading(true);
    try {
      const dataToSave = validValues.map((item) => ({
        requiredDataId: item.requiredDataId,
        projectIndicatorId: indicator.projectIndicatorId,
        value: item.value,
        measurementDate:
          item.measurementDate || new Date().toISOString().split("T")[0],
        location: item.location || "",
        notes: item.notes || "",
        createdBy: userId,
      }));

      await saveProjectIndicatorValues(dataToSave);

      alert("Values saved successfully!");
      setNewValues([]);
    } catch (error) {
      console.error("Failed to save values:", error);
      alert("Failed to save values. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentValue = (requiredDataId: number, field: string) => {
    const found = newValues.find((v) => v.requiredDataId === requiredDataId);
    return found ? found[field] || "" : "";
  };

  return (
    <div className="w-full">
      {indicator.requiredData.length > 0 ? (
        <div className="w-full flex flex-col gap-6">
          <div className="w-full p-4 flex flex-col gap-6">
            <div className="w-full flex flex-col gap-4">
              {indicator.requiredData.map((data) => (
                <div
                  key={data.requiredDataId}
                  className="w-full p-4 border border-gray-300 rounded-lg flex flex-col gap-3"
                >
                  <h4 className="font-semibold text-lg">
                    {data.requiredDataName}
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-medium text-gray-700">
                        Value
                      </label>
                      <input
                        type="number"
                        step="any"
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter value"
                        onChange={(e) =>
                          handleValueChange(
                            data.requiredDataId,
                            "value",
                            e.target.value,
                          )
                        }
                        value={getCurrentValue(data.requiredDataId, "value")}
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-medium text-gray-700">
                        Measurement Date
                      </label>
                      <input
                        type="date"
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onChange={(e) =>
                          handleValueChange(
                            data.requiredDataId,
                            "measurementDate",
                            e.target.value,
                          )
                        }
                        value={getCurrentValue(
                          data.requiredDataId,
                          "measurementDate",
                        )}
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-medium text-gray-700">
                        Location
                      </label>
                      <select
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onChange={(e) =>
                          handleValueChange(
                            data.requiredDataId,
                            "location",
                            e.target.value,
                          )
                        }
                        value={getCurrentValue(data.requiredDataId, "location")}
                      >
                        <option value="">Select location</option>
                        {assignedLocations.map((loc) => (
                          <option key={loc.location_id} value={loc.name}>
                            {loc.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-medium text-gray-700">
                        Notes
                      </label>
                      <input
                        type="text"
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter notes"
                        onChange={(e) =>
                          handleValueChange(
                            data.requiredDataId,
                            "notes",
                            e.target.value,
                          )
                        }
                        value={getCurrentValue(data.requiredDataId, "notes")}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="w-full flex justify-end">
              <button
                onClick={submitNewValues}
                disabled={isLoading}
                className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? "Saving..." : "Save Values"}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-gray-500 text-center py-8">
          No required data identified for this indicator.
        </div>
      )}
    </div>
  );
};

export default EditProjectIndicatorValues;
