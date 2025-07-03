"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { HiInformationCircle, HiXCircle } from "react-icons/hi2";
import { DashboardAvailableIndicatorWithHierarchy } from "@/types/dashboard.types";

// Dynamic import to avoid SSR issues
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function IndicatorDashboard({
  goaldId,
  indicators,
}: {
  goaldId: string;
  indicators: DashboardAvailableIndicatorWithHierarchy[]; // Use the new type
}) {
  const [progressData, setProgressData] = useState<{ [key: string]: number }>(
    {},
  );
  const [indicatorDescriptions, setIndicatorDescriptions] = useState<{
    [key: string]: any;
  }>({});
  const [selectedDescription, setSelectedDescription] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // SDG colors array (same as MainDashboard)
  const sdgColors = [
    "#E5243B",
    "#DDA63A",
    "#4C9F38",
    "#C5192D",
    "#FF3A21",
    "#26BDE2",
    "#FCC30B",
    "#A21942",
    "#FD6925",
    "#DD1367",
    "#FD9D24",
    "#BF8B2E",
    "#3F7E44",
    "#0A97D9",
    "#56C02B",
    "#00689D",
    "#19486A",
  ];

  // Get the color for this specific goal
  const goalColor = sdgColors[parseInt(goaldId) - 1] || sdgColors[0];

  const baseOptions = {
    chart: {
      height: 300,
      type: "radialBar" as const,
    },
    plotOptions: {
      radialBar: {
        hollow: {
          margin: 15,
          size: "70%",
          imageClipped: false,
        },
        dataLabels: {
          name: {
            show: false,
            color: "#fff",
          },
          value: {
            show: true,
            color: "#333",
            offsetY: 10, // Center vertically (was 60)
            fontSize: "24px", // Increased font size
            fontWeight: "bold", // Make it bold
            formatter: function (val: string | number) {
              return parseInt(val.toString(), 10) + "%";
            },
          },
        },
      },
    },
    stroke: {
      lineCap: "round" as const,
    },
    labels: ["Progress"],
  };

  // Flatten all indicators and sub-indicators into a single array
  const allIndicatorsAndSubIndicators = indicators.flatMap((indicator) => {
    const mainIndicator = {
      id: indicator.md_indicator.indicator_id,
      name: indicator.md_indicator.name,
      description: indicator.md_indicator.description,
      type: "indicator" as const,
      goalIndicatorId: indicator.goal_indicator_id,
    };

    // Get sub-indicators from td_goal_sub_indicator (these have goalSubIndicatorId)
    const directSubIndicators = indicator.td_goal_sub_indicator.map(
      (subIndicator) => ({
        id: subIndicator.md_sub_indicator.sub_indicator_id,
        name: subIndicator.md_sub_indicator.name,
        description: subIndicator.md_sub_indicator.description,
        type: "sub-indicator" as const,
        level: 1,
        goalSubIndicatorId: subIndicator.md_sub_indicator.sub_indicator_id, // This should exist in your data
        goalIndicatorId: indicator.goal_indicator_id,
      }),
    );

    // Note: The hierarchical sub_indicators from md_indicator don't have goalSubIndicatorId
    // so we'll focus on the ones from td_goal_sub_indicator for now

    return [mainIndicator, ...directSubIndicators];
  });

  const openModal = (description: any, indicatorName: string) => {
    setSelectedDescription({ ...description, indicatorName });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedDescription(null);
  };
  // Fetch descriptions for indicators only (not sub-indicators)
  const fetchIndicatorDescriptions = async () => {
    try {
      const uniqueGoalIndicatorIds = [
        ...new Set(
          allIndicatorsAndSubIndicators
            .filter((item) => item.type === "indicator")
            .map((item) => item.goalIndicatorId),
        ),
      ];

      const descriptionPromises = uniqueGoalIndicatorIds.map(
        async (goalIndicatorId) => {
          try {
            const response = await fetch(
              `/api/goal_description/${goalIndicatorId}`,
            );
            if (response.ok) {
              const descriptions = await response.json();
              // Since there's only 1 description per indicator, get the first one
              return { goalIndicatorId, description: descriptions[0] || null };
            }
            return { goalIndicatorId, description: null };
          } catch (error) {
            console.error(
              `Error fetching descriptions for ${goalIndicatorId}:`,
              error,
            );
            return { goalIndicatorId, description: null };
          }
        },
      );

      const results = await Promise.all(descriptionPromises);
      const descriptionsMap: { [key: string]: any } = {};

      results.forEach(({ goalIndicatorId, description }) => {
        descriptionsMap[`indicator-${goalIndicatorId}`] = description;
      });

      setIndicatorDescriptions(descriptionsMap);
    } catch (error) {
      console.error("Error fetching indicator descriptions:", error);
    }
  };

  // Fetch progress data for all indicators and sub-indicators
  useEffect(() => {
    const fetchProgress = async () => {
      setLoading(true);

      try {
        const progressMap: { [key: string]: number } = {};

        // Fetch indicator progress
        const uniqueGoalIndicatorIds = [
          ...new Set(
            allIndicatorsAndSubIndicators
              .filter((item) => item.type === "indicator")
              .map((item) => item.goalIndicatorId),
          ),
        ];

        const indicatorProgressPromises = uniqueGoalIndicatorIds.map(
          async (goalIndicatorId) => {
            try {
              const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/goal_indicator_progress/${goalIndicatorId}`,
              );
              if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
              }
              const data = await response.json();
              return {
                key: `indicator-${goalIndicatorId}`,
                percentage: data.percentageOfTarget || 0,
              };
            } catch (error) {
              console.error(
                `Error fetching indicator progress for ${goalIndicatorId}:`,
                error,
              );
              return { key: `indicator-${goalIndicatorId}`, percentage: 0 };
            }
          },
        );

        // Fetch sub-indicator progress
        const subIndicatorIds = allIndicatorsAndSubIndicators
          .filter((item) => item.type === "sub-indicator")
          .map((item) => item.goalSubIndicatorId)
          .filter((id) => id !== undefined);

        const subIndicatorProgressPromises = subIndicatorIds.map(
          async (goalSubIndicatorId) => {
            try {
              const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/goal_sub_indicator_progress/${goalSubIndicatorId}`,
              );
              if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
              }
              const data = await response.json();
              return {
                key: `sub-indicator-${goalSubIndicatorId}`,
                percentage: data.percentageOfTarget || 0,
              };
            } catch (error) {
              console.error(
                `Error fetching sub-indicator progress for ${goalSubIndicatorId}:`,
                error,
              );
              return {
                key: `sub-indicator-${goalSubIndicatorId}`,
                percentage: 0,
              };
            }
          },
        );

        const allResults = await Promise.all([
          ...indicatorProgressPromises,
          ...subIndicatorProgressPromises,
        ]);

        allResults.forEach((result) => {
          progressMap[result.key] = result.percentage;
        });

        setProgressData(progressMap);

        // Fetch descriptions after progress data (only for indicators)
        await fetchIndicatorDescriptions();
      } catch (error) {
        console.error("Error fetching progress data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (allIndicatorsAndSubIndicators.length > 0) {
      fetchProgress();
    } else {
      setLoading(false);
    }
  }, [indicators]);

  if (loading) {
    return (
      <div className="w-full flex justify-center items-center h-64">
        <div className="text-lg" style={{ color: goalColor }}>
          Loading progress data...
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h2
        className="text-2xl font-bold mb-6 text-center"
        style={{ color: goalColor }}
      >
        Goal {goaldId} Indicators & Sub-indicators
      </h2>
      <div className="flex flex-wrap justify-center items-start gap-6">
        {allIndicatorsAndSubIndicators.map((item, index) => {
          // Get dynamic progress data using the appropriate key
          let progressPercentage = 0;
          let progressKey = "";

          if (item.type === "indicator") {
            progressKey = `indicator-${item.goalIndicatorId}`;
            progressPercentage = Math.round(progressData[progressKey] || 0);
          } else if (item.type === "sub-indicator" && item.goalSubIndicatorId) {
            progressKey = `sub-indicator-${item.goalSubIndicatorId}`;
            progressPercentage = Math.round(progressData[progressKey] || 0);
          }

          const series = [progressPercentage];

          // Vary opacity based on type and level for visual hierarchy
          const opacity =
            item.type === "indicator"
              ? 1
              : Math.max(0.6, 1 - item.level * 0.15);

          const options = {
            ...baseOptions,
            colors: [goalColor],
            fill: {
              colors: [goalColor],
              opacity: opacity,
            },
            plotOptions: {
              ...baseOptions.plotOptions,
              radialBar: {
                ...baseOptions.plotOptions.radialBar,
                hollow: {
                  ...baseOptions.plotOptions.radialBar.hollow,
                },
              },
            },
          };

          return (
            <div
              key={`${item.type}-${item.id}-${index}`}
              className="flex-shrink-0 bg-white rounded-lg shadow-md p-4 w-80"
            >
              <Chart
                options={options}
                series={series}
                type="radialBar"
                height={300}
              />
              {/* Title outside the chart */}
              <div className="flex items-center justify-center mt-2 px-2 gap-2">
                <h3
                  className="text-sm font-bold text-center"
                  style={{ color: goalColor }}
                >
                  {item.name}
                </h3>

                {/* Info icon for indicators with descriptions */}
                {item.type === "indicator" &&
                  indicatorDescriptions[
                    `indicator-${item.goalIndicatorId}`
                  ] && (
                    <HiInformationCircle
                      className="w-5 h-5 text-gray-400 hover:text-gray-600 cursor-pointer transition-colors duration-200"
                      onClick={() =>
                        openModal(
                          indicatorDescriptions[
                            `indicator-${item.goalIndicatorId}`
                          ],
                          item.name,
                        )
                      }
                    />
                  )}
              </div>

              {/* Additional info */}
              <div className="mt-2 text-sm text-gray-600 text-center">
                <p className="text-xs font-medium">
                  {item.type === "indicator"
                    ? "Main Indicator"
                    : `Sub-indicator (Level ${item.level})`}
                </p>

                {/* Basic description */}
                {item.description && (
                  <p className="mt-1 text-xs">{item.description}</p>
                )}

                <p
                  className="mt-1 text-xs font-semibold"
                  style={{ color: goalColor }}
                >
                  Target Progress: {progressPercentage}%
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {isModalOpen && selectedDescription && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-800">
                Indicator Notes: {selectedDescription.indicatorName}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <HiXCircle className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="prose prose-sm max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {selectedDescription.explanation}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  <span className="font-medium">Created:</span>{" "}
                  {new Date(selectedDescription.created_at).toLocaleDateString(
                    "en-US",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    },
                  )}
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md transition-colors duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
