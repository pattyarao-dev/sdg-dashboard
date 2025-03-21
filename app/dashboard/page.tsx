"use client"

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Goal } from '@/types/dashboard.types';
import { useRouter } from 'next/navigation';
import { TimeFilter } from "@/components/TimeFilter";
import GaugeChart from '@/components/GaugeChart';
import dynamic from 'next/dynamic';

// Dynamically import the ChoroplethMap component with no SSR
const ChoroplethMapNoSSR = dynamic(
  () => import('@/components/ChoroplethMap').then(mod => mod.default || mod),
  { ssr: false }
);

const Dashboard: React.FC = () => {
  const [filters, setFilters] = useState({
    year: new Date().getFullYear(),
    month: null,
    location: null,
    goal_id: null,
    project_id: null,
    indicator_id: null, 
    sub_indicator_id: null 
  });
  const [data, setData] = useState([]);
  const [allGoals, setAllGoals] = useState<Goal[]>([]);
  const [goalSummaries, setGoalSummaries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [goalsLoading, setGoalsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'table' | 'map'>('map'); // Default to map view
  const [locations, setLocations] = useState<string[]>([]);

  // New states for drill-down functionality
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [indicatorsLoading, setIndicatorsLoading] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [projectContributions, setProjectContributions] = useState([]);

  // Fetch all goals initially
  useEffect(() => {
    const fetchAllGoals = async () => {
      setGoalsLoading(true);
      try {
        const response = await axios.get('http://localhost:8000/api/indicators/goals');
        setAllGoals(response.data.data);
      } catch (error) {
        console.error('Error fetching goals:', error);
      } finally {
        setGoalsLoading(false);
      }
    };

    fetchAllGoals();
  }, []);

  // Fetch indicators when a goal is selected
  useEffect(() => {
    const fetchIndicators = async () => {
      if (!filters.goal_id) {
        setIndicators([]);
        return;
      }
      
      setIndicatorsLoading(true);
      try {
        const response = await axios.get(`http://localhost:8000/api/indicators/api/indicators/${filters.goal_id}`, {
        });
        setIndicators(response.data.data);
      } catch (error) {
        console.error('Error fetching indicators:', error);
      } finally {
        setIndicatorsLoading(false);
      }
    };

    fetchIndicators();
  }, [filters.goal_id]);

  // Fetch projects and their contributions when an indicator is selected
  useEffect(() => {
    const fetchProjects = async () => {
      if (!filters.indicator_id && !filters.sub_indicator_id) {
        setProjects([]);
        setProjectContributions([]);
        return;
      }
      
      setProjectsLoading(true);
      try {
        // Build query params for projects
        const params = {};
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== null) {
            params[key] = value;
          }
        });
        
        // Fetch projects related to the selected indicator/sub-indicator
        const response = await axios.get('http://localhost:8000/api/projects', { params });
        setProjects(response.data.data);
        
        // Fetch project contributions to this indicator
        const contributionsResponse = await axios.get('http://localhost:8000/api/indicators/project-contribution', { params });
        setProjectContributions(contributionsResponse.data.contributions);
      } catch (error) {
        console.error('Error fetching projects data:', error);
      } finally {
        setProjectsLoading(false);
      }
    };

    fetchProjects();
  }, [filters.indicator_id, filters.sub_indicator_id, filters.year, filters.month, filters.location]);

  // Fetch locations
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/locations');
        setLocations(response.data.data.map((loc: any) => loc.name));
      } catch (error) {
        console.error('Error fetching locations:', error);
        // Fallback - extract locations from GeoJSON if available
        fetch('/pasigcity.0.01.json')
          .then(response => response.json())
          .then(data => {
            const extractedLocations = data.features.map((feature: any) => feature.properties.NAME_3);
            setLocations([...new Set(extractedLocations)]);
          })
          .catch(err => console.error('Error extracting locations from GeoJSON:', err));
      }
    };

    fetchLocations();
  }, []);

  // Fetch data based on filters
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Build query params
        const params = {};
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== null) {
            params[key] = value;
          }
        });

        // Fetch indicator values
        const response = await axios.get('http://localhost:8000/api/indicators/values', { params });
        setData(response.data.data);

        // Fetch goal summaries
        const goalSummaryResponse = await axios.get('http://localhost:8000/api/indicators/goal-summary', { params });
        setGoalSummaries(goalSummaryResponse.data.data);

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filters]);

  const handleTimeFilterChange = (year: number | null, month: number | null) => {
    setFilters(prev => ({
      ...prev,
      year,
      month
    }));
  };

  const handleFilterChange = (name: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleGoalFilterChange = (goal_id: number | null) => {
    // Reset indicator and sub-indicator when changing goal
    setFilters(prev => ({
      ...prev,
      goal_id,
      indicator_id: null,
      sub_indicator_id: null
    }));
  };

  const handleIndicatorSelect = (indicator_id: number | null) => {
    // Reset sub-indicator when changing indicator
    setFilters(prev => ({
      ...prev,
      indicator_id,
      sub_indicator_id: null
    }));
  };

  const handleSubIndicatorSelect = (sub_indicator_id: number | null) => {
    setFilters(prev => ({
      ...prev,
      sub_indicator_id
    }));
  };

  const handleLocationSelect = (locationName: string | null) => {
    setFilters(prev => ({
      ...prev,
      location: locationName
    }));
  };

  const handleProjectSelect = (project_id: number | null) => {
    setFilters(prev => ({
      ...prev,
      project_id
    }));
  };

  // SDG goal colors
  const goalColors = {
    1: "#E5243B",
    2: "#DDA63A", 
    3: "#4C9F38", 
    4: "#C5192D", 
    5: "#FF3A21", 
    6: "#26BDE2", 
    7: "#FCC30B", 
    8: "#A21942", 
    9: "#FD6925",
    10: "#DD1367", 
    11: "#FD9D24", 
    12: "#BF8B2E", 
    13: "#3F7E44", 
    14: "#0A97D9", 
    15: "#56C02B", 
    16: "#00689D", 
    17: "#19486A", 
  };

  // Gets current goal color
  const getCurrentGoalColor = () => {
    if (!filters.goal_id) return "#666666";
    return goalColors[filters.goal_id as keyof typeof goalColors];
  };

  // Function to generate random colors for project pie chart
  const getProjectColors = (count: number) => {
    const baseColor = getCurrentGoalColor();
    const colors = [];
    
    // Create variations of the base color
    for (let i = 0; i < count; i++) {
      const hueShift = (i * 30) % 360;
      colors.push(shiftHue(baseColor, hueShift));
    }
    return colors;
  };

  // Helper function to shift hue of a hex color
  const shiftHue = (hex: string, deg: number) => {
    // Very simplified version - in real code, use a proper color manipulation library
    return hex; // Placeholder - would actually shift the hue in a real implementation
  };

 // Helper to get selected indicator or sub-indicator name
  const getSelectedIndicatorName = () => {
    if (filters.sub_indicator_id) {
      // Look through your indicators data to find the one containing this sub-indicator
      const indicator = indicators.find(ind => 
        ind.sub_indicators && ind.sub_indicators.some(sub => 
          sub.sub_indicator_id === filters.sub_indicator_id
        )
      );
      
      if (indicator && indicator.sub_indicators) {
        const subIndicator = indicator.sub_indicators.find(
          sub => sub.sub_indicator_id === filters.sub_indicator_id
        );
        
        if (subIndicator) {
          return `${subIndicator.sub_indicator_id || ''}: ${subIndicator.name || ''}`;
        }
      }
    }
    
    if (filters.indicator_id) {
      // Find the indicator in your indicators array
      const indicator = indicators.find(
        ind => ind.indicator_id === filters.indicator_id
      );
      
      if (indicator) {
        return `${indicator.indicator_id || ''}: ${indicator.name || indicator.indicator_name || ''}`;
      }
    }
    
    return 'All Indicators';
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">LGU SDG Dashboard</h1>
      
      {/* TimeFilter component */}
      <TimeFilter 
        onFilterChange={handleTimeFilterChange}
        initialYear={filters.year}
        initialMonth={filters.month}
      />
      
      <div className="filters mt-4 flex flex-wrap items-center">
        {/* Only show location dropdown in table view */}
        {viewMode === 'table' && (
          <select 
            value={filters.location || ''}
            onChange={e => handleFilterChange('location', e.target.value ? e.target.value : null)}
            className="border border-gray-300 rounded-md p-2 bg-white mr-2"
          >
            <option value="">All Locations</option>
            {locations.map(location => (
              <option key={location} value={location}>{location}</option>
            ))}
          </select>
        )}
        
        {/* View mode toggle */}
        <div className="ml-auto">
          <button 
            onClick={() => setViewMode('table')}
            className={`px-4 py-2 rounded-l-md transition-colors ${viewMode === 'table' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            Table
          </button>
          <button 
            onClick={() => setViewMode('map')}
            className={`px-4 py-2 rounded-r-md transition-colors ${viewMode === 'map' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            Map
          </button>
        </div>
      </div>

      {/* Active filters display */}
      <div className="mt-2 flex flex-wrap items-center gap-2">
        {filters.location && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Location: {filters.location}
            <button 
              onClick={() => handleFilterChange('location', null)}
              className="ml-1.5 inline-flex text-blue-400 hover:text-blue-600"
            >
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </span>
        )}
        
        {filters.goal_id && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Goal: {filters.goal_id}
            <button 
              onClick={() => handleGoalFilterChange(null)}
              className="ml-1.5 inline-flex text-blue-400 hover:text-blue-600"
            >
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </span>
        )}
        
        {filters.indicator_id && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Indicator: {indicators.find(i => i.indicator_id === filters.indicator_id)?.indicator_code}
            <button 
              onClick={() => handleIndicatorSelect(null)}
              className="ml-1.5 inline-flex text-blue-400 hover:text-blue-600"
            >
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </span>
        )}
        
        {filters.sub_indicator_id && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Sub-Indicator: {
              indicators.find(i => 
                i.sub_indicators?.some(s => s.sub_indicator_id === filters.sub_indicator_id)
              )?.sub_indicators?.find(s => 
                s.sub_indicator_id === filters.sub_indicator_id
              )?.sub_indicator_code
            }
            <button 
              onClick={() => handleSubIndicatorSelect(null)}
              className="ml-1.5 inline-flex text-blue-400 hover:text-blue-600"
            >
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </span>
        )}
      </div>

      {/* SDG Goal Gauges - shows only if no indicator is selected */}
      {!filters.indicator_id && !filters.sub_indicator_id && (
        <div className="mb-8 mt-6">
          <h2 className="text-xl font-semibold mb-4">Goals Progress Overview</h2>
          
          {goalsLoading ? (
            <p>Loading goals...</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {allGoals
                .sort((a, b) => a.goal_id - b.goal_id) // Sort goals by ID
                .map(goal => (
                  <GaugeChart 
                    key={goal.goal_id}
                    goal_id={goal.goal_id}
                    title={`${goal.goal_id}. ${goal.name}`}
                    color={goal.color || goalColors[goal.goal_id as keyof typeof goalColors]}
                    isActive={filters.goal_id === goal.goal_id}
                    onFilterChange={handleGoalFilterChange}
                    year={filters.year}
                    month={filters.month}
                    location={filters.location}
                    project_id={filters.project_id}
                    defaultValue={0}
                  />
                ))}
            </div>
          )}
        </div>
      )}

      {/* Indicators List - Shows when a goal is selected */}
      {filters.goal_id && !filters.indicator_id && !filters.sub_indicator_id && (
        <div className="mt-6 mb-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              Goal {filters.goal_id} Indicators
            </h2>
            <button 
              onClick={() => handleGoalFilterChange(null)}
              className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded-md text-sm transition-colors"
            >
              Back to All Goals
            </button>
          </div>
          
          {indicatorsLoading ? (
            <p className="my-4">Loading indicators...</p>
          ) : indicators.length === 0 ? (
            <p className="my-4 text-gray-600">No indicators found for this goal.</p>
          ) : (
            <div className="mt-4 space-y-4">
              {indicators.map(indicator => (
                <div 
                  key={indicator.indicator_id} 
                  className="border rounded-md p-4 bg-white hover:shadow-md transition-shadow"
                >
                  <div 
                    className="cursor-pointer"
                    onClick={() => handleIndicatorSelect(indicator.indicator_id)}
                  >
                    <h3 className="text-lg font-medium flex items-center">
                      <span 
                        className="w-3 h-3 rounded-full mr-2" 
                        style={{ backgroundColor: getCurrentGoalColor() }}
                      ></span>
                      {indicator.indicator_code}: {indicator.name}
                    </h3>
                    <p className="text-gray-600 mt-1">{indicator.description || 'No description available.'}</p>
                  </div>
                  
                  {/* Sub-indicators with indent */}
                  {indicator.sub_indicators && indicator.sub_indicators.length > 0 && (
                    <div className="mt-3 pl-5 border-l-2 space-y-2" style={{ borderColor: getCurrentGoalColor() }}>
                      <p className="text-sm text-gray-500 font-medium">Sub-indicators:</p>
                      {indicator.sub_indicators.map(subInd => (
                        <div 
                          key={subInd.sub_indicator_id} 
                          className="py-2 px-3 bg-gray-50 rounded hover:bg-gray-100 cursor-pointer"
                          onClick={() => handleSubIndicatorSelect(subInd.sub_indicator_id)}
                        >
                          <p className="font-medium">{subInd.sub_indicator_code}: {subInd.name}</p>
                          {subInd.description && (
                            <p className="text-sm text-gray-600 mt-1">{subInd.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Project Contributions - Shows when an indicator/sub-indicator is selected */}
      {(filters.indicator_id || filters.sub_indicator_id) && (
        <div className="mt-6 mb-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              {getSelectedIndicatorName()}
            </h2>
            <button 
              onClick={() => filters.indicator_id ? handleIndicatorSelect(null) : handleSubIndicatorSelect(null)}
              className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded-md text-sm transition-colors"
            >
              Back to {filters.indicator_id ? `Goal ${filters.goal_id} Indicators` : 'Indicator'}
            </button>
          </div>
          
          {projectsLoading ? (
            <p className="my-4">Loading projects data...</p>
          ) : (
            <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Projects Contribution Pie Chart */}
              <div className="border rounded-lg p-4 bg-white shadow-sm">
                <h3 className="text-lg font-medium mb-4">Project Contributions</h3>
                {projectContributions.length > 0 ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={projectContributions}
                          dataKey="contribution"
                          nameKey="project_name"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label={({name, percent}) => `${name}: ${(percent * 100).toFixed(1)}%`}
                        >
                          {projectContributions.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={getProjectColors(projectContributions.length)[index % getProjectColors(projectContributions.length).length]} 
                            />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `${value}%`} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="text-center text-gray-500 my-10">No project contribution data available</p>
                )}
              </div>
              
              {/* Projects List */}
              <div className="border rounded-lg p-4 bg-white shadow-sm">
                <h3 className="text-lg font-medium mb-4">Projects</h3>
                {projects.length > 0 ? (
                  <div className="overflow-y-auto max-h-64">
                    <table className="min-w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="py-2 px-3 text-left text-sm font-medium text-gray-500">Project</th>
                          <th className="py-2 px-3 text-right text-sm font-medium text-gray-500">Value</th>
                          <th className="py-2 px-3 text-right text-sm font-medium text-gray-500">Contribution</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {projects.map(project => {
                          const contribution = projectContributions.find(p => p.project_id === project.project_id);
                          return (
                            <tr 
                              key={project.project_id} 
                              className="hover:bg-gray-50 cursor-pointer"
                              onClick={() => handleProjectSelect(project.project_id)}
                            >
                              <td className="py-2 px-3 text-sm">{project.name}</td>
                              <td className="py-2 px-3 text-sm text-right">{project.value || '-'}</td>
                              <td className="py-2 px-3 text-sm text-right">
                                {contribution ? `${contribution.contribution}%` : '-'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-center text-gray-500 my-10">No projects found for this indicator</p>
                )}
              </div>
            </div>
          )}
          
          {/* Recorded Values Table */}
          <div className="mt-6 border rounded-lg p-4 bg-white shadow-sm">
            <h3 className="text-lg font-medium mb-4">Recorded Values</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-2 px-4 text-left text-sm font-medium text-gray-500">Date</th>
                    <th className="py-2 px-4 text-left text-sm font-medium text-gray-500">Location</th>
                    <th className="py-2 px-4 text-left text-sm font-medium text-gray-500">Project</th>
                    <th className="py-2 px-4 text-right text-sm font-medium text-gray-500">Value</th>
                    <th className="py-2 px-4 text-left text-sm font-medium text-gray-500">Source</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {data.length > 0 ? (
                    data.map(item => (
                      <tr key={item.value_id} className="hover:bg-gray-50">
                        <td className="py-2 px-4 text-sm">{new Date(item.measurement_date).toLocaleDateString()}</td>
                        <td className="py-2 px-4 text-sm">{item.location}</td>
                        <td className="py-2 px-4 text-sm">{item.project_name || '-'}</td>
                        <td className="py-2 px-4 text-sm text-right">{item.value}</td>
                        <td className="py-2 px-4 text-sm">{item.source || '-'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-4 text-center text-gray-500">No data available for the selected filters</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Map or Table View - Only show if no indicator is selected */}
      {!filters.indicator_id && !filters.sub_indicator_id && (
        <>
          {loading ? (
            <p className="text-center my-8">Loading data...</p>
          ) : (
            <>
              {viewMode === 'table' ? (
                <div className="overflow-x-auto mt-6">
                  <table className="min-w-full bg-white border border-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="py-2 px-4 border-b text-left">Goal</th>
                        <th className="py-2 px-4 border-b text-left">Indicator</th>
                        <th className="py-2 px-4 border-b text-left">Value</th>
                        <th className="py-2 px-4 border-b text-left">Date</th>
                        <th className="py-2 px-4 border-b text-left">Location</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.length > 0 ? (
                        data.map(item => (
                          <tr key={item.value_id} className="hover:bg-gray-50">
                            <td className="py-2 px-4 border-b">{item.goal_name}</td>
                            <td className="py-2 px-4 border-b">{item.indicator_name}</td>
                            <td className="py-2 px-4 border-b">{item.value}</td>
                            <td className="py-2 px-4 border-b">{new Date(item.measurement_date).toLocaleDateString()}</td>
                            <td className="py-2 px-4 border-b">{item.location}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="py-4 text-center text-gray-500">No data available for the selected filters</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="mt-6">
                  <h2 className="text-xl font-semibold mb-4">
                    {filters.goal_id ? `Goal ${filters.goal_id} Geographic Performance` : 'Geographic Performance Overview'}
                    <span className="text-sm font-normal ml-2 text-gray-600">(Click on a location to filter data)</span>
                  </h2>
                  <ChoroplethMapNoSSR 
                    filters={filters} 
                    height="600px" 
                    onLocationSelect={handleLocationSelect}
                  />
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}

export default Dashboard;

























































// import React, { useEffect, useState, useMemo, useCallback, use } from "react";
// import { useRouter } from 'next/navigation';
// import GaugeChart from "@/components/GaugeChart";
// import LineChart from "@/components/LineChart";
// import { ProgressBarList } from "@/components/ProgressBarChart";
// import ScoreCard from "@/components/ScoreCardChart";
// import { 
//   transformSDGData, 
//   calculateSummaryMetrics, 
//   calculateOverallProgress, 
//   getMostRecentValue, 
//   getAllIndicatorsData,
//   // New utility functions
//   getProjectContributionToGoal,
//   getProjectContributionPercentage
// } from "@/utils/transformSDGData";
// import { GoAlert } from "react-icons/go";

// // SDG colors
// const sdgColors = {
//   "No Poverty": "#E5243B",
//   "Zero Hunger": "#DDA63A",
//   "Good Health and Well-being": "#4C9F38",
//   "Quality Education": "#C5192D",
//   "Gender Equality": "#FF3A21",
//   "Clean Water and Sanitation": "#26BDE2",
//   "Affordable and Clean Energy": "#FCC30B",
//   "Decent Work and Economic Growth": "#A21942",
//   "Industry, Innovation and Infrastructure": "#FD6925",
//   "Reduced Inequalities": "#DD1367",
//   "Sustainable Cities and Communities": "#FD9D24",
//   "Responsible Consumption and Production": "#BF8B2E",
//   "Climate Action": "#3F7E44",
//   "Life Below Water": "#0A97D9",
//   "Life on Land": "#56C02B",
//   "Peace, Justice and Strong Institutions": "#00689D",
//   "Partnerships for the Goals": "#19486A",
// };

// const projectStatusColors = {
//   "Completed": "#4C9F38", // Green
//   "In Progress": "#FCC30B", // Yellow
//   "At Risk": "#E5243B", // Red
// };

// // Indicator colors
// const indicatorColors = [
//   "#E5243B", "#26BDE2", "#4C9F38", "#FD6925", "#FF3A21", "#FCC30B",
//   "#A21942", "#DD1367", "#56C02B", "#00689D", "#3F7E44", "#0A97D9",
//   "#BF8B2E", "#FD9D24", "#DDA63A", "#C5192D", "#19486A"
// ];

// // Month names array
// const monthNames = [
//   'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
//   'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
// ];

// interface DashboardSDG {
//   goal_id: number;
//   title: string;
//   indicators: Array<{
//     name: string;
//     current: Array<{
//       date: string;
//       value?: number;
//       current?: number;
//     }>;
//     target: number | number[];
//     achievement_percentage?: number;
//     sub_indicators?: Array<{
//       name: string;
//       current: Array<{
//         date: string;
//         value?: number;
//         current?: number;
//       }>;
//       target: number;
//       achievement_percentage?: number;
//     }>;
//   }>;
//   global_current_value: Array<{
//     date: string;
//     value?: number;
//   }>;
//   projects?: Array<{
//     id: string;
//     name: string;
//   }>;
// }

// interface Project {
//   id: string;
//   name: string;
//   status: string;
//   completion: number;
//   sdgContributions?: Array<{
//     goalId: number;
//     contribution: number;
//   }>;
//   indicators?: Array<{
//     name: string;
//     current: Array<{
//       date: string;
//       value: number;
//     }>;
//     progress?: number;
//     target?: number;
//     sub_indicators?: Array<{
//       name: string;
//       current: Array<{
//         date: string;
//         value: number;
//       }>;
//       progress?: number;
//       target?: number;
//     }>;
//   }>;
// }

// interface DateFilterProps {
//   availableYears: string[];
//   availableMonths: string[];
//   selectedYear: string | null;
//   selectedMonth: string | null;
//   onYearChange: (year: string | null) => void;
//   onMonthChange: (month: string | null) => void;
//   onResetFilters: () => void;
// }

// // Project Filter Component
// const ProjectFilter = React.memo(({ 
//   availableProjects, 
//   selectedProject, 
//   onProjectChange,
//   onClearProject
// }) => (
//   <div className="mb-6 p-4 bg-gray-50 rounded-lg">
//     <div className="flex items-center">
//       <div className="flex-grow">
//         <label htmlFor="project-filter" className="block text-sm font-medium text-gray-700 mb-1">Filter by Project</label>
//         <select 
//           id="project-filter"
//           value={selectedProject || "all"} 
//           onChange={(e) => onProjectChange(e.target.value === "all" ? null : e.target.value)}
//           className="w-full border border-gray-300 rounded-md p-2 bg-white"
//         >
//           <option value="all">All Projects</option>
//           {availableProjects.map(project => (
//             <option key={project.id} value={project.id}>{project.name}</option>
//           ))}
//         </select>
//       </div>
      
//       {selectedProject && (
//         <button 
//           onClick={onClearProject}
//           className="ml-4 mt-6 px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
//         >
//           Clear
//         </button>
//       )}
//     </div>
//   </div>
// ));

// // SDG Gauges component
// const SDGGauges = React.memo(({ sdgData, selectedGoalId, onGaugeClick, selectedProject }) => {
//   // Filter goals based on selected project if applicable
//   const displayedGoals = selectedProject 
//     ? sdgData.filter(goal => goal.projects?.some(p => p.id === selectedProject))
//     : sdgData;
  
//   return (
//     <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
//       {displayedGoals.map((goal) => {
//         // Calculate progress considering project filter if applicable
//         const progress = selectedProject 
//           ? calculateOverallProgress(goal, selectedProject) 
//           : calculateOverallProgress(goal);
        
//         return (
//           <div 
//             key={goal.goal_id}
//             className={`cursor-pointer transition-all duration-200 ${selectedGoalId === goal.goal_id ? 'scale-110 shadow-lg' : 'hover:scale-105'}`}
//             onClick={() => onGaugeClick(goal.goal_id)}
//           >
//             <div className="text-center mb-2 font-medium text-sm">
//               SDG {goal.goal_id}: {goal.title}
//             </div>
//             <GaugeChart 
//               value={progress}
//               min={0}
//               max={100}
//               title=""
//               color={sdgColors[goal.title] || "blue"}
//             />
//             {selectedProject && (
//               <div className="text-center mt-1 text-xs text-gray-600">
//                 Project contribution
//               </div>
//             )}
//           </div>
//         );
//       })}
      
//       {displayedGoals.length === 0 && (
//         <div className="col-span-full text-center p-6 bg-gray-50 rounded-lg">
//           <p className="text-gray-500">No SDG data available for the selected project.</p>
//         </div>
//       )}
//     </div>
//   );
// });

// // Project List component with enhancement
// const ProjectList = React.memo(({ 
//   projects, 
//   onSelectProject, 
//   selectedProject, 
//   selectedGoalId = null,
//   projectFilters = {}
// }) => {
//   // Apply filters if provided
//   let displayProjects = [...projects];
  
//   // Filter by status if specified
//   if (projectFilters.status) {
//     displayProjects = displayProjects.filter(p => p.status === projectFilters.status);
//   }
  
//   // Filter by SDG if specified
//   if (projectFilters.sdgId && !selectedGoalId) {
//     displayProjects = displayProjects.filter(p => 
//       p.sdgContributions && p.sdgContributions.some(s => s.goalId === projectFilters.sdgId)
//     );
//   }
  
//   // Sort by contribution percentage if viewing in SDG context
//   if (selectedGoalId) {
//     displayProjects.sort((a, b) => {
//       const aContrib = a.sdgContributions?.find(s => s.goalId === selectedGoalId)?.contribution || 0;
//       const bContrib = b.sdgContributions?.find(s => s.goalId === selectedGoalId)?.contribution || 0;
//       return bContrib - aContrib;
//     });
//   } else {
//     // Otherwise sort by overall completion
//     displayProjects.sort((a, b) => b.completion - a.completion);
//   }

//   return (
//     <div className="bg-white rounded-lg shadow overflow-hidden">
//       <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
//         <h3 className="text-lg font-medium text-gray-900">
//           {selectedGoalId ? `Projects Contributing to SDG ${selectedGoalId}` : "Projects Overview"}
//         </h3>
//       </div>
//       <ul className="divide-y divide-gray-200">
//         {displayProjects.length > 0 ? (
//           displayProjects.map((project) => {
//             // Calculate contribution for this specific SDG if in SDG context
//             const contribution = selectedGoalId 
//               ? project.sdgContributions?.find(s => s.goalId === selectedGoalId)?.contribution || 0
//               : project.completion;
            
//             const contributionLabel = selectedGoalId 
//               ? `Contribution to SDG ${selectedGoalId}: ${contribution.toFixed(1)}%`
//               : `Overall completion: ${contribution.toFixed(1)}%`;
            
//             return (
//               <li 
//                 key={project.id} 
//                 className={`px-4 py-3 hover:bg-gray-50 cursor-pointer ${
//                   selectedProject === project.id ? 'bg-blue-50' : ''
//                 }`}
//                 onClick={() => onSelectProject(project.id)}
//               >
//                 <div className="flex items-center justify-between">
//                   <div className="flex-1">
//                     <div className="flex items-center">
//                       <h4 className="text-sm font-medium">{project.name}</h4>
//                       <span 
//                         className="ml-2 px-2 py-1 text-xs rounded-full" 
//                         style={{ 
//                           backgroundColor: projectStatusColors[project.status] || "#ccc",
//                           color: project.status === "Completed" ? "white" : "black" 
//                         }}
//                       >
//                         {project.status}
//                       </span>
//                     </div>
//                     <p className="text-xs text-gray-500">{contributionLabel}</p>
                    
//                     {!selectedGoalId && project.sdgContributions && (
//                       <div className="flex flex-wrap gap-1 mt-1">
//                         {project.sdgContributions
//                           .sort((a, b) => b.contribution - a.contribution)
//                           .slice(0, 3)
//                           .map(sdg => (
//                             <span 
//                               key={sdg.goalId} 
//                               className="inline-block px-2 py-1 text-xs rounded-full text-white"
//                               style={{ backgroundColor: sdgColors[`SDG ${sdg.goalId}`] || "#777" }}
//                             >
//                               SDG {sdg.goalId}: {sdg.contribution.toFixed(0)}%
//                             </span>
//                           ))}
//                         {project.sdgContributions.length > 3 && (
//                           <span className="inline-block px-2 py-1 text-xs rounded-full bg-gray-200">
//                             +{project.sdgContributions.length - 3} more
//                           </span>
//                         )}
//                       </div>
//                     )}
//                   </div>
//                   <div 
//                     className="w-3 h-3 rounded-full"
//                     style={{ backgroundColor: contribution > 70 ? '#4C9F38' : contribution > 30 ? '#FCC30B' : '#E5243B' }}
//                   ></div>
//                 </div>
//               </li>
//             );
//           })
//         ) : (
//           <li className="px-4 py-3 text-sm text-gray-500">No projects found</li>
//         )}
//       </ul>
//     </div>
//   );
// });

// // Summary Cards component
// const SummaryCards = React.memo(({ 
//   summaryMetrics, 
//   selectedGoalId, 
//   selectedGoalData,
//   selectedProject = null
// }) => (
//   <>
//     <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
//       <ScoreCard 
//         title="Overall Progress" 
//         value={`${summaryMetrics.overallProgress}%`}
//         subtitle={
//           selectedProject ? "For selected project" :
//           selectedGoalId ? `For SDG ${selectedGoalId}` : 
//           "All SDGs"
//         }
//         color={selectedGoalData ? sdgColors[selectedGoalData.title] : "#19486A"}
//       />
//       <ScoreCard 
//         title="On Track Indicators" 
//         value={`${summaryMetrics.onTrackIndicators}/${summaryMetrics.totalIndicators}`}
//         subtitle="≥ 75% of target achieved"
//         color="#4C9F38" // Green
//       />
//       <ScoreCard 
//         title="At Risk Indicators" 
//         value={`${summaryMetrics.atRiskIndicators}/${summaryMetrics.totalIndicators}`}
//         subtitle="< 50% of target achieved"
//         color="#E5243B" // Red
//         />
//         </div>
        
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
//           <ScoreCard 
//             title="Total Metrics Tracked" 
//             value={summaryMetrics.totalIndicators + summaryMetrics.totalSubIndicators}
//             subtitle={`${summaryMetrics.totalIndicators} indicators, ${summaryMetrics.totalSubIndicators} sub-indicators`}
//             color="#19486A" // Dark blue
//           />
//           <ScoreCard 
//             title="Most Improved" 
//             value={summaryMetrics.mostImprovedIndicator.name}
//             subtitle={`+${summaryMetrics.mostImprovedIndicator.improvement.toFixed(1)}% (${summaryMetrics.mostImprovedIndicator.goalTitle})`}
//             color="#56C02B" // Green
//           />
//           <ScoreCard 
//             title="Needs Attention" 
//             value={summaryMetrics.leastImprovedIndicator.name}
//             subtitle={`${summaryMetrics.leastImprovedIndicator.improvement.toFixed(1)}% (${summaryMetrics.leastImprovedIndicator.goalTitle})`}
//             color="#FD9D24" // Orange
//           />
//         </div>
//       </>
//     ));
    
//     // Indicator Progress Bar List component
//     const IndicatorProgressBars = React.memo(({ 
//       indicators, 
//       onSelectIndicator, 
//       colorOffset = 0, 
//       selectedIndicator,
//       sourceProject = null
//     }) => (
//       <ProgressBarList 
//         items={indicators.map((indicator, index) => {
//           const colorIndex = (index + colorOffset) % indicatorColors.length;
          
//           // Create label that includes project source if available
//           const projectLabel = sourceProject ? ` (${sourceProject})` : '';
//           const itemLabel = indicator.label || indicator.name;
//           const label = sourceProject ? `${itemLabel}${projectLabel}` : itemLabel;
          
//           return {
//             label: label,
//             progress: indicator.progress || getMostRecentValue(indicator.current),
//             target: typeof indicator.target === "number" ? indicator.target : indicator.target[0],
//             onClick: onSelectIndicator ? () => onSelectIndicator(indicator.name) : undefined,
//             color: indicatorColors[colorIndex],
//             selected: selectedIndicator === indicator.name,
//             source: indicator.source || null // Keep track of data source (project)
//           };
//         })}
//       />
//     ));
    
//     // Project Contribution Chart component - NEW
//     const ProjectContributionChart = React.memo(({ 
//       projectContributions = [], 
//       goalTitle = "", 
//       goalId = null 
//     }) => {
//       if (!projectContributions || projectContributions.length === 0) {
//         return (
//           <div className="p-4 bg-gray-50 rounded-md text-gray-600">
//             No project contribution data available.
//           </div>
//         );
//       }
    
//       // Sort contributions by percentage
//       const sortedContributions = [...projectContributions].sort((a, b) => b.contribution - a.contribution);
      
//       return (
//         <div className="bg-white p-4 rounded-lg shadow">
//           <h3 className="text-lg font-semibold mb-3">
//             {goalId ? `Project Contributions to SDG ${goalId}` : "Project Contributions by SDG"}
//           </h3>
          
//           <div className="space-y-3">
//             {sortedContributions.map((item, index) => (
//               <div key={item.projectId || index} className="relative">
//                 <div className="flex justify-between mb-1 text-sm">
//                   <span>{item.projectName}</span>
//                   <span>{item.contribution.toFixed(1)}%</span>
//                 </div>
//                 <div className="w-full bg-gray-200 rounded-full h-2.5">
//                   <div 
//                     className="h-2.5 rounded-full" 
//                     style={{ 
//                       width: `${Math.min(item.contribution, 100)}%`,
//                       backgroundColor: goalId ? sdgColors[goalTitle] : indicatorColors[index % indicatorColors.length]
//                     }}></div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       );
//     });

// // Helper function to extract all unique years and months from data
// const extractDateOptions = (sdgData) => {
//   const years = new Set();
//   const months = new Set();
  
//   sdgData.forEach(goal => {
//     goal.indicators.forEach(indicator => {
//       indicator.current.forEach(dataPoint => {
//         if (dataPoint.date) {
//           const [year, month] = dataPoint.date.split('-');
//           years.add(year);
//           if (month) {
//             months.add(month);
//           }
//         }
//       });
      
//       if (indicator.sub_indicators) {
//         indicator.sub_indicators.forEach(subInd => {
//           subInd.current.forEach(dataPoint => {
//             if (dataPoint.date) {
//               const [year, month] = dataPoint.date.split('-');
//               years.add(year);
//               if (month) {
//                 months.add(month);
//               }
//             }
//           });
//         });
//       }
//     });
//   });
  
//   return {
//     years: Array.from(years).sort(),
//     months: Array.from(months).sort()
//   };
// };

// // Helper function to filter data by date
// const filterDataByDate = (data, selectedYear, selectedMonth) => {
//   if (!selectedYear && !selectedMonth) return data;
  
//   const monthIndex = selectedMonth ? monthNames.indexOf(selectedMonth) + 1 : null;
//   const monthStr = monthIndex ? String(monthIndex).padStart(2, '0') : null;
  
//   // Create a deep copy of the data to avoid mutating the original
//   const filteredData = JSON.parse(JSON.stringify(data));
  
//   filteredData.forEach(goal => {
//     // Filter indicator data
//     goal.indicators.forEach(indicator => {
//       indicator.current = indicator.current.filter(dataPoint => {
//         const [year, month] = dataPoint.date.split('-');
//         return (
//           (!selectedYear || year === selectedYear) && 
//           (!monthStr || month === monthStr)
//         );
//       });
      
//       // Recalculate achievement percentage based on filtered data
//       if (indicator.current.length > 0) {
//         const latestValue = getMostRecentValue(indicator.current);
//         indicator.achievement_percentage = Math.min(
//           Math.round((latestValue / indicator.target) * 100),
//           100
//         );
//       }
      
//       // Filter sub-indicators data if they exist
//       if (indicator.sub_indicators) {
//         indicator.sub_indicators.forEach(subInd => {
//           subInd.current = subInd.current.filter(dataPoint => {
//             const [year, month] = dataPoint.date.split('-');
//             return (
//               (!selectedYear || year === selectedYear) && 
//               (!monthStr || month === monthStr)
//             );
//           });
          
//           // Recalculate achievement percentage based on filtered data
//           if (subInd.current.length > 0) {
//             const latestValue = getMostRecentValue(subInd.current);
//             subInd.achievement_percentage = Math.min(
//               Math.round((latestValue / subInd.target) * 100),
//               100
//             );
//           }
//         });
//       }
//     });
    
//     // Filter goal's global values
//     goal.global_current_value = goal.global_current_value.filter(dataPoint => {
//       const [year, month] = dataPoint.date.split('-');
//       return (
//         (!selectedYear || year === selectedYear) && 
//         (!monthStr || month === monthStr)
//       );
//     });
//   });
  
//   return filteredData;
// };

// // Main Dashboard Component
// const Dashboard: React.FC = () => {
//   const router = useRouter();
//   const [sdgData, setSdgData] = useState<DashboardSDG[]>([]);
//   const [filteredSdgData, setFilteredSdgData] = useState<DashboardSDG[]>([]);
//   const [selectedGoalId, setSelectedGoalId] = useState<number | null>(null);
//   const [selectedIndicator, setSelectedIndicator] = useState<string>("");
//   const [loading, setLoading] = useState<boolean>(true);
//   const [selectedProject, setSelectedProject] = useState<string | null>(null);
//   const [selectedProjectIndicator, setSelectedProjectIndicator] = useState<string | null>(null);
  
//   // Date filter states
//   const [selectedYear, setSelectedYear] = useState<string | null>(null);
//   const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  
//   // Extract date options once when data loads
//   const dateOptions = useMemo(() => {
//     return sdgData.length > 0 ? extractDateOptions(sdgData) : { years: [], months: [] };
//   }, [sdgData]);

//   // Fetch data only once at component mount
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setLoading(true);
//         const transformedData = await transformSDGData();
//         setSdgData(transformedData);
//         setFilteredSdgData(transformedData);
//       } catch (error) {
//         console.error("Error fetching SDG data:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, []);
  
//   // Apply filters when date selection changes
//   useEffect(() => {
//     if (sdgData.length > 0) {
//       const filtered = filterDataByDate(sdgData, selectedYear, selectedMonth);
//       setFilteredSdgData(filtered);
//     }
//   }, [sdgData, selectedYear, selectedMonth]);

//   // Memoize selected goal data
//   const selectedGoalData = useMemo(() => 
//     filteredSdgData.find((goal) => goal.goal_id === selectedGoalId) || null, 
//     [filteredSdgData, selectedGoalId]
//   );
  
//   // Memoize summary metrics calculation 
//   const summaryMetrics = useMemo(() => 
//     calculateSummaryMetrics(filteredSdgData, selectedGoalData),
//     [filteredSdgData, selectedGoalData]
//   );
  
//   // Memoize indicators data
//   const allIndicatorsData = useMemo(() => 
//     getAllIndicatorsData(filteredSdgData, sdgColors),
//     [filteredSdgData]
//   );

//   // Memoize event handlers
//   const handleGaugeClick = useCallback((goalId: number) => {
//     router.push(`/dashboard/${goalId}`);
//   }, [router]);

//   const handleSelectIndicator = useCallback((indicatorName: string) => {
//     setSelectedIndicator(prevIndicator => prevIndicator === indicatorName ? "" : indicatorName);
//   }, []);
  
//   const handleYearChange = useCallback((year: string | null) => {
//     setSelectedYear(year);
//     if (!year) setSelectedMonth(null);
//   }, []);
  
//   const handleMonthChange = useCallback((month: string | null) => {
//     setSelectedMonth(month);
//   }, []);
  
//   const handleResetFilters = useCallback(() => {
//     setSelectedYear(null);
//     setSelectedMonth(null);
//   }, []);

//   const handleProjectSelect = useCallback((projectId: string) => {
//     setSelectedProject(prev => prev === projectId ? null : projectId);
//     setSelectedProjectIndicator(null);
//   }, []);
  
//   const handleProjectIndicatorSelect = useCallback((indicatorName) => {
//     setSelectedProjectIndicator(prev => prev === indicatorName ? null : indicatorName);
//   }, []);

//   // Memoize filtered performance indicators
//   const topPerformingIndicators = useMemo(() => 
//     allIndicatorsData
//       .sort((a, b) => b.achievement_percentage - a.achievement_percentage)
//       .slice(0, 5),
//     [allIndicatorsData]
//   );

//   const needAttentionIndicators = useMemo(() => 
//     allIndicatorsData
//       .sort((a, b) => a.achievement_percentage - b.achievement_percentage)
//       .slice(0, 5),
//     [allIndicatorsData]
//   );

//   // New memoized project data
//   const projectData = useMemo(() => {
//     if (!selectedGoalId || !selectedProject || !sdgData) return null;
    
//     return getProjectContributionToGoal(
//       parseInt(selectedProject), // Convert string ID to number
//       selectedGoalId,
//       sdgData
//     );
//   }, [selectedGoalId, selectedProject, sdgData]);

// // Project level indicators
// const projectIndicators = useMemo(() => {
//   if (!projectData || !projectData.indicators) return [];
//   return projectData.indicators.map(indicator => ({
//     ...indicator,
//     label: `${indicator.name} (Project: ${projectData.name})`
//   }));
// }, [projectData]);

// // Project sub-indicators
// const projectSubIndicators = useMemo(() => {
//   if (!projectData || !selectedProjectIndicator) return [];
  
//   const indicator = projectData.indicators?.find(ind => ind.name === selectedProjectIndicator);
  
//   return indicator?.sub_indicators?.map(subInd => ({
//     ...subInd,
//     label: `${subInd.name} (${projectData.name})`
//   })) || [];
// }, [projectData, selectedProjectIndicator]);

//   // Memoize chart data
//   const selectedGoalChartData = useMemo(() => {
//     if (!selectedGoalData) return [];
    
//     // If an indicator is selected, only show that indicator in the chart
//     if (selectedIndicator) {
//       const selectedIndicatorObj = selectedGoalData.indicators.find(ind => ind.name === selectedIndicator);
//       if (!selectedIndicatorObj) return [];
      
//       return [{
//         x: selectedIndicatorObj.current.map(item => item.date),
//         y: selectedIndicatorObj.current.map(item => 'value' in item ? item.value : item.current),
//         type: "scatter",
//         mode: "lines+markers",
//         marker: { color: indicatorColors[0] },
//         line: { color: indicatorColors[0] },
//         name: selectedIndicatorObj.name,
//       }];
//     }
    
//     // Otherwise, show all indicators
//     return selectedGoalData.indicators.map((indicator, index) => {
//       const colorIndex = index % indicatorColors.length;
//       return {
//         x: indicator.current.map(item => item.date),
//         y: indicator.current.map(item => 'value' in item ? item.value : item.current),
//         type: "scatter",
//         mode: "lines+markers",
//         marker: { color: indicatorColors[colorIndex] },
//         line: { color: indicatorColors[colorIndex] },
//         name: indicator.name,
//       };
//     });
//   }, [selectedGoalData, selectedIndicator]);

//   // Memoize sub-indicator chart data for the selected indicator
//   const selectedSubIndicatorsChartData = useMemo(() => {
//     if (!selectedGoalData || !selectedIndicator) return [];
    
//     const selectedIndicatorObj = selectedGoalData.indicators.find(ind => ind.name === selectedIndicator);
//     if (!selectedIndicatorObj || !selectedIndicatorObj.sub_indicators) return [];
    
//     return selectedIndicatorObj.sub_indicators.map((subInd, index) => {
//       const colorIndex = (index + 3) % indicatorColors.length; // Offset to use different colors
//       return {
//         x: subInd.current.map(item => item.date),
//         y: subInd.current.map(item => 'value' in item ? item.value : item.current),
//         type: "scatter",
//         mode: "lines+markers",
//         marker: { color: indicatorColors[colorIndex] },
//         line: { color: indicatorColors[colorIndex] },
//         name: subInd.name,
//       };
//     });
//   }, [selectedGoalData, selectedIndicator]);

//   // Memoize overall SDG progress for LineChart
//   const overallSDGChartData = useMemo(() => {
//     return filteredSdgData.map((goal, index) => {
//       // Extract unique years and calculate averages
//       const allDates = goal.indicators.flatMap(ind => 
//         ind.current
//           .filter(item => item?.date) // Ensure item and item.date exist
//           .map(item => item.date.split('-')[0]) 
//       );
  
//       const uniqueYears = [...new Set(allDates)].sort();
  
//       const yearlyAverages = uniqueYears.map(year => {
//         const yearData = goal.indicators.flatMap(ind => 
//           ind.current
//             .filter(item => item?.date?.startsWith(year)) // Ensure date exists
//             .map(item => ('value' in item ? item.value : item.current))
//         );
  
//         return yearData.length > 0 
//           ? yearData.reduce((sum, val) => sum + val, 0) / yearData.length 
//           : 0;
//       });
      
//       const goalColor = sdgColors[goal.title] || indicatorColors[index % indicatorColors.length];
      
//       return {
//         x: uniqueYears,
//         y: yearlyAverages,
//         type: "scatter",
//         mode: "lines+markers",
//         marker: { color: goalColor },
//         line: { color: goalColor },
//         name: `SDG ${goal.goal_id}: ${goal.title}`,
//       };
//     });
//   }, [filteredSdgData]);

//   const renderProjectView = () => {
//     if (!projectData || !projectData.indicators) {
//       return (
//         <div className="mt-6">
//           <div className="flex items-center gap-4 mb-6">
//             <h2 className="text-xl font-semibold">
//               Project: {selectedProject}
//             </h2>
//             <button 
//               onClick={() => setSelectedProject(null)}
//               className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded-md"
//             >
//               Clear Selection
//             </button>
//           </div>
//           <div className="p-6 bg-gray-50 rounded-lg">
//             <p className="text-gray-600">No data available for this project and SDG combination.</p>
//           </div>
//         </div>
//       );
//     }
  
//     return (
//       <div className="mt-6">
//         <div className="flex items-center gap-4 mb-6">
//           <h2 className="text-xl font-semibold">
//             Project: {projectData?.name}
//           </h2>
//           <button 
//             onClick={() => setSelectedProject(null)}
//             className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded-md"
//           >
//             Clear Selection
//           </button>
//         </div>
    
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//           {/* Project Indicators */}
//           <div>
//             <h3 className="text-lg font-semibold mb-3">
//               Project Indicators
//               {selectedProjectIndicator && (
//                 <button 
//                   onClick={() => setSelectedProjectIndicator(null)}
//                   className="ml-2 text-sm text-blue-600 hover:text-blue-800"
//                 >
//                   (Back to all indicators)
//                 </button>
//               )}
//             </h3>
            
//             {selectedProjectIndicator ? (
//               projectSubIndicators.length > 0 ? (
//                 <IndicatorProgressBars 
//                   indicators={projectSubIndicators}
//                   colorOffset={3}
//                 />
//               ) : (
//                 <div className="p-4 bg-gray-50 rounded-md text-gray-600">
//                   No sub-indicators available for this indicator.
//                 </div>
//               )
//             ) : (
//               projectIndicators.length > 0 ? (
//                 <IndicatorProgressBars 
//                   indicators={projectIndicators}
//                   onSelectIndicator={handleProjectIndicatorSelect}
//                   selectedIndicator={selectedProjectIndicator}
//                 />
//               ) : (
//                 <div className="p-4 bg-gray-50 rounded-md text-gray-600">
//                   No indicators available for this project.
//                 </div>
//               )
//             )}
//           </div>
    
//           {/* Project Charts */}
//           <div>
//             <h3 className="text-lg font-semibold mb-3">
//               {selectedProjectIndicator 
//                 ? `${selectedProjectIndicator} Progress`
//                 : 'Project Indicators Progress'}
//             </h3>
            
//             <LineChart 
//               data={selectedProjectIndicator
//                 ? projectSubIndicators.map((subInd, idx) => ({
//                     x: subInd.current.map(d => d.date),
//                     y: subInd.current.map(d => d.value),
//                     name: subInd.name,
//                     type: 'scatter',
//                     mode: 'lines+markers',
//                     marker: { color: indicatorColors[idx] },
//                     line: { color: indicatorColors[idx] }
//                   }))
//                 : projectIndicators.map((ind, idx) => ({
//                     x: ind.current.map(d => d.date),
//                     y: ind.current.map(d => d.value),
//                     name: ind.name,
//                     type: 'scatter',
//                     mode: 'lines+markers',
//                     marker: { color: indicatorColors[idx] },
//                     line: { color: indicatorColors[idx] }
//                   }))
//               }
//             />
//           </div>
//         </div>
    
//         {/* Project Contribution */}
//         <div className="mt-6">
//           <h3 className="text-lg font-semibold mb-3">
//             Project Contribution to SDG {selectedGoalId}
//           </h3>
//           <ProjectContributionChart 
//             projectContributions={[{
//               projectId: projectData.id,
//               projectName: projectData.name,
//               contribution: getProjectContributionPercentage(projectData.id, selectedGoalId) || 0
//             }]}
//             goalTitle={selectedGoalData?.title}
//             goalId={selectedGoalId}
//           />
//         </div>
//       </div>
//     );
//   };

//   if (loading) {
//     return <div className="p-6">Loading SDG data...</div>;
//   }

//   return (
//     <div className="p-6">
//       <h1 className="text-2xl font-bold mb-4">LGU SDG Dashboard</h1>
      
//       {/* Date Filter Component */}
//       <DateFilter 
//         availableYears={dateOptions.years} 
//         availableMonths={dateOptions.months}
//         selectedYear={selectedYear}
//         selectedMonth={selectedMonth}
//         onYearChange={handleYearChange}
//         onMonthChange={handleMonthChange}
//         onResetFilters={handleResetFilters}
//       />
      
//       {/* Summary Scorecards */}
//       <SummaryCards 
//         summaryMetrics={summaryMetrics} 
//         selectedGoalId={selectedGoalId} 
//         selectedGoalData={selectedGoalData} 
//       />
      
//       {/* SDG Goal Gauges */}
//       <div className="mb-8">
//         <h2 className="text-xl font-semibold mb-4">SDG Progress Overview</h2>
//         <SDGGauges 
//           sdgData={filteredSdgData}
//           selectedGoalId={selectedGoalId}
//           onGaugeClick={handleGaugeClick}
//           selectedProject={selectedProject}
//         />
//       </div>
  
//       {selectedGoalId ? (
//         <>
//           <h2 className="text-xl font-semibold mb-4">
//             Details for SDG {selectedGoalId}: {selectedGoalData?.title}
//             {selectedIndicator && ` → ${selectedIndicator}`}
//           </h2>
          
//           {/* Add Project Filter */}
//           <ProjectFilter 
//             availableProjects={sdgData ? sdgData.flatMap(goal => 
//               goal.indicators.flatMap(indicator => 
//                 (indicator.contributingProjects || []).map(project => ({
//                   id: project.project_id,
//                   name: project.name,
//                   status: project.status
//                 }))
//               )
//             ).filter((p, i, self) => self.findIndex(t => t.id === p.id) === i) : []}
//             selectedProject={selectedProject}
//             onProjectChange={handleProjectSelect}
//             onClearProject={() => setSelectedProject(null)}
//           />

//           <div className="mt-6 mb-6">
//             <h3 className="text-lg font-semibold mb-3">Projects Contributing to SDG {selectedGoalId}</h3>
//             <ProjectList 
//               projects={selectedGoalData?.indicators.flatMap(indicator => 
//                 (indicator.contributingProjects || []).map(project => ({
//                   id: project.project_id.toString(),
//                   name: project.name,
//                   status: project.status,
//                   completion: project.contributionPercentage,
//                   sdgContributions: [{
//                     goalId: selectedGoalId,
//                     contribution: project.latestContribution
//                   }]
//                 }))
//               ).filter((p, i, self) => self.findIndex(t => t.id === p.id) === i) || []}
//               onSelectProject={handleProjectSelect}
//               selectedProject={selectedProject}
//               selectedGoalId={selectedGoalId}
//             />
//           </div>
  
//           {/* Render either project view or regular SDG view */}
//           {selectedProject ? renderProjectView() : (
//             <>
//               {/* Filter context indication */}
//               {(selectedYear || selectedMonth) && (
//                 <div className="mb-4 py-2 px-4 bg-blue-50 border border-blue-200 rounded-md inline-block">
//                   <span className="text-sm text-blue-800">
//                     {!selectedMonth && selectedYear && `Showing data for ${selectedYear}`}
//                     {selectedMonth && selectedYear && `Showing data for ${selectedMonth} ${selectedYear}`}
//                   </span>
//                 </div>
//               )}
                
//               {/* Two-column layout */}
//               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//                 {/* Indicators progress bars */}
//                 <div>
//                   <h3 className="text-lg font-semibold mb-3">
//                     {selectedIndicator ? `${selectedIndicator} Sub-Indicators` : "Indicators"}
//                     {selectedIndicator && (
//                       <button 
//                         onClick={() => setSelectedIndicator("")}
//                         className="ml-2 text-sm text-blue-600 hover:text-blue-800"
//                       >
//                         (Back to all indicators)
//                       </button>
//                     )}
//                   </h3>
                  
//                   {selectedIndicator ? (
//                     selectedGoalData && 
//                     selectedGoalData.indicators.find(ind => ind.name === selectedIndicator)?.sub_indicators?.length > 0 ? (
//                       <IndicatorProgressBars 
//                         indicators={selectedGoalData.indicators.find(ind => ind.name === selectedIndicator)?.sub_indicators || []}
//                         colorOffset={3}
//                       />
//                     ) : (
//                       <div className="p-4 bg-gray-50 rounded-md text-gray-600">
//                         No sub-indicator data available for {selectedIndicator}.
//                       </div>
//                     )
//                   ) : (
//                     selectedGoalData && selectedGoalData.indicators.length > 0 ? (
//                       <IndicatorProgressBars 
//                         indicators={selectedGoalData.indicators}
//                         onSelectIndicator={handleSelectIndicator}
//                         selectedIndicator={selectedIndicator}
//                       />
//                     ) : (
//                       <div className="p-4 bg-gray-50 rounded-md text-gray-600">
//                         No indicator data available for the selected time period.
//                       </div>
//                     )
//                   )}
//                 </div>
                
//                 {/* Line Chart */}
//                 <div>
//                   <h3 className="text-lg font-semibold mb-3">
//                     {selectedIndicator 
//                       ? `${selectedIndicator} Achievement Level` 
//                       : "Indicators Achievement Level Over Time"}
//                   </h3>
//                   {selectedGoalData && selectedGoalChartData.length > 0 ? (
//                     <LineChart data={selectedGoalChartData} />
//                   ) : (
//                     <div className="p-4 bg-gray-50 rounded-md text-gray-600">
//                       No time series data available for the selected time period.
//                     </div>
//                   )}
  
//                   {/* Sub-indicators Chart section */}
//                   {selectedIndicator && selectedSubIndicatorsChartData.length > 0 && (
//                     <div className="mt-6">
//                       <h3 className="text-lg font-semibold mb-3">Sub-indicators Achievement Level Over Time</h3>
//                       <LineChart data={selectedSubIndicatorsChartData} />
//                     </div>
//                   )}
//                 </div>
//               </div>
              
//               <button 
//                 onClick={() => {
//                   setSelectedGoalId(null);
//                   setSelectedIndicator("");
//                 }}
//                 className="mt-6 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
//               >
//                 Back to Overview
//               </button>
//             </>
//           )}
//         </>
//       ) : (
//         <>
//           {/* Overview layout */}
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
//             {/* Progress bars column */}
//             <div>
//               {/* Top Indicators */}
//               <div>
//                 <h2 className="text-lg font-semibold mb-3">Top Performing Indicators</h2>
//                 {topPerformingIndicators.length > 0 ? (
//                   <IndicatorProgressBars 
//                     indicators={topPerformingIndicators.map(indicator => ({
//                       ...indicator,
//                       label: `${indicator.name} (SDG ${indicator.goalId})`
//                     }))}
//                   />
//                 ) : (
//                   <div className="p-4 bg-gray-50 rounded-md text-gray-600">
//                     No indicator data available for the selected time period.
//                   </div>
//                 )}
//               </div>
              
//               {/* Bottom Indicators */}
//               <div className="mt-6">
//                 <h2 className="text-lg font-semibold mb-3">Needs Attention</h2>
//                 {needAttentionIndicators.length > 0 ? (
//                   <IndicatorProgressBars 
//                     indicators={needAttentionIndicators.map(indicator => ({
//                       ...indicator,
//                       label: `${indicator.name} (SDG ${indicator.goalId})`
//                     }))}
//                     colorOffset={5}
//                   />
//                 ) : (
//                   <div className="p-4 bg-gray-50 rounded-md text-gray-600">
//                     No indicator data available for the selected time period.
//                   </div>
//                 )}
//               </div>
//             </div>
            
//             {/* Line Chart column */}
//             <div>
//               <h2 className="text-lg font-semibold mb-3">Overall SDG Progress Over Time</h2>
//               {overallSDGChartData.length > 0 && overallSDGChartData.some(item => item.x.length > 0) ? (
//                 <LineChart data={overallSDGChartData} />
//               ) : (
//                 <div className="p-4 bg-gray-50 rounded-md text-gray-600">
//                   No time series data available for the selected time period.
//                 </div>
//               )}
//             </div>
//           </div>
//         </>
//       )}
//     </div>
//   )};

//   export default Dashboard;