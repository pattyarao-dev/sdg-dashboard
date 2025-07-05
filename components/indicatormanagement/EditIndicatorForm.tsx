"use client";

import { useState, useRef, useEffect } from "react";
import { Goal, RequiredData } from "@/types/goal.types";
import { DashboardAvailableIndicatorWithHierarchy } from "@/types/dashboard.types";

interface EditIndicatorFormProps {
  selectedIndicator: DashboardAvailableIndicatorWithHierarchy;
  goal: Goal;
  onBack: () => void;
  onSaveComplete: () => void;
}

// Simple, flat data structures for the form
interface FormMainIndicator {
  goal_indicator_id: number;
  indicator_id: number;
  name: string;
  description: string;
  global_target_value: number | null;
  global_baseline_value: number | null;
  baseline_year: number;
  required_data: RequiredData[];
}

interface FormSubIndicator {
  goal_sub_indicator_id?: number;
  sub_indicator_id: number;
  name: string;
  description: string;
  global_target_value: number | null;
  global_baseline_value: number | null;
  baseline_year: number;
  required_data: RequiredData[];
  level: number;
  parent_name: string;
}

const EditIndicatorForm = ({ selectedIndicator, goal, onBack, onSaveComplete }: EditIndicatorFormProps) => {
  const focusedElementId = useRef<string | null>(null);

  // Convert complex hierarchy to simple flat structures
  const convertToFormData = () => {
    // Main indicator data
    const mainIndicator: FormMainIndicator = {
      goal_indicator_id: selectedIndicator.goal_indicator_id,
      indicator_id: selectedIndicator.indicator_id,
      name: selectedIndicator.md_indicator.name,
      description: selectedIndicator.md_indicator.description || "",
      global_target_value: selectedIndicator.global_target_value,
      global_baseline_value: selectedIndicator.global_baseline_value,
      baseline_year: selectedIndicator.baseline_year,
      required_data: selectedIndicator.td_goal_indicator_required_data?.map(rd => ({
        required_data_id: rd.ref_required_data.required_data_id,
        name: rd.ref_required_data.name,
        newRD: false
      })) || []
    };

    // Flatten sub-indicators hierarchy
    const flattenSubIndicators = (subIndicators: any[], level: number = 1, parentName: string = ""): FormSubIndicator[] => {
      if (!subIndicators || subIndicators.length === 0) return [];

      let flattened: FormSubIndicator[] = [];

      subIndicators.forEach(sub => {
        // Try to find existing goal-specific data for this sub-indicator
        const existingGoalSubIndicator = selectedIndicator.td_goal_sub_indicator?.find(
          goalSub => goalSub.md_sub_indicator?.sub_indicator_id === sub.indicator_id
        );

        // Get required data from goal-specific relationship if it exists
        const subRequiredData = existingGoalSubIndicator?.td_goal_sub_indicator_required_data?.map(rd => ({
          required_data_id: rd.ref_required_data.required_data_id,
          name: rd.ref_required_data.name,
          newRD: false
        })) || [];

        const formSub: FormSubIndicator = {
          goal_sub_indicator_id: existingGoalSubIndicator?.goal_sub_indicator_id,
          sub_indicator_id: sub.indicator_id,
          name: sub.name,
          description: sub.description || "",
          global_target_value: existingGoalSubIndicator?.global_target_value || null,
          global_baseline_value: existingGoalSubIndicator?.global_baseline_value || null,
          baseline_year: existingGoalSubIndicator?.baseline_year || new Date().getFullYear(),
          required_data: subRequiredData,
          level: level,
          parent_name: parentName || mainIndicator.name
        };

        flattened.push(formSub);

        // Recursively flatten nested sub-indicators
        if (sub.sub_indicators && sub.sub_indicators.length > 0) {
          flattened = flattened.concat(
            flattenSubIndicators(sub.sub_indicators, level + 1, sub.name)
          );
        }
      });

      return flattened;
    };

    const subIndicators = flattenSubIndicators(selectedIndicator.md_indicator.sub_indicators || []);

    return { mainIndicator, subIndicators };
  };

  const { mainIndicator: initialMainIndicator, subIndicators: initialSubIndicators } = convertToFormData();

  const [mainIndicator, setMainIndicator] = useState<FormMainIndicator>(initialMainIndicator);
  const [subIndicators, setSubIndicators] = useState<FormSubIndicator[]>(initialSubIndicators);
  const [allRequiredData, setAllRequiredData] = useState<RequiredData[]>([]);
  const [newRequiredDataInputs, setNewRequiredDataInputs] = useState<{ [key: string]: string }>({});

  // Initialize allRequiredData with existing required data from the indicator
  useEffect(() => {
    const existingRequiredData: RequiredData[] = [];

    // Add main indicator required data
    if (initialMainIndicator.required_data) {
      existingRequiredData.push(...initialMainIndicator.required_data);
    }

    // Add sub-indicator required data
    initialSubIndicators.forEach(sub => {
      if (sub.required_data) {
        sub.required_data.forEach(rd => {
          // Avoid duplicates
          if (!existingRequiredData.find(existing => existing.required_data_id === rd.required_data_id)) {
            existingRequiredData.push(rd);
          }
        });
      }
    });

    setAllRequiredData(existingRequiredData);

    // Debug logging
    console.log("Selected Indicator Data:", selectedIndicator);
    console.log("Main Indicator:", initialMainIndicator);
    console.log("Sub Indicators:", initialSubIndicators);
    console.log("All Required Data:", existingRequiredData);
  }, [selectedIndicator]);

  // Simple update functions for flat data structures
  const updateMainIndicator = (field: keyof FormMainIndicator, value: any) => {
    // Save focus
    if (document.activeElement) {
      focusedElementId.current = document.activeElement.id;
    }

    setMainIndicator(prev => ({
      ...prev,
      [field]: value
    }));

    // Restore focus
    setTimeout(() => {
      if (focusedElementId.current) {
        const element = document.getElementById(focusedElementId.current);
        if (element) {
          (element as HTMLElement).focus();
        }
      }
    }, 0);
  };

  const updateSubIndicator = (subIndicatorId: number, field: keyof FormSubIndicator, value: any) => {
    // Save focus
    if (document.activeElement) {
      focusedElementId.current = document.activeElement.id;
    }

    setSubIndicators(prev => prev.map(sub =>
      sub.sub_indicator_id === subIndicatorId
        ? { ...sub, [field]: value }
        : sub
    ));

    // Restore focus
    setTimeout(() => {
      if (focusedElementId.current) {
        const element = document.getElementById(focusedElementId.current);
        if (element) {
          (element as HTMLElement).focus();
        }
      }
    }, 0);
  };

  // Required data management
  const handleNewRequiredDataInputChange = (indicatorKey: string, value: string) => {
    setNewRequiredDataInputs(prev => ({
      ...prev,
      [indicatorKey]: value
    }));
  };

  const handleCreateNewRequiredData = (indicatorKey: string, isMainIndicator: boolean, subIndicatorId?: number) => {
    const inputValue = newRequiredDataInputs[indicatorKey]?.trim();

    if (!inputValue) {
      alert("Please enter a name for the required data");
      return;
    }

    // Check if required data with this name already exists
    const existingData = allRequiredData.find(
      (data) => data.name.toLowerCase() === inputValue.toLowerCase()
    );

    if (existingData) {
      alert("Required data with this name already exists");
      return;
    }

    // Create new required data object
    const newRequiredData: RequiredData = {
      required_data_id: Number(Date.now()), // Temporary ID
      name: inputValue,
      newRD: true,
    };

    // Add to all required data list
    setAllRequiredData(prev => [...prev, newRequiredData]);

    // Add to the appropriate indicator's required data
    if (isMainIndicator) {
      updateMainIndicator('required_data', [...mainIndicator.required_data, newRequiredData]);
    } else if (subIndicatorId) {
      const subIndicator = subIndicators.find(sub => sub.sub_indicator_id === subIndicatorId);
      if (subIndicator) {
        updateSubIndicator(subIndicatorId, 'required_data', [...subIndicator.required_data, newRequiredData]);
      }
    }

    // Clear the input
    setNewRequiredDataInputs(prev => ({
      ...prev,
      [indicatorKey]: ""
    }));
  };

  const handleRemoveRequiredData = (dataId: number, isMainIndicator: boolean, subIndicatorId?: number) => {
    if (isMainIndicator) {
      updateMainIndicator('required_data', mainIndicator.required_data.filter(rd => rd.required_data_id !== dataId));
    } else if (subIndicatorId) {
      const subIndicator = subIndicators.find(sub => sub.sub_indicator_id === subIndicatorId);
      if (subIndicator) {
        updateSubIndicator(subIndicatorId, 'required_data', subIndicator.required_data.filter(rd => rd.required_data_id !== dataId));
      }
    }
  };

  const handleSelectRequiredData = (data: RequiredData, isMainIndicator: boolean, subIndicatorId?: number) => {
    if (isMainIndicator) {
      const isSelected = mainIndicator.required_data.some(rd => rd.required_data_id === data.required_data_id);
      const updatedData = isSelected
        ? mainIndicator.required_data.filter(rd => rd.required_data_id !== data.required_data_id)
        : [...mainIndicator.required_data, data];
      updateMainIndicator('required_data', updatedData);
    } else if (subIndicatorId) {
      const subIndicator = subIndicators.find(sub => sub.sub_indicator_id === subIndicatorId);
      if (subIndicator) {
        const isSelected = subIndicator.required_data.some(rd => rd.required_data_id === data.required_data_id);
        const updatedData = isSelected
          ? subIndicator.required_data.filter(rd => rd.required_data_id !== data.required_data_id)
          : [...subIndicator.required_data, data];
        updateSubIndicator(subIndicatorId, 'required_data', updatedData);
      }
    }
  };

  const handleSave = async () => {
    console.log("Saving main indicator:", mainIndicator);
    console.log("Saving sub indicators:", subIndicators);

    try {
      // TODO: Implement actual save logic here
      alert("Save functionality will be implemented next!");
      onSaveComplete();
    } catch (error) {
      console.error("Error saving:", error);
      alert("Failed to save changes");
    }
  };

  const handleCancel = () => {
    // Reset to original state
    const { mainIndicator: resetMain, subIndicators: resetSubs } = convertToFormData();
    setMainIndicator(resetMain);
    setSubIndicators(resetSubs);
    setNewRequiredDataInputs({});
  };

  // Render required data section
  const renderRequiredDataSection = (
    requiredData: RequiredData[],
    indicatorKey: string,
    isMainIndicator: boolean,
    subIndicatorId?: number
  ) => {
    return (
      <div className="w-full flex flex-col gap-4">
        <p className="text-sm text-green-800 font-semibold uppercase">
          Required data for this goal-indicator relationship:
        </p>

        {/* New Required Data Input */}
        <div className="w-full flex flex-col gap-2">
          <p className="text-sm text-green-800 font-bold uppercase">
            Create new required data:
          </p>
          <div className="w-full flex items-center gap-4">
            <input
              type="text"
              placeholder="Enter required data name"
              className="flex-1 p-2 border border-gray-300"
              value={newRequiredDataInputs[indicatorKey] || ""}
              onChange={(e) => handleNewRequiredDataInputChange(indicatorKey, e.target.value)}
              onKeyUp={(e) => {
                if (e.key === "Enter") {
                  handleCreateNewRequiredData(indicatorKey, isMainIndicator, subIndicatorId);
                }
              }}
            />
            <button
              onClick={() => handleCreateNewRequiredData(indicatorKey, isMainIndicator, subIndicatorId)}
              className="px-4 py-2 bg-green-700 text-white rounded-md font-semibold text-sm hover:bg-green-600"
            >
              Add
            </button>
          </div>
        </div>

        {/* Available Required Data */}
        <div className="w-full flex flex-col gap-2">
          <p className="text-sm text-green-800 font-bold uppercase">
            Select existing required data:
          </p>
          {allRequiredData.length > 0 ? (
            <div className="max-h-32 overflow-y-auto space-y-1">
              {allRequiredData.map((data, index) => {
                const isSelected = requiredData.some(rd => rd.required_data_id === data.required_data_id);
                return (
                  <div
                    key={index}
                    className={`p-2 border cursor-pointer ${isSelected ? "bg-green-50 border-green-300" : "bg-white border-gray-200"
                      }`}
                    onClick={() => handleSelectRequiredData(data, isMainIndicator, subIndicatorId)}
                  >
                    {data.name}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500 text-sm italic">No additional required data available</p>
          )}
        </div>

        {/* Selected Required Data */}
        <div className="w-full flex flex-col gap-2">
          <p className="text-sm text-green-800 font-semibold uppercase">
            Selected Required Data:
          </p>
          {requiredData.length > 0 ? (
            <div className="space-y-2">
              {requiredData.map((data, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-gray-50 border border-gray-200 rounded"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{data.name}</span>
                    {data.newRD && (
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                        NEW
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => handleRemoveRequiredData(data.required_data_id, isMainIndicator, subIndicatorId)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm italic">No required data selected</p>
          )}
        </div>
      </div>
    );
  };

  // Render main indicator form
  const renderMainIndicatorForm = () => {
    return (
      <div className="w-full p-4 border border-orange-400 rounded">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-orange-400 font-bold text-lg">Main Indicator</h2>
          <span className="px-2 py-1 text-xs font-semibold rounded bg-blue-100 text-blue-800">
            EXISTING
          </span>
        </div>

        <div className="space-y-4">
          {/* Name (Read-only - Global property) */}
          <div>
            <label className="block text-sm font-semibold text-green-800 uppercase mb-1">
              Indicator Name (Global - Read Only):
            </label>
            <input
              type="text"
              value={mainIndicator.name}
              readOnly
              className="w-full p-2 border border-gray-300 bg-gray-100 cursor-not-allowed"
            />
          </div>

          {/* Description (Read-only - Global property) */}
          <div>
            <label className="block text-sm font-semibold text-green-800 uppercase mb-1">
              Indicator Description (Global - Read Only):
            </label>
            <input
              type="text"
              value={mainIndicator.description}
              readOnly
              className="w-full p-2 border border-gray-300 bg-gray-100 cursor-not-allowed"
            />
          </div>

          {/* Target and Baseline (EDITABLE - Goal-specific) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-green-800 uppercase mb-1">
                2030 Target (Goal-Specific - EDITABLE):
              </label>
              <input
                id="main-target"
                type="number"
                placeholder="Enter target value"
                value={mainIndicator.global_target_value || ""}
                onChange={(e) => updateMainIndicator('global_target_value', Number(e.target.value) || null)}
                className="w-full p-2 border border-gray-300 focus:border-orange-400 focus:outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-green-800 uppercase">
                Baseline (Goal-Specific - EDITABLE):
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Baseline value"
                  value={mainIndicator.global_baseline_value || ""}
                  onChange={(e) => updateMainIndicator('global_baseline_value', Number(e.target.value) || null)}
                  className="flex-1 p-2 border border-gray-300 focus:border-orange-400 focus:outline-none"
                />
                <input
                  type="number"
                  placeholder="Year"
                  value={mainIndicator.baseline_year}
                  onChange={(e) => updateMainIndicator('baseline_year', Number(e.target.value))}
                  className="w-24 p-2 border border-gray-300 focus:border-orange-400 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Required Data */}
          {renderRequiredDataSection(
            mainIndicator.required_data,
            "main",
            true
          )}
        </div>
      </div>
    );
  };

  // Render sub-indicator form
  const renderSubIndicatorForm = (subIndicator: FormSubIndicator) => {
    const indentStyle = { marginLeft: `${(subIndicator.level - 1) * 24}px` };

    return (
      <div
        key={subIndicator.sub_indicator_id}
        className="w-full p-4 border border-gray-300 rounded"
        style={indentStyle}
      >
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-gray-600 font-bold">
            Sub-Indicator (Level {subIndicator.level})
          </h3>
          <span className="px-2 py-1 text-xs font-semibold rounded bg-blue-100 text-blue-800">
            EXISTING
          </span>
          <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
            Parent: {subIndicator.parent_name}
          </span>
        </div>

        <div className="space-y-4">
          {/* Name (Read-only - Global property) */}
          <div>
            <label className="block text-sm font-semibold text-green-800 uppercase mb-1">
              Sub-Indicator Name (Global - Read Only):
            </label>
            <input
              type="text"
              value={subIndicator.name}
              readOnly
              className="w-full p-2 border border-gray-300 bg-gray-100 cursor-not-allowed"
            />
          </div>

          {/* Description (Read-only - Global property) */}
          <div>
            <label className="block text-sm font-semibold text-green-800 uppercase mb-1">
              Sub-Indicator Description (Global - Read Only):
            </label>
            <input
              type="text"
              value={subIndicator.description}
              readOnly
              className="w-full p-2 border border-gray-300 bg-gray-100 cursor-not-allowed"
            />
          </div>

          {/* Target and Baseline (EDITABLE - Goal-specific) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-green-800 uppercase mb-1">
                2030 Target (Goal-Specific - EDITABLE):
              </label>
              <input
                type="number"
                placeholder="Enter target value"
                value={subIndicator.global_target_value || ""}
                onChange={(e) => updateSubIndicator(subIndicator.sub_indicator_id, 'global_target_value', Number(e.target.value) || null)}
                className="w-full p-2 border border-gray-300 focus:border-orange-400 focus:outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-green-800 uppercase">
                Baseline (Goal-Specific - EDITABLE):
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Baseline value"
                  value={subIndicator.global_baseline_value || ""}
                  onChange={(e) => updateSubIndicator(subIndicator.sub_indicator_id, 'global_baseline_value', Number(e.target.value) || null)}
                  className="flex-1 p-2 border border-gray-300 focus:border-orange-400 focus:outline-none"
                />
                <input
                  type="number"
                  placeholder="Year"
                  value={subIndicator.baseline_year}
                  onChange={(e) => updateSubIndicator(subIndicator.sub_indicator_id, 'baseline_year', Number(e.target.value))}
                  className="w-24 p-2 border border-gray-300 focus:border-orange-400 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Required Data */}
          {renderRequiredDataSection(
            subIndicator.required_data,
            `sub-${subIndicator.sub_indicator_id}`,
            false,
            subIndicator.sub_indicator_id
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full">
      {/* Header with back button and actions */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Selection
          </button>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Editing: {selectedIndicator.md_indicator.name}
            </h2>
            <p className="text-sm text-gray-600">
              Goal: {goal.name}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleCancel}
            className="px-6 py-2 bg-gray-500 text-white rounded-md font-semibold uppercase text-sm hover:bg-gray-600 transition-colors"
          >
            Cancel Changes
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-orange-500 text-white rounded-md font-semibold uppercase text-sm hover:bg-orange-600 transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>

      {/* Form Content */}
      <div className="space-y-6">
        {/* Info Note */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> You&apos;re editing an existing indicator assigned to this goal.
            The indicator name and description cannot be changed (they&apos;re global), but you can
            modify goal-specific targets, baselines, and required data for this goal-indicator relationship.
          </p>
        </div>

        {/* Main Indicator Form */}
        {renderMainIndicatorForm()}

        {/* Sub-Indicators Forms */}
        {subIndicators.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700">
              Sub-Indicators ({subIndicators.length})
            </h3>
            {subIndicators.map((subIndicator) => renderSubIndicatorForm(subIndicator))}
          </div>
        )}

        {/* Summary */}
        <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
          <h4 className="font-semibold text-gray-700 mb-2">Edit Summary</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="font-medium">Main Indicator:</p>
              <p>Target: {mainIndicator.global_target_value || "Not set"}</p>
              <p>Baseline: {mainIndicator.global_baseline_value || "Not set"} ({mainIndicator.baseline_year})</p>
              <p>Required Data: {mainIndicator.required_data.length}</p>
            </div>
            <div>
              <p className="font-medium">Sub-Indicators:</p>
              <p>Total: {subIndicators.length}</p>
              <p>With Targets: {subIndicators.filter(sub => sub.global_target_value !== null).length}</p>
              <p>With Required Data: {subIndicators.filter(sub => sub.required_data.length > 0).length}</p>
            </div>
            <div>
              <p className="font-medium">Changes:</p>
              <p className="text-orange-600">Ready to save</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditIndicatorForm;
