import { getGoals, getProjects, getProjectWithIndicators } from "@/app/actions/actions";

export interface ProjectContribution {
  project_id: number;
  name: string;
  status: string;
  contribution: { date: string; value: number }[];
  latestContribution: number;
  contributionPercentage: number;
}

export interface TopContributingProject {
  project_id: number;
  name: string;
  status: string;
  totalContribution: number;
  contributedIndicators: number;
  averageContribution: number;
}

export interface DashboardSDG {
  goal_id: number;
  title: string;
  global_current_value: { date: string; current: number }[];
  indicators: {
    name: string;
    description?: string | null;
    current: {
      current?: number; 
      date: string; 
      value?: number;
    }[];
    target: number | number[];
    achievement_percentage: number;
    latestValue: number; // Pre-computed latest value
    contributingProjects?: ProjectContribution[]; // Added contributing projects
    sub_indicators?: {
      name: string;
      description?: string | null;
      current: { date: string; value: number }[];
      target: number | number[];
      achievement_percentage: number;
      latestValue: number; // Pre-computed latest value
      contributingProjects?: ProjectContribution[]; // Added contributing projects
    }[];
  }[];
  topContributingProjects?: TopContributingProject[]; // Added top contributing projects
}

// For metrics calculation and dashboard display
export interface SummaryMetrics {
  totalIndicators: number;
  totalSubIndicators: number;
  onTrackIndicators: number;
  atRiskIndicators: number;
  avgYoyGrowth: string;
  mostImprovedIndicator: {
    name: string;
    improvement: number;
    goalTitle: string;
  };
  leastImprovedIndicator: {
    name: string;
    improvement: number;
    goalTitle: string;
  };
  overallProgress: number;
  // New metrics for project contributions
  topContributingProject?: {
    name: string;
    contribution: number;
    goalTitle: string;
  };
  projectsContributing: number;
}
interface TemporalValue {
  date: string;
  value?: number;
  current?: number;
}

// Create a cache for expensive operations
interface DataCache {
  sdgData: DashboardSDG[] | null;
  dateMap: Map<string, Date>;
  summaryMetricsCache: Map<string, SummaryMetrics>;
  indicatorsDataCache: Map<string, any[]>;
  filteredDataCache: Map<string, DashboardSDG[]>;
  projectContributionsCache: Map<string, any>; // New cache for project contributions
  indicatorProjectRelationshipsCache: Map<string, any[]>; // New cache for indicator-project relationships
}

// Update the data cache definition
const dataCache: DataCache = {
  sdgData: null,
  dateMap: new Map<string, Date>(),
  summaryMetricsCache: new Map<string, SummaryMetrics>(),
  indicatorsDataCache: new Map<string, any[]>(),
  filteredDataCache: new Map<string, DashboardSDG[]>(),
  projectContributionsCache: new Map<string, any>(),
  indicatorProjectRelationshipsCache: new Map<string, any[]>()
};


// Helper function to get or create cached Date objects
const getCachedDate = (dateString: string): Date => {
  if (!dataCache.dateMap.has(dateString)) {
    dataCache.dateMap.set(dateString, new Date(dateString));
  }
  return dataCache.dateMap.get(dateString)!;
};

// Optimized to handle both data structures more efficiently
export const getMostRecentValue = (data: TemporalValue[]): number => {
  if (!data || data.length === 0) return 0;
  
  // Use a single pass to find the most recent entry
  let mostRecent = data[0];
  let mostRecentTime = getCachedDate(data[0].date).getTime();
  
  for (let i = 1; i < data.length; i++) {
    const currentTime = getCachedDate(data[i].date).getTime();
    if (currentTime > mostRecentTime) {
      mostRecent = data[i];
      mostRecentTime = currentTime;
    }
  }
  
  // Return the value, handling both data structure types
  return mostRecent.value !== undefined ? mostRecent.value : (mostRecent.current || 0);
};

