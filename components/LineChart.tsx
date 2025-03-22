"use client"

import React, { useState, useEffect } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';

const SDGLineChart = ({ 
  data = [], 
  height = 400, 
  goalId = null,
  indicatorId = null, 
  subIndicatorId = null,
  projectId = null,
  showTarget = true,
  showBaseline = true,
  timeScale = 'monthly' // 'monthly', 'quarterly', 'yearly'
}) => {
  const [chartData, setChartData] = useState([]);
  const [targetValue, setTargetValue] = useState(null);
  const [baselineValue, setBaselineValue] = useState(null);
  const [progressDirection, setProgressDirection] = useState('up');
  const [unit, setUnit] = useState('');
  
  // SDG goal colors
  const goalColors = {
    1: "#E5243B", 2: "#DDA63A", 3: "#4C9F38", 4: "#C5192D", 
    5: "#FF3A21", 6: "#26BDE2", 7: "#FCC30B", 8: "#A21942", 
    9: "#FD6925", 10: "#DD1367", 11: "#FD9D24", 12: "#BF8B2E", 
    13: "#3F7E44", 14: "#0A97D9", 15: "#56C02B", 16: "#00689D", 
    17: "#19486A"
  };

  // Get current goal color
  const getChartColor = () => {
    if (!goalId) return "#666666";
    return goalColors[goalId] || "#666666";
  };

  useEffect(() => {
    if (!data || data.length === 0) return;

    // Extract target and baseline info if available in the first data item
    if (data[0]) {
      if (data[0].target_value !== undefined) {
        setTargetValue(data[0].target_value);
      } else if (data[0].global_target_value !== undefined) {
        setTargetValue(data[0].global_target_value);
      }

      if (data[0].baseline_value !== undefined) {
        setBaselineValue(data[0].baseline_value);
      } else if (data[0].global_baseline_value !== undefined) {
        setBaselineValue(data[0].global_baseline_value);
      }

      if (data[0].progress_direction) {
        setProgressDirection(data[0].progress_direction);
      }

      if (data[0].unit_of_measurement) {
        setUnit(data[0].unit_of_measurement);
      }
    }

    // Prepare data based on time scale
    const transformedData = prepareDataByTimeScale(data, timeScale);
    setChartData(transformedData);
  }, [data, timeScale]);

  // Function to prepare data based on the selected time scale
  const prepareDataByTimeScale = (rawData, scale) => {
    if (!rawData || rawData.length === 0) return [];

    // Sort data by date
    const sortedData = [...rawData].sort((a, b) => 
      new Date(a.measurement_date) - new Date(b.measurement_date)
    );

    if (scale === 'monthly') {
      // Group by month
      const monthlyData = {};
      
      sortedData.forEach(item => {
        const date = new Date(item.measurement_date);
        const monthYear = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
        
        if (!monthlyData[monthYear]) {
          monthlyData[monthYear] = {
            date: monthYear,
            displayDate: `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`,
            count: 0,
            total: 0
          };
        }
        
        monthlyData[monthYear].count++;
        monthlyData[monthYear].total += parseFloat(item.value) || 0;
      });
      
      // Calculate averages and prepare final data
      return Object.values(monthlyData).map(month => ({
        ...month,
        value: month.total / month.count
      }));
    } 
    else if (scale === 'quarterly') {
      // Group by quarter
      const quarterlyData = {};
      
      sortedData.forEach(item => {
        const date = new Date(item.measurement_date);
        const quarter = Math.floor(date.getMonth() / 3) + 1;
        const key = `${date.getFullYear()}-Q${quarter}`;
        
        if (!quarterlyData[key]) {
          quarterlyData[key] = {
            date: key,
            displayDate: `Q${quarter} ${date.getFullYear()}`,
            count: 0,
            total: 0
          };
        }
        
        quarterlyData[key].count++;
        quarterlyData[key].total += parseFloat(item.value) || 0;
      });
      
      return Object.values(quarterlyData).map(quarter => ({
        ...quarter,
        value: quarter.total / quarter.count
      }));
    } 
    else { // yearly
      // Group by year
      const yearlyData = {};
      
      sortedData.forEach(item => {
        const date = new Date(item.measurement_date);
        const year = date.getFullYear();
        
        if (!yearlyData[year]) {
          yearlyData[year] = {
            date: year.toString(),
            displayDate: year.toString(),
            count: 0,
            total: 0
          };
        }
        
        yearlyData[year].count++;
        yearlyData[year].total += parseFloat(item.value) || 0;
      });
      
      return Object.values(yearlyData).map(year => ({
        ...year,
        value: year.total / year.count
      }));
    }
  };

  const formatValue = (value) => {
    if (value === undefined || value === null) return 'N/A';
    
    // Format number with appropriate decimals
    const formatted = Number.isInteger(value) 
      ? value.toLocaleString() 
      : value.toLocaleString(undefined, { 
          minimumFractionDigits: 1, 
          maximumFractionDigits: 2 
        });
    
    return unit ? `${formatted} ${unit}` : formatted;
  };

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border shadow-md rounded">
          <p className="font-medium">{payload[0].payload.displayDate}</p>
          <p className="text-sm">
            <span className="font-medium">Value:</span> {formatValue(payload[0].value)}
          </p>
          <p className="text-sm">
            <span className="font-medium">Measurements:</span> {payload[0].payload.count}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">
            {indicatorId || subIndicatorId ? 'Indicator Trend' : (goalId ? `Goal ${goalId} Performance Trend` : 'Performance Trend')}
          </h3>
          {unit && <p className="text-sm text-gray-500">Measured in {unit}</p>}
        </div>
        {/* Optional time scale selector */}
        <select 
          value={timeScale}
          onChange={(e) => setTimeScale(e.target.value)}
          className="border rounded p-1 text-sm"
        >
          <option value="monthly">Monthly</option>
          <option value="quarterly">Quarterly</option>
          <option value="yearly">Yearly</option>
        </select>
      </div>
      
      {chartData.length > 0 ? (
        <div style={{ width: '100%', height }}>
          <ResponsiveContainer>
            <LineChart 
              data={chartData}
              margin={{ top: 10, right: 30, left: 20, bottom: 30 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis 
                dataKey="displayDate" 
                angle={-45} 
                textAnchor="end" 
                height={70}
                tickMargin={15}
              />
              <YAxis domain={['auto', 'auto']} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              
              {/* Target reference line */}
              {showTarget && targetValue !== null && (
                <ReferenceLine 
                  y={targetValue} 
                  stroke="#52b788" 
                  strokeDasharray="4 4" 
                  label={{ 
                    value: `Target: ${formatValue(targetValue)}`, 
                    position: 'insideTopRight',
                    fill: '#52b788',
                    fontSize: 12
                  }} 
                />
              )}
              
              {/* Baseline reference line */}
              {showBaseline && baselineValue !== null && (
                <ReferenceLine 
                  y={baselineValue} 
                  stroke="#6c757d" 
                  strokeDasharray="4 4" 
                  label={{ 
                    value: `Baseline: ${formatValue(baselineValue)}`, 
                    position: 'insideBottomRight',
                    fill: '#6c757d',
                    fontSize: 12
                  }} 
                />
              )}
              
              <Line 
                type="monotone" 
                dataKey="value" 
                name="Value" 
                stroke={getChartColor()} 
                strokeWidth={2}
                dot={{ r: 5, fill: getChartColor() }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="border rounded p-8 text-center text-gray-500 bg-gray-50" style={{ height }}>
          No time series data available for the selected filters
        </div>
      )}
    </div>
  );
};

export default SDGLineChart;