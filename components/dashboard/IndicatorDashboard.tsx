"use client"
import { useEffect, useState } from "react";
import dynamic from 'next/dynamic';
import { DashboardAvailableIndicatorWithHierarchy } from "@/types/dashboard.types";

// Dynamic import to avoid SSR issues
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

export default function IndicatorDashboard({
  goaldId,
  indicators
}: {
  goaldId: string,
  indicators: DashboardAvailableIndicatorWithHierarchy[] // Use the new type
}) {
  const [progressData, setProgressData] = useState<{ [key: string]: number }>({});
  const [loading, setLoading] = useState(true);

  // SDG colors array (same as MainDashboard)
  const sdgColors = [
    '#E5243B', '#DDA63A', '#4C9F38', '#C5192D', '#FF3A21', '#26BDE2',
    '#FCC30B', '#A21942', '#FD6925', '#DD1367', '#FD9D24', '#BF8B2E',
    '#3F7E44', '#0A97D9', '#56C02B', '#00689D', '#19486A'
  ];

  // Get the color for this specific goal
  const goalColor = sdgColors[parseInt(goaldId) - 1] || sdgColors[0];

  const baseOptions = {
    chart: {
      height: 300,
      type: 'radialBar' as const,
    },
    plotOptions: {
      radialBar: {
        hollow: {
          margin: 15,
          size: '70%',
          imageClipped: false
        },
        dataLabels: {
          name: {
            show: false,
            color: '#fff'
          },
          value: {
            show: true,
            color: '#333',
            offsetY: 10, // Center vertically (was 60)
            fontSize: '24px', // Increased font size
            fontWeight: 'bold', // Make it bold
            formatter: function(val: string | number) {
              return parseInt(val.toString(), 10) + '%';
            }
          }
        }
      }
    },
    stroke: {
      lineCap: 'round' as const
    },
    labels: ['Progress'],
  };

  // Flatten all indicators and sub-indicators into a single array
  const allIndicatorsAndSubIndicators = indicators.flatMap(indicator => {
    const mainIndicator = {
      id: indicator.md_indicator.indicator_id,
      name: indicator.md_indicator.name,
      description: indicator.md_indicator.description,
      type: 'indicator' as const,
      goalIndicatorId: indicator.goal_indicator_id
    };

    // Get sub-indicators from td_goal_sub_indicator (these have goalSubIndicatorId)
    const directSubIndicators = indicator.td_goal_sub_indicator.map(subIndicator => ({
      id: subIndicator.md_sub_indicator.sub_indicator_id,
      name: subIndicator.md_sub_indicator.name,
      description: subIndicator.md_sub_indicator.description,
      type: 'sub-indicator' as const,
      level: 1,
      goalSubIndicatorId: subIndicator.md_sub_indicator.sub_indicator_id,// This should exist in your data
      goalIndicatorId: indicator.goal_indicator_id
    }));

    // Note: The hierarchical sub_indicators from md_indicator don't have goalSubIndicatorId
    // so we'll focus on the ones from td_goal_sub_indicator for now

    return [mainIndicator, ...directSubIndicators];
  });

  // Fetch progress data for all indicators and sub-indicators
  useEffect(() => {
    const fetchProgress = async () => {
      setLoading(true);

      try {
        const progressMap: { [key: string]: number } = {};

        // Fetch indicator progress
        const uniqueGoalIndicatorIds = [...new Set(
          allIndicatorsAndSubIndicators
            .filter(item => item.type === 'indicator')
            .map(item => item.goalIndicatorId)
        )];

        const indicatorProgressPromises = uniqueGoalIndicatorIds.map(async (goalIndicatorId) => {
          try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/goal_indicator_progress/${goalIndicatorId}`);
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return {
              key: `indicator-${goalIndicatorId}`,
              percentage: data.percentageOfTarget || 0
            };
          } catch (error) {
            console.error(`Error fetching indicator progress for ${goalIndicatorId}:`, error);
            return { key: `indicator-${goalIndicatorId}`, percentage: 0 };
          }
        });

        // Fetch sub-indicator progress
        const subIndicatorIds = allIndicatorsAndSubIndicators
          .filter(item => item.type === 'sub-indicator')
          .map(item => item.goalSubIndicatorId)
          .filter(id => id !== undefined);

        const subIndicatorProgressPromises = subIndicatorIds.map(async (goalSubIndicatorId) => {
          try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/goal_sub_indicator_progress/${goalSubIndicatorId}`);
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return {
              key: `sub-indicator-${goalSubIndicatorId}`,
              percentage: data.percentageOfTarget || 0
            };
          } catch (error) {
            console.error(`Error fetching sub-indicator progress for ${goalSubIndicatorId}:`, error);
            return { key: `sub-indicator-${goalSubIndicatorId}`, percentage: 0 };
          }
        });

        const allResults = await Promise.all([...indicatorProgressPromises, ...subIndicatorProgressPromises]);

        allResults.forEach(result => {
          progressMap[result.key] = result.percentage;
        });

        setProgressData(progressMap);
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
        <div className="text-lg" style={{ color: goalColor }}>Loading progress data...</div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold mb-6 text-center" style={{ color: goalColor }}>
        Goal {goaldId} Indicators & Sub-indicators
      </h2>
      <div className="flex flex-wrap justify-center items-start gap-6">
        {allIndicatorsAndSubIndicators.map((item, index) => {
          // Get dynamic progress data using the appropriate key
          let progressPercentage = 0;
          let progressKey = '';

          if (item.type === 'indicator') {
            progressKey = `indicator-${item.goalIndicatorId}`;
            progressPercentage = Math.round(progressData[progressKey] || 0);
          } else if (item.type === 'sub-indicator' && item.goalSubIndicatorId) {
            progressKey = `sub-indicator-${item.goalSubIndicatorId}`;
            progressPercentage = Math.round(progressData[progressKey] || 0);
          }

          const series = [progressPercentage];

          // Vary opacity based on type and level for visual hierarchy
          const opacity = item.type === 'indicator' ? 1 : Math.max(0.6, 1 - (item.level * 0.15));

          const options = {
            ...baseOptions,
            colors: [goalColor],
            fill: {
              colors: [goalColor],
              opacity: opacity
            },
            plotOptions: {
              ...baseOptions.plotOptions,
              radialBar: {
                ...baseOptions.plotOptions.radialBar,
                hollow: {
                  ...baseOptions.plotOptions.radialBar.hollow,
                }
              }
            }
          };

          return (
            <div key={`${item.type}-${item.id}-${index}`} className="flex-shrink-0 bg-white rounded-lg shadow-md p-4 w-80">
              <Chart
                options={options}
                series={series}
                type="radialBar"
                height={300}
              />
              {/* Title outside the chart */}
              <h3 className="text-sm font-bold text-center mt-2 px-2" style={{ color: goalColor }}>
                {item.name}
              </h3>

              {/* Additional info */}
              <div className="mt-2 text-sm text-gray-600 text-center">
                <p className="text-xs font-medium">
                  {item.type === 'indicator' ? 'Main Indicator' : `Sub-indicator (Level ${item.level})`}
                </p>
                {item.description && (
                  <p className="mt-1 text-xs">{item.description}</p>
                )}
                <p className="mt-1 text-xs font-semibold" style={{ color: goalColor }}>
                  Target Progress: {progressPercentage}%
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