export const getIndicatorsByProject = (
  projectId: number,
  allData: DashboardSDG[]
): {
  projectDetails: {
    project_id: number;
    name: string;
    status: string;
    description?: string;
    start_date?: string;
    end_date?: string;
  };
  contributedGoals: {
    goal_id: number;
    name: string;
    contribution: number;
    indicators: {
      indicator_id: number;
      name: string;
      contribution: number;
      latestValue: number;
      targetValue: number;
      achievement_percentage: number;
      sub_indicators?: {
        sub_indicator_id: number;
        name: string;
        contribution: number;
        latestValue: number;
        targetValue: number;
        achievement_percentage: number;
      }[];
    }[];
  }[];
  totalGoalsImpacted: number;
  totalIndicatorsImpacted: number;
  totalSubIndicatorsImpacted: number;
  overallContribution: number;
} => {
  // Initialize the result structure
  const result = {
    projectDetails: {
      project_id: projectId,
      name: "Unknown Project",
      status: "Unknown"
    },
    contributedGoals: [],
    totalGoalsImpacted: 0,
    totalIndicatorsImpacted: 0,
    totalSubIndicatorsImpacted: 0,
    overallContribution: 0
  };
  
  const contributedGoalMap = new Map();
  let totalContribution = 0;
  let contributionCount = 0;
  
  // Scan through all goals and their indicators
  for (const goal of allData) {
    let goalContribution = 0;
    const contributedIndicators = [];
    
    // Check indicators
    for (const indicator of goal.indicators) {
      const projectContribution = indicator.contributingProjects?.find(p => p.project_id === projectId);
      
      if (projectContribution) {
        // Set project details if not yet set
        if (result.projectDetails.name === "Unknown Project") {
          result.projectDetails = {
            project_id: projectId,
            name: projectContribution.name,
            status: projectContribution.status,
            description: projectContribution.description,
            start_date: projectContribution.start_date,
            end_date: projectContribution.end_date
          };
        }
        
        const subIndicatorsContributed = [];
        let subIndicatorCount = 0;
        
        // Check sub-indicators
        if (indicator.sub_indicators) {
          for (const subInd of indicator.sub_indicators) {
            const subProjectContribution = subInd.contributingProjects?.find(p => p.project_id === projectId);
            
            if (subProjectContribution) {
              subIndicatorsContributed.push({
                sub_indicator_id: subInd.sub_indicator_id,
                name: subInd.name,
                contribution: subProjectContribution.latestContribution,
                latestValue: subInd.latestValue,
                targetValue: subInd.target,
                achievement_percentage: subInd.achievement_percentage
              });
              
              subIndicatorCount++;
              goalContribution += subProjectContribution.latestContribution;
              totalContribution += subProjectContribution.latestContribution;
              contributionCount++;
            }
          }
        }
        
        // Add indicator details
        contributedIndicators.push({
          indicator_id: indicator.indicator_id,
          name: indicator.name,
          contribution: projectContribution.latestContribution,
          latestValue: indicator.latestValue,
          targetValue: indicator.target,
          achievement_percentage: indicator.achievement_percentage,
          sub_indicators: subIndicatorsContributed.length > 0 ? subIndicatorsContributed : undefined
        });
        
        goalContribution += projectContribution.latestContribution;
        totalContribution += projectContribution.latestContribution;
        contributionCount++;
        result.totalIndicatorsImpacted++;
        result.totalSubIndicatorsImpacted += subIndicatorCount;
      }
    }
    
    // If this project contributes to this goal, add it
    if (contributedIndicators.length > 0) {
      contributedGoalMap.set(goal.goal_id, {
        goal_id: goal.goal_id,
        name: goal.title,
        contribution: goalContribution,
        indicators: contributedIndicators
      });
      
      result.totalGoalsImpacted++;
    }
  }
  
  // Convert the map to an array and sort by contribution
  result.contributedGoals = Array.from(contributedGoalMap.values())
    .sort((a, b) => b.contribution - a.contribution);
  
  // Calculate overall contribution
  result.overallContribution = contributionCount > 0 ? totalContribution / contributionCount : 0;
  
  return result;
};

// Generate a cache key for filtered data
const getFilterCacheKey = (filters: any): string => {
  return JSON.stringify(filters);
};

// Filter SDG data based on criteria and use cache
export const filterSDGData = (
  allData: DashboardSDG[], 
  filters: any
): DashboardSDG[] => {
  const cacheKey = getFilterCacheKey(filters);
  
  // Check if we already have this result cached
  if (dataCache.filteredDataCache.has(cacheKey)) {
    return dataCache.filteredDataCache.get(cacheKey)!;
  }
  
  // If no filters are applied, return the original data
  if (!filters || Object.keys(filters).length === 0) {
    return allData;
  }
  
  // Perform the filtering
  const filteredData = allData.filter(goal => {
    // Apply goal-level filters
    if (filters.goalId && goal.goal_id !== filters.goalId) {
      return false;
    }
    
    // Filter by project if specified
    if (filters.projectId) {
      // Check if this project contributes to the goal
      const projectContributes = goal.projectContributionBreakdown?.some(
        p => p.project_id === filters.projectId
      ) || goal.topContributingProjects?.some(
        p => p.project_id === filters.projectId
      );
      
      if (!projectContributes) return false;
    }
    
    // Create a new goal object with filtered indicators
    const filteredGoal = {
      ...goal,
      indicators: goal.indicators.filter(indicator => {
        // Apply indicator-level filters
        if (filters.indicatorName && !indicator.name.toLowerCase().includes(filters.indicatorName.toLowerCase())) {
          return false;
        }
        
        if (filters.minProgress !== undefined && indicator.achievement_percentage < filters.minProgress) {
          return false;
        }
        
        if (filters.maxProgress !== undefined && indicator.achievement_percentage > filters.maxProgress) {
          return false;
        }
        
        // Filter by project contribution to indicator
        if (filters.projectId && !indicator.contributingProjects?.some(p => p.project_id === filters.projectId)) {
          return false;
        }
        
        // Filter by minimum project impact
        if (filters.minProjectImpact !== undefined) {
          const projectImpact = indicator.projectImpactAnalysis?.totalImpact || 0;
          if (projectImpact < filters.minProjectImpact) {
            return false;
          }
        }
        
        // Filter by project count
        if (filters.minProjectCount !== undefined) {
          const projectCount = indicator.contributingProjects?.length || 0;
          if (projectCount < filters.minProjectCount) {
            return false;
          }
        }
        
        return true;
      })
    };
    
    // Only include goals that have at least one indicator after filtering
    return filteredGoal.indicators.length > 0;
  });
  
  // Cache the result
  dataCache.filteredDataCache.set(cacheKey, filteredData);
  
  return filteredData;
};

function extractTemporalValues(values: any[]): { date: string; value: number }[] {
  if (!values || values.length === 0) return [];
  
  return values.map(entry => ({
    date: entry.date,
    value: entry.value !== undefined ? entry.value : (entry.current || 0)
  }));
}

function aggregateTemporalValues(indicators: any[], level: 'goal' | 'indicator'): { date: string; current: number }[] {
  if (!indicators || indicators.length === 0) return [];
  
  // Create a map of date -> sum of values
  const aggregatedValues = new Map<string, number>();
  let totalIndicators = 0;
  
  for (const indicator of indicators) {
    const values = level === 'goal' 
      ? indicator.td_indicator_value || []
      : indicator.current || [];
    
    for (const value of values) {
      const date = value.date;
      const val = value.value !== undefined ? value.value : (value.current || 0);
      
      if (!aggregatedValues.has(date)) {
        aggregatedValues.set(date, 0);
      }
      aggregatedValues.set(date, aggregatedValues.get(date)! + val);
    }
    totalIndicators++;
  }
  
  // Average the values if we have multiple indicators
  if (totalIndicators > 1) {
    for (const [date, value] of aggregatedValues.entries()) {
      aggregatedValues.set(date, value / totalIndicators);
    }
  }
  
  // Convert to array and sort by date
  return Array.from(aggregatedValues.entries())
    .map(([date, value]) => ({ date, current: value }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

// Calculate overall progress for a single goal - optimized for speed
export function calculateOverallProgress(goalData: DashboardSDG): number {
  const indicators = goalData.indicators;
  if (!indicators.length) return 0;
  
  let totalAchievement = 0;
  for (let i = 0; i < indicators.length; i++) {
    totalAchievement += indicators[i].achievement_percentage;
  }
  
  return Math.round(totalAchievement / indicators.length);
}

// Calculate overall progress across multiple goals with cache
export function calculateOverallProgressAcrossGoals(goalsData: DashboardSDG[]): number {
  if (!goalsData.length) return 0;
  
  // Create a cache key based on the goal IDs included
  const cacheKey = goalsData.map(g => g.goal_id).sort().join('-');
  
  // Check for cached calculation
  if (dataCache.summaryMetricsCache.has(`progress-${cacheKey}`)) {
    return (dataCache.summaryMetricsCache.get(`progress-${cacheKey}`) as any).overallProgress;
  }
  
  let totalAchievement = 0;
  let indicatorCount = 0;
  
  for (const goal of goalsData) {
    for (const indicator of goal.indicators) {
      totalAchievement += indicator.achievement_percentage;
      indicatorCount++;
    }
  }
  
  const result = indicatorCount > 0 ? Math.round(totalAchievement / indicatorCount) : 0;
  
  // Store in cache
  dataCache.summaryMetricsCache.set(`progress-${cacheKey}`, { overallProgress: result });
  
  return result;
}

// Optimized helper function to calculate achievement percentage with bounds
function calculateAchievementPercentage(current: number, target: number): number {
  if (!target) return 0;
  const percentage = (current / target) * 100;
  return Math.min(Math.max(Math.round(percentage), 0), 100); // Clamp between 0-100 and round
}

// Calculate summary metrics with caching
export const calculateSummaryMetrics = (
  allData: DashboardSDG[], 
  selectedGoal: DashboardSDG | null,
  filters?: any
): SummaryMetrics => {
  // Create a cache key based on selected goal and filters
  const selectedGoalId = selectedGoal ? selectedGoal.goal_id : 'all';
  const filtersKey = filters ? JSON.stringify(filters) : 'none';
  const cacheKey = `metrics-${selectedGoalId}-${filtersKey}`;
  
  // Check if we have cached results
  if (dataCache.summaryMetricsCache.has(cacheKey)) {
    return dataCache.summaryMetricsCache.get(cacheKey)!;
  }
  
  // If filters are provided, use the filtered data
  const dataToProcess = filters 
    ? filterSDGData(selectedGoal ? [selectedGoal] : allData, filters)
    : (selectedGoal ? [selectedGoal] : allData);
  
  let totalIndicators = 0;
  let totalSubIndicators = 0;
  let onTrackIndicators = 0;
  let atRiskIndicators = 0;
  let avgYoyGrowth = 0;
  let indicatorsWithGrowth = 0;
  
  // Initialize with defaults to avoid null checks later
  let mostImprovedIndicator = { name: "N/A", improvement: 0, goalTitle: "N/A" };
  let leastImprovedIndicator = { name: "N/A", improvement: Infinity, goalTitle: "N/A" };
  
  // Process all indicators in a single pass
  for (const goal of dataToProcess) {
    for (const indicator of goal.indicators) {
      totalIndicators++;
      
      if (indicator.sub_indicators) {
        totalSubIndicators += indicator.sub_indicators.length;
      }
      
      if (indicator.achievement_percentage >= 75) {
        onTrackIndicators++;
      }
      
      if (indicator.achievement_percentage < 50) {
        atRiskIndicators++;
      }
      
      // Calculate growth only if there are at least 2 values
      if (indicator.current && indicator.current.length >= 2) {
        const sortedValues = [...indicator.current].filter(entry => entry?.date);
        sortedValues.sort((a, b) => (a.date || "").localeCompare(b.date || ""));
      
        if (sortedValues.length >= 2) {
          const oldestValue = sortedValues[0]?.value ?? sortedValues[0]?.current ?? 0;
          const latestValue = sortedValues[sortedValues.length - 1]?.value ?? sortedValues[sortedValues.length - 1]?.current ?? 0;
      
          if (oldestValue > 0) {
            const improvement = ((latestValue - oldestValue) / oldestValue) * 100;
            avgYoyGrowth += improvement;
            indicatorsWithGrowth++;
      
            // Track most/least improved
            if (improvement > mostImprovedIndicator.improvement) {
              mostImprovedIndicator = { 
                name: indicator.name, 
                improvement,
                goalTitle: goal.title
              };
            }
      
            if (improvement < leastImprovedIndicator.improvement) {
              leastImprovedIndicator = { 
                name: indicator.name, 
                improvement,
                goalTitle: goal.title
              };
            }
          }
        }
      }
    }
  }
  
  // Replace Infinity with 0 if no improvements were found
  if (leastImprovedIndicator.improvement === Infinity) {
    leastImprovedIndicator.improvement = 0;
  }
  
  // Calculate average growth
  const calculatedAvgYoyGrowth = indicatorsWithGrowth > 0 ? avgYoyGrowth / indicatorsWithGrowth : 0;
  
  // Get overall progress (this might use a cached value)
  const overallProgress = calculateOverallProgressAcrossGoals(dataToProcess);
  
  const result = {
    totalIndicators,
    totalSubIndicators,
    onTrackIndicators,
    atRiskIndicators,
    avgYoyGrowth: calculatedAvgYoyGrowth.toFixed(1),
    mostImprovedIndicator,
    leastImprovedIndicator,
    overallProgress
  };
  
  // Cache the result
  dataCache.summaryMetricsCache.set(cacheKey, result);
  
  return result;
};

// Get aggregate data for all indicators with caching
export const getAllIndicatorsData = (
  sdgData: DashboardSDG[], 
  sdgColors: { [key: string]: string },
  filters?: any
) => {
  // Create cache key
  const filterKey = filters ? JSON.stringify(filters) : 'none';
  const cacheKey = `indicators-${filterKey}`;
  
  // Check cache first
  if (dataCache.indicatorsDataCache.has(cacheKey)) {
    return dataCache.indicatorsDataCache.get(cacheKey);
  }
  
  // Get filtered data if filters provided
  const dataToProcess = filters ? filterSDGData(sdgData, filters) : sdgData;
  
  const result = [];
  
  for (const goal of dataToProcess) {
    for (const indicator of goal.indicators) {
      result.push({
        ...indicator,
        goalId: goal.goal_id,
        goalTitle: goal.title,
        goalColor: sdgColors[goal.title] || "blue"
      });
    }
  }
  
  // Cache the result
  dataCache.indicatorsDataCache.set(cacheKey, result);
  
  return result;
};

// Main transformation function with optimizations
export const transformSDGData = async (): Promise<DashboardSDG[]> => {
  // Check cached data
  if (dataCache.sdgData) {
    return dataCache.sdgData;
  }
  
  // Get goals, projects, and projects with indicators
  const goals = await getGoals();
  const projects = await getProjects();
  const projectsWithIndicators = await getProjectWithIndicators();
  
  // Create project lookup for faster access
  const projectLookup = new Map();
  for (const project of projects) {
    projectLookup.set(project.project_id, project);
  }
  
  const result: DashboardSDG[] = [];
  
  for (const goal of goals) {
    const goalIndicators = goal.td_goal_indicator || [];
    // Make sure global_current_value matches expected type
    const globalCurrentValue = aggregateTemporalValues(goalIndicators, "goal");

    const indicators = [];
    const allContributingProjects = new Map(); // Collect all projects contributing to this goal
    
    for (const gi of goalIndicators) {
      const indicator = gi.md_indicator;
      if (!indicator) continue;

      const indicatorValues = gi.td_indicator_value || [];
      
      // Convert to the expected format for the indicator's own values
      const current = extractTemporalValues(indicatorValues).map(item => ({
        date: item.date,
        current: item.value,
        value: item.value
      }));
      
      // Enhanced: Find contributing projects for this indicator with more details
      const contributingProjects = findContributingProjects(projectsWithIndicators, gi.goal_indicator_id);
      
      // Track all projects contributing to this goal
      for (const project of contributingProjects) {
        if (!allContributingProjects.has(project.project_id)) {
          allContributingProjects.set(project.project_id, {
            project_id: project.project_id,
            name: project.name,
            status: project.status,
            indicators: [],
            totalContribution: 0
          });
        }
        
        // Add this indicator to the project's list
        const projectEntry = allContributingProjects.get(project.project_id);
        projectEntry.indicators.push({
          indicator_id: indicator.indicator_id,
          name: indicator.name,
          contribution: project.latestContribution
        });
        projectEntry.totalContribution += project.latestContribution;
      }
      
      const target = gi.global_target_value || 0;
      const latestValue = getMostRecentValue(current);
      const achievement_percentage = calculateAchievementPercentage(latestValue, target);

      const sub_indicators = [];
      
      if (gi.td_goal_sub_indicator && gi.td_goal_sub_indicator.length > 0) {
        for (const gsi of gi.td_goal_sub_indicator) {
          const subInd = gsi.md_sub_indicator;
          if (!subInd) continue;
          
          const subIndValues = gsi.td_sub_indicator_value || [];
          
          // Ensure sub-indicator current values have the correct format
          const subCurrent = extractTemporalValues(subIndValues).map(item => ({
            date: item.date,
            value: item.value || 0 // Ensure value is defined
          }));
          
          // Find contributing projects for this sub-indicator with enhanced details
          const contributingProjectsForSubIndicator = findContributingProjectsForSubIndicator(
            projectsWithIndicators, 
            gsi.goal_sub_indicator_id
          );
          
          // Track all projects contributing to this goal via sub-indicators
          for (const project of contributingProjectsForSubIndicator) {
            if (!allContributingProjects.has(project.project_id)) {
              allContributingProjects.set(project.project_id, {
                project_id: project.project_id,
                name: project.name,
                status: project.status,
                indicators: [],
                subIndicators: [],
                totalContribution: 0
              });
            }
            
            // Add this sub-indicator to the project's list
            const projectEntry = allContributingProjects.get(project.project_id);
            if (!projectEntry.subIndicators) projectEntry.subIndicators = [];
            
            projectEntry.subIndicators.push({
              sub_indicator_id: subInd.sub_indicator_id,
              name: subInd.name,
              contribution: project.latestContribution
            });
            projectEntry.totalContribution += project.latestContribution;
          }
          
          const target = gsi.global_target_value || 0;
          const latestValue = getMostRecentValue(subCurrent);
          const achievement_percentage = calculateAchievementPercentage(latestValue, target);
          
          sub_indicators.push({
            sub_indicator_id: subInd.sub_indicator_id,
            name: subInd.name,
            description: subInd.description,
            current: subCurrent,
            target,
            achievement_percentage,
            latestValue, // Pre-compute and store this value
            contributingProjects: contributingProjectsForSubIndicator // Enhanced contributing projects
          });
        }
      }

      indicators.push({
        indicator_id: indicator.indicator_id,
        name: indicator.name,
        description: indicator.description,
        current,
        target,
        achievement_percentage,
        latestValue, // Pre-compute and store this value
        contributingProjects, // Enhanced contributing projects
        sub_indicators: sub_indicators.length > 0 ? sub_indicators : undefined,
        // New: Add project impact analysis
        projectImpactAnalysis: calculateProjectImpactForIndicator(contributingProjects)
      });
    }

    // Calculate top contributing projects with enhanced details
    const topContributingProjects = calculateTopContributingProjects(
      projectsWithIndicators, 
      goal.goal_id
    );
    
    // Create enhanced goal data structure
    result.push({
      goal_id: goal.goal_id,
      title: goal.name,
      description: goal.description,
      global_current_value: globalCurrentValue,
      indicators,
      topContributingProjects,
      // New: Add project contribution breakdown
      projectContributionBreakdown: Array.from(allContributingProjects.values())
        .sort((a, b) => b.totalContribution - a.totalContribution)
        .slice(0, 20), // Limit to top 20 projects
      // New: Add goal achievement metrics
      achievementMetrics: calculateGoalAchievementMetrics(indicators)
    });
  }
  
  // Clear any existing caches when we load fresh data
  dataCache.filteredDataCache.clear();
  dataCache.summaryMetricsCache.clear();
  dataCache.indicatorsDataCache.clear();
  
  // Cache the full dataset
  dataCache.sdgData = result;
  return result;
};

function getAchievementStatus(percentage: number): string {
  if (percentage >= 100) return "Achieved";
  if (percentage >= 75) return "On Track";
  if (percentage >= 50) return "Progressing";
  if (percentage >= 25) return "At Risk";
  return "Off Track";
}

export const getProjectImpactByGoal = (
  goalId: number,
  allData: DashboardSDG[]
): {
  goalDetails: {
    goal_id: number;
    name: string;
    description?: string;
  };
  projectImpact: {
    project_id: number;
    name: string;
    status: string;
    totalContribution: number;
    indicatorCount: number;
    subIndicatorCount: number;
    averageContribution: number;
    indicators: {
      indicator_id: number;
      name: string;
      contribution: number;
      contributionPercentage: number;
    }[];
  }[];
  impactMetrics: {
    totalProjects: number;
    highImpactProjects: number; // >75% contribution
    mediumImpactProjects: number; // 25-75% contribution
    lowImpactProjects: number; // <25% contribution
    averageProjectContribution: number;
  };
} | null => {
  // Find the goal
  const goal = allData.find(g => g.goal_id === goalId);
  if (!goal) return null;
  
  // Initialize result structure
  const result = {
    goalDetails: {
      goal_id: goalId,
      name: goal.title,
      description: goal.description
    },
    projectImpact: [],
    impactMetrics: {
      totalProjects: 0,
      highImpactProjects: 0,
      mediumImpactProjects: 0,
      lowImpactProjects: 0,
      averageProjectContribution: 0
    }
  };
  
  // Use the project contribution breakdown if available
  if (goal.projectContributionBreakdown && goal.projectContributionBreakdown.length > 0) {
    const projectImpacts = [];
    let totalContribution = 0;
    
    for (const project of goal.projectContributionBreakdown) {
      // Create detailed project impact info
      const projectImpact = {
        project_id: project.project_id,
        name: project.name,
        status: project.status,
        totalContribution: project.totalContribution,
        indicatorCount: project.indicators?.length || 0,
        subIndicatorCount: project.subIndicators?.length || 0,
        averageContribution: 0,
        indicators: project.indicators?.map(ind => ({
          indicator_id: ind.indicator_id,
          name: ind.name,
          contribution: ind.contribution,
          contributionPercentage: 0 // Will calculate after we know the totals
        })) || []
      };
      
      // Calculate average contribution
      const totalItems = projectImpact.indicatorCount + projectImpact.subIndicatorCount;
      projectImpact.averageContribution = totalItems > 0 ? 
        project.totalContribution / totalItems : 0;
      
      projectImpacts.push(projectImpact);
      totalContribution += project.totalContribution;
    }
    
    // Now that we have the total, calculate percentages
    let highImpact = 0;
    let mediumImpact = 0;
    let lowImpact = 0;
    
    for (const project of projectImpacts) {
      // Calculate contribution percentage for the project
      const contributionPercentage = totalContribution > 0 ? 
        (project.totalContribution / totalContribution) * 100 : 0;
      
      // Categorize by impact level
      if (contributionPercentage >= 75) highImpact++;
      else if (contributionPercentage >= 25) mediumImpact++;
      else lowImpact++;
      
      // Calculate percentages for each indicator
      for (const ind of project.indicators) {
        ind.contributionPercentage = project.totalContribution > 0 ?
          (ind.contribution / project.totalContribution) * 100 : 0;
      }
    }
    
    // Sort by total contribution
    result.projectImpact = projectImpacts.sort((a, b) => b.totalContribution - a.totalContribution);
    
    // Set impact metrics
    result.impactMetrics = {
      totalProjects: projectImpacts.length,
      highImpactProjects: highImpact,
      mediumImpactProjects: mediumImpact,
      lowImpactProjects: lowImpact,
      averageProjectContribution: projectImpacts.length > 0 ? 
        totalContribution / projectImpacts.length : 0
    };
  } else {
    // Fall back to top contributing projects if breakdown isn't available
    result.projectImpact = goal.topContributingProjects?.map(p => ({
      project_id: p.project_id,
      name: p.name,
      status: p.status,
      totalContribution: p.totalContribution,
      indicatorCount: p.contributedIndicators,
      subIndicatorCount: 0, // Not available in this data
      averageContribution: p.averageContribution,
      indicators: p.indicatorContributions || []
    })) || [];
    
    // Set basic impact metrics
    const projectCount = result.projectImpact.length;
    result.impactMetrics = {
      totalProjects: projectCount,
      highImpactProjects: 0,
      mediumImpactProjects: 0,
      lowImpactProjects: 0,
      averageProjectContribution: 0
    };
    
    // Calculate impact categories
    for (const project of result.projectImpact) {
      const avgContrib = project.averageContribution;
      if (avgContrib >= 75) result.impactMetrics.highImpactProjects++;
      else if (avgContrib >= 25) result.impactMetrics.mediumImpactProjects++;
      else result.impactMetrics.lowImpactProjects++;
    }
  }
  
  return result;
};


function calculateProjectImpactForIndicator(projects: ProjectContribution[]) {
  // Skip if no projects contribute
  if (!projects.length) return { totalImpact: 0, projectCount: 0, averageImpact: 0 };
  
  let totalImpact = 0;
  const projectCount = projects.length;
  
  for (const project of projects) {
    totalImpact += project.latestContribution;
  }
  
  return {
    totalImpact,
    projectCount,
    averageImpact: totalImpact / projectCount,
    impactDistribution: projects.map(p => ({
      project_id: p.project_id,
      name: p.name,
      impact: p.latestContribution,
      impactPercentage: (p.latestContribution / totalImpact) * 100
    }))
  };
}

// 6. New helper function for goal achievement metrics
function calculateGoalAchievementMetrics(indicators: any[]) {
  if (!indicators.length) return { 
    overallAchievement: 0, 
    indicatorCount: 0,
    achievedIndicators: 0,
    indicators: [] 
  };
  
  let totalAchievement = 0;
  let achievedIndicators = 0;
  const indicatorMetrics = [];
  
  for (const indicator of indicators) {
    totalAchievement += indicator.achievement_percentage;
    
    if (indicator.achievement_percentage >= 100) {
      achievedIndicators++;
    }
    
    indicatorMetrics.push({
      name: indicator.name,
      achievement: indicator.achievement_percentage,
      status: getAchievementStatus(indicator.achievement_percentage)
    });
  }
  
  return {
    overallAchievement: totalAchievement / indicators.length,
    indicatorCount: indicators.length,
    achievedIndicators,
    indicators: indicatorMetrics
  };
}

export const getProjectContributionToGoal = (
  projectId: number,
  goalId: number,
  allData: DashboardSDG[]
): {
  projectName: string;
  goalName: string;
  contributedIndicators: {
    name: string;
    contribution: number;
    target: number;
    contributionPercentage: number;
    subIndicators?: {
      name: string;
      contribution: number;
      target: number;
      contributionPercentage: number;
    }[];
  }[];
  overallContribution: number;
} | null => {
  try {
    // Find the goal in our data
    const goal = allData.find(g => g.goal_id === goalId);
    if (!goal) return null;

    let projectName = "Unknown Project";
    const contributedIndicators: {
      name: string;
      contribution: number;
      target: number;
      contributionPercentage: number;
      subIndicators?: {
        name: string;
        contribution: number;
        target: number;
        contributionPercentage: number;
      }[];
    }[] = [];
    let totalContribution = 0;
    let totalIndicators = 0;

    // Make sure indicators exist before iterating
    if (!goal.indicators || !Array.isArray(goal.indicators)) {
      return {
        projectName,
        goalName: goal.title || "Unknown Goal",
        contributedIndicators: [],
        overallContribution: 0
      };
    }

    // Iterate through each indicator in the goal
    for (const indicator of goal.indicators) {
      // Handle the case when contributingProjects is undefined
      const contributingProjects = indicator.contributingProjects || [];
      
      // Find the project-specific contribution for this indicator
      const projectIndicator = contributingProjects.find(p => p && p.project_id === projectId);
      if (!projectIndicator) continue;

      projectName = projectIndicator.name || "Unknown Project";

      // Extract latest contribution value
      const contribution = projectIndicator.latestContribution || 0;
      
      // Handle the case when target is an array
      let targetValue: number;
      if (Array.isArray(indicator.target)) {
        targetValue = indicator.target.length > 0 ? indicator.target[0] : 1;
      } else {
        targetValue = indicator.target || 1; // Default to 1 to avoid division by zero
      }
      
      const contributionPercentage = (contribution / targetValue) * 100;

      // Safely handle sub-indicators
      const subIndicators: {
        name: string;
        contribution: number;
        target: number;
        contributionPercentage: number;
      }[] = [];
      
      // Check if sub_indicators exists before processing
      if (indicator.sub_indicators && Array.isArray(indicator.sub_indicators)) {
        for (const sub of indicator.sub_indicators) {
          // Handle the case when contributingProjects is undefined
          const subContributingProjects = sub.contributingProjects || [];
          
          const subProjectIndicator = subContributingProjects.find(p => p && p.project_id === projectId);
          if (!subProjectIndicator) continue;
          
          const subContribution = subProjectIndicator.latestContribution || 0;
          
          // Handle the case when target is an array
          let subTargetValue: number;
          if (Array.isArray(sub.target)) {
            subTargetValue = sub.target.length > 0 ? sub.target[0] : 1;
          } else {
            subTargetValue = sub.target || 1;
          }
          
          subIndicators.push({
            name: sub.name || "Unknown Sub-indicator",
            contribution: subContribution,
            target: subTargetValue,
            contributionPercentage: (subContribution / subTargetValue) * 100
          });
        }
      }

      contributedIndicators.push({
        name: indicator.name || "Unknown Indicator",
        contribution,
        target: targetValue,
        contributionPercentage,
        subIndicators: subIndicators.length > 0 ? subIndicators : undefined
      });

      totalContribution += contributionPercentage;
      totalIndicators++;
    }

    return {
      projectName,
      goalName: goal.title || "Unknown Goal",
      contributedIndicators,
      overallContribution: totalIndicators ? totalContribution / totalIndicators : 0
    };
  } catch (error) {
    console.error("Error in getProjectContributionToGoal:", error);
    return {
      projectName: "Error",
      goalName: "Error occurred when calculating project contribution",
      contributedIndicators: [],
      overallContribution: 0
    };
  }
};

// Get the overall contribution percentage for a project to a specific goal
export function getProjectContributionPercentage(projectId, goalId, sdgData) {
  const goal = sdgData.find(g => g.goal_id === goalId);
  if (!goal) return 0;
  
  let totalContribution = 0;
  let totalIndicators = 0;
  
  for (const indicator of goal.indicators) {
    const projectContribution = indicator.contributingProjects?.find(
      p => p.project_id.toString() === projectId
    );
    
    if (projectContribution) {
      totalContribution += projectContribution.contributionPercentage;
      totalIndicators++;
    }
  }
  
  return totalIndicators > 0 ? totalContribution / totalIndicators : 0;
}

function findContributingProjects(projects: any[], goalIndicatorId: number): ProjectContribution[] {
  const contributingProjects: ProjectContribution[] = [];
  
  for (const project of projects) {
    for (const projectIndicator of project.td_project_indicator || []) {
      // Check if this project indicator is linked to our goal indicator
      if (projectIndicator.goal_indicator_id === goalIndicatorId) {
        // Get indicator values from the project
        const projectValues = projectIndicator.td_project_indicator_value || [];
        
        // Extract and transform the values
        const projectValueData = extractTemporalValues(projectValues);
        
        // Calculate the latest contribution value
        const latestValue = projectValueData.length > 0 
          ? getMostRecentValue(projectValueData) 
          : 0;
        
        // Get the target value for calculating contribution percentage
        const targetValue = projectIndicator.target_value || 
                           (projectIndicator.td_goal_indicator?.global_target_value || 100);
        
        // Calculate contribution percentage
        const contributionPercentage = Math.min(Math.round((latestValue / targetValue) * 100), 100);
        
        contributingProjects.push({
          project_id: project.project_id,
          name: project.name,
          status: project.project_status,
          description: project.description,
          start_date: project.start_date,
          end_date: project.end_date,
          contribution: projectValueData,
          latestContribution: latestValue,
          contributionPercentage,
          targetValue,
          indicatorRelationships: extractIndicatorRelationships(project, goalIndicatorId)
        });
      }
    }
  }
  
  // Sort by contribution percentage (descending)
  return contributingProjects.sort((a, b) => b.contributionPercentage - a.contributionPercentage);
}

function extractIndicatorRelationships(project: any, goalIndicatorId: number) {
  const relationships = [];
  
  for (const projectIndicator of project.td_project_indicator || []) {
    if (projectIndicator.goal_indicator_id === goalIndicatorId) {
      relationships.push({
        indicator_id: projectIndicator.indicator_id,
        indicator_name: projectIndicator.td_goal_indicator?.md_indicator?.name || "Unknown",
        contribution_type: projectIndicator.contribution_type || "direct",
        impact_weight: projectIndicator.impact_weight || 1.0,
        notes: projectIndicator.notes || ""
      });
    }
  }
  
  return relationships;
}

// Helper function to find projects contributing to a specific sub-indicator
function findContributingProjectsForSubIndicator(projects: any[], goalSubIndicatorId: number) {
  const contributingProjects = [];
  
  for (const project of projects) {
    for (const projectIndicator of project.td_project_indicator) {
      // Check if this project has any sub-indicators that match our goal sub indicator
      for (const projectSubIndicator of (projectIndicator.td_project_sub_indicator || [])) {
        // We need to match this project's sub-indicator to the goal's sub-indicator
        // Logic to match will depend on your data structure
        // This is a simplified approach based on the data structure in your code
        const matchesGoalSubIndicator = determineMatchingSubIndicator(projectSubIndicator, goalSubIndicatorId);
        
        if (matchesGoalSubIndicator) {
          // Get sub-indicator values from the project
          const projectSubValues = projectSubIndicator.td_project_sub_indicator_value || [];
          
          // Extract and transform the values
          const projectValueData = extractTemporalValues(projectSubValues);
          
          // Calculate the latest contribution value and percentage
          const latestValue = projectValueData.length > 0 
            ? getMostRecentValue(projectValueData) 
            : 0;
          
          contributingProjects.push({
            project_id: project.project_id,
            name: project.name,
            status: project.project_status,
            contribution: projectValueData,
            latestContribution: latestValue,
            contributionPercentage: calculateSubIndicatorContributionPercentage(
              latestValue, 
              goalSubIndicatorId
            )
          });
        }
      }
    }
  }
  
  // Sort by contribution percentage (descending)
  return contributingProjects.sort((a, b) => b.contributionPercentage - a.contributionPercentage);
}

// Helper function to determine if a project sub-indicator matches a goal sub-indicator
function determineMatchingSubIndicator(projectSubIndicator: any, goalSubIndicatorId: number): boolean {
  // Direct ID match
  if (projectSubIndicator.goal_sub_indicator_id === goalSubIndicatorId) {
    return true;
  }
  
  // Check if there's a relationship through the sub-indicator's metadata
  if (projectSubIndicator.td_goal_sub_indicator && 
      projectSubIndicator.td_goal_sub_indicator.goal_sub_indicator_id === goalSubIndicatorId) {
    return true;
  }
  
  // Check if there's a relationship through the sub-indicator's parent indicator
  if (projectSubIndicator.goal_indicator_id && 
      projectSubIndicator.sub_indicator_id && 
      projectSubIndicator.td_goal_indicator?.td_goal_sub_indicator?.some(
        (gsi: any) => gsi.goal_sub_indicator_id === goalSubIndicatorId
      )) {
    return true;
  }
  
  return false;
}

// Helper function to calculate contribution percentage for an indicator
function calculateContributionPercentage(projectValue: number, goalIndicator: any): number {
  if (!goalIndicator || !goalIndicator.global_target_value) return 0;
  
  const targetValue = goalIndicator.global_target_value;
  return Math.min(Math.round((projectValue / targetValue) * 100), 100);
}

// Helper function to calculate contribution percentage for a sub-indicator
function calculateSubIndicatorContributionPercentage(projectValue: number, goalSubIndicatorId: number): number {
  // You would need to fetch the target value for this sub-indicator
  // This implementation depends on how you access this data
  const targetValue = getSubIndicatorTargetValue(goalSubIndicatorId);
  
  if (!targetValue) return 0;
  return Math.min(Math.round((projectValue / targetValue) * 100), 100);
}

// Helper function to get sub-indicator target value (implement this based on your data structure)
function getSubIndicatorTargetValue(goalSubIndicatorId: number): number {
  // Search through the data cache if we have loaded the SDG data
  if (dataCache.sdgData) {
    for (const goal of dataCache.sdgData) {
      for (const indicator of goal.indicators) {
        if (indicator.sub_indicators) {
          for (const subInd of indicator.sub_indicators) {
            if (subInd.sub_indicator_id === goalSubIndicatorId) {
              return Array.isArray(subInd.target) ? subInd.target[0] : (subInd.target || 100);
            }
          }
        }
      }
    }
  }
}

// Helper function to calculate the top contributing projects for a goal
function calculateTopContributingProjects(projects: any[], goalId: number): TopContributingProject[] {
  const projectContributions = new Map();
  
  // First, collect all contributions by project for this goal
  for (const project of projects) {
    let totalContribution = 0;
    let contributedIndicators = 0;
    const impactedIndicators = new Set();
    const indicatorContributions = [];
    
    for (const projectIndicator of project.td_project_indicator || []) {
      // Check if this indicator belongs to our goal
      if (projectIndicator.td_goal_indicator?.md_goal?.goal_id === goalId) {
        contributedIndicators++;
        
        const indicatorName = projectIndicator.td_goal_indicator?.md_indicator?.name || "Unknown";
        impactedIndicators.add(indicatorName);
        
        let indicatorContribution = 0;
        
        // Sum up the indicator values
        const projectValues = projectIndicator.td_project_indicator_value || [];
        if (projectValues.length > 0) {
          // Find the most recent value and add to total
          const valueData = extractTemporalValues(projectValues);
          const latestValue = getMostRecentValue(valueData);
          totalContribution += latestValue;
          indicatorContribution += latestValue;
        }
        
        // Also include sub-indicator contributions
        const subIndicatorContributions = [];
        for (const projectSubIndicator of (projectIndicator.td_project_sub_indicator || [])) {
          const projectSubValues = projectSubIndicator.td_project_sub_indicator_value || [];
          if (projectSubValues.length > 0) {
            const valueData = extractTemporalValues(projectSubValues);
            const latestValue = getMostRecentValue(valueData);
            totalContribution += latestValue;
            indicatorContribution += latestValue;
            
            // Add sub-indicator detail
            subIndicatorContributions.push({
              sub_indicator_id: projectSubIndicator.sub_indicator_id,
              name: projectSubIndicator.td_goal_sub_indicator?.md_sub_indicator?.name || "Unknown",
              contribution: latestValue,
              contribution_date: projectSubValues[0]?.date || "Unknown"
            });
          }
        }
        
        // Add indicator contribution detail
        indicatorContributions.push({
          indicator_id: projectIndicator.indicator_id,
          name: indicatorName,
          contribution: indicatorContribution,
          contribution_date: projectValues[0]?.date || "Unknown",
          sub_indicators: subIndicatorContributions
        });
      }
    }
    
    // Only add projects that actually contribute to this goal
    if (contributedIndicators > 0) {
      projectContributions.set(project.project_id, {
        project_id: project.project_id,
        name: project.name,
        status: project.project_status,
        description: project.description,
        start_date: project.start_date,
        end_date: project.end_date,
        totalContribution,
        contributedIndicators,
        impactedIndicatorCount: impactedIndicators.size,
        averageContribution: contributedIndicators > 0 ? totalContribution / contributedIndicators : 0,
        indicatorContributions  // Detailed breakdown of contributions per indicator
      });
    }
  }
  
  // Convert to array and sort by total contribution
  const contributingProjects = Array.from(projectContributions.values())
    .sort((a, b) => b.totalContribution - a.totalContribution);
  
  // Return top projects (configurable limit)
  return contributingProjects.slice(0, 10);
}