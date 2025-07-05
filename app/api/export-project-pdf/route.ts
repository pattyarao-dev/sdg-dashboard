import puppeteer from 'puppeteer';
import { NextRequest } from 'next/server';

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

interface RequestBody {
  projectId: number;
  indicatorProgress: IndicatorProgress[];
  locationData: LocationData;
  timeSeriesData: TimeSeriesData;
  funnelData: FunnelData | null;
  filters: Filters;
  projectName?: string;
}

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const body: RequestBody = await request.json();
    const {
      projectId,
      indicatorProgress,
      locationData,
      timeSeriesData,
      funnelData,
      filters,
      projectName = `Project ${projectId}`
    } = body;
    console.log(indicatorProgress)

    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu'
      ]
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 800 });

    // Calculate summary statistics
    const totalLocations = Object.keys(locationData).length;
    const totalIndicators = new Set(
      Object.values(locationData).flat().map(item => item.indicatorName)
    ).size;

    const allProgress = Object.values(locationData).flat().map(item =>
      Math.min(100, Math.max(0, item.progressPercentage))
    );
    const averageProgress = allProgress.length > 0
      ? Math.round(allProgress.reduce((a, b) => a + b, 0) / allProgress.length)
      : 0;

    const onTrackIndicators = allProgress.filter(p => p >= 75).length;
    const behindIndicators = allProgress.filter(p => p < 50).length;

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${projectName} Dashboard Report</title>
      <script src="https://cdn.jsdelivr.net/npm/apexcharts@latest"></script>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          background: white;
          padding: 20px;
        }
        
        .header { 
          text-align: center; 
          margin-bottom: 40px; 
          border-bottom: 3px solid #2563eb;
          padding-bottom: 20px;
        }
        
        .header h1 {
          font-size: 32px;
          color: #1e40af;
          margin-bottom: 10px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        
        .header p {
          color: #6b7280;
          font-size: 16px;
        }
        
        .executive-summary {
          background: linear-gradient(135deg, #f8fafc, #e2e8f0);
          padding: 30px;
          border-radius: 12px;
          margin-bottom: 40px;
          border-left: 6px solid #2563eb;
        }
        
        .summary-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-top: 20px;
        }
        
        .summary-card {
          background: white;
          padding: 20px;
          border-radius: 8px;
          text-align: center;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .summary-number {
          font-size: 28px;
          font-weight: bold;
          color: #2563eb;
          margin-bottom: 5px;
        }
        
        .summary-label {
          font-size: 14px;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .section {
          margin-bottom: 40px;
          page-break-inside: avoid;
        }
        
        .section-title {
          font-size: 24px;
          font-weight: bold;
          color: #1e40af;
          margin-bottom: 20px;
          padding-bottom: 10px;
          border-bottom: 2px solid #e5e7eb;
        }
        
        .chart-container {
          background: white;
          border-radius: 12px;
          padding: 25px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          margin-bottom: 35px;
          page-break-inside: avoid;
        }
        
        .chart-title {
          font-size: 20px;
          font-weight: bold;
          color: #374151;
          text-align: center;
          margin-bottom: 20px;
          padding-bottom: 10px;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .filters-applied {
          background: #f0f9ff;
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 20px;
          border-left: 4px solid #0ea5e9;
        }
        
        .filter-tag {
          display: inline-block;
          background: #0ea5e9;
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          margin: 2px;
        }
        
        .location-summary {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 15px;
          margin: 20px 0;
        }
        
        .location-card {
          background: #f8fafc;
          padding: 15px;
          border-radius: 8px;
          border-left: 4px solid #10b981;
        }
        
        .location-name {
          font-weight: bold;
          color: #374151;
          margin-bottom: 8px;
        }
        
        .indicator-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 4px 0;
          font-size: 14px;
        }
        
        .progress-bar {
          width: 60px;
          height: 8px;
          background: #e5e7eb;
          border-radius: 4px;
          overflow: hidden;
        }
        
        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #10b981, #059669);
          border-radius: 4px;
        }
        
        .funnel-summary-cards {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin: 20px 0;
        }
        
        .funnel-card {
          padding: 20px;
          border-radius: 8px;
          text-align: center;
        }
        
        .funnel-card.completion { background: #dbeafe; color: #1e40af; }
        .funnel-card.quality { background: #d1fae5; color: #065f46; }
        .funnel-card.computation { background: #e9d5ff; color: #581c87; }
        
        .recommendations {
          background: #fef3c7;
          padding: 20px;
          border-radius: 8px;
          border-left: 4px solid #f59e0b;
          margin-top: 20px;
        }
        
        .recommendations h4 {
          color: #92400e;
          margin-bottom: 10px;
        }
        
        .recommendations ul {
          list-style: none;
          padding: 0;
        }
        
        .recommendations li {
          color: #92400e;
          margin-bottom: 8px;
          padding-left: 20px;
          position: relative;
        }
        
        .recommendations li:before {
          content: "•";
          position: absolute;
          left: 0;
          font-weight: bold;
        }
        
        .footer {
          margin-top: 50px;
          text-align: center;
          border-top: 1px solid #e5e7eb;
          padding-top: 20px;
          color: #6b7280;
          font-size: 12px;
        }
        
        @media print {
          .section {
            break-inside: avoid;
          }
          .chart-container {
            break-inside: avoid;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>📊 ${projectName}</h1>
        <p>Comprehensive Dashboard Report</p>
        <p>Generated on ${new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}</p>
      </div>

      <!-- Executive Summary -->
      <div class="executive-summary">
        <h2 style="color: #1e40af; margin-bottom: 15px;">📈 Executive Summary</h2>
        <p style="font-size: 16px; margin-bottom: 20px;">
          This report provides a comprehensive analysis of ${projectName} performance across 
          ${totalLocations} locations with ${totalIndicators} unique indicators.
        </p>
        
        <div class="summary-grid">
          <div class="summary-card">
            <div class="summary-number">${averageProgress}%</div>
            <div class="summary-label">Average Progress</div>
          </div>
          <div class="summary-card">
            <div class="summary-number">${totalLocations}</div>
            <div class="summary-label">Active Locations</div>
          </div>
          <div class="summary-card">
            <div class="summary-number">${totalIndicators}</div>
            <div class="summary-label">Tracked Indicators</div>
          </div>
          <div class="summary-card">
            <div class="summary-number">${onTrackIndicators}</div>
            <div class="summary-label">On Track (≥75%)</div>
          </div>
          <div class="summary-card">
            <div class="summary-number">${behindIndicators}</div>
            <div class="summary-label">Need Attention (&lt;50%)</div>
          </div>
          <div class="summary-card">
            <div class="summary-number">${Object.keys(timeSeriesData).length}</div>
            <div class="summary-label">Years of Data</div>
          </div>
        </div>
      </div>

      <!-- Applied Filters -->
      ${(filters.selectedLocations.length > 0 ||
        filters.selectedIndicators.length > 0 ||
        filters.selectedYears.length > 0 ||
        filters.progressRange.min > 0 ||
        filters.progressRange.max < 100) ? `
      <div class="filters-applied">
        <h4 style="margin-bottom: 10px; color: #0369a1;">🔍 Applied Filters</h4>
        ${filters.selectedLocations.length > 0 ?
        `<div><strong>Locations:</strong> ${filters.selectedLocations.map(loc =>
          `<span class="filter-tag">${loc}</span>`).join('')}</div>` : ''}
        ${filters.selectedIndicators.length > 0 ?
        `<div><strong>Indicators:</strong> ${filters.selectedIndicators.slice(0, 3).map(ind =>
          `<span class="filter-tag">${ind}</span>`).join('')}${filters.selectedIndicators.length > 3 ? ' <span class="filter-tag">+' + (filters.selectedIndicators.length - 3) + ' more</span>' : ''}</div>` : ''}
        ${filters.progressRange.min > 0 || filters.progressRange.max < 100 ?
        `<div><strong>Progress Range:</strong> <span class="filter-tag">${filters.progressRange.min}% - ${filters.progressRange.max}%</span></div>` : ''}
      </div>` : ''}

      <!-- Location Performance Summary -->
      <div class="section">
        <h2 class="section-title">🌍 Location Performance Overview</h2>
        <div class="location-summary">
          ${Object.entries(locationData).map(([location, indicators]) => {
          const avgProgress = indicators.length > 0
            ? Math.round(indicators.reduce((sum, ind) => sum + Math.min(100, ind.progressPercentage), 0) / indicators.length)
            : 0;

          return `
              <div class="location-card">
                <div class="location-name">${location}</div>
                <div style="font-size: 24px; font-weight: bold; color: #10b981; margin: 8px 0;">${avgProgress}%</div>
                <div style="font-size: 12px; color: #6b7280;">${indicators.length} indicators</div>
                ${indicators.slice(0, 3).map(ind => `
                  <div class="indicator-item">
                    <span style="font-size: 12px;">${ind.indicatorName.substring(0, 25)}${ind.indicatorName.length > 25 ? '...' : ''}</span>
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <span style="font-size: 12px; font-weight: bold;">${Math.round(ind.progressPercentage)}%</span>
                      <div class="progress-bar">
                        <div class="progress-fill" style="width: ${Math.min(100, ind.progressPercentage)}%;"></div>
                      </div>
                    </div>
                  </div>
                `).join('')}
                ${indicators.length > 3 ? `<div style="font-size: 11px; color: #6b7280; margin-top: 8px;">+${indicators.length - 3} more indicators</div>` : ''}
              </div>
            `;
        }).join('')}
        </div>
      </div>

      <!-- Charts Section - Linear Layout (One per row) -->
      <div class="section">
        <h2 class="section-title">📊 Performance Analysis</h2>
        
        <!-- Chart 1: Overall Progress Distribution -->
        <div class="chart-container">
          <div class="chart-title">Overall Progress Distribution</div>
          <div id="radial-chart" style="height: 400px;"></div>
          <p style="text-align: center; color: #6b7280; font-size: 14px; margin-top: 10px;">
            Individual indicator progress across all project locations
          </p>
        </div>
        
        <!-- Chart 2: Location Comparison -->
        <div class="chart-container">
          <div class="chart-title">Indicator Performance Across Locations</div>
          <div id="radar-chart" style="height: 400px;"></div>
          <p style="text-align: center; color: #6b7280; font-size: 14px; margin-top: 10px;">
            Comparative view showing how each indicator performs in different locations
          </p>
        </div>
        
        <!-- Chart 3: Progress Trends Over Time -->
        <div class="chart-container">
          <div class="chart-title">Progress Trends Over Time</div>
          <div id="line-chart" style="height: 400px;"></div>
          <p style="text-align: center; color: #6b7280; font-size: 14px; margin-top: 10px;">
            Historical progress tracking showing improvement trends by indicator
          </p>
        </div>
      </div>

      <!-- Implementation Pipeline - Single Row -->
      ${funnelData ? `
      <div class="section">
        <h2 class="section-title">🚀 Implementation Pipeline</h2>
        
        <div class="chart-container">
          <div class="chart-title">Project Implementation Funnel</div>
          <div id="funnel-chart" style="height: 450px;"></div>
          <p style="text-align: center; color: #6b7280; font-size: 14px; margin-top: 15px;">
            Implementation stages showing indicator progression from data collection to target achievement
          </p>
        </div>
        
        <div class="funnel-summary-cards">
          <div class="funnel-card completion">
            <h4>Completion Rate</h4>
            <div style="font-size: 28px; font-weight: bold; margin: 8px 0;">${funnelData.summary.completionRate}%</div>
            <div style="font-size: 12px;">Indicators meeting targets</div>
          </div>
          <div class="funnel-card quality">
            <h4>Data Quality</h4>
            <div style="font-size: 28px; font-weight: bold; margin: 8px 0;">${funnelData.summary.dataQualityScore}%</div>
            <div style="font-size: 12px;">Complete data collection</div>
          </div>
          <div class="funnel-card computation">
            <h4>Computation Success</h4>
            <div style="font-size: 28px; font-weight: bold; margin: 8px 0;">${funnelData.summary.computationSuccessRate}%</div>
            <div style="font-size: 12px;">Successful calculations</div>
          </div>
        </div>

        ${funnelData.recommendations.length > 0 ? `
        <div class="recommendations">
          <h4>📋 Recommendations</h4>
          <ul>
            ${funnelData.recommendations.map(rec => `<li>${rec}</li>`).join('')}
          </ul>
        </div>` : ''}
      </div>` : ''}

      <div class="footer">
        <p>🏢 This report was generated from live project data and provides insights for strategic decision-making.</p>
        <p>For technical questions about this report, please contact your system administrator.</p>
      </div>

      <script>
        const colors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#84cc16'];
        
        // Prepare chart data
        const locationData = ${JSON.stringify(locationData)};
        const timeSeriesData = ${JSON.stringify(timeSeriesData)};
        const funnelData = ${JSON.stringify(funnelData)};
        
        const renderCharts = () => {
          // 1. RADIAL CHART - Multi-series showing all indicators from all locations
          const allIndicators = Object.values(locationData).flat();
          console.log('All indicators for radial:', allIndicators);
          
          if (allIndicators.length > 0) {
            const radialSeries = allIndicators.slice(0, 6).map(ind => Math.min(100, Math.round(ind.progressPercentage)));
            const radialLabels = allIndicators.slice(0, 6).map((ind, index) => {
              const location = Object.keys(locationData).find(loc => 
                locationData[loc].some(item => item.projectIndicatorId === ind.projectIndicatorId)
              );
              return \`\${ind.indicatorName.substring(0, 15)} (\${location})\`;
            });
            
            console.log('Radial series:', radialSeries);
            console.log('Radial labels:', radialLabels);
            
            const radialChart = new ApexCharts(document.querySelector("#radial-chart"), {
              series: radialSeries,
              chart: {
                height: 400,
                type: 'radialBar',
                animations: { enabled: false }
              },
              plotOptions: {
                radialBar: {
                  hollow: { size: '25%' },
                  track: { margin: 8 },
                  dataLabels: {
                    name: {
                      show: true,
                      fontSize: '10px',
                      fontWeight: 'bold',
                      color: '#333',
                      offsetY: -8
                    },
                    value: {
                      show: true,
                      fontSize: '12px',
                      fontWeight: 'bold',
                      color: '#333',
                      offsetY: 4,
                      formatter: function(val) { 
                        return parseInt(val, 10) + '%'; 
                      }
                    }
                  }
                }
              },
              labels: radialLabels,
              colors: colors.slice(0, radialSeries.length),
              legend: { 
                show: true,
                position: 'bottom',
                fontSize: '10px',
                markers: { size: 6 }
              }
            });
            radialChart.render();
          }

          // 2. RADAR CHART - Indicators across locations
          const locations = Object.keys(locationData);
          console.log('Locations for radar:', locations);
          
          if (locations.length > 0) {
            // Get all unique indicator names
            const allIndicatorNames = [...new Set(
              Object.values(locationData).flat().map(item => item.indicatorName)
            )];
            console.log('All indicator names:', allIndicatorNames);
            
            // Create series - each indicator is a series, locations are axes
            const radarSeries = allIndicatorNames.slice(0, 5).map(indicatorName => {
              const data = locations.map(location => {
                const locationIndicators = locationData[location] || [];
                const indicator = locationIndicators.find(item => item.indicatorName === indicatorName);
                const progress = indicator ? Math.min(100, Math.round(indicator.progressPercentage)) : 0;
                console.log(\`\${indicatorName} in \${location}: \${progress}%\`);
                return progress;
              });
              
              return {
                name: indicatorName.substring(0, 20),
                data: data
              };
            });
            
            console.log('Radar series:', radarSeries);
            
            if (radarSeries.length > 0 && radarSeries[0].data.length > 0) {
              const radarChart = new ApexCharts(document.querySelector("#radar-chart"), {
                series: radarSeries,
                chart: {
                  height: 400,
                  type: 'radar',
                  animations: { enabled: false }
                },
                xaxis: {
                  categories: locations,
                  labels: {
                    style: {
                      fontSize: '11px',
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
                    formatter: function(val) {
                      return val + '%';
                    },
                    style: {
                      fontSize: '10px'
                    }
                  }
                },
                plotOptions: {
                  radar: {
                    size: 120,
                    polygons: {
                      strokeColors: '#e8e8e8',
                      fill: {
                        colors: ['#f8f8f8', 'transparent']
                      }
                    }
                  }
                },
                colors: colors.slice(0, radarSeries.length),
                stroke: {
                  show: true,
                  width: 2
                },
                fill: {
                  opacity: 0.1
                },
                markers: {
                  size: 3,
                  strokeColors: '#fff',
                  strokeWidth: 1
                },
                legend: {
                  show: true,
                  position: 'bottom',
                  fontSize: '10px',
                  markers: { size: 6 }
                }
              });
              radarChart.render();
            }
          }

          // 3. LINE CHART - Progress over time
          const years = Object.keys(timeSeriesData).sort();
          console.log('Years for line chart:', years);
          
          if (years.length > 0) {
            const indicators = [...new Set(
              Object.values(timeSeriesData).flat().map(item => item.indicatorName)
            )];
            console.log('Indicators for line chart:', indicators);
            
            const lineSeries = indicators.slice(0, 4).map(indicatorName => {
              const data = years.map(year => {
                const yearData = timeSeriesData[year] || [];
                const indicator = yearData.find(item => item.indicatorName === indicatorName);
                const progress = indicator ? Math.min(100, Math.round(indicator.progressPercentage)) : 0;
                console.log(\`\${indicatorName} in \${year}: \${progress}%\`);
                return progress;
              });
              
              return {
                name: indicatorName.substring(0, 25),
                data: data
              };
            });
            
            console.log('Line series:', lineSeries);
            
            if (lineSeries.length > 0 && lineSeries[0].data.length > 0) {
              const lineChart = new ApexCharts(document.querySelector("#line-chart"), {
                series: lineSeries,
                chart: {
                  height: 400,
                  type: 'line',
                  animations: { enabled: false }
                },
                stroke: { 
                  curve: 'smooth', 
                  width: 3 
                },
                xaxis: { 
                  categories: years,
                  title: {
                    text: 'Year',
                    style: { fontSize: '12px' }
                  }
                },
                yaxis: { 
                  min: 0, 
                  max: 100,
                  title: {
                    text: 'Progress (%)',
                    style: { fontSize: '12px' }
                  }
                },
                colors: colors.slice(0, lineSeries.length),
                legend: { 
                  position: 'bottom',
                  fontSize: '10px'
                },
                dataLabels: {
                  enabled: false
                },
                tooltip: {
                  y: {
                    formatter: function(val) {
                      return val + '%';
                    }
                  }
                }
              });
              lineChart.render();
            }
          }

          // 4. FUNNEL CHART
          if (funnelData && funnelData.stages && funnelData.stages.length > 0) {
            console.log('Funnel data:', funnelData.stages);
            
            const funnelChart = new ApexCharts(document.querySelector("#funnel-chart"), {
              series: [{
                name: 'Indicators',
                data: funnelData.stages.map(stage => stage.value)
              }],
              chart: {
                type: 'bar',
                height: 450,
                animations: { enabled: false }
              },
              plotOptions: {
                bar: {
                  horizontal: true,
                  distributed: true,
                  barHeight: '70%',
                  borderRadius: 4
                }
              },
              colors: ['#00E396', '#00D9FF', '#008FFB', '#FEB019', '#FF4560', '#775DD0'],
              xaxis: {
                categories: funnelData.stages.map(stage => stage.stage),
                labels: {
                  style: { fontSize: '11px' }
                }
              },
              yaxis: {
                title: {
                  text: 'Implementation Stages',
                  style: { fontSize: '12px' }
                }
              },
              dataLabels: {
                enabled: true,
                formatter: function(val, opts) {
                  const stage = funnelData.stages[opts.dataPointIndex];
                  return val + ' (' + stage.percentage + '%)';
                },
                style: {
                  colors: ['#fff'],
                  fontSize: '11px',
                  fontWeight: 'bold'
                }
              },
              legend: {
                show: false
              }
            });
            funnelChart.render();
          }
        };

        // Wait for ApexCharts to load
        const waitForApexCharts = () => {
          if (typeof ApexCharts !== 'undefined' && document.readyState === 'complete') {
            console.log('ApexCharts loaded, rendering charts...');
            renderCharts();
          } else {
            console.log('Waiting for ApexCharts...');
            setTimeout(waitForApexCharts, 100);
          }
        };
        
        waitForApexCharts();
      </script>
    </body>
    </html>
    `;

    await page.setContent(htmlContent, {
      waitUntil: 'networkidle0',
      timeout: 30000
    });

    await page.waitForFunction(
      () => document.querySelectorAll('[id$="-chart"]').length > 0,
      { timeout: 10000 }
    );

    await new Promise(resolve => setTimeout(resolve, 4000));

    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '15mm',
        bottom: '15mm',
        left: '15mm',
        right: '15mm'
      },
      preferCSSPageSize: true
    });

    await browser.close();

    return new Response(pdf, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=project-${projectId}-dashboard-report.pdf`,
        'Cache-Control': 'no-cache',
      },
    });

  } catch (error) {
    console.error('Error generating project dashboard PDF:', error);
    return Response.json(
      {
        error: 'Failed to generate PDF',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
