import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar } from 'recharts';
import axios from 'axios';

const SDGReport = () => {
  const [reportData, setReportData] = useState({
    goals: [],
    indicators: [],
    projects: [],
    summaryStats: {
      totalGoals: 0,
      totalIndicators: 0,
      totalProjects: 0,
      totalMeasurements: 0,
      performingIndicators: 0,
      atRiskIndicators: 0,
      criticalIndicators: 0,
      latestUpdate: ''
    }
  });
  const [loading, setLoading] = useState(true);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState('yearly');

  // SDG goal colors
  const goalColors = {
    1: "#E5243B", 2: "#DDA63A", 3: "#4C9F38", 4: "#C5192D", 
    5: "#FF3A21", 6: "#26BDE2", 7: "#FCC30B", 8: "#A21942", 
    9: "#FD6925", 10: "#DD1367", 11: "#FD9D24", 12: "#BF8B2E", 
    13: "#3F7E44", 14: "#0A97D9", 15: "#56C02B", 16: "#00689D", 
    17: "#19486A"
  };

  // Sample data for demonstration

  useEffect(() => {
    const filters = JSON.parse(sessionStorage.getItem('reportFilters') || '{}');
    const reportData = JSON.parse(sessionStorage.getItem('reportData') || '{}');
    
    // Use the data to render your report
  }, []);
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      try {
        // In a real implementation, these would be actual API calls
        // For now we'll simulate the data
        
        // Simulate goals data
        const goals = Array.from({ length: 17 }, (_, i) => ({
          goal_id: i + 1,
          name: `SDG ${i + 1}`,
          description: `Sustainable Development Goal ${i + 1}`,
          color: goalColors[i + 1],
          progress: Math.floor(Math.random() * 100)
        }));
        
        // Simulate indicators data
        const indicators = Array.from({ length: 40 }, (_, i) => {
          const goalId = Math.ceil((i + 1) / 3);
          const currentValue = Math.floor(Math.random() * 85) + 15;
          const targetValue = 100;
          
          return {
            indicator_id: i + 1,
            goal_id: goalId,
            name: `Indicator ${goalId}.${i % 3 + 1}`,
            indicator_code: `${goalId}.${i % 3 + 1}`,
            description: `Description for indicator ${goalId}.${i % 3 + 1}`,
            current_value: currentValue,
            global_target_value: targetValue,
            global_baseline_value: Math.floor(currentValue * 0.7),
            progress: (currentValue / targetValue) * 100,
            unit_of_measurement: '%',
            status: currentValue > 75 ? 'performing' : currentValue > 50 ? 'at-risk' : 'critical',
            trend: Math.random() > 0.5 ? 'increasing' : 'decreasing'
          };
        });
        
        // Simulate time series data for charts
        const timeSeriesData = [];
        const now = new Date();
        
        // Generate quarterly data for the past 3 years
        for (let i = 0; i < 12; i++) {
          const date = new Date(now);
          date.setMonth(now.getMonth() - (i * 3));
          
          const entry = {
            date: date.toISOString().split('T')[0],
            quarter: `Q${Math.floor((date.getMonth() + 3) / 3)} ${date.getFullYear()}`
          };
          
          // Add value for each goal
          goals.forEach(goal => {
            // Generate trend with some variability
            const baseValue = goal.progress;
            const variability = 15;
            const trend = Math.random() > 0.7 ? -1 : 1;
            const value = Math.min(100, Math.max(0, baseValue + (trend * (Math.random() * variability - variability/2))));
            
            entry[`goal_${goal.goal_id}`] = value.toFixed(1);
          });
          
          timeSeriesData.push(entry);
        }
        
        // Calculate summary statistics
        const performingCount = indicators.filter(i => i.status === 'performing').length;
        const atRiskCount = indicators.filter(i => i.status === 'at-risk').length;
        const criticalCount = indicators.filter(i => i.status === 'critical').length;
        
        setReportData({
          goals,
          indicators,
          timeSeriesData: timeSeriesData.reverse(), // Most recent first
          summaryStats: {
            totalGoals: goals.length,
            totalIndicators: indicators.length,
            totalProjects: 24, // Sample value
            totalMeasurements: 846, // Sample value
            performingIndicators: performingCount,
            atRiskIndicators: atRiskCount,
            criticalIndicators: criticalCount,
            latestUpdate: new Date().toLocaleDateString()
          }
        });
        
      } catch (error) {
        console.error('Error fetching report data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Format number with commas
  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };
  
  // Calculate progress status color
  const getStatusColor = (status) => {
    switch(status) {
      case 'performing': return '#4CAF50';
      case 'at-risk': return '#FFC107';
      case 'critical': return '#F44336';
      default: return '#9E9E9E';
    }
  };
  
  // Get goal color
  const getGoalColor = (goalId) => {
    return goalColors[goalId] || '#666666';
  };
  
  // Filter indicators by selected goal
  const filteredIndicators = selectedGoal 
    ? reportData.indicators.filter(indicator => indicator.goal_id === selectedGoal)
    : reportData.indicators;
  
  // Get indicators status summary data for pie chart
  const statusSummaryData = [
    { name: 'Performing', value: reportData.summaryStats.performingIndicators, color: '#4CAF50' },
    { name: 'At Risk', value: reportData.summaryStats.atRiskIndicators, color: '#FFC107' },
    { name: 'Critical', value: reportData.summaryStats.criticalIndicators, color: '#F44336' }
  ];
  
  // Get trend data for line chart
  const trendData = reportData.timeSeriesData || [];
  
  // Prepare data for goal progress bar chart
  const goalProgressData = reportData.goals.map(goal => ({
    name: `Goal ${goal.goal_id}`,
    progress: goal.progress,
    color: goal.color
  }));

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">SDG Progress Report</h1>
          <p className="text-gray-600">Last updated: {reportData.summaryStats.latestUpdate}</p>
        </header>
      
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-xl text-gray-500">Loading report data...</p>
          </div>
        ) : (
          <>
            {/* Report Controls */}
            <div className="mb-8 flex justify-between items-center">
              <div className="flex space-x-2">
                <select 
                  className="border rounded-md p-2 bg-white"
                  value={selectedGoal || ''}
                  onChange={e => setSelectedGoal(e.target.value ? parseInt(e.target.value) : null)}
                >
                  <option value="">All Goals</option>
                  {reportData.goals.map(goal => (
                    <option key={goal.goal_id} value={goal.goal_id}>
                      Goal {goal.goal_id}: {goal.name}
                    </option>
                  ))}
                </select>
                
                <select 
                  className="border rounded-md p-2 bg-white"
                  value={selectedTimeframe}
                  onChange={e => setSelectedTimeframe(e.target.value)}
                >
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
              
              <button className="bg-blue-600 text-white px-4 py-2 rounded-md">
                Export Report
              </button>
            </div>
          
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-gray-500 text-sm uppercase mb-1">Goals Tracked</h3>
                <p className="text-3xl font-bold">{reportData.summaryStats.totalGoals}</p>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-gray-500 text-sm uppercase mb-1">Indicators</h3>
                <p className="text-3xl font-bold">{reportData.summaryStats.totalIndicators}</p>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-gray-500 text-sm uppercase mb-1">Projects</h3>
                <p className="text-3xl font-bold">{reportData.summaryStats.totalProjects}</p>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-gray-500 text-sm uppercase mb-1">Measurements</h3>
                <p className="text-3xl font-bold">{formatNumber(reportData.summaryStats.totalMeasurements)}</p>
              </div>
            </div>
            
            {/* Charts Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Indicator Status Pie Chart */}
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <h2 className="text-lg font-semibold mb-4">Indicator Status</h2>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusSummaryData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {statusSummaryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [value, 'Indicators']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              {/* Goal Progress Trend */}
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <h2 className="text-lg font-semibold mb-4">Progress Trend</h2>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="quarter" 
                        tick={{fontSize: 12}}
                      />
                      <YAxis 
                        domain={[0, 100]}
                        tickFormatter={(value) => `${value}%`}
                      />
                      <Tooltip formatter={(value) => [`${value}%`, 'Progress']} />
                      <Legend />
                      {selectedGoal ? (
                        <Line 
                          type="monotone" 
                          dataKey={`goal_${selectedGoal}`} 
                          name={`Goal ${selectedGoal}`}
                          stroke={getGoalColor(selectedGoal)}
                          strokeWidth={2}
                        />
                      ) : (
                        // Show top 5 goals if no specific goal is selected
                        reportData.goals.slice(0, 5).map(goal => (
                          <Line 
                            key={goal.goal_id}
                            type="monotone" 
                            dataKey={`goal_${goal.goal_id}`} 
                            name={`Goal ${goal.goal_id}`}
                            stroke={goal.color}
                            strokeWidth={2}
                          />
                        ))
                      )}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            
            {/* Goal Progress Overview */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-8">
              <h2 className="text-lg font-semibold mb-4">Goal Progress Overview</h2>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={goalProgressData}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 50, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      type="number" 
                      domain={[0, 100]}
                      tickFormatter={(value) => `${value}%`}
                    />
                    <YAxis 
                      type="category" 
                      dataKey="name" 
                      tick={{fontSize: 12}}
                      width={80}
                    />
                    <Tooltip formatter={(value) => [`${value}%`, 'Progress']} />
                    <Bar 
                      dataKey="progress" 
                      name="Progress"
                    >
                      {goalProgressData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Indicator Table */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-lg font-semibold mb-4">
                {selectedGoal ? `Goal ${selectedGoal} Indicators` : 'All Indicators'}
              </h2>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Indicator
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Current Value
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Target
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Progress
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Trend
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredIndicators.map((indicator) => (
                      <tr key={indicator.indicator_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: getGoalColor(indicator.goal_id) }}></div>
                            {indicator.indicator_code}: {indicator.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {indicator.current_value}{indicator.unit_of_measurement}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {indicator.global_target_value}{indicator.unit_of_measurement}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div 
                              className="h-2.5 rounded-full" 
                              style={{ 
                                width: `${indicator.progress}%`,
                                backgroundColor: getStatusColor(indicator.status)
                              }}
                            ></div>
                          </div>
                          <span className="text-xs mt-1 inline-block">{indicator.progress.toFixed(1)}%</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                            style={{ 
                              backgroundColor: `${getStatusColor(indicator.status)}20`, 
                              color: getStatusColor(indicator.status)
                            }}
                          >
                            {indicator.status.charAt(0).toUpperCase() + indicator.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {indicator.trend === 'increasing' ? (
                            <span className="text-green-600">↑ Improving</span>
                          ) : (
                            <span className="text-red-600">↓ Declining</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SDGReport;