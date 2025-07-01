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

export default function ProjectDashboard({ id }: { id: number }) {
  const [indicatorProgress, setIndicatorProgress] = useState<IndicatorProgress[]>([]);
  const [locationData, setLocationData] = useState<LocationData>({});
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all project data
  useEffect(() => {
    const fetchProjectData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch all three endpoints in parallel
        const [progressRes, locationRes, timeSeriesRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/project_indicator_progress/${id}`),
          fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/project_location_comparison/${id}`),
          fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/project_progress_over_time/${id}`)
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

  // Multi-series Radial Bar Chart Options (All indicators and locations)
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
              size: '30%', // Smaller center to fit more rings
            },
            track: {
              margin: 5, // Space between rings
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
            width: 8,
            height: 8
          }
        }
      }
    };
  };

  // Radar Chart Options (Location Comparison) - Flipped Structure
  const getRadarChartOptions = () => {
    // Guard against empty or invalid locationData
    if (!locationData || typeof locationData !== 'object' || Object.keys(locationData).length === 0) {
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
        const locationIndicators = locationData[location];

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
            formatter: function(val: number) {
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
            formatter: function(val: number) {
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
    // Guard against empty or invalid timeSeriesData
    if (!timeSeriesData || typeof timeSeriesData !== 'object' || Object.keys(timeSeriesData).length === 0) {
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

    const years = Object.keys(timeSeriesData).sort();

    // Get all unique indicator names across all years
    const indicatorNames = [...new Set(
      years.flatMap(year => {
        const yearIndicators = timeSeriesData[year];
        return Array.isArray(yearIndicators)
          ? yearIndicators.map(item => item?.indicatorName).filter(Boolean)
          : [];
      })
    )];

    const series = indicatorNames.map((indicatorName, index) => ({
      name: indicatorName,
      data: years.map(year => {
        const yearIndicators = timeSeriesData[year];

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

  return (
    <div className="w-full max-w-7xl mx-auto px-4 space-y-8">
      {/* Header */}
      <div className="w-full flex justify-center mb-8">
        <h1 className="text-4xl font-bold uppercase text-gray-800">
          Project {id} Dashboard
        </h1>
      </div>

      {/* Single Multi-Series Radial Bar Chart */}
      <div className="w-full">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
          Overall Project Progress
        </h2>
        {Object.keys(locationData).length > 0 ? (
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
          <div className="text-center text-gray-500">No project data available</div>
        )}
      </div>

      {/* Radar Chart - Location Comparison */}
      <div className="w-full">
        <div className="bg-white rounded-lg shadow-md p-6">
          {Object.keys(locationData).length > 0 ? (
            <Chart
              options={radarData.options}
              series={radarData.series}
              type="radar"
              height={400}
            />
          ) : (
            <div className="h-96 flex items-center justify-center text-gray-500">
              No location comparison data available
            </div>
          )}
        </div>
      </div>

      {/* Line Chart - Progress Over Time */}
      <div className="w-full">
        <div className="bg-white rounded-lg shadow-md p-6">
          {Object.keys(timeSeriesData).length > 0 ? (
            <Chart
              options={lineData.options}
              series={lineData.series}
              type="line"
              height={400}
            />
          ) : (
            <div className="h-96 flex items-center justify-center text-gray-500">
              No time series data available
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
