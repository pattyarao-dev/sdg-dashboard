"use client";

import { SubIndicator } from "@/types/indicator.types";
import { useState } from "react";
import useCreateFormula from "@/hooks/useCreateFormula";
import { updateComputationRule } from "@/app/actions/actions_indicatormanagement";

const EditSubIndicatorComputationRule = ({ sub }: { sub: SubIndicator }) => {
  const { createFormula } = useCreateFormula();

  const [formula, setFormula] = useState("");
  const [includeSubIndicators, setIncludeSubIndicators] = useState(false);

  // New state for edit mode
  const [isEditing, setIsEditing] = useState(false);
  const [editFormula, setEditFormula] = useState("");
  const [editIncludeSubIndicators, setEditIncludeSubIndicators] =
    useState(false);
  const [isUpdating, setIsUpdating] = useState(false); // Loading state for updates

  function formatFormula(input: string): string {
    return input.replace(/\b[a-zA-Z\s]+\b/g, (match) => {
      // Only replace if it's not an operator/number
      if (!/^\d+$/.test(match.trim())) {
        return match.trim().replace(/\s+/g, "_").toLowerCase();
      }
      return match;
    });
  }

  const submitFormulaChange = () => {
    if (sub.goalSubIndicatorId) {
      const formattedFormula = formatFormula(formula);
      createFormula(
        formattedFormula,
        sub.goalSubIndicatorId,
        "subIndicator",
        includeSubIndicators,
      );
    }
  };

  // Handle edit mode
  const handleEditClick = () => {
    if (sub.subIndicatorComputationRule.length > 0) {
      setEditFormula(sub.subIndicatorComputationRule[0].ruleFormula);
      setEditIncludeSubIndicators(
        sub.subIndicatorComputationRule[0].includeSubIndicators || false,
      );
    }
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    if (sub.subIndicatorComputationRule.length > 0) {
      setIsUpdating(true);
      try {
        const ruleId = sub.subIndicatorComputationRule[0].ruleId;
        const formattedFormula = formatFormula(editFormula);

        // Use the server action directly
        await updateComputationRule(
          ruleId,
          formattedFormula,
          editIncludeSubIndicators,
        );

        setIsEditing(false);
        alert("Formula updated successfully!");
      } catch (error) {
        console.error("Error updating formula:", error);
        alert("Failed to update formula. Please try again.");
      } finally {
        setIsUpdating(false);
      }
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditFormula("");
    setEditIncludeSubIndicators(false);
  };

  return (
    <div className="w-full p-6 flex flex-col gap-4 bg-gray-100">
      <p className="text-lg font-bold">
        <span className="font-thin text-sm">{sub.goalSubIndicatorId}</span>{" "}
        {sub.subIndicatorName}
      </p>
      {sub.requiredData.length > 0 ? (
        <div className="flex flex-col gap-10">
          {sub.subIndicatorComputationRule.length > 0 ? (
            <div className="w-full p-6 flex flex-col gap-2 border border-gray-300">
              <p className="text-sm font-semibold text-green-800">
                Computation Rule for {sub.subIndicatorName}:
              </p>

              {!isEditing ? (
                // Display mode
                <>
                  {sub.subIndicatorComputationRule.map((subRule) => (
                    <div key={subRule.ruleId} className="flex flex-col gap-2">
                      <p className="w-fit font-mono bg-gray-300 py-2 px-4">
                        {subRule.ruleFormula}
                      </p>
                      <p className="text-xs text-gray-600">
                        Include sub-indicators:{" "}
                        {subRule.includeSubIndicators ? "Yes" : "No"}
                      </p>
                    </div>
                  ))}
                  <button
                    onClick={handleEditClick}
                    className="mt-10 w-fit px-6 py-2 button-style"
                  >
                    Edit formula
                  </button>
                </>
              ) : (
                // Edit mode
                <div className="w-full flex flex-col gap-6">
                  <div className="w-full flex flex-col gap-2">
                    <div className="w-full flex items-center justify-center gap-4">
                      <input
                        type="text"
                        className="grow p-2 border border-gray-300 rounded-md flex items-center"
                        value={editFormula}
                        onChange={(e) => setEditFormula(e.target.value)}
                        placeholder="Enter formula"
                        disabled={isUpdating}
                      />
                    </div>

                    {/* Checkbox for edit mode */}
                    <div className="w-full flex items-center gap-2 mt-2">
                      <input
                        type="checkbox"
                        id={`editIncludeSubIndicators-${sub.goalSubIndicatorId}`}
                        checked={editIncludeSubIndicators}
                        onChange={(e) =>
                          setEditIncludeSubIndicators(e.target.checked)
                        }
                        className="w-4 h-4"
                        disabled={isUpdating}
                      />
                      <label
                        htmlFor={`editIncludeSubIndicators-${sub.goalSubIndicatorId}`}
                        className="text-sm text-green-800"
                      >
                        Include sub-indicators in computation
                      </label>
                    </div>
                  </div>

                  {/* Save/Cancel buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={handleSaveEdit}
                      disabled={isUpdating}
                      className="w-fit py-2 px-4 bg-gradient-to-br from-green-200 to-orange-100 rounded-md disabled:opacity-50"
                    >
                      {isUpdating ? "Saving..." : "Save Changes"}
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      disabled={isUpdating}
                      className="w-fit py-2 px-4 bg-gray-300 rounded-md hover:bg-gray-400 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="w-full p-6 flex flex-col gap-6 border border-gray-300">
              <div className="w-full flex flex-col gap-2">
                <p className="text-sm font-semibold text-green-800">
                  Input the computational formula for this sub-indicator.
                </p>
                <div className="w-full flex items-center justify-center gap-4">
                  <input
                    type="text"
                    className="grow p-2 border border-gray-300 rounded-md flex items-center"
                    onChange={(e) => setFormula(e.target.value)}
                    placeholder="Enter formula"
                  />
                  <button
                    onClick={submitFormulaChange}
                    className="w-fit py-2 px-4 bg-gradient-to-br from-green-200 to-orange-100 rounded-md"
                  >
                    Submit Formula
                  </button>
                </div>
                {/* Add checkbox for includeSubIndicators */}
                <div className="w-full flex items-center gap-2 mt-2">
                  <input
                    type="checkbox"
                    id={`includeSubIndicators-${sub.goalSubIndicatorId}`}
                    checked={includeSubIndicators}
                    onChange={(e) => setIncludeSubIndicators(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <label
                    htmlFor={`includeSubIndicators-${sub.goalSubIndicatorId}`}
                    className="text-sm text-green-800"
                  >
                    Include sub-indicators in computation
                  </label>
                </div>
              </div>
              <div className="w-full flex flex-col">
                <p className="w-full text-sm font-semibold text-green-800">
                  Required Data:
                </p>
                <div className="w-full pl-3 flex flex-col">
                  {sub.requiredData.map((data) => (
                    <p key={data.requiredDataId}>{data.requiredDataName}</p>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <p className="text-gray-500 italic">No required data</p>
      )}
    </div>
  );
};

export default EditSubIndicatorComputationRule;
