"use client"

import { useEffect, useState } from "react";
import { DashboardProcessedGoal } from "@/types/dashboard.types";
import Link from "next/link";
import { IoTrophy } from "react-icons/io5";
import { TbStarsFilled } from "react-icons/tb";
import dynamic from 'next/dynamic';

// Dynamic import to avoid SSR issues
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

export default function HomeDashboard() {
  const [totalProgress, setTotalProgress] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  // Fetch total SDG progress
  useEffect(() => {
    const fetchTotalProgress = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/total_sdg_progress`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setTotalProgress(Math.round(data.totalSdgProgress || 0));
      } catch (error) {
        console.error("Error fetching total SDG progress:", error);
        setTotalProgress(0);
      } finally {
        setLoading(false);
      }
    };

    fetchTotalProgress();
  }, []);

  const series = [totalProgress];

  const chartOptions = {
    chart: {
      height: 400,
      type: 'radialBar' as const,
    },
    plotOptions: {
      radialBar: {
        hollow: {
          margin: 15,
          size: '60%',
          imageClipped: false
        },
        track: {
          background: '#f1f5f9',
          strokeWidth: '67%',
        },
        dataLabels: {
          name: {
            show: true,
            fontSize: '16px',
            fontWeight: 'bold',
            color: '#1e293b',
            offsetY: -10
          },
          value: {
            show: true,
            color: '#1e293b',
            offsetY: 10,
            fontSize: '32px',
            fontWeight: 'bold',
            formatter: function(val: string | number) {
              return parseInt(val.toString(), 10) + '%';
            }
          }
        }
      }
    },
    fill: {
      type: 'gradient',
      gradient: {
        shade: 'light',
        type: 'horizontal',
        shadeIntensity: 0.5,
        gradientToColors: ['#10b981', '#059669'], // Green gradient
        inverseColors: false,
        opacityFrom: 1,
        opacityTo: 1,
        stops: [0, 100]
      }
    },
    stroke: {
      lineCap: 'round' as const
    },
    labels: ['Overall SDG Progress'],
    colors: ['#34d399'], // Light green start
  };

  return (
    <>
      <div className="w-full flex justify-center mb-8">
        <p className="text-4xl font-bold uppercase text-gray-800">
          Indicators Data Progress Dashboard
        </p>
      </div>

      {/* Total SDG Progress Chart */}
      <div className="w-full flex justify-center mb-12">
        <div className="w-[400px] h-[450px] flex flex-col items-center justify-center bg-white rounded-xl shadow-lg border border-gray-200">
          {loading ? (
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
              <p className="text-gray-600">Loading SDG Progress...</p>
            </div>
          ) : (
            <>
              <Chart
                options={chartOptions}
                series={series}
                type="radialBar"
                height={350}
              />
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600 mb-1">
                  Progress across Baguio SDG Goals
                </p>
                <div className="flex items-center justify-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gradient-to-r from-green-400 to-green-600"></div>
                  <p className="text-xs text-gray-500">
                    Based on indicators and sub-indicators
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Navigation Cards */}
      <div className="w-full flex items-center justify-center gap-16">
        <Link href="/dashboard/projectprogress">
          <div className="w-[300px] h-[350px] px-6 flex flex-col items-center justify-center gap-4 text-center bg-gradient-to-br from-green-100/80 to-orange-100/80 rounded-lg hover:shadow-lg transition-shadow duration-300">
            <TbStarsFilled className="text-7xl text-gray-700" />
            <p className="text-xl uppercase font-black text-gray-800">
              Project Indicators Progress
            </p>
          </div>
        </Link>
        <Link href="/dashboard/goalprogress">
          <div className="w-[300px] h-[350px] px-6 flex flex-col items-center justify-center gap-4 text-center bg-gradient-to-br from-green-100/80 to-orange-100/80 rounded-lg hover:shadow-lg transition-shadow duration-300">
            <IoTrophy className="text-7xl text-gray-700" />
            <p className="text-xl uppercase font-black text-gray-800">
              Goal Indicators Progress
            </p>
          </div>
        </Link>
      </div>
    </>
  );
}
