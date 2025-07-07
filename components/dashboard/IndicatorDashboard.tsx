"use client";
import { useEffect, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { HiInformationCircle, HiXCircle, HiChartBar } from "react-icons/hi2";
import { DashboardAvailableIndicatorWithHierarchy, DashboardSubIndicatorHierarchy } from "@/types/dashboard.types";

// Dynamic import to avoid SSR issues
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

type FlattenedIndicatorItem = {
  id: number;
  name: string;
  description?: string | null;
  type: 'indicator' | 'sub-indicator';
  level: number;
  goalIndicatorId: number;
  goalSubIndicatorId?: number;
  parentId?: number | null;
  hasGoalTarget: boolean;
  source: 'goal_sub_indicator' | 'indicator_hierarchy';
};

type ModalType = 'description' | 'chart';

export default function IndicatorDashboard({
  goaldId,
  indicators,
}: {
  goaldId: string;
  indicators: DashboardAvailableIndicatorWithHierarchy[];
}) {
  const [progressData, setProgressData] = useState<{ [key: string]: number }>({});
  const [indicatorDescriptions, setIndicatorDescriptions] = useState<{
    [key: string]: any;
  }>({});
  const [annualProgressData, setAnnualProgressData] = useState<{
    [key: string]: any;
  }>({});
  const [selectedModalData, setSelectedModalData] = useState<any>(null);
  const [modalType, setModalType] = useState<ModalType>('description');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  // SDG colors array
  const sdgColors = [
    "#E5243B", "#DDA63A", "#4C9F38", "#C5192D", "#FF3A21", "#26BDE2",
    "#FCC30B", "#A21942", "#FD6925", "#DD1367", "#FD9D24", "#BF8B2E",
    "#3F7E44", "#0A97D9", "#56C02B", "#00689D", "#19486A",
  ];
  console.log(indicators)

  const goalColor = sdgColors[parseInt(goaldId) - 1] || sdgColors[0];

  const baseOptions = {
    chart: {
      height: 280,
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
            offsetY: 10,
            fontSize: "20px",
            fontWeight: "bold",
            formatter: function(val: string | number) {
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

  // Line chart options for annual progress
  const getLineChartOptions = (indicatorName: string, annualData: any) => {
    if (!annualData?.hasAnnualData) return null;

    const categories = annualData.annualProgress.map((item: any) => item.year.toString());

    return {
      chart: {
        height: 350,
        type: 'line' as const,
        zoom: {
          enabled: false
        }
      },
      dataLabels: {
        enabled: true,
        formatter: function(val: number) {
          return val.toFixed(1) + '%';
        },
        style: {
          fontSize: '12px',
          fontWeight: 'bold',
          colors: ['#fff']
        },
        background: {
          enabled: true,
          foreColor: '#fff',
          borderRadius: 2,
          padding: 4,
          opacity: 0.9,
          borderWidth: 1,
          borderColor: goalColor,
          dropShadow: {
            enabled: true,
            top: 1,
            left: 1,
            blur: 1,
            color: '#000',
            opacity: 0.45
          }
        }
      },
      stroke: {
        curve: 'smooth' as const,
        width: 3
      },
      title: {
        text: `${indicatorName} - Annual Progress Trend`,
        align: 'left' as const,
        style: {
          fontSize: '16px',
          fontWeight: 'bold',
          color: goalColor
        }
      },
      grid: {
        row: {
          colors: ['#f3f3f3', 'transparent'],
          opacity: 0.5
        },
      },
      xaxis: {
        categories: categories,
        title: {
          text: 'Year',
          style: {
            color: '#666',
            fontSize: '12px'
          }
        }
      },
      yaxis: {
        title: {
          text: 'Progress (%)',
          style: {
            color: '#666',
            fontSize: '12px'
          }
        },
        min: 0,
        max: 100
      },
      colors: [goalColor],
      tooltip: {
        y: {
          formatter: function(val: number) {
            return val.toFixed(1) + '%';
          }
        }
      }
    };
  };

  // Export to PDF function
  const exportToPDF = async () => {
    setIsExporting(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/export_indicator_pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          goalId: goaldId,
          indicators: allIndicatorsAndSubIndicators,
          progressData,
          indicatorDescriptions
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sdg-goal-${goaldId}-indicators-report-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert(`Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsExporting(false);
    }
  };

  // Recursive function to flatten hierarchical sub-indicators
  const flattenSubIndicatorHierarchy = (
    subIndicators: DashboardSubIndicatorHierarchy[],
    level: number,
    goalIndicatorId: number,
    parentId?: number
  ): FlattenedIndicatorItem[] => {
    return subIndicators.flatMap(subIndicator => {
      const current: FlattenedIndicatorItem = {
        id: subIndicator.indicator_id,
        name: subIndicator.name,
        description: subIndicator.description,
        type: 'sub-indicator',
        level,
        goalIndicatorId,
        parentId,
        hasGoalTarget: false,
        source: 'indicator_hierarchy'
      };

      const children = subIndicator.sub_indicators?.length > 0
        ? flattenSubIndicatorHierarchy(
          subIndicator.sub_indicators,
          level + 1,
          goalIndicatorId,
          subIndicator.indicator_id
        )
        : [];

      return [current, ...children];
    });
  };

  // Memoized flattening logic
  const allIndicatorsAndSubIndicators = useMemo(() => {
    return indicators.flatMap((indicator) => {
      const mainIndicator: FlattenedIndicatorItem = {
        id: indicator.md_indicator.indicator_id,
        name: indicator.md_indicator.name,
        description: indicator.md_indicator.description,
        type: 'indicator',
        level: 0,
        goalIndicatorId: indicator.goal_indicator_id,
        hasGoalTarget: true,
        source: 'goal_sub_indicator'
      };

      // Goal-specific sub-indicators (these have targets)
      const goalSubIndicators: FlattenedIndicatorItem[] = indicator.td_goal_sub_indicator.map(
        (goalSubIndicator) => ({
          id: goalSubIndicator.md_sub_indicator.sub_indicator_id,
          name: goalSubIndicator.md_sub_indicator.name,
          description: goalSubIndicator.md_sub_indicator.description,
          type: 'sub-indicator',
          level: 1,
          goalIndicatorId: indicator.goal_indicator_id,
          goalSubIndicatorId: goalSubIndicator.goal_sub_indicator_id,
          parentId: goalSubIndicator.md_sub_indicator.parent_indicator_id,
          hasGoalTarget: true,
          source: 'goal_sub_indicator'
        })
      );

      // Hierarchical sub-indicators (for display hierarchy)
      const hierarchicalSubIndicators: FlattenedIndicatorItem[] =
        indicator.md_indicator.sub_indicators?.length > 0
          ? flattenSubIndicatorHierarchy(
            indicator.md_indicator.sub_indicators,
            1,
            indicator.goal_indicator_id,
            indicator.md_indicator.indicator_id
          )
          : [];

      // Remove duplicates (prefer goal sub-indicators over hierarchical ones)
      const goalSubIndicatorIds = new Set(goalSubIndicators.map(item => item.id));
      const uniqueHierarchicalSubIndicators = hierarchicalSubIndicators.filter(
        item => !goalSubIndicatorIds.has(item.id)
      );

      return [mainIndicator, ...goalSubIndicators, ...uniqueHierarchicalSubIndicators];
    });
  }, [indicators]);

  const openDescriptionModal = (description: any, indicatorName: string) => {
    setSelectedModalData({ ...description, indicatorName });
    setModalType('description');
    setIsModalOpen(true);
  };

  const openChartModal = (annualData: any, indicatorName: string, indicatorType: string) => {
    setSelectedModalData({ annualData, indicatorName, indicatorType });
    setModalType('chart');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedModalData(null);
  };

  // Fetch descriptions for indicators only
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
            const response = await fetch(`/api/goal_description/${goalIndicatorId}`);
            if (response.ok) {
              const descriptions = await response.json();
              return { goalIndicatorId, description: descriptions[0] || null };
            }
            return { goalIndicatorId, description: null };
          } catch (error) {
            console.error(`Error fetching descriptions for ${goalIndicatorId}:`, error);
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

  // Fetch annual progress data
  const fetchAnnualProgressData = async () => {
    try {
      const annualProgressMap: { [key: string]: any } = {};

      // Fetch for indicators with goal targets
      const itemsWithGoalTargets = allIndicatorsAndSubIndicators.filter(item => item.hasGoalTarget);

      const indicatorAnnualPromises = itemsWithGoalTargets
        .filter(item => item.type === 'indicator')
        .map(async (item) => {
          try {
            const response = await fetch(
              `${process.env.NEXT_PUBLIC_API_BASE_URL}/goal_indicator_annual_progress/${item.goalIndicatorId}`,
            );
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const data = await response.json();
            return {
              key: `indicator-${item.goalIndicatorId}`,
              data: data,
            };
          } catch (error) {
            console.error(`Error fetching annual progress for ${item.goalIndicatorId}:`, error);
            return { key: `indicator-${item.goalIndicatorId}`, data: { hasAnnualData: false } };
          }
        });

      const subIndicatorAnnualPromises = itemsWithGoalTargets
        .filter(item => item.type === 'sub-indicator' && item.goalSubIndicatorId)
        .map(async (item) => {
          try {
            const response = await fetch(
              `${process.env.NEXT_PUBLIC_API_BASE_URL}/goal_sub_indicator_annual_progress/${item.goalSubIndicatorId}`,
            );
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const data = await response.json();
            return {
              key: `sub-indicator-${item.goalSubIndicatorId}`,
              data: data,
            };
          } catch (error) {
            console.error(`Error fetching annual progress for ${item.goalSubIndicatorId}:`, error);
            return { key: `sub-indicator-${item.goalSubIndicatorId}`, data: { hasAnnualData: false } };
          }
        });

      const allAnnualResults = await Promise.all([
        ...indicatorAnnualPromises,
        ...subIndicatorAnnualPromises,
      ]);

      allAnnualResults.forEach((result) => {
        annualProgressMap[result.key] = result.data;
      });

      setAnnualProgressData(annualProgressMap);
    } catch (error) {
      console.error("Error fetching annual progress data:", error);
    }
  };

  // Fetch progress data
  useEffect(() => {
    const fetchProgress = async () => {
      setLoading(true);

      try {
        const progressMap: { [key: string]: number } = {};

        // Fetch indicator progress
        const itemsWithGoalTargets = allIndicatorsAndSubIndicators.filter(item => item.hasGoalTarget);

        const indicatorProgressPromises = itemsWithGoalTargets
          .filter(item => item.type === 'indicator')
          .map(async (item) => {
            try {
              const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/goal_indicator_progress/${item.goalIndicatorId}`,
              );
              if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

              const data = await response.json();
              return {
                key: `indicator-${item.goalIndicatorId}`,
                percentage: data.percentageOfTarget || 0,
              };
            } catch (error) {
              console.error(`Error fetching indicator progress for ${item.goalIndicatorId}:`, error);
              return { key: `indicator-${item.goalIndicatorId}`, percentage: 0 };
            }
          });

        const subIndicatorProgressPromises = itemsWithGoalTargets
          .filter(item => item.type === 'sub-indicator' && item.goalSubIndicatorId)
          .map(async (item) => {
            console.log("logging items:")
            console.log(item)
            try {
              const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/goal_sub_indicator_progress/${item.goalSubIndicatorId}`,
              );
              if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

              const data = await response.json();
              return {
                key: `sub-indicator-${item.goalSubIndicatorId}`,
                percentage: data.percentageOfTarget || 0,
              };
            } catch (error) {
              console.error(`Error fetching sub-indicator progress for ${item.goalSubIndicatorId}:`, error);
              return { key: `sub-indicator-${item.goalSubIndicatorId}`, percentage: 0 };
            }
          });

        const allResults = await Promise.all([
          ...indicatorProgressPromises,
          ...subIndicatorProgressPromises,
        ]);

        allResults.forEach((result) => {
          // Cap progress at 100% to match backend logic (LEAST function)
          progressMap[result.key] = Math.min(100, result.percentage);
        });

        setProgressData(progressMap);
        await fetchIndicatorDescriptions();
        await fetchAnnualProgressData();
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
  }, [allIndicatorsAndSubIndicators]);

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
      {/* Header with Export Button */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 sm:justify-between sm:items-center">
        <div>
          <h2
            className="text-2xl font-bold"
            style={{ color: goalColor }}
          >
            Goal {goaldId} Indicators & Sub-indicators
          </h2>
          <p className="text-gray-600 text-sm mt-1">
            Track progress across {allIndicatorsAndSubIndicators.filter(item => item.type === 'indicator').length} main indicators and {allIndicatorsAndSubIndicators.filter(item => item.type === 'sub-indicator').length} sub-indicators
          </p>
        </div>
        <button
          onClick={exportToPDF}
          disabled={isExporting || loading || Object.keys(progressData).length === 0}
          className="bg-blue-500 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors duration-200 shadow-sm"
        >
          {isExporting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Generating PDF...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export Indicators Report
            </>
          )}
        </button>
      </div>

      {/* Hierarchical display */}
      <div className="max-w-6xl mx-auto space-y-4">
        {allIndicatorsAndSubIndicators.map((item, index) => {
          let progressPercentage = 0;
          let progressKey = "";
          let hasProgressData = false;

          if (item.hasGoalTarget) {
            if (item.type === "indicator") {
              progressKey = `indicator-${item.goalIndicatorId}`;
              progressPercentage = Math.round(progressData[progressKey] || 0);
              hasProgressData = true;
            } else if (item.type === "sub-indicator" && item.goalSubIndicatorId) {
              progressKey = `sub-indicator-${item.goalSubIndicatorId}`;
              progressPercentage = Math.round(progressData[progressKey] || 0);
              hasProgressData = true;
            }
          }

          const series = [progressPercentage];

          // Calculate indentation based on level
          const indentationPx = item.level * 40;

          // Opacity based on level for visual hierarchy
          const opacity = item.type === "indicator" ? 1 : Math.max(0.5, 1 - item.level * 0.1);

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

          // Helper function to convert hex to rgba
          const hexToRgba = (hex: string, alpha: number) => {
            const r = parseInt(hex.slice(1, 3), 16);
            const g = parseInt(hex.slice(3, 5), 16);
            const b = parseInt(hex.slice(5, 7), 16);
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
          };

          // Get annual progress data for this item
          const annualData = annualProgressData[progressKey];

          return (
            <div
              key={`${item.type}-${item.id}-${index}`}
              className="flex items-center"
              style={{ marginLeft: `${indentationPx}px` }}
            >
              {/* Connecting lines for hierarchy */}
              {item.level > 0 && (
                <div className="flex items-center mr-4">
                  {/* Vertical line from parent */}
                  <div
                    className="border-l-2 border-gray-300"
                    style={{
                      height: '40px',
                      marginRight: '8px',
                      borderColor: goalColor,
                      opacity: 0.3
                    }}
                  />
                  {/* Horizontal connector */}
                  <div
                    className="border-t-2 border-gray-300"
                    style={{
                      width: '20px',
                      borderColor: goalColor,
                      opacity: 0.3
                    }}
                  />
                </div>
              )}

              {/* Card */}
              <div className={`
                bg-white rounded-lg shadow-md p-4 flex-grow max-w-4xl
                ${item.level > 0 ? 'border-l-4' : ''}
              `}
                style={{
                  borderLeftColor: item.level > 0 ? hexToRgba(goalColor, opacity) : 'transparent'
                }}>
                <div className="flex items-center gap-6">
                  {/* Chart section */}
                  <div className="flex-shrink-0">
                    {hasProgressData ? (
                      <Chart
                        options={options}
                        series={series}
                        type="radialBar"
                        height={280}
                        width={280}
                      />
                    ) : (
                      <div className="w-[280px] h-[280px] flex items-center justify-center bg-gray-100 rounded-lg border-2 border-dashed border-gray-300">
                        <div className="text-center text-gray-500">
                          <p className="text-sm font-medium">No Progress Target</p>
                          <p className="text-xs mt-1">Hierarchical Display</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Info section */}
                  <div className="flex-grow">
                    <div className="flex items-center gap-2 mb-2">
                      <h3
                        className="text-lg font-bold"
                        style={{ color: goalColor }}
                      >
                        {item.name}
                      </h3>

                      {/* Level indicator */}
                      <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                        {item.type === "indicator" ? "MAIN" : `L${item.level}`}
                      </span>

                      {/* Info icon for indicators with descriptions */}
                      {item.type === "indicator" &&
                        indicatorDescriptions[`indicator-${item.goalIndicatorId}`] && (
                          <HiInformationCircle
                            className="w-5 h-5 text-gray-400 hover:text-gray-600 cursor-pointer transition-colors duration-200"
                            onClick={() =>
                              openDescriptionModal(
                                indicatorDescriptions[`indicator-${item.goalIndicatorId}`],
                                item.name,
                              )
                            }
                          />
                        )}

                      {/* Chart icon for items with annual data */}
                      {hasProgressData && annualData?.hasAnnualData && (
                        <HiChartBar
                          className="w-5 h-5 text-blue-500 hover:text-blue-700 cursor-pointer transition-colors duration-200"
                          onClick={() =>
                            openChartModal(
                              annualData,
                              item.name,
                              item.type
                            )
                          }
                          title="View Annual Progress Trend"
                        />
                      )}
                    </div>

                    {/* Description */}
                    {item.description && (
                      <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                    )}

                    {/* Progress info */}
                    {hasProgressData && (
                      <p
                        className="text-sm font-semibold"
                        style={{ color: goalColor }}
                      >
                        Target Progress: {progressPercentage}%
                      </p>
                    )}

                    {/* Annual data indicator */}
                    {hasProgressData && annualData?.hasAnnualData && (
                      <p className="text-xs text-blue-600 mt-1">
                        📊 {annualData.totalYears} years of trend data ({annualData.yearRange.start}-{annualData.yearRange.end})
                      </p>
                    )}

                    {/* Type info */}
                    <p className="text-xs text-gray-500 mt-1">
                      {item.type === "indicator"
                        ? "Main Indicator"
                        : `Sub-indicator (Level ${item.level})`}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {isModalOpen && selectedModalData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-800">
                {modalType === 'description' ? (
                  <>Indicator Notes: {selectedModalData.indicatorName}</>
                ) : (
                  <>Annual Progress Trend: {selectedModalData.indicatorName}</>
                )}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <HiXCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[70vh]">
              {modalType === 'description' ? (
                <>
                  <div className="prose prose-sm max-w-none">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {selectedModalData.explanation}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-500">
                      <span className="font-medium">Created:</span>{" "}
                      {new Date(selectedModalData.created_at).toLocaleDateString(
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
                </>
              ) : (
                <>
                  {/* Line Chart */}
                  {selectedModalData.annualData?.hasAnnualData ? (
                    <>
                      <div className="mb-4">
                        <Chart
                          options={getLineChartOptions(selectedModalData.indicatorName, selectedModalData.annualData)}
                          series={[{
                            name: 'Progress (%)',
                            data: selectedModalData.annualData.annualProgress.map((item: any) => item.progressPercentage)
                          }]}
                          type="line"
                          height={350}
                        />
                      </div>

                      {/* Data Summary */}
                      <div className="mt-6 pt-4 border-t border-gray-200">
                        <h4 className="text-lg font-semibold mb-3" style={{ color: goalColor }}>
                          Trend Summary
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Total Years</p>
                            <p className="text-lg font-bold text-gray-800">{selectedModalData.annualData.totalYears}</p>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Year Range</p>
                            <p className="text-lg font-bold text-gray-800">
                              {selectedModalData.annualData.yearRange.start}-{selectedModalData.annualData.yearRange.end}
                            </p>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Latest Progress</p>
                            <p className="text-lg font-bold" style={{ color: goalColor }}>
                              {selectedModalData.annualData.annualProgress[selectedModalData.annualData.annualProgress.length - 1]?.progressPercentage.toFixed(1)}%
                            </p>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Growth Trend</p>
                            <p className="text-lg font-bold text-green-600">
                              {(() => {
                                const first = selectedModalData.annualData.annualProgress[0]?.progressPercentage || 0;
                                const last = selectedModalData.annualData.annualProgress[selectedModalData.annualData.annualProgress.length - 1]?.progressPercentage || 0;
                                const growth = last - first;
                                return growth >= 0 ? `+${growth.toFixed(1)}%` : `${growth.toFixed(1)}%`;
                              })()}
                            </p>
                          </div>
                        </div>

                        {/* Detailed Data Table */}
                        <div className="overflow-x-auto">
                          <table className="min-w-full bg-white border border-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Target</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress %</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {selectedModalData.annualData.annualProgress.map((yearData: any, idx: number) => (
                                <tr key={yearData.year} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                  <td className="px-4 py-2 text-sm font-medium text-gray-900">{yearData.year}</td>
                                  <td className="px-4 py-2 text-sm text-gray-600">{yearData.value.toFixed(2)}</td>
                                  <td className="px-4 py-2 text-sm text-gray-600">{yearData.targetValue.toFixed(2)}</td>
                                  <td className="px-4 py-2 text-sm font-semibold" style={{ color: goalColor }}>
                                    {yearData.progressPercentage.toFixed(1)}%
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-12">
                      <div className="text-gray-400 mb-4">
                        <HiChartBar className="w-16 h-16 mx-auto" />
                      </div>
                      <h4 className="text-lg font-semibold text-gray-600 mb-2">No Annual Historical Data</h4>
                      <p className="text-gray-500">
                        This {selectedModalData.indicatorType} does not have multiple years of data for trend analysis.
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>

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
