"use client"
import { useEffect, useState } from "react";
import dynamic from 'next/dynamic';

// Dynamic import to avoid SSR issues
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface IndicatorProgress {
  projectIndicatorId: number;
  indicatorName: string;
  targetValue: number;
  calculatedValue: number;
  progressPercentage: number;
}

interface LocationData {
  [location: string]: IndicatorProgress[];
}

interface TimeSeriesData {
  [year: string]: IndicatorProgress[];
}

// Add funnel interfaces
interface FunnelStage {
  stage: string;
  value: number;
  percentage: number;
  description: string;
  conversionRate?: number;
}

interface FunnelData {
  projectId: number;
  funnelType: string;
  stages: FunnelStage[];
  summary: {
    totalIndicators: number;
    completionRate: number;
    dataQualityScore: number;
    computationSuccessRate: number;
  };
  recommendations: string[];
}

interface Filters {
  selectedLocations: string[];
  selectedIndicators: string[];
  selectedYears: string[];
  progressRange: { min: number; max: number };
  targetAchievement: 'all' | 'above' | 'ontrack' | 'behind';
  showCompleteDataOnly: boolean;
}

export default function ProjectDashboard({ id }: { id: number }) {
  const [indicatorProgress, setIndicatorProgress] = useState<IndicatorProgress[]>([]);
  const [locationData, setLocationData] = useState<LocationData>({});
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData>({});
  const [funnelData, setFunnelData] = useState<FunnelData | null>(null); // Add funnel state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Filter states
  const [filters, setFilters] = useState<Filters>({
    selectedLocations: [],
    selectedIndicators: [],
    selectedYears: [],
    progressRange: { min: 0, max: 100 },
    targetAchievement: 'all',
    showCompleteDataOnly: false
  });

  // Get available options for filters
  const availableLocations = Object.keys(locationData);
  const availableIndicators = [...new Set(
    Object.values(locationData).flat().map(item => item.indicatorName)
  )];
  const availableYears = Object.keys(timeSeriesData).sort();

  // Initialize filters when data loads
  useEffect(() => {
    if (Object.keys(locationData).length > 0) {
      setFilters(prev => ({
        ...prev,
        selectedLocations: prev.selectedLocations.length === 0 ? availableLocations : prev.selectedLocations,
        selectedIndicators: prev.selectedIndicators.length === 0 ? availableIndicators : prev.selectedIndicators,
        selectedYears: prev.selectedYears.length === 0 ? availableYears : prev.selectedYears
      }));
    }
  }, [locationData, timeSeriesData]);

  // Filter data based on current filter settings
  const getFilteredLocationData = (): LocationData => {
    const filtered: LocationData = {};

    availableLocations.forEach(location => {
      if (filters.selectedLocations.length === 0 || filters.selectedLocations.includes(location)) {
        const locationIndicators = locationData[location]?.filter(indicator => {
          // Filter by selected indicators
          if (filters.selectedIndicators.length > 0 && !filters.selectedIndicators.includes(indicator.indicatorName)) {
            return false;
          }

          // Filter by progress range
          if (indicator.progressPercentage < filters.progressRange.min || indicator.progressPercentage > filters.progressRange.max) {
            return false;
          }

          // Filter by target achievement
          if (filters.targetAchievement !== 'all') {
            const progress = indicator.progressPercentage;
            switch (filters.targetAchievement) {
              case 'above':
                if (progress <= 100) return false;
                break;
              case 'ontrack':
                if (progress < 50 || progress > 100) return false;
                break;
              case 'behind':
                if (progress >= 50) return false;
                break;
            }
          }

          return true;
        }) || [];

        if (locationIndicators.length > 0) {
          filtered[location] = locationIndicators;
        }
      }
    });

    return filtered;
  };

  const getFilteredTimeSeriesData = (): TimeSeriesData => {
    const filtered: TimeSeriesData = {};

    availableYears.forEach(year => {
      if (filters.selectedYears.length === 0 || filters.selectedYears.includes(year)) {
        const yearIndicators = timeSeriesData[year]?.filter(indicator => {
          return filters.selectedIndicators.length === 0 || filters.selectedIndicators.includes(indicator.indicatorName);
        }) || [];

        if (yearIndicators.length > 0) {
          filtered[year] = yearIndicators;
        }
      }
    });

    return filtered;
  };

  const handleFilterChange = (filterType: keyof Filters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const resetFilters = () => {
    setFilters({
      selectedLocations: availableLocations,
      selectedIndicators: availableIndicators,
      selectedYears: availableYears,
      progressRange: { min: 0, max: 100 },
      targetAchievement: 'all',
      showCompleteDataOnly: false
    });
  };

  // Fetch all project data - Updated to include funnel
  useEffect(() => {
    const fetchProjectData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch all four endpoints in parallel
        const [progressRes, locationRes, timeSeriesRes, funnelRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/project_indicator_progress/${id}`),
          fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/project_location_comparison/${id}`),
          fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/project_progress_over_time/${id}`),
          fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/project_implementation_funnel/${id}`) // Add funnel fetch
        ]);

        if (progressRes.ok) {
          const progressData = await progressRes.json();
          setIndicatorProgress(Array.isArray(progressData) ? progressData : []);
        }

        if (locationRes.ok) {
          const locationData = await locationRes.json();
          setLocationData(locationData || {});
        }

        if (timeSeriesRes.ok) {
          const timeData = await timeSeriesRes.json();
          setTimeSeriesData(timeData || {});
        }

        if (funnelRes.ok) {
          const funnelData = await funnelRes.json();
          setFunnelData(funnelData);
        }

      } catch (error) {
        console.error("Error fetching project data:", error);
        setError("Failed to load project data");
      } finally {
        setLoading(false);
      }
    };

    fetchProjectData();
  }, [id]);

  // Chart colors
  const colors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#84cc16'];

  // Funnel Chart Options - Fixed types
  const getFunnelChartOptions = () => {
    if (!funnelData || !funnelData.stages) {
      return {
        series: [],
        options: {
          chart: {
            type: 'bar' as const,
            height: 400
          },
          title: {
            text: 'Project Implementation Pipeline',
            align: 'center' as const
          }
        }
      };
    }

    const series = [{
      name: 'Indicators',
      data: funnelData.stages.map(stage => stage.value)
    }];

    return {
      series,
      options: {
        chart: {
          type: 'bar' as const,
          height: 400
        },
        plotOptions: {
          bar: {
            horizontal: true,
            distributed: true,
            barHeight: '70%',
            borderRadius: 5
          }
        },
        colors: [
          '#00E396', '#00D9FF', '#008FFB',
          '#FEB019', '#FF4560', '#775DD0'
        ],
        xaxis: {
          categories: funnelData.stages.map(stage => stage.stage),
          labels: {
            formatter: function(val: any): string {
              return val.toString();
            }
          }
        },
        yaxis: {
          title: {
            text: 'Implementation Stages'
          }
        },
        title: {
          text: 'Project Implementation Pipeline',
          align: 'center' as const,
          style: {
            fontSize: '18px',
            fontWeight: 'bold'
          }
        },
        dataLabels: {
          enabled: true,
          formatter: function(val: any, opts: any): string {
            const stage = funnelData.stages[opts.dataPointIndex];
            const percentage = stage.percentage;
            return `${val} (${percentage}%)`;
          },
          style: {
            colors: ['#fff'],
            fontSize: '12px',
            fontWeight: 'bold'
          }
        },
        legend: {
          show: false
        },
        tooltip: {
          custom: function({ series, seriesIndex, dataPointIndex }: any) {
            const stage = funnelData.stages[dataPointIndex];
            const val = series[seriesIndex][dataPointIndex];
            return `
              <div style="padding: 10px; background: white; border: 1px solid #ccc; border-radius: 4px;">
                <strong>${val} indicators</strong><br/>
                ${stage.percentage}% of total<br/>
                ${stage.conversionRate ? `${stage.conversionRate}% conversion` : ''}<br/>
                <em>${stage.description}</em>
              </div>
            `;
          }
        }
      }
    };
  };

  // Multi-series Radial Bar Chart Options - Fixed types
  const getMultiRadialBarOptions = () => {
    // Collect all indicator data from all locations
    const allIndicatorData: { name: string; value: number; color: string }[] = [];

    Object.keys(locationData).forEach((location, locationIndex) => {
      locationData[location].forEach((indicator, indicatorIndex) => {
        allIndicatorData.push({
          name: `${indicator.indicatorName} (${location})`,
          value: Math.round(indicator.progressPercentage),
          color: colors[(locationIndex * 2 + indicatorIndex) % colors.length]
        });
      });
    });

    const series = allIndicatorData.map(item => item.value);
    const labels = allIndicatorData.map(item => item.name);
    const chartColors = allIndicatorData.map(item => item.color);

    return {
      series,
      options: {
        chart: {
          height: 500,
          type: 'radialBar' as const,
        },
        plotOptions: {
          radialBar: {
            hollow: {
              margin: 15,
              size: '30%',
            },
            track: {
              margin: 5,
            },
            dataLabels: {
              name: {
                show: true,
                fontSize: '12px',
                fontWeight: 'bold',
                color: '#333',
                offsetY: -10
              },
              value: {
                show: true,
                color: '#333',
                offsetY: 5,
                fontSize: '14px',
                fontWeight: 'bold',
                formatter: function(val: any): string {
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
            inverseColors: false,
            opacityFrom: 1,
            opacityTo: 1,
            stops: [0, 100]
          }
        },
        stroke: {
          lineCap: 'round' as const
        },
        labels: labels,
        colors: chartColors,
        legend: {
          show: true,
          position: 'bottom' as const,
          horizontalAlign: 'center' as const,
          fontSize: '12px',
          markers: {
            size: 8
          }
        }
      }
    };
  };

  // Radar Chart Options (Location Comparison) - Flipped Structure
  const getRadarChartOptions = () => {
    const filteredLocationData = getFilteredLocationData();

    // Guard against empty or invalid locationData
    if (!filteredLocationData || typeof filteredLocationData !== 'object' || Object.keys(filteredLocationData).length === 0) {
      return {
        series: [],
        options: {
          chart: {
            height: 400,
            type: 'radar' as const,
          },
          title: {
            text: 'Indicators by Location',
            align: 'center' as const,
            style: {
              fontSize: '18px',
              fontWeight: 'bold'
            }
          }
        }
      };
    }

    const locations = Object.keys(locationData);

    if (locations.length === 0) {
      return {
        series: [],
        options: {
          chart: {
            height: 400,
            type: 'radar' as const,
          },
          title: {
            text: 'Indicators by Location',
            align: 'center' as const,
            style: {
              fontSize: '18px',
              fontWeight: 'bold'
            }
          }
        }
      };
    }

    // Get all unique indicator names across all locations
    const allIndicatorNames = new Set<string>();
    locations.forEach(location => {
      const locationIndicators = locationData[location];
      if (Array.isArray(locationIndicators)) {
        locationIndicators.forEach(indicator => {
          if (indicator && indicator.indicatorName) {
            allIndicatorNames.add(indicator.indicatorName);
          }
        });
      }
    });

    const indicatorNames = Array.from(allIndicatorNames);

    // FLIPPED: Now each indicator is a series, and locations are the axes
    const series = indicatorNames.map((indicatorName) => {
      const data = locations.map(location => {
        const locationIndicators = filteredLocationData[location];

        if (!Array.isArray(locationIndicators)) return 0;

        const indicator = locationIndicators.find(item =>
          item && item.indicatorName === indicatorName
        );

        if (indicator && typeof indicator.progressPercentage === 'number') {
          return Math.round(Math.max(0, Math.min(100, indicator.progressPercentage)));
        }
        return 0;
      });

      return {
        name: indicatorName,
        data: data
      };
    });

    return {
      series,
      options: {
        chart: {
          height: 400,
          type: 'radar' as const,
          toolbar: {
            show: false
          }
        },
        title: {
          text: 'Indicators Across Locations',
          align: 'center' as const,
          style: {
            fontSize: '18px',
            fontWeight: 'bold',
            color: '#333'
          }
        },
        xaxis: {
          categories: locations, // Now locations are the axes
          labels: {
            style: {
              fontSize: '12px',
              fontWeight: 500
            }
          }
        },
        yaxis: {
          show: true,
          min: 0,
          max: 100,
          tickAmount: 4,
          labels: {
            formatter: function(val: number): string {
              return val + '%';
            },
            style: {
              fontSize: '11px'
            }
          }
        },
        plotOptions: {
          radar: {
            size: 140,
            polygons: {
              strokeColors: '#e8e8e8',
              fill: {
                colors: ['#f8f8f8', 'transparent']
              }
            }
          }
        },
        colors: colors.slice(0, indicatorNames.length),
        stroke: {
          show: true,
          width: 2
        },
        fill: {
          opacity: 0.1
        },
        markers: {
          size: 4,
          colors: undefined,
          strokeColors: '#fff',
          strokeWidth: 2,
          hover: {
            size: 6
          }
        },
        tooltip: {
          y: {
            formatter: function(val: number): string {
              return val + '%';
            }
          }
        },
        legend: {
          show: true,
          position: 'bottom' as const,
          horizontalAlign: 'center' as const,
          fontSize: '12px'
        }
      }
    };
  };

  // Line Chart Options (Progress Over Time)
  const getLineChartOptions = () => {
    const filteredTimeSeriesData = getFilteredTimeSeriesData();

    // Guard against empty or invalid timeSeriesData
    if (!filteredTimeSeriesData || typeof filteredTimeSeriesData !== 'object' || Object.keys(filteredTimeSeriesData).length === 0) {
      return {
        series: [],
        options: {
          chart: {
            height: 400,
            type: 'line' as const,
            zoom: {
              enabled: false
            }
          },
          title: {
            text: 'Progress Over Time',
            align: 'center' as const,
            style: {
              fontSize: '18px',
              fontWeight: 'bold'
            }
          },
          dataLabels: {
            enabled: false
          },
          stroke: {
            curve: 'smooth' as const,
            width: 3
          },
          xaxis: {
            categories: [],
            title: {
              text: 'Year'
            }
          },
          yaxis: {
            title: {
              text: 'Progress (%)'
            },
            min: 0,
            max: 100
          },
          legend: {
            position: 'bottom' as const
          },
          colors: []
        }
      };
    }

    const years = Object.keys(filteredTimeSeriesData).sort();

    // Get all unique indicator names across all years
    const indicatorNames = [...new Set(
      years.flatMap(year => {
        const yearIndicators = filteredTimeSeriesData[year];
        return Array.isArray(yearIndicators)
          ? yearIndicators.map(item => item?.indicatorName).filter(Boolean)
          : [];
      })
    )];

    const series = indicatorNames.map((indicatorName) => ({
      name: indicatorName,
      data: years.map(year => {
        const yearIndicators = filteredTimeSeriesData[year];

        if (!Array.isArray(yearIndicators)) return 0;

        const indicator = yearIndicators.find(item =>
          item && item.indicatorName === indicatorName
        );
        return indicator && typeof indicator.progressPercentage === 'number'
          ? Math.round(indicator.progressPercentage)
          : 0;
      })
    }));

    return {
      series,
      options: {
        chart: {
          height: 400,
          type: 'line' as const,
          zoom: {
            enabled: false
          }
        },
        title: {
          text: 'Progress Over Time',
          align: 'center' as const,
          style: {
            fontSize: '18px',
            fontWeight: 'bold'
          }
        },
        dataLabels: {
          enabled: false
        },
        stroke: {
          curve: 'smooth' as const,
          width: 3
        },
        xaxis: {
          categories: years,
          title: {
            text: 'Year'
          }
        },
        yaxis: {
          title: {
            text: 'Progress (%)'
          },
          min: 0,
          max: 100
        },
        legend: {
          position: 'bottom' as const
        },
        colors: colors.slice(0, indicatorNames.length)
      }
    };
  };

  if (loading) {
    return (
      <div className="w-full flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">Loading project dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full flex justify-center items-center h-64">
        <div className="text-lg text-red-600">{error}</div>
      </div>
    );
  }

  const radarData = getRadarChartOptions();
  const lineData = getLineChartOptions();
  const multiRadialData = getMultiRadialBarOptions();
  const funnelChartData = getFunnelChartOptions(); // Add funnel data
  const filteredLocationData = getFilteredLocationData();

  return (
    <div className="w-full max-w-7xl mx-auto px-4 space-y-8">
      {/* Header */}
      <div className="w-full flex justify-center mb-8">
        <h1 className="text-4xl font-bold uppercase text-gray-800">
          Project {id} Dashboard
        </h1>
      </div>

      {/* Filter Controls */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Filters</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
            <button
              onClick={resetFilters}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
            >
              Reset
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Location Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Locations</label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {availableLocations.map(location => (
                  <label key={location} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.selectedLocations.includes(location)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          handleFilterChange('selectedLocations', [...filters.selectedLocations, location]);
                        } else {
                          handleFilterChange('selectedLocations', filters.selectedLocations.filter(l => l !== location));
                        }
                      }}
                      className="mr-2"
                    />
                    <span className="text-sm">{location}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Indicator Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Indicators</label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {availableIndicators.map(indicator => (
                  <label key={indicator} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.selectedIndicators.includes(indicator)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          handleFilterChange('selectedIndicators', [...filters.selectedIndicators, indicator]);
                        } else {
                          handleFilterChange('selectedIndicators', filters.selectedIndicators.filter(i => i !== indicator));
                        }
                      }}
                      className="mr-2"
                    />
                    <span className="text-sm">{indicator}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Year Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Years</label>
              <div className="space-y-2">
                {availableYears.map(year => (
                  <label key={year} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.selectedYears.includes(year)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          handleFilterChange('selectedYears', [...filters.selectedYears, year]);
                        } else {
                          handleFilterChange('selectedYears', filters.selectedYears.filter(y => y !== year));
                        }
                      }}
                      className="mr-2"
                    />
                    <span className="text-sm">{year}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Progress Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Progress Range</label>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm">Min:</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={filters.progressRange.min}
                    onChange={(e) => handleFilterChange('progressRange', {
                      ...filters.progressRange,
                      min: parseInt(e.target.value) || 0
                    })}
                    className="w-16 px-2 py-1 border rounded text-sm"
                  />
                  <span className="text-sm">%</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm">Max:</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={filters.progressRange.max}
                    onChange={(e) => handleFilterChange('progressRange', {
                      ...filters.progressRange,
                      max: parseInt(e.target.value) || 100
                    })}
                    className="w-16 px-2 py-1 border rounded text-sm"
                  />
                  <span className="text-sm">%</span>
                </div>
              </div>
            </div>

            {/* Target Achievement Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Target Achievement</label>
              <select
                value={filters.targetAchievement}
                onChange={(e) => handleFilterChange('targetAchievement', e.target.value)}
                className="w-full px-3 py-2 border rounded-md text-sm"
              >
                <option value="all">All Indicators</option>
                <option value="above">Above Target (&gt;100%)</option>
                <option value="ontrack">On Track (50-100%)</option>
                <option value="behind">Behind Target (&lt;50%)</option>
              </select>
            </div>

            {/* Data Completeness Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Data Quality</label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.showCompleteDataOnly}
                  onChange={(e) => handleFilterChange('showCompleteDataOnly', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm">Complete data only</span>
              </label>
            </div>
          </div>
        )}
      </div>


      {/* Single Multi-Series Radial Bar Chart */}
      <div className="w-full">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
          Overall Project Progress
        </h2>
        {Object.keys(filteredLocationData).length > 0 ? (
          <div className="flex justify-center">
            <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-4xl">
              <Chart
                options={multiRadialData.options}
                series={multiRadialData.series}
                type="radialBar"
                height={500}
              />
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-500">No project data available with current filters</div>
        )}
      </div>

      {/* Radar Chart - Location Comparison */}
      <div className="w-full">
        <div className="bg-white rounded-lg shadow-md p-6">
          {Object.keys(filteredLocationData).length > 0 ? (
            <Chart
              options={radarData.options}
              series={radarData.series}
              type="radar"
              height={400}
            />
          ) : (
            <div className="h-96 flex items-center justify-center text-gray-500">
              No location comparison data available with current filters
            </div>
          )}
        </div>
      </div>

      {/* Line Chart - Progress Over Time */}
      <div className="w-full">
        <div className="bg-white rounded-lg shadow-md p-6">
          {Object.keys(getFilteredTimeSeriesData()).length > 0 ? (
            <Chart
              options={lineData.options}
              series={lineData.series}
              type="line"
              height={400}
            />
          ) : (
            <div className="h-96 flex items-center justify-center text-gray-500">
              No time series data available with current filters
            </div>
          )}
        </div>
      </div>


      {/* Implementation Funnel Chart - NEW SECTION */}
      <div className="w-full">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
          Implementation Pipeline
        </h2>
        <div className="bg-white rounded-lg shadow-md p-6">
          {funnelData ? (
            <div className="space-y-6">
              <Chart
                options={funnelChartData.options}
                series={funnelChartData.series}
                type="bar"
                height={400}
              />
              
              {/* Funnel Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-800">Completion Rate</h4>
                  <p className="text-2xl font-bold text-blue-600">{funnelData.summary.completionRate}%</p>
                  <p className="text-sm text-blue-600">Indicators meeting targets</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-800">Data Quality</h4>
                  <p className="text-2xl font-bold text-green-600">{funnelData.summary.dataQualityScore}%</p>
                  <p className="text-sm text-green-600">Complete data collection</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-purple-800">Computation Success</h4>
                  <p className="text-2xl font-bold text-purple-600">{funnelData.summary.computationSuccessRate}%</p>
                  <p className="text-sm text-purple-600">Successful calculations</p>
                </div>
              </div>

              {/* Recommendations */}
              {funnelData.recommendations && funnelData.recommendations.length > 0 && (
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-yellow-800 mb-2">Recommendations</h4>
                  <ul className="space-y-1">
                    {funnelData.recommendations.map((recommendation, index) => (
                      <li key={index} className="text-yellow-700 text-sm">
                        • {recommendation}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="h-96 flex items-center justify-center text-gray-500">
              No funnel data available
            </div>
          )}
        </div>
      </div>
    </div>
  );
}