"use client"
import { DashboardProcessedGoal } from "@/types/dashboard.types";
import Link from "next/link";
import dynamic from 'next/dynamic';

// Dynamic import to avoid SSR issues
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

export default function MainDashboard({ goals }: { goals: DashboardProcessedGoal[] }) {
  const series = [67];
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
      height: 350,
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
            fontSize: '22px'
          }
        }
      }
    },
    stroke: {
      lineCap: 'round' as const
    },
    labels: ['Progress'],
  };

  console.log(goals)

  return (
    <>
      {goals.map((goal, index) => {
        const goalColor = sdgColors[goal.goalId - 1] || sdgColors[0];

        // Format the goal ID to match your file naming (E_WEB_01.png, E_WEB_02.png, etc.)
        const goalIdFormatted = goal.goalId.toString().padStart(2, '0');
        const sdgImagePath = `/sdg_images/E_WEB_${goalIdFormatted}.png`;

        const options = {
          ...baseOptions,
          title: {
            text: goal.goalName,
            align: 'center' as const,
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
          <Link key={goal.goalId || index} href={`/dashboard/${goal.goalId}`}>
            <Chart
              options={options}
              series={series}
              type="radialBar"
              height={350}
            />
          </Link>
        );
      })}
    </>
  )
}
