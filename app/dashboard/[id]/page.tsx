'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { 
    transformSDGData, 
    calculateSummaryMetrics, 
    calculateOverallProgress, 
    getMostRecentValue, 
    getAllIndicatorsData,
    // New utility functions
    getProjectContributionToGoal,
    getProjectContributionPercentage
  } from "@/utils/transformSDGData"; // Adjust import path as needed
import { DashboardSDG } from '@/utils/transformSDGData'; 
import { FaArrowLeft } from 'react-icons/fa';
import Link from 'next/link';

export default function GoalDetailPage() {
  const params = useParams();
  const goalId = typeof params.goalId === 'string' ? parseInt(params.goalId, 10) : null;
  
  const [goalData, setGoalData] = useState<DashboardSDG | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadGoalData() {
      if (!goalId) {
        setError('Invalid goal ID');
        setLoading(false);
        return;
      }
      
      try {
        const data = await setGoalData(goalId);
        setGoalData(data);
      } catch (err) {
        setError('Failed to load goal data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    
    loadGoalData();
  }, [goalId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !goalData) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-2xl font-bold text-red-500">Error</h1>
        <p className="text-lg">{error || 'Goal not found'}</p>
        <Link href="/dashboard" className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/dashboard" className="flex items-center text-blue-500 hover:text-blue-700">
          <FaArrowLeft className="mr-2" />
          Back to Dashboard
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex flex-col md:flex-row items-center md:items-start mb-8">
          <div className="w-40 h-40 md:mr-8 mb-4 md:mb-0">
            <CircularProgressbar
              value={goalData.overall_progress || 0}
              text={`${goalData.overall_progress || 0}%`}
              styles={buildStyles({
                pathColor: '#3B82F6',
                textColor: '#1F2937',
                trailColor: '#E5E7EB'
              })}
            />
          </div>
          
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">Goal {goalData.goal_id}: {goalData.goal_name}</h1>
            <p className="text-gray-600 mb-4">{goalData.goal_description || 'No description available'}</p>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded">
                <h3 className="font-semibold">Total Indicators</h3>
                <p className="text-2xl">{goalData.indicators?.length || 0}</p>
              </div>
              <div className="bg-green-50 p-4 rounded">
                <h3 className="font-semibold">Average Achievement</h3>
                <p className="text-2xl">{goalData.overall_progress || 0}%</p>
              </div>
            </div>
          </div>
        </div>
        
        <h2 className="text-2xl font-bold mb-4">Indicators</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-3 px-4 text-left">Indicator ID</th>
                <th className="py-3 px-4 text-left">Name</th>
                <th className="py-3 px-4 text-left">Achievement</th>
                <th className="py-3 px-4 text-left">Target</th>
                <th className="py-3 px-4 text-left">Achievement %</th>
              </tr>
            </thead>
            <tbody>
              {goalData.indicators?.map((indicator) => (
                <tr key={indicator.indicator_id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">{indicator.indicator_id}</td>
                  <td className="py-3 px-4">{indicator.indicator_name}</td>
                  <td className="py-3 px-4">{indicator.achievement}</td>
                  <td className="py-3 px-4">{indicator.target}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                        <div 
                          className="bg-blue-600 h-2.5 rounded-full" 
                          style={{ width: `${indicator.achievement_percentage}%` }}
                        ></div>
                      </div>
                      <span>{indicator.achievement_percentage}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}