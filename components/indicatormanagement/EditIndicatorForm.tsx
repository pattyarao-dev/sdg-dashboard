"use client";

import { useState, useRef } from "react";
import { Goal } from "@/types/goal.types";
import { updateMainIndicator, updateSubIndicator } from "@/app/actions/actions_edit_indicators";

// Simple flat indicator type for editing
interface FlatIndicatorItem {
  id: string;
  type: 'main' | 'sub';
  indicator_id: number;
  goal_indicator_id?: number;
  goal_sub_indicator_id?: number;
  name: string;
  description: string;
  global_target_value: number | null;
  global_baseline_value: number | null;
  baseline_year: number;
  level: number;
  parent_name?: string;
  required_data_count: number;
}

interface EditIndicatorFormProps {
  selectedItem: FlatIndicatorItem;
  goal: Goal;
  onBack: () => void;
  onSaveComplete: () => void;
}

const EditIndicatorForm = ({ selectedItem, goal, onBack, onSaveComplete }: EditIndicatorFormProps) => {
  const focusedElementId = useRef<string | null>(null);

  // Simple state for the single indicator being edited
  const [formData, setFormData] = useState({
    // Global properties (affects all goals)
    name: selectedItem.name,
    description: selectedItem.description,

    // Goal-specific properties (only affects this goal)
    global_target_value: selectedItem.global_target_value,
    global_baseline_value: selectedItem.global_baseline_value,
    baseline_year: selectedItem.baseline_year
  });

  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Simple field update function
  const updateField = (field: keyof typeof formData, value: any) => {
    // Save focus
    if (document.activeElement) {
      focusedElementId.current = document.activeElement.id;
    }

    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    setHasChanges(true);

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

  const handleSave = async () => {
    if (!hasChanges) return;

    setIsSaving(true);

    try {
      let result;

      if (selectedItem.type === 'main') {
        // Validate required IDs for main indicator
        if (!selectedItem.goal_indicator_id) {
          throw new Error("Goal indicator ID is missing");
        }

        result = await updateMainIndicator({
          indicator_id: selectedItem.indicator_id,
          goal_indicator_id: selectedItem.goal_indicator_id,
          data: {
            name: formData.name,
            description: formData.description,
            global_target_value: formData.global_target_value,
            global_baseline_value: formData.global_baseline_value,
            baseline_year: formData.baseline_year
          }
        });
      } else {
        // Validate required IDs for sub-indicator
        if (!selectedItem.goal_sub_indicator_id) {
          throw new Error("Goal sub-indicator ID is missing");
        }

        result = await updateSubIndicator({
          sub_indicator_id: selectedItem.indicator_id,
          goal_sub_indicator_id: selectedItem.goal_sub_indicator_id,
          data: {
            name: formData.name,
            description: formData.description,
            global_target_value: formData.global_target_value,
            global_baseline_value: formData.global_baseline_value,
            baseline_year: formData.baseline_year
          }
        });
      }

      if (result.success) {
        setHasChanges(false);
        alert(`${selectedItem.type === 'main' ? 'Main indicator' : 'Sub-indicator'} updated successfully!`);
        onSaveComplete();
      } else {
        throw new Error(result.error || "Unknown error occurred");
      }

    } catch (error) {
      console.error("Error saving indicator:", error);
      alert(`Failed to save changes: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset to original state
    setFormData({
      name: selectedItem.name,
      description: selectedItem.description,
      global_target_value: selectedItem.global_target_value,
      global_baseline_value: selectedItem.global_baseline_value,
      baseline_year: selectedItem.baseline_year
    });
    setHasChanges(false);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header */}
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
              Editing: {selectedItem.name}
            </h2>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>Goal: {goal.name}</span>
              <span>•</span>
              <span className={`px-2 py-1 text-xs font-semibold rounded ${selectedItem.type === 'main'
                ? 'bg-orange-100 text-orange-800'
                : 'bg-blue-100 text-blue-800'
                }`}>
                {selectedItem.type === 'main' ? 'Main Indicator' : `Sub-Indicator (Level ${selectedItem.level})`}
              </span>
              {selectedItem.parent_name && (
                <>
                  <span>•</span>
                  <span>Parent: {selectedItem.parent_name}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleCancel}
            disabled={!hasChanges || isSaving}
            className={`px-6 py-2 rounded-md font-semibold uppercase text-sm transition-colors ${hasChanges && !isSaving
              ? 'bg-gray-500 text-white hover:bg-gray-600'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
          >
            Cancel Changes
          </button>
          <button
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
            className={`px-6 py-2 rounded-md font-semibold uppercase text-sm transition-colors flex items-center gap-2 ${hasChanges && !isSaving
              ? 'bg-orange-500 text-white hover:bg-orange-600'
              : 'bg-orange-300 text-orange-500 cursor-not-allowed'
              }`}
          >
            {isSaving && (
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Form Content */}
      <div className="space-y-6">
        {/* Global Properties Warning */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <h4 className="text-sm font-medium text-yellow-800">Global Properties</h4>
              <p className="text-sm text-yellow-700 mt-1">
                Changes to name and description will affect this indicator in <strong>all goals</strong> that use it.
                Target and baseline changes only affect this specific goal.
              </p>
            </div>
          </div>
        </div>

        {/* Global Properties Section */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Global Properties (affects all goals)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Indicator Name:
              </label>
              <input
                id="indicator-name"
                type="text"
                value={formData.name}
                onChange={(e) => updateField('name', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded focus:border-orange-400 focus:outline-none"
                placeholder="Enter indicator name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Indicator Description:
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => updateField('description', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded focus:border-orange-400 focus:outline-none"
                placeholder="Enter indicator description"
              />
            </div>
          </div>
        </div>

        {/* Goal-Specific Properties Section */}
        <div className="bg-white border border-orange-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-orange-600 mb-4">
            Goal-Specific Properties (only affects &quot;{goal.name}&quot;)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                2030 Target:
              </label>
              <input
                type="number"
                value={formData.global_target_value || ""}
                onChange={(e) => updateField('global_target_value', Number(e.target.value) || null)}
                className="w-full p-3 border border-gray-300 rounded focus:border-orange-400 focus:outline-none"
                placeholder="Enter target value"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Baseline Value:
              </label>
              <input
                type="number"
                value={formData.global_baseline_value || ""}
                onChange={(e) => updateField('global_baseline_value', Number(e.target.value) || null)}
                className="w-full p-3 border border-gray-300 rounded focus:border-orange-400 focus:outline-none"
                placeholder="Enter baseline value"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Baseline Year:
              </label>
              <input
                type="number"
                value={formData.baseline_year}
                onChange={(e) => updateField('baseline_year', Number(e.target.value))}
                className="w-full p-3 border border-gray-300 rounded focus:border-orange-400 focus:outline-none"
                placeholder="Enter baseline year"
              />
            </div>
          </div>
        </div>

        {/* Changes Summary */}
        {hasChanges && (
          <div className="bg-orange-50 border border-orange-200 rounded-md p-4">
            <h4 className="text-sm font-medium text-orange-800 mb-2">Pending Changes</h4>
            <p className="text-sm text-orange-700">
              You have unsaved changes. Click &quot;Save Changes&quot; to apply them or &quot;Cancel Changes&quot; to discard.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditIndicatorForm;
