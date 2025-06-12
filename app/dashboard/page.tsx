"use client"

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Goal } from '@/types/dashboard.types';
import { useRouter } from 'next/navigation';
import { TimeFilter } from "@/components/TimeFilter";
import GaugeChart from '@/components/GaugeChart';
import ProgressBar from '@/components/ProgressBar';
import ScoreCard from '@/components/ScoreCard';
import SDGLineChart from '@/components/LineChart';
import dynamic from 'next/dynamic';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import NotesPanel from '@/components/NotesPanel';

// Dynamically import the ChoroplethMap component with no SSR
// DYNAMIC IMPORT: ChoroplethMap is imported dynamically without SSR to avoid server-side rendering issues
// This is common for map components that depend on browser APIs
const ChoroplethMapNoSSR = dynamic(
  () => import('@/components/ChoroplethMap').then(mod => mod.default || mod),
  { ssr: false }
);

// TYPE DEFINITIONS: These should ideally be in separate type files
interface Indicator {
  indicator_id: number;
  indicator_code: string;
  name: string;
  indicator_name?: string;
  description?: string;
  current_value?: number;
  global_target_value?: number;
  global_baseline_value?: number;
  unit_of_measurement?: string;
  progress_direction?: 'up' | 'down';
  sub_indicators?: SubIndicator[];
}

interface SubIndicator {
  sub_indicator_id: number;
  sub_indicator_code: string;
  name: string;
  description?: string;
  current_value?: number;
  global_target_value?: number;
  global_baseline_value?: number;
  unit_of_measurement?: string;
  progress_direction?: 'up' | 'down';
}

interface Project {
  project_id: number;
  name: string;
  current_value?: number;
  project_target_value?: number;
  project_baseline_value?: number;
  progress_direction?: 'up' | 'down';
}

// FILTER STATE INTERFACE: Defines the structure of all possible filters
interface FilterState {
  year: number;
  month: number | null;
  location: string | null;
  goal_id: number | null;
  project_id: number | null;
  indicator_id: number | null;
  sub_indicator_id: number | null;
  timeScale?: string;
}

// NOTES CONTEXT INTERFACE: Defines different contexts for the notes panel
interface NotesContext {
  currentLevel: 'overview' | 'goal' | 'project' | 'indicator';
  goalId?: number;
  projectId?: number;
  indicatorId?: number;
}

