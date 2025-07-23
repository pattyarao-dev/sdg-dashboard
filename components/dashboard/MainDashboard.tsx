"use client";
import { useEffect, useState } from "react";
import { DashboardProcessedGoal } from "@/types/dashboard.types";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Session } from "next-auth";

// Dynamic import to avoid SSR issues
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function MainDashboard({
  goals,
  session,
}: {
  goals: DashboardProcessedGoal[];
  session: Session;
}) {
  const [goalProgress, setGoalProgress] = useState<{ [key: number]: number }>(
    {},
  );
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  // const {data, status} = useSession()

  useEffect(() => {
    console.log(session);
  }, [session]);

  const sdgColors = [
    "#E5243B", // Goal 1: No Poverty
    "#DDA63A", // Goal 2: Zero Hunger
    "#4C9F38", // Goal 3: Good Health and Well-being
    "#C5192D", // Goal 4: Quality Education
    "#FF3A21", // Goal 5: Gender Equality
    "#26BDE2", // Goal 6: Clean Water and Sanitation
    "#FCC30B", // Goal 7: Affordable and Clean Energy
    "#A21942", // Goal 8: Decent Work and Economic Growth
    "#FD6925", // Goal 9: Industry, Innovation and Infrastructure
    "#DD1367", // Goal 10: Reduced Inequalities
    "#FD9D24", // Goal 11: Sustainable Cities and Communities
    "#BF8B2E", // Goal 12: Responsible Consumption and Production
    "#3F7E44", // Goal 13: Climate Action
    "#0A97D9", // Goal 14: Life Below Water
    "#56C02B", // Goal 15: Life on Land
    "#00689D", // Goal 16: Peace, Justice and Strong Institutions
    "#19486A", // Goal 17: Partnerships for the Goals
  ];

  const getProgressColor = (progressPercentage: number) => {
    if (progressPercentage >= 75) {
      return "#008018"; // Green for good progress (75%+)
    } else if (progressPercentage >= 50) {
      return "#FFA52C"; // Yellow for moderate progress (50-74%)
    } else {
      return "#FF0018"; // Red for poor progress (0-49%)
    }
  };

  const baseOptions = {
    chart: {
      height: 360,
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
            offsetY: 70,
            fontSize: "22px",
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

  // Export to PDF function
  const exportToPDF = async () => {
    setIsExporting(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/export_main_dashboard_pdf`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            goals,
            goalProgress,
            generatedBy: {
              userEmail: session.user.email,
            },
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`,
        );
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `sdg-goals-report-${new Date().toISOString().split("T")[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading PDF:", error);
      alert(
        `Failed to generate PDF: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    } finally {
      setIsExporting(false);
    }
  };

  // Fetch progress data for all goals
  useEffect(() => {
    const fetchGoalProgress = async () => {
      setLoading(true);

      try {
        const progressPromises = goals.map(async (goal) => {
          try {
            const response = await fetch(
              `${process.env.NEXT_PUBLIC_API_BASE_URL}/goal_progress/${goal.goalId}`,
            );
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return {
              goalId: goal.goalId,
              progress: Math.round(data.averageProgress || 0),
            };
          } catch (error) {
            console.error(
              `Error fetching progress for goal ${goal.goalId}:`,
              error,
            );
            return { goalId: goal.goalId, progress: 0 };
          }
        });

        const results = await Promise.all(progressPromises);
        const progressMap = results.reduce(
          (acc, result) => {
            acc[result.goalId] = result.progress;
            return acc;
          },
          {} as { [key: number]: number },
        );

        setGoalProgress(progressMap);
      } catch (error) {
        console.error("Error fetching goal progress data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (goals.length > 0) {
      fetchGoalProgress();
    } else {
      setLoading(false);
    }
  }, [goals]);

  console.log(goals);

  if (loading) {
    return (
      <div className="w-full flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">Loading goal progress...</div>
      </div>
    );
  }

  return (
    <>
      <div className="w-full h-full flex flex-col justify-center items-center">
        <div className="mb-6 flex flex-col sm:flex-row gap-4 sm:justify-between sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              SDG Goals Dashboard
            </h1>
            <p className="text-gray-600 text-sm mt-1">
              Track progress across {goals.length} Sustainable Development Goals
            </p>
          </div>
          {session ? (
            <button
              onClick={exportToPDF}
              disabled={
                isExporting || loading || Object.keys(goalProgress).length === 0
              }
              className="bg-blue-500 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors duration-200 shadow-sm"
            >
              {isExporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Generating PDF...
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Export PDF Report
                </>
              )}
            </button>
          ) : (
            ""
          )}
        </div>
        {/* Add Export Button */}

        {/* Goals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {goals.map((goal, index) => {
            const goalColor = sdgColors[goal.goalId - 1] || sdgColors[0];

            // Get dynamic progress for this goal
            const progressPercentage = goalProgress[goal.goalId] || 0;
            const series = [progressPercentage];

            // Format the goal ID to match your file naming (E_WEB_01.png, E_WEB_02.png, etc.)
            const goalIdFormatted = goal.goalId.toString().padStart(2, "0");
            const sdgImagePath = `/sdg_images/E_WEB_${goalIdFormatted}.png`;

            const options = {
              ...baseOptions,
              title: {
                text: goal.goalName,
                align: "center" as const,
                offsetY: 310, // Move title to bottom
                style: {
                  fontSize: "16px",
                  fontWeight: "bold",
                  color: goalColor, // Keep goal color for title
                },
              },
              colors: [getProgressColor(progressPercentage)], // Use progress-based color for chart
              fill: {
                colors: [getProgressColor(progressPercentage)], // Use progress-based color for fill
              },
              plotOptions: {
                ...baseOptions.plotOptions,
                radialBar: {
                  ...baseOptions.plotOptions.radialBar,
                  hollow: {
                    ...baseOptions.plotOptions.radialBar.hollow,
                    image: sdgImagePath,
                    imageWidth: 80,
                    imageHeight: 80,
                  },
                },
              },
            };

            return (
              <Link
                key={goal.goalId || index}
                href={`/dashboard/goalprogress/${goal.goalId}`}
                className="w-fit h-[400px]"
              >
                <div className="h-full relative hover:shadow-lg transition-shadow duration-200 rounded-lg overflow-hidden">
                  <Chart
                    options={options}
                    series={series}
                    type="radialBar"
                    height={400}
                  />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
