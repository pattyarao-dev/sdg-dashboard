"use client";

import { useState, useEffect } from "react";
import { Goal } from "@/types/goal.types";
import { getGoalIndicators } from "@/app/actions/actions_indicatormanagement";
import { DashboardAvailableIndicatorWithHierarchy } from "@/types/dashboard.types";
import EditIndicatorForm from "./EditIndicatorForm";

interface EditIndicatorsProps {
  goal: Goal;
}

// Simple types for flat indicator list
interface FlatIndicatorItem {
  id: string; // Unique identifier for this item
  type: 'main' | 'sub';
  indicator_id: number;
  goal_indicator_id?: number;
  goal_sub_indicator_id?: number;
  name: string;
  description: string;
  global_target_value: number | null;
  global_baseline_value: number | null;
  baseline_year: number;
  level: number; // For sub-indicators, shows nesting level
  parent_name?: string; // For sub-indicators, shows parent name
  required_data_count: number;
}

const EditIndicators = ({ goal }: EditIndicatorsProps) => {
  const [goalIndicators, setGoalIndicators] = useState<DashboardAvailableIndicatorWithHierarchy[]>([]);
  const [flatIndicatorsList, setFlatIndicatorsList] = useState<FlatIndicatorItem[]>([]);
  const [selectedIndicatorForEdit, setSelectedIndicatorForEdit] = useState<FlatIndicatorItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch indicators assigned to this goal
  useEffect(() => {
    const fetchGoalIndicators = async () => {
      try {
        setLoading(true);
        const indicators = await getGoalIndicators(goal.goal_id);
        setGoalIndicators(indicators);

        // Convert to flat list
        const flatList = convertToFlatList(indicators);
        setFlatIndicatorsList(flatList);
      } catch (err) {
        console.error("Error fetching goal indicators:", err);
        setError("Failed to load indicators for this goal");
      } finally {
        setLoading(false);
      }
    };

    if (goal.goal_id) {
      console.log(goalIndicators)
      fetchGoalIndicators();
    }
  }, [goal.goal_id]);

  // Convert hierarchical data to flat list for easy selection
  const convertToFlatList = (indicators: DashboardAvailableIndicatorWithHierarchy[]): FlatIndicatorItem[] => {
    const flatList: FlatIndicatorItem[] = [];

    indicators.forEach(indicator => {
      // Add main indicator
      flatList.push({
        id: `main-${indicator.indicator_id}`,
        type: 'main',
        indicator_id: indicator.indicator_id,
        goal_indicator_id: indicator.goal_indicator_id,
        name: indicator.md_indicator.name,
        description: indicator.md_indicator.description || "",
        global_target_value: indicator.global_target_value,
        global_baseline_value: indicator.global_baseline_value,
        baseline_year: indicator.baseline_year,
        level: 0,
        required_data_count: indicator.td_goal_indicator_required_data?.length || 0
      });

      // Add sub-indicators recursively
      const flattenSubIndicators = (
        subIndicators: any[],
        level: number,
        parentName: string,
        goalIndicatorId: number
      ) => {
        subIndicators.forEach(sub => {
          // Find the goal-specific data for this sub-indicator
          const goalSubIndicator = indicator.td_goal_sub_indicator?.find(
            gsi => gsi.md_sub_indicator.sub_indicator_id === sub.indicator_id
          );

          flatList.push({
            id: `sub-${sub.indicator_id}`,
            type: 'sub',
            indicator_id: sub.indicator_id,
            goal_indicator_id: goalIndicatorId,
            goal_sub_indicator_id: goalSubIndicator?.goal_sub_indicator_id,
            name: sub.name,
            description: sub.description || "",
            global_target_value: goalSubIndicator?.global_target_value || null,
            global_baseline_value: goalSubIndicator?.global_baseline_value || null,
            baseline_year: goalSubIndicator?.baseline_year || new Date().getFullYear(),
            level: level,
            parent_name: parentName,
            required_data_count: goalSubIndicator?.td_goal_sub_indicator_required_data?.length || 0
          });

          // Recursively add nested sub-indicators
          if (sub.sub_indicators && sub.sub_indicators.length > 0) {
            flattenSubIndicators(sub.sub_indicators, level + 1, sub.name, goalIndicatorId);
          }
        });
      };

      // Process sub-indicators
      if (indicator.md_indicator.sub_indicators && indicator.md_indicator.sub_indicators.length > 0) {
        flattenSubIndicators(
          indicator.md_indicator.sub_indicators,
          1,
          indicator.md_indicator.name,
          indicator.goal_indicator_id
        );
      }
    });

    return flatList;
  };

  const handleEditIndicator = (item: FlatIndicatorItem) => {
    setSelectedIndicatorForEdit(item);
  };

  const handleBackToSelection = () => {
    setSelectedIndicatorForEdit(null);
  };

  const handleSaveComplete = () => {
    // Refresh the list after successful save
    setSelectedIndicatorForEdit(null);
    // Optionally refetch to show updated values
    // fetchGoalIndicators();
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

    if (flatIndicatorsList.length === 0) {
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
      <div className="w-full space-y-2">
        <div className="grid grid-cols-12 gap-4 p-3 bg-gray-100 font-semibold text-sm text-gray-700 rounded-t-lg">
          <div className="col-span-5">Indicator Name</div>
          <div className="col-span-2">Type/Level</div>
          <div className="col-span-2">Target</div>
          <div className="col-span-2">Baseline</div>
          <div className="col-span-1">Actions</div>
        </div>

        {flatIndicatorsList.map((item) => (
          <div
            key={item.id}
            className="grid grid-cols-12 gap-4 p-3 bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            {/* Indicator Name with indentation for sub-indicators */}
            <div className="col-span-5 flex items-center">
              <div style={{ marginLeft: `${item.level * 20}px` }} className="flex items-center gap-2">
                {item.level > 0 && (
                  <span className="text-gray-400">└─</span>
                )}
                <div>
                  <div className="font-medium">{item.name}</div>
                  {item.parent_name && (
                    <div className="text-xs text-gray-500">
                      Parent: {item.parent_name}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Type/Level */}
            <div className="col-span-2 flex items-center">
              <div>
                <span className={`px-2 py-1 text-xs font-semibold rounded ${item.type === 'main'
                  ? 'bg-orange-100 text-orange-800'
                  : 'bg-blue-100 text-blue-800'
                  }`}>
                  {item.type === 'main' ? 'MAIN' : `SUB-L${item.level}`}
                </span>
              </div>
            </div>

            {/* Target Value */}
            <div className="col-span-2 flex items-center">
              <span className="text-sm">
                {item.global_target_value || <span className="text-gray-400 italic">Not set</span>}
              </span>
            </div>

            {/* Baseline */}
            <div className="col-span-2 flex items-center">
              <span className="text-sm">
                {item.global_baseline_value ? (
                  `${item.global_baseline_value} (${item.baseline_year})`
                ) : (
                  <span className="text-gray-400 italic">Not set</span>
                )}
              </span>
            </div>

            {/* Actions */}
            <div className="col-span-1 flex items-center">
              <button
                onClick={() => handleEditIndicator(item)}
                className="px-3 py-1 bg-orange-500 text-white text-xs font-semibold rounded hover:bg-orange-600 transition-colors"
              >
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Render the edit interface for selected indicator
  const renderEditInterface = () => {
    if (!selectedIndicatorForEdit) return null;

    return (
      <EditIndicatorForm
        selectedItem={selectedIndicatorForEdit}
        goal={goal}
        onBack={handleBackToSelection}
        onSaveComplete={handleSaveComplete}
      />
    );
  };

  return (
    <div className="w-full p-6 bg-white drop-shadow-lg">
      <div className="w-full flex flex-col gap-6">
        {/* Header */}
        <div className="w-full flex flex-col gap-2">
          <h2 className="text-lg font-semibold text-orange-400">
            {selectedIndicatorForEdit ? 'Edit Indicator' : 'Select an Indicator to Edit'}
          </h2>
          <hr className="w-full border border-orange-400" />
          {!selectedIndicatorForEdit && (
            <p className="text-sm text-gray-600">
              Choose any indicator assigned to &quot;<strong>{goal.name}</strong>&quot; to edit.
              You can edit both global properties (affects all goals) and goal-specific settings.
            </p>
          )}
        </div>

        {/* Content */}
        {selectedIndicatorForEdit ? renderEditInterface() : renderIndicatorSelection()}
      </div>
    </div>
  );
};

export default EditIndicators;
