"use client";

import { useState } from "react";
import { Indicator } from "@/types/indicator.types";
import useCreateFormula from "@/hooks/useCreateFormula";
import EditSubIndicatorComputationRule from "./EditSubIndicatorComputationRule";
import { updateComputationRule } from "@/app/actions/actions_indicatormanagement";

const EditIndicatorComputationRule = ({
  indicator,
}: {
  indicator: Indicator;
}) => {
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
    if (indicator.goalIndicatorId) {
      const formattedFormula = formatFormula(formula);
      createFormula(
        formattedFormula,
        indicator.goalIndicatorId,
        "indicator",
        includeSubIndicators,
      );
    }
    alert("Formula updated successfully!");
  };

  // Handle edit mode
  const handleEditClick = () => {
    if (indicator.computationRule.length > 0) {
      setEditFormula(indicator.computationRule[0].ruleFormula);
      setEditIncludeSubIndicators(
        indicator.computationRule[0].includeSubIndicators || false,
      );
    }
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    if (indicator.computationRule.length > 0) {
      setIsUpdating(true);
      try {
        const ruleId = indicator.computationRule[0].ruleId;
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
    <div
      key={indicator.goalIndicatorId}
      className="w-full p-8 flex flex-col gap-10 bg-white border-2 border-gray-300"
    >
      <div className="w-full flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <div className="w-full flex items-center gap-4">
            <p>{indicator.goalIndicatorId}</p>
            <h3 className="text-xl font-semibold">{indicator.indicatorName}</h3>
          </div>
          <hr />
        </div>
        <div className="w-full">
          {indicator.requiredData.length > 0 ? (
            <div className="flex flex-col gap-10">
              {indicator.computationRule.length > 0 ? (
                <div className="w-full p-4 flex flex-col gap-2 bg-gray-100">
                  <p className="text-sm font-semibold text-green-800">
                    Computation Rule for {indicator.indicatorName}:
                  </p>

                  {!isEditing ? (
                    // Display mode
                    <>
                      {indicator.computationRule.map((rule) => (
                        <div key={rule.ruleId} className="flex flex-col gap-2">
                          <p className="w-fit font-mono bg-gray-300 py-2 px-4">
                            {rule.ruleFormula}
                          </p>
                          <p className="text-xs text-gray-600">
                            Include sub-indicators:{" "}
                            {rule.includeSubIndicators ? "Yes" : "No"}
                          </p>
                        </div>
                      ))}
                      <button
                        onClick={handleEditClick}
                        className="mt-4 w-fit px-6 py-2 button-style"
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
                            id={`editIncludeSubIndicators-${indicator.goalIndicatorId}`}
                            checked={editIncludeSubIndicators}
                            onChange={(e) =>
                              setEditIncludeSubIndicators(e.target.checked)
                            }
                            className="w-4 h-4"
                            disabled={isUpdating}
                          />
                          <label
                            htmlFor={`editIncludeSubIndicators-${indicator.goalIndicatorId}`}
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
                <div className="w-full p-4 flex flex-col gap-4 bg-gray-100">
                  <div className="w-full flex flex-col gap-2">
                    <p className="text-sm font-semibold text-green-800">
                      Input the computational formula for this indicator.
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
                        id={`includeSubIndicators-${indicator.goalIndicatorId}`}
                        checked={includeSubIndicators}
                        onChange={(e) =>
                          setIncludeSubIndicators(e.target.checked)
                        }
                        className="w-4 h-4"
                      />
                      <label
                        htmlFor={`includeSubIndicators-${indicator.goalIndicatorId}`}
                        className="text-sm text-green-800"
                      >
                        Include sub-indicators in computation
                      </label>
                    </div>
                  </div>
                  <div className="w-full flex flex-col gap-1">
                    <p className="w-full text-sm font-semibold text-green-800">
                      Required Data:
                    </p>
                    <div className="w-full pl-3 flex flex-col">
                      {indicator.requiredData.map((data) => (
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
      </div>
      <div className="w-full flex flex-col gap-4">
        {indicator.subIndicators.length > 0 ? (
          <div className="w-full flex flex-col gap-2 ">
            <p className="text-lg font-bold uppercase text-green-800">
              Sub-Indicators:
            </p>
            {indicator.subIndicators.map((sub) => (
              <EditSubIndicatorComputationRule
                key={sub.subIndicatorId}
                sub={sub}
              />
            ))}
          </div>
        ) : (
          <p className="pl-6 text-gray-500 italic">
            This goal-indicator has no sub-indicators
          </p>
        )}
      </div>
    </div>
  );
};

export default EditIndicatorComputationRule;