const Dashboard: React.FC = () => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  
  // MAIN FILTER STATE: Controls all filtering across the dashboard
  // This is the central state that drives most data fetching and display logic
  const [filters, setFilters] = useState<FilterState>({
    year: new Date().getFullYear(),
    month: null,
    location: null,
    goal_id: null,
    project_id: null,
    indicator_id: null, 
    sub_indicator_id: null 
  });

  // DATA STATES: Store fetched data from various API endpoints
  const [data, setData] = useState([]); // Main indicator values data
  const [allGoals, setAllGoals] = useState<Goal[]>([]); // SDG goals master list
  const [goalSummaries, setGoalSummaries] = useState([]); // Goal-level summary statistics
  const [indicators, setIndicators] = useState<Indicator[]>([]); // Indicators for selected goal
  const [projects, setProjects] = useState<Project[]>([]); // Projects for selected indicator
  const [projectContributions, setProjectContributions] = useState([]); // Project contribution percentages
  const [locations, setLocations] = useState<string[]>([]); // Available locations

  // LOADING STATES: Track loading status for different data sections
  const [loading, setLoading] = useState(false); // Main data loading
  const [goalsLoading, setGoalsLoading] = useState(true); // Goals loading
  const [summaryLoading, setSummaryLoading] = useState(true); // Summary loading
  const [indicatorsLoading, setIndicatorsLoading] = useState(false); // Indicators loading
  const [projectsLoading, setProjectsLoading] = useState(false); // Projects loading

  // UI STATE: Controls view modes and interactions
  const [viewMode, setViewMode] = useState<'chart' | 'map'>('chart'); // Chart vs Map view toggle
  // const [notesContext, setNotesContext] = useState<NotesContext>({ // Notes panel context
  //   currentLevel: 'overview'
  // });

  // ============================================================================
  // CONFIGURATION AND CONSTANTS
  // ============================================================================
  
  // SDG GOAL COLORS: Official SDG color scheme mapping
  const goalColors = {
    1: "#E5243B",  // No Poverty
    2: "#DDA63A",  // Zero Hunger
    3: "#4C9F38",  // Good Health and Well-being
    4: "#C5192D",  // Quality Education
    5: "#FF3A21",  // Gender Equality
    6: "#26BDE2",  // Clean Water and Sanitation
    7: "#FCC30B",  // Affordable and Clean Energy
    8: "#A21942",  // Decent Work and Economic Growth
    9: "#FD6925",  // Industry, Innovation and Infrastructure
    10: "#DD1367", // Reduced Inequality
    11: "#FD9D24", // Sustainable Cities and Communities
    12: "#BF8B2E", // Responsible Consumption and Production
    13: "#3F7E44", // Climate Action
    14: "#0A97D9", // Life Below Water
    15: "#56C02B", // Life on Land
    16: "#00689D", // Peace and Justice Strong Institutions
    17: "#19486A", // Partnerships to achieve the Goal
  };

  // ============================================================================
  // DATA FETCHING EFFECTS
  // ============================================================================

  // FETCH ALL GOALS: Loads the master list of SDG goals on component mount
  // RELATIONSHIP: Goals -> Indicators -> Sub-indicators -> Projects
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

  // FETCH INDICATORS: Loads indicators when a goal is selected
  // RELATIONSHIP: Goal (1) -> Indicators (many) -> Sub-indicators (many)
  useEffect(() => {
    const fetchIndicators = async () => {
      if (!filters.goal_id) {
        setIndicators([]);
        return;
      }
      
      setIndicatorsLoading(true);
      try {
        const response = await axios.get(`http://localhost:8000/api/indicators/api/indicators/${filters.goal_id}`);
        setIndicators(response.data.data);
      } catch (error) {
        console.error('Error fetching indicators:', error);
      } finally {
        setIndicatorsLoading(false);
      }
    };

    fetchIndicators();
  }, [filters.goal_id]);

  // FETCH LOCATIONS: Loads available geographic locations
  // RELATIONSHIP: Locations are used to filter indicator values geographically
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/indicators/locations');
        setLocations(response.data.data.map((loc: any) => loc.name));
      } catch (error) {
        console.error('Error fetching locations:', error);
        // FALLBACK: Try to extract locations from GeoJSON file if API fails
        fetch('/baguiocity.json')
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

  // FETCH MAIN DATA: Loads indicator values based on current filters
  // RELATIONSHIP: This is the main data that populates charts, tables, and visualizations
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // BUILD QUERY PARAMS: Convert filter state to API parameters
        const params = {};
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== null) {
            params[key] = value;
          }
        });

        // FETCH INDICATOR VALUES: Main data for visualizations
        const response = await axios.get('http://localhost:8000/api/indicators/values', { params });
        setData(response.data.data);

        // FETCH GOAL SUMMARIES: Aggregate statistics per goal
        const goalSummaryResponse = await axios.get('http://localhost:8000/api/indicators/goal-summary', { params });
        setGoalSummaries(goalSummaryResponse.data.data);
        
        setSummaryLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filters]); // Refetch whenever filters change

  // FETCH PROJECTS: Loads projects when an indicator is selected
  // RELATIONSHIP: Indicator/Sub-indicator (1) -> Projects (many) -> Project Contributions (many)
  useEffect(() => {
    const fetchProjects = async () => {
      if (!filters.indicator_id && !filters.sub_indicator_id) {
        setProjects([]);
        setProjectContributions([]);
        return;
      }
      
      setProjectsLoading(true);
      try {
        const params = {};
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== null) {
            params[key] = value;
          }
        });
        
        // FETCH PROJECTS LIST
        const response = await axios.get('http://localhost:8000/api/indicators/projects', { params });
        const projectsData = response.data.data || [];
        
        // FETCH PROJECT CONTRIBUTIONS: How much each project contributes to the indicator
        const contributionsResponse = await axios.get('http://localhost:8000/api/indicators/project-contribution', { params });
        
        let flattenedContributions = [];
        let enhancedProjects = [...projectsData];
        
        // PROCESS CONTRIBUTIONS DATA: Navigate nested structure to find relevant contributions
        if (contributionsResponse.data && contributionsResponse.data.contributions) {
          const relevantGoal = contributionsResponse.data.contributions.find(
            goal => goal.goal_id === filters.goal_id
          );
          
          if (relevantGoal) {
            const relevantIndicator = relevantGoal.indicators.find(
              indicator => indicator.indicator_id === filters.indicator_id
            );
            
            if (relevantIndicator && relevantIndicator.projects) {
              // EXTRACT CONTRIBUTION PERCENTAGES
              flattenedContributions = relevantIndicator.projects.map(project => ({
                project_id: project.project_id,
                project_name: project.project_name,
                contribution: project.contribution_percentage || 0
              }));
              
              // ENHANCE PROJECTS WITH VALUES: Merge project data with contribution values
              enhancedProjects = projectsData.map(project => {
                const matchingContribution = relevantIndicator.projects.find(
                  p => p.project_id === project.project_id
                );
                
                return {
                  ...project,
                  current_value: matchingContribution?.project_value || null,
                  project_target_value: null,
                  project_baseline_value: 0,
                  progress_direction: 'up'
                };
              });
              
              // FETCH DETAILED PROJECT DATA: Get additional project-specific indicator details
              const projectDetailsPromises = enhancedProjects.map(async (project) => {
                try {
                  const detailsResponse = await axios.get(`http://localhost:8000/api/indicators/project-details/${project.project_id}`);
                  const projectDetails = detailsResponse.data;
                  
                  // EXTRACT PROJECT-SPECIFIC TARGETS AND BASELINES
                  let targetValue = null;
                  let baselineValue = 0;
                  let latestValue = null;
                  
                  if (projectDetails.goals) {
                    const goal = projectDetails.goals.find(g => g.goal_id === filters.goal_id);
                    if (goal && goal.indicators) {
                      const indicator = goal.indicators.find(i => 
                        i.indicator_name === relevantIndicator.indicator_name
                      );
                      
                      if (indicator) {
                        targetValue = indicator.project_target_value;
                        baselineValue = indicator.project_baseline_value || 0;
                        latestValue = indicator.latest_value;
                      }
                    }
                  }
                  
                  return {
                    ...project,
                    current_value: latestValue || project.current_value,
                    project_target_value: targetValue,
                    project_baseline_value: baselineValue
                  };
                } catch (error) {
                  console.error(`Error fetching details for project ${project.project_id}:`, error);
                  return project;
                }
              });
              
              const projectsWithDetails = await Promise.all(projectDetailsPromises);
              enhancedProjects = projectsWithDetails;
            }
          }
        }
        
        setProjects(enhancedProjects);
        setProjectContributions(flattenedContributions);
        
      } catch (error) {
        console.error('Error fetching projects data:', error);
      } finally {
        setProjectsLoading(false);
      }
    };

    fetchProjects();
  }, [filters.indicator_id, filters.sub_indicator_id, filters.goal_id]);

  // FETCH PROJECT DETAILS: Additional effect for when a specific project is selected
  useEffect(() => {
    const fetchProjectDetails = async () => {
      if (!filters.project_id) return;
      
      try {
        const response = await axios.get(`http://localhost:8000/api/indicators/project-details/${filters.project_id}`);
        console.log('Project details:', response.data);
        // This could be used to show project-specific information
      } catch (error) {
        console.error('Error fetching project details:', error);
      }
    };

    fetchProjectDetails();
  }, [filters.project_id]);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  // TIME FILTER HANDLER: Updates year and month filters
  // RELATIONSHIP: Connects TimeFilter component to main filter state
  const handleTimeFilterChange = (year: number | null, month: number | null) => {
    setFilters(prev => ({
      ...prev,
      year,
      month
    }));
  };

  // GENERIC FILTER HANDLER: Updates any filter property
  const handleFilterChange = (name: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // GOAL FILTER HANDLER: Handles goal selection and resets dependent filters
  // RELATIONSHIP: Goal -> Indicators -> Sub-indicators (cascade reset)
  const handleGoalFilterChange = (goal_id: number | null) => {
    setFilters(prev => ({
      ...prev,
      goal_id,
      indicator_id: null,      // Reset when goal changes
      sub_indicator_id: null   // Reset when goal changes
    }));
    
    // UPDATE NOTES CONTEXT: Change notes panel context based on selection
    // if (goal_id) {
    //   setNotesContext({ currentLevel: 'goal', goalId: goal_id });
    // } else {
    //   setNotesContext({ currentLevel: 'overview' });
    // }
  };

  // INDICATOR FILTER HANDLER: Handles indicator selection and resets sub-indicators
  // RELATIONSHIP: Indicator -> Sub-indicators (cascade reset)
  const handleIndicatorSelect = (indicator_id: number | null) => {
    setFilters(prev => ({
      ...prev,
      indicator_id,
      sub_indicator_id: null   // Reset when indicator changes
    }));
    
    // UPDATE NOTES CONTEXT
    if (indicator_id) {
      setNotesContext({ 
        currentLevel: 'indicator', 
        goalId: filters.goal_id!, 
        indicatorId: indicator_id 
      });
    } else {
      setNotesContext({ currentLevel: 'goal', goalId: filters.goal_id! });
    }
  };

  // SUB-INDICATOR FILTER HANDLER
  const handleSubIndicatorSelect = (sub_indicator_id: number | null) => {
    setFilters(prev => ({
      ...prev,
      sub_indicator_id
    }));
  };

  // LOCATION FILTER HANDLER: For geographic filtering
  const handleLocationSelect = (locationName: string | null) => {
    setFilters(prev => ({
      ...prev,
      location: locationName
    }));
  };

  // PROJECT FILTER HANDLER: For project-specific filtering
  const handleProjectSelect = (project_id: number | null) => {
    setFilters(prev => ({
      ...prev,
      project_id
    }));
    
    // UPDATE NOTES CONTEXT
    if (project_id) {
      setNotesContext({ 
        currentLevel: 'project', 
        goalId: filters.goal_id!, 
        projectId: project_id 
      });
    }
  };


 // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  // GET CURRENT GOAL COLOR: Returns the color for the currently selected goal
  const getCurrentGoalColor = () => {
    if (!filters.goal_id) return "#666666";
    return goalColors[filters.goal_id as keyof typeof goalColors];
  };

  // GENERATE PROJECT COLORS: Creates color variations for project visualizations
  const getProjectColors = (count: number) => {
    const baseColor = getCurrentGoalColor();
    const colors = [];
    
    // This is a simplified version - in production, use a proper color manipulation library
    for (let i = 0; i < count; i++) {
      const hueShift = (i * 30) % 360;
      colors.push(shiftHue(baseColor, hueShift));
    }
    return colors;
  };

  // SHIFT HUE: Helper function for color manipulation (simplified)
  const shiftHue = (hex: string, deg: number) => {
    // Placeholder - would actually shift the hue in a real implementation
    return hex;
  };

  // GET SELECTED INDICATOR NAME: Returns formatted name of currently selected indicator
  const getSelectedIndicatorName = () => {
    if (filters.sub_indicator_id) {
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
      const indicator = indicators.find(
        ind => ind.indicator_id === filters.indicator_id
      );
      
      if (indicator) {
        return `${indicator.indicator_id || ''}: ${indicator.name || indicator.indicator_name || ''}`;
      }
    }
    
    return 'All Indicators';
  };

  // FORMATTING HELPERS
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const formatNumber = (num: number, decimals = 1) => {
    if (num === undefined || num === null) return 'N/A';
    return num.toLocaleString(undefined, { 
      minimumFractionDigits: decimals, 
      maximumFractionDigits: decimals 
    });
  };

  // PLACEHOLDER FUNCTION: This needs to be implemented
  function handleGenerateReport(event: React.MouseEvent<HTMLButtonElement>) {
    console.log('Generate report functionality needs to be implemented');
    // TODO: Implement report generation logic
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">LGU SDG Dashboard</h1>
      
      <button 
      onClick={handleGenerateReport}
      className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded flex items-center"
    >
      <span className="mr-2">Generate Report</span>
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
      </svg>
      </button>

      {/* TimeFilter component */}
      <TimeFilter 
        onFilterChange={handleTimeFilterChange}
        initialYear={filters.year}
        initialMonth={filters.month}
      />
      
      <div className="filters mt-4 flex flex-wrap items-center">
        {/* Only show location dropdown in table view */}
        {viewMode === 'chart' && (
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
        {/* New time scale filter for the chart view */}
        {viewMode === 'chart' && (
          <select 
            value={filters.timeScale || 'monthly'}
            onChange={e => handleFilterChange('timeScale', e.target.value)}
            className="border border-gray-300 rounded-md p-2 bg-white mr-2"
          >
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="yearly">Yearly</option>
          </select>
        )}
        
        {/* View mode toggle */}
        <div className="ml-auto">
          <button 
            onClick={() => setViewMode('chart')}
            className={`px-4 py-2 rounded-l-md transition-colors ${viewMode === 'chart' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            Chart
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

      {/* Overall Summary Scorecards - displays when no goal is selected */}
      {!filters.goal_id && !filters.indicator_id && !filters.sub_indicator_id && (
        <div className="mt-6 mb-4">
          <h2 className="text-xl font-semibold mb-4">
            Overall Summary
          </h2>
          
          {summaryLoading ? (
            <p className="my-4">Loading summary data...</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <ScoreCard
                title="Total Goals Tracked"
                value={allGoals.length}
                subtitle="Sustainable Development Goals"
                color="#19486A" // SDG 17 color
              />
              <ScoreCard
                title="Total Measurements"
                value={data.length}
                subtitle={`In ${filters.year}${filters.month ? `, Month ${filters.month}` : ''}`}
                color="#4C9F38" // SDG 3 color
              />
              <ScoreCard
                title="Latest Update"
                value={data.length > 0 ? formatDate(data.sort((a, b) => 
                  new Date(b.measurement_date).getTime() - new Date(a.measurement_date).getTime()
                )[0]?.measurement_date) : 'No data'}
                subtitle="Most recent measurement"
                color="#FD9D24" // SDG 11 color
              />
              <ScoreCard
                title="Locations Tracked"
                value={locations.length}
                subtitle="Geographic coverage"
                color="#00689D" // SDG 16 color
              />
            </div>
          )}
        </div>
      )}

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
                  
                  {/* ProgressBar with dynamic target */}
                    <div className="mt-3">
                      <ProgressBar 
                        value={indicator.current_value || 0} 
                        target={indicator.global_target_value !== undefined ? indicator.global_target_value : 100}
                        baseline={indicator.global_baseline_value || 0}
                        showBaseline={true}
                        color={getCurrentGoalColor()}
                        // label="Progress"
                        valueSuffix={indicator.unit_of_measurement || ''}
                        targetSuffix={indicator.unit_of_measurement || ''}
                        indicatorType="indicator"
                        progressDirection={indicator.progress_direction || 'up'}
                        className="mt-2"
                      />
                    </div>
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

                          {/* ProgressBar for sub-indicators with dynamic target */}
                            <ProgressBar 
                              value={subInd.current_value || 0} 
                              target={subInd.global_target_value !== undefined ? subInd.global_target_value : 100}
                              baseline={subInd.global_baseline_value || 0}
                              color={getCurrentGoalColor()}
                              height="0.5rem"
                              valueSuffix={subInd.unit_of_measurement || ''}
                              targetSuffix={subInd.unit_of_measurement || ''}
                              indicatorType="sub-indicator"
                              progressDirection={subInd.progress_direction || 'up'}
                              showBaseline={false}
                              className="mt-2"
                            />
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

          {/* Line chart above the project contributions section */}
          <div className="mt-4 border rounded-lg p-4 bg-white shadow-sm">
            <SDGLineChart 
              data={data}
              height={350}
              goalId={filters.goal_id}
              indicatorId={filters.indicator_id}
              subIndicatorId={filters.sub_indicator_id}
              projectId={filters.project_id}
            />
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
                          
                          // Get project's target and baseline values for the current indicator/sub-indicator
                          const projectTarget = project.project_target_value !== undefined ? 
                            project.project_target_value : 
                            (filters.sub_indicator_id ? 
                              indicators.find(i => i.sub_indicators?.some(s => s.sub_indicator_id === filters.sub_indicator_id))
                                ?.sub_indicators?.find(s => s.sub_indicator_id === filters.sub_indicator_id)?.global_target_value : 
                              indicators.find(i => i.indicator_id === filters.indicator_id)?.global_target_value);
                          
                          const projectBaseline = project.project_baseline_value || 0;
                          
                          return (
                            <tr 
                              key={project.project_id} 
                              className="hover:bg-gray-50 cursor-pointer"
                              onClick={() => handleProjectSelect(project.project_id)}
                            >
                              <td className="py-2 px-3 text-sm">{project.name}</td>
                              <td className="py-2 px-3 text-sm text-right">{project.current_value || '-'}</td>
                              <td className="py-2 px-3 text-sm text-right">
                                {contribution ? `${contribution.contribution}%` : '-'}
                              </td>
                              <td className="py-2 px-3">
                                {/* Add dynamic ProgressBar for project indicators */}
                                {project.current_value !== undefined && (
                                  <ProgressBar 
                                    value={project.current_value} 
                                    target={projectTarget || 100}
                                    baseline={projectBaseline}
                                    color={getProjectColors(projects.length)[projects.indexOf(project) % getProjectColors(projects.length).length]}
                                    height="0.5rem"
                                    showValue={false}
                                    showTarget={false}
                                    indicatorType={filters.sub_indicator_id ? "project-sub-indicator" : "project-indicator"}
                                    progressDirection={project.progress_direction || 'up'}
                                  />
                                )}
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
                  ) : viewMode === 'chart' ? (
                    // Add a new view option for the chart
                    <div className="mt-6 border rounded-lg p-4 bg-white shadow-sm">
                      <SDGLineChart 
                        data={data} 
                        height={500}
                        goalId={filters.goal_id}
                        indicatorId={filters.indicator_id}
                        subIndicatorId={filters.sub_indicator_id}
                        projectId={filters.project_id}
                        timeScale={filters.timeScale || 'monthly'}
                      />
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

      {/* <NotesPanel 
        currentContext={notesContext}
        onContextChange={setNotesContext}
      /> */}
    </div>
  );
}

export default Dashboard;