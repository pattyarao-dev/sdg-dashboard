"use client"
import { useEffect, useState } from "react";
import { DashboardProcessedGoal } from "@/types/dashboard.types";
import Link from "next/link";
import dynamic from 'next/dynamic';

// Dynamic import to avoid SSR issues
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

export default function MainDashboard({ goals }: { goals: DashboardProcessedGoal[] }) {
  const [goalProgress, setGoalProgress] = useState<{ [key: number]: number }>({});
  const [loading, setLoading] = useState(true);

  const sdgColors = [
    '#E5243B', // Goal 1: No Poverty
    '#DDA63A', // Goal 2: Zero Hunger
    '#4C9F38', // Goal 3: Good Health and Well-being
    '#C5192D', // Goal 4: Quality Education
    '#FF3A21', // Goal 5: Gender Equality
    '#26BDE2', // Goal 6: Clean Water and Sanitation
    '#FCC30B', // Goal 7: Affordable and Clean Energy
    '#A21942', // Goal 8: Decent Work and Economic Growth
    '#FD6925', // Goal 9: Industry, Innovation and Infrastructure
    '#DD1367', // Goal 10: Reduced Inequalities
    '#FD9D24', // Goal 11: Sustainable Cities and Communities
    '#BF8B2E', // Goal 12: Responsible Consumption and Production
    '#3F7E44', // Goal 13: Climate Action
    '#0A97D9', // Goal 14: Life Below Water
    '#56C02B', // Goal 15: Life on Land
    '#00689D', // Goal 16: Peace, Justice and Strong Institutions
    '#19486A'  // Goal 17: Partnerships for the Goals
  ];

  const baseOptions = {
    chart: {
      height: 360,
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
            offsetY: 70,
            fontSize: '22px',
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

  // Fetch progress data for all goals
  useEffect(() => {
    const fetchGoalProgress = async () => {
      setLoading(true);

      try {
        const progressPromises = goals.map(async (goal) => {
          try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/goal_progress/${goal.goalId}`);
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return {
              goalId: goal.goalId,
              progress: Math.round(data.averageProgress || 0)
            };
          } catch (error) {
            console.error(`Error fetching progress for goal ${goal.goalId}:`, error);
            return { goalId: goal.goalId, progress: 0 };
          }
        });

        const results = await Promise.all(progressPromises);
        const progressMap = results.reduce((acc, result) => {
          acc[result.goalId] = result.progress;
          return acc;
        }, {} as { [key: number]: number });

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
      {goals.map((goal, index) => {
        const goalColor = sdgColors[goal.goalId - 1] || sdgColors[0];

        // Get dynamic progress for this goal
        const progressPercentage = goalProgress[goal.goalId] || 0;
        const series = [progressPercentage];

        // Format the goal ID to match your file naming (E_WEB_01.png, E_WEB_02.png, etc.)
        const goalIdFormatted = goal.goalId.toString().padStart(2, '0');
        const sdgImagePath = `/sdg_images/E_WEB_${goalIdFormatted}.png`;

        const options = {
          ...baseOptions,
          title: {
            text: goal.goalName,
            align: 'center' as const,
            offsetY: 310, // Move title to bottom
            style: {
              fontSize: '16px',
              fontWeight: 'bold',
              color: goalColor
            }
          },
          colors: [goalColor],
          fill: {
            colors: [goalColor]
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
              }
            }
          }
        };

        return (
          <Link key={goal.goalId || index} href={`/dashboard/goalprogress/${goal.goalId}`}>
            <div className="relative">
              <Chart
                options={options}
                series={series}
                type="radialBar"
                height={350}
              />
            </div>
          </Link>
        );
      })}
    </>
  );
}
