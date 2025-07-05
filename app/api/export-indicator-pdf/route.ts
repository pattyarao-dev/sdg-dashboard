// app/api/export-indicator-pdf/route.ts
import puppeteer from 'puppeteer';
import { NextRequest } from 'next/server';

interface FlattenedIndicatorItem {
  id: number;
  name: string;
  description?: string | null;
  type: 'indicator' | 'sub-indicator';
  level: number;
  goalIndicatorId: number;
  goalSubIndicatorId?: number;
  parentId?: number | null;
  hasGoalTarget: boolean;
  source: 'goal_sub_indicator' | 'indicator_hierarchy';
}

interface ProgressData {
  [key: string]: number;
}

interface RequestBody {
  goalId: string;
  indicators: FlattenedIndicatorItem[];
  progressData: ProgressData;
  indicatorDescriptions: { [key: string]: any };
}

const sdgColors: string[] = [
  '#E5243B', '#DDA63A', '#4C9F38', '#C5192D', '#FF3A21', '#26BDE2',
  '#FCC30B', '#A21942', '#FD6925', '#DD1367', '#FD9D24', '#BF8B2E',
  '#3F7E44', '#0A97D9', '#56C02B', '#00689D', '#19486A'
];

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const body: RequestBody = await request.json();
    const { goalId, indicators, progressData, indicatorDescriptions } = body;

    if (!indicators || !Array.isArray(indicators) || indicators.length === 0) {
      return Response.json(
        { error: 'Indicators data is required and must be a non-empty array' },
        { status: 400 }
      );
    }

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

    const goalColor = sdgColors[parseInt(goalId) - 1] || sdgColors[0];

    // Calculate summary statistics using backend logic
    const mainIndicators = indicators.filter(item => item.type === 'indicator');
    const subIndicators = indicators.filter(item => item.type === 'sub-indicator');
    const indicatorsWithProgress = indicators.filter(item => item.hasGoalTarget);

    // Replicate backend calculation: include all values (including zeros), cap at 100%
    const allProgressValues: number[] = [];

    indicatorsWithProgress.forEach(item => {
      let progressValue = 0;

      if (item.type === 'indicator') {
        progressValue = progressData[`indicator-${item.goalIndicatorId}`] || 0;
      } else if (item.goalSubIndicatorId) {
        progressValue = progressData[`sub-indicator-${item.goalSubIndicatorId}`] || 0;
      }

      // Cap at 100% like backend does with LEAST(100, ...)
      allProgressValues.push(Math.min(100, progressValue));
    });

    const averageProgress = allProgressValues.length > 0
      ? Math.round(allProgressValues.reduce((a, b) => a + b, 0) / allProgressValues.length)
      : 0;

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>SDG Goal ${goalId} Indicators Report</title>
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
          border-bottom: 3px solid ${goalColor};
          padding-bottom: 20px;
        }
        
        .header h1 {
          font-size: 28px;
          color: ${goalColor};
          margin-bottom: 10px;
        }
        
        .header p {
          color: #6b7280;
          font-size: 14px;
        }
        
        .summary {
          background: #f8fafc;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 30px;
          border-left: 4px solid ${goalColor};
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 20px;
        }
        
        .summary-item {
          text-align: center;
        }
        
        .summary-number {
          font-size: 24px;
          font-weight: bold;
          color: ${goalColor};
        }
        
        .summary-label {
          font-size: 12px;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .indicator-container { 
          margin-bottom: 25px; 
          page-break-inside: avoid;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          background: white;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          overflow: hidden;
        }
        
        .indicator-header {
          background: linear-gradient(135deg, ${goalColor}22, ${goalColor}11);
          padding: 15px 20px;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .indicator-content {
          display: flex;
          align-items: center;
          padding: 20px;
        }
        
        .indicator-info { 
          flex: 1;
          padding-right: 20px;
        }
        
        .chart-container { 
          width: 200px; 
          height: 200px;
          flex-shrink: 0;
        }
        
        .no-progress-placeholder {
          width: 200px;
          height: 200px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f9fafb;
          border: 2px dashed #d1d5db;
          border-radius: 8px;
          flex-direction: column;
        }
        
        .indicator-title {
          font-size: 18px;
          font-weight: bold;
          color: ${goalColor};
          margin-bottom: 8px;
        }
        
        .sub-indicator-title {
          font-size: 16px;
          font-weight: 600;
          color: #4b5563;
          margin-bottom: 6px;
        }
        
        .indicator-description {
          font-size: 14px;
          color: #6b7280;
          margin-bottom: 12px;
          line-height: 1.5;
        }
        
        .progress-info {
          font-size: 14px;
          font-weight: 600;
          color: ${goalColor};
        }
        
        .level-badge {
          display: inline-block;
          padding: 2px 8px;
          background: #e5e7eb;
          color: #374151;
          border-radius: 12px;
          font-size: 10px;
          font-weight: bold;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-left: 8px;
        }
        
        .main-badge {
          background: ${goalColor};
          color: white;
        }
        
        .sub-indicators {
          margin-left: 20px;
          border-left: 2px solid ${goalColor}33;
          padding-left: 20px;
        }
        
        .notes-badge {
          background: #fbbf24;
          color: #92400e;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 10px;
          font-weight: bold;
          margin-left: 8px;
        }
        
        .indicator-notes {
          background: #fffbeb;
          border: 1px solid #fbbf24;
          border-radius: 8px;
          padding: 12px;
          margin-top: 12px;
        }
        
        .notes-content {
          font-size: 13px;
          line-height: 1.5;
          color: #374151;
          margin-bottom: 8px;
        }
        
        .notes-meta {
          padding-top: 8px;
          border-top: 1px solid #fde68a;
        }
          margin-top: 40px;
          text-align: center;
          border-top: 1px solid #e5e7eb;
          padding-top: 20px;
          color: #6b7280;
          font-size: 12px;
        }
        
        @media print {
          .indicator-container {
            break-inside: avoid;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🎯 SDG Goal ${goalId} Indicators Report</h1>
        <p>Sustainable Development Goal Indicators and Sub-indicators</p>
        <p>Generated on ${new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })}</p>
      </div>
      
      <div class="summary">
        <div class="summary-item">
          <div class="summary-number">${mainIndicators.length}</div>
          <div class="summary-label">Main Indicators</div>
        </div>
        <div class="summary-item">
          <div class="summary-number">${subIndicators.length}</div>
          <div class="summary-label">Sub-indicators</div>
        </div>
        <div class="summary-item">
          <div class="summary-number">${indicatorsWithProgress.length}</div>
          <div class="summary-label">With Targets</div>
        </div>
        <div class="summary-item">
          <div class="summary-number">${averageProgress}%</div>
          <div class="summary-label">Avg Progress</div>
        </div>
      </div>
      
      ${indicators.map((item) => {
      let progressPercentage = 0;
      let hasProgressData = false;

      if (item.hasGoalTarget) {
        if (item.type === "indicator") {
          progressPercentage = Math.round(progressData[`indicator-${item.goalIndicatorId}`] || 0);
          hasProgressData = true;
        } else if (item.type === "sub-indicator" && item.goalSubIndicatorId) {
          progressPercentage = Math.round(progressData[`sub-indicator-${item.goalSubIndicatorId}`] || 0);
          hasProgressData = true;
        }
      }

      const isMainIndicator = item.type === 'indicator';
      const marginLeft = item.level * 20;

      // Get indicator notes for main indicators
      const indicatorNotes = isMainIndicator && indicatorDescriptions[`indicator-${item.goalIndicatorId}`]
        ? indicatorDescriptions[`indicator-${item.goalIndicatorId}`]
        : null;

      return `
          <div class="indicator-container" style="margin-left: ${marginLeft}px;">
            <div class="indicator-header">
              <div class="${isMainIndicator ? 'indicator-title' : 'sub-indicator-title'}">
                ${item.name}
                <span class="level-badge ${isMainIndicator ? 'main-badge' : ''}">
                  ${isMainIndicator ? 'MAIN' : `L${item.level}`}
                </span>
                ${indicatorNotes ? '<span class="notes-badge">📋 Notes Available</span>' : ''}
              </div>
            </div>
            <div class="indicator-content">
              <div class="indicator-info">
                ${item.description ? `<div class="indicator-description">${item.description}</div>` : ''}
                ${hasProgressData ? `<div class="progress-info">Target Progress: ${progressPercentage}%</div>` : '<div class="progress-info">No progress target set</div>'}
                <div style="font-size: 12px; color: #9ca3af; margin-top: 8px;">
                  ${isMainIndicator ? 'Main Indicator' : `Sub-indicator (Level ${item.level})`}
                </div>
                
                ${indicatorNotes ? `
                <div class="indicator-notes">
                  <h4 style="color: ${goalColor}; margin: 12px 0 8px 0; font-size: 14px; font-weight: bold;">📋 Indicator Notes:</h4>
                  <div class="notes-content">
                    ${indicatorNotes.explanation ? indicatorNotes.explanation.replace(/\n/g, '<br>') : 'No detailed explanation available.'}
                  </div>
                  ${indicatorNotes.created_at ? `
                  <div class="notes-meta">
                    <span style="font-size: 11px; color: #6b7280;">
                      Created: ${new Date(indicatorNotes.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })}
                    </span>
                  </div>` : ''}
                </div>` : ''}
              </div>
              <div class="chart-container">
                ${hasProgressData ? `<div id="chart-${item.type}-${item.id}"></div>` : `
                  <div class="no-progress-placeholder">
                    <div style="font-size: 12px; color: #6b7280; text-align: center; font-weight: 500;">No Progress Target</div>
                    <div style="font-size: 10px; color: #9ca3af; text-align: center; margin-top: 4px;">Hierarchical Display</div>
                  </div>
                `}
              </div>
            </div>
          </div>
        `;
    }).join('')}

      <div class="footer">
        <p>📊 This report shows the hierarchical structure and progress of SDG Goal ${goalId} indicators.</p>
        <p>For more information about the Sustainable Development Goals, visit <strong>sdgs.un.org</strong></p>
      </div>

      <script>
        const goalColor = '${goalColor}';
        const indicators = ${JSON.stringify(indicators)};
        const progressData = ${JSON.stringify(progressData)};
        
        const renderCharts = () => {
          indicators.forEach(item => {
            let progressPercentage = 0;
            let hasProgressData = false;

            if (item.hasGoalTarget) {
              if (item.type === "indicator") {
                progressPercentage = Math.round(progressData[\`indicator-\${item.goalIndicatorId}\`] || 0);
                hasProgressData = true;
              } else if (item.type === "sub-indicator" && item.goalSubIndicatorId) {
                progressPercentage = Math.round(progressData[\`sub-indicator-\${item.goalSubIndicatorId}\`] || 0);
                hasProgressData = true;
              }
            }

            if (!hasProgressData) return;
            
            const options = {
              series: [progressPercentage],
              chart: {
                height: 180,
                type: 'radialBar',
                animations: {
                  enabled: false
                }
              },
              plotOptions: {
                radialBar: {
                  hollow: {
                    size: '60%',
                  },
                  track: {
                    background: '#f1f5f9',
                    strokeWidth: '100%',
                  },
                  dataLabels: {
                    value: {
                      fontSize: '16px',
                      fontWeight: 'bold',
                      color: goalColor,
                      formatter: function(val) {
                        return parseInt(val, 10) + '%';
                      }
                    },
                    name: {
                      show: false
                    }
                  }
                }
              },
              colors: [goalColor],
              stroke: {
                lineCap: 'round'
              }
            };
            
            const chartElement = document.querySelector(\`#chart-\${item.type}-\${item.id}\`);
            if (chartElement) {
              const chart = new ApexCharts(chartElement, options);
              chart.render();
            }
          });
        };
        
        const waitForApexCharts = () => {
          if (typeof ApexCharts !== 'undefined' && document.readyState === 'complete') {
            renderCharts();
          } else {
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
      () => document.querySelectorAll('[id^="chart-"]').length > 0,
      { timeout: 10000 }
    );

    await new Promise(resolve => setTimeout(resolve, 3000));

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
        'Content-Disposition': `attachment; filename=sdg-goal-${goalId}-indicators-report.pdf`,
        'Cache-Control': 'no-cache',
      },
    });

  } catch (error) {
    console.error('Error generating PDF:', error);
    return Response.json(
      {
        error: 'Failed to generate PDF',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
