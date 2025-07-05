"use client";

import { useState, useEffect } from "react";
import { Goal } from "@/types/goal.types";
import { getGoalIndicators } from "@/app/actions/actions_indicatormanagement";
import { DashboardAvailableIndicatorWithHierarchy } from "@/types/dashboard.types";
import EditIndicatorForm from "./EditIndicatorForm";

interface EditIndicatorsProps {
  goal: Goal;
}

const EditIndicators = ({ goal }: EditIndicatorsProps) => {
  const [goalIndicators, setGoalIndicators] = useState<DashboardAvailableIndicatorWithHierarchy[]>([]);
  const [selectedIndicator, setSelectedIndicator] = useState<DashboardAvailableIndicatorWithHierarchy | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch indicators assigned to this goal
  useEffect(() => {
    const fetchGoalIndicators = async () => {
      try {
        setLoading(true);
        const indicators = await getGoalIndicators(goal.goal_id);
        setGoalIndicators(indicators);
      } catch (err) {
        console.error("Error fetching goal indicators:", err);
        setError("Failed to load indicators for this goal");
      } finally {
        setLoading(false);
      }
    };

    if (goal.goal_id) {
      fetchGoalIndicators();
    }
  }, [goal.goal_id]);

  const handleIndicatorSelect = (indicator: DashboardAvailableIndicatorWithHierarchy) => {
    setSelectedIndicator(indicator);
  };

  const handleBackToSelection = () => {
    setSelectedIndicator(null);
  };

  const handleSaveComplete = () => {
    // Refresh the indicators list after save
    setSelectedIndicator(null);
    // Optionally refetch indicators to show updated values
    // fetchGoalIndicators();
  };

  // Count total sub-indicators recursively
  const countSubIndicators = (subIndicators: any[]): number => {
    if (!subIndicators || subIndicators.length === 0) return 0;

    let count = subIndicators.length;
    subIndicators.forEach(sub => {
      if (sub.sub_indicators) {
        count += countSubIndicators(sub.sub_indicators);
      }
    });
    return count;
  };

  // Render the indicator selection interface
  const renderIndicatorSelection = () => {
    if (loading) {
      return (
        <div className="w-full h-[400px] flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-400"></div>
            <p className="text-gray-600">Loading indicators...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="w-full p-6 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 font-medium">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      );
    }

    if (goalIndicators.length === 0) {
      return (
        <div className="w-full p-8 bg-gray-50 border border-gray-200 rounded-lg text-center">
          <p className="text-gray-600 text-lg mb-4">
            No indicators are currently assigned to this goal.
          </p>
          <p className="text-gray-500 text-sm">
            Add indicators to this goal before you can edit them.
          </p>
        </div>
      );
    }

    return (
      <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goalIndicators.map((indicator) => {
          const subIndicatorCount = countSubIndicators(
            indicator.md_indicator.sub_indicators || []
          );
          const requiredDataCount = indicator.td_goal_indicator_required_data?.length || 0;

          return (
            <div
              key={indicator.goal_indicator_id}
              className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer hover:border-orange-300"
              onClick={() => handleIndicatorSelect(indicator)}
            >
              {/* Indicator Header */}
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {indicator.md_indicator.name}
                </h3>
                {indicator.md_indicator.description && (
                  <p className="text-sm text-gray-600 mb-3">
                    {indicator.md_indicator.description}
                  </p>
                )}

                {/* Status Badge */}
                <span className={`inline-block px-2 py-1 text-xs font-semibold rounded ${indicator.md_indicator.status === 'active'
                  ? 'bg-green-100 text-green-800'
                  : indicator.md_indicator.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                  }`}>
                  {indicator.md_indicator.status?.toUpperCase()}
                </span>
              </div>

              {/* Goal-Specific Values */}
              <div className="mb-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Target Value:</span>
                  <span className="font-medium">
                    {indicator.global_target_value || "Not set"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Baseline:</span>
                  <span className="font-medium">
                    {indicator.global_baseline_value || "Not set"}
                    {indicator.baseline_year && ` (${indicator.baseline_year})`}
                  </span>
                </div>
              </div>

              {/* Statistics */}
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Sub-indicators:</span>
                  <span className="font-medium">{subIndicatorCount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Required Data:</span>
                  <span className="font-medium">{requiredDataCount}</span>
                </div>
              </div>

              {/* Action Hint */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-orange-600 font-medium">
                  Click to edit this indicator →
                </p>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Render the edit interface for selected indicator
  const renderEditInterface = () => {
    if (!selectedIndicator) return null;

    // For now, just show the selected indicator data
    // We'll replace this with the EditIndicatorForm component
    return (
      <EditIndicatorForm selectedIndicator={selectedIndicator} goal={goal} onBack={handleBackToSelection} onSaveComplete={handleSaveComplete} />
    );
  };

  return (
    <div className="w-full p-6 bg-white drop-shadow-lg">
      <div className="w-full flex flex-col gap-6">
        {/* Header */}
        <div className="w-full flex flex-col gap-2">
          <h2 className="text-lg font-semibold text-orange-400">
            {selectedIndicator ? 'Edit Indicator' : 'Select an Indicator to Edit'}
          </h2>
          <hr className="w-full border border-orange-400" />
          {!selectedIndicator && (
            <p className="text-sm text-gray-600">
              Choose an indicator assigned to &quot;<strong>{goal.name}</strong>&quot; to edit its goal-specific settings.
            </p>
          )}
        </div>

        {/* Content */}
        {selectedIndicator ? renderEditInterface() : renderIndicatorSelection()}
      </div>
    </div>
  );
};

export default EditIndicators;
