// app/api/export-pdf/route.ts
import puppeteer from 'puppeteer';
import { NextRequest } from 'next/server';
import { DashboardProcessedGoal } from '@/types/dashboard.types';


interface GoalProgress {
  [key: number]: number;
}

interface RequestBody {
  goals: DashboardProcessedGoal[];
  goalProgress: GoalProgress;
}

interface StatusInfo {
  text: string;
  class: string;
}

const getStatus = (progress: number): StatusInfo => {
  if (progress >= 75) return { text: 'Excellent', class: 'status-excellent' };
  if (progress >= 50) return { text: 'Good', class: 'status-good' };
  if (progress >= 25) return { text: 'Moderate', class: 'status-moderate' };
  return { text: 'Needs Focus', class: 'status-poor' };
};

const sdgColors: string[] = [
  '#E5243B', '#DDA63A', '#4C9F38', '#C5192D', '#FF3A21', '#26BDE2',
  '#FCC30B', '#A21942', '#FD6925', '#DD1367', '#FD9D24', '#BF8B2E',
  '#3F7E44', '#0A97D9', '#56C02B', '#00689D', '#19486A'
];

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const body: RequestBody = await request.json();
    const { goals, goalProgress } = body;

    if (!goals || !Array.isArray(goals) || goals.length === 0) {
      return Response.json(
        { error: 'Goals data is required and must be a non-empty array' },
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

    // Calculate summary statistics
    const progressValues = Object.values(goalProgress);
    const averageProgress = progressValues.length > 0
      ? Math.round(progressValues.reduce((a, b) => a + b, 0) / progressValues.length)
      : 0;
    const excellentGoals = progressValues.filter(p => p >= 75).length;

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>SDG Goals Report</title>
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
          font-size: 28px;
          color: #1e40af;
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
          border-left: 4px solid #2563eb;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
        }
        
        .summary-item {
          text-align: center;
        }
        
        .summary-number {
          font-size: 24px;
          font-weight: bold;
          color: #2563eb;
        }
        
        .summary-label {
          font-size: 12px;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .goal-container { 
          margin-bottom: 30px; 
          page-break-inside: avoid;
          display: flex;
          align-items: center;
          border: 1px solid #e5e7eb;
          padding: 20px;
          border-radius: 12px;
          background: white;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        .goal-info { 
          flex: 1;
          padding-left: 25px;
        }
        
        .chart-container { 
          width: 220px; 
          height: 220px;
          flex-shrink: 0;
        }
        
        .goal-title {
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 8px;
        }
        
        .goal-name {
          font-size: 16px;
          margin-bottom: 15px;
          color: #4b5563;
        }
        
        .progress-bar {
          width: 100%;
          height: 24px;
          background-color: #f3f4f6;
          border-radius: 12px;
          overflow: hidden;
          margin: 12px 0;
          position: relative;
        }
        
        .progress-fill {
          height: 100%;
          border-radius: 12px;
          transition: width 0.3s ease;
          position: relative;
        }
        
        .progress-text {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-weight: bold;
          color: white;
          font-size: 12px;
          text-shadow: 1px 1px 1px rgba(0,0,0,0.5);
        }
        
        .status-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: bold;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .status-excellent { background: #10b981; color: white; }
        .status-good { background: #3b82f6; color: white; }
        .status-moderate { background: #f59e0b; color: white; }
        .status-poor { background: #ef4444; color: white; }
        
        .footer {
          margin-top: 40px;
          text-align: center;
          border-top: 1px solid #e5e7eb;
          padding-top: 20px;
          color: #6b7280;
          font-size: 12px;
        }
        
        @media print {
          .goal-container {
            break-inside: avoid;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🌍 SDG Goals Progress Report</h1>
        <p>Sustainable Development Goals Tracking Dashboard</p>
        <p>Generated on ${new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })}</p>
      </div>
      
      <div class="summary">
        <div class="summary-item">
          <div class="summary-number">${goals.length}</div>
          <div class="summary-label">Total Goals</div>
        </div>
        <div class="summary-item">
          <div class="summary-number">${averageProgress}%</div>
          <div class="summary-label">Average Progress</div>
        </div>
        <div class="summary-item">
          <div class="summary-number">${excellentGoals}</div>
          <div class="summary-label">Goals Above 75%</div>
        </div>
        <div class="summary-item">
          <div class="summary-number">${progressValues.filter(p => p < 25).length}</div>
          <div class="summary-label">Need Focus</div>
        </div>
      </div>
      
      ${goals.map((goal: DashboardProcessedGoal) => {
      const progress: number = goalProgress[goal.goalId] || 0;
      const color: string = sdgColors[goal.goalId - 1] || sdgColors[0];
      const status: StatusInfo = getStatus(progress);

      return `
          <div class="goal-container">
            <div class="chart-container" id="chart-${goal.goalId}"></div>
            <div class="goal-info">
              <div class="goal-title" style="color: ${color};">
                🎯 SDG ${goal.goalId}
              </div>
              <div class="goal-name">${goal.goalName}</div>
              <div class="progress-bar">
                <div class="progress-fill" style="width: ${progress}%; background: linear-gradient(90deg, ${color}, ${color}dd);">
                  <div class="progress-text">${progress}%</div>
                </div>
              </div>
              <div style="margin-top: 12px;">
                <span class="status-badge ${status.class}">${status.text}</span>
              </div>
            </div>
          </div>
        `;
    }).join('')}

      <div class="footer">
        <p>🌱 This report was automatically generated from your SDG tracking dashboard.</p>
        <p>For more information about the Sustainable Development Goals, visit <strong>sdgs.un.org</strong></p>
      </div>

      <script>
        const sdgColors = ${JSON.stringify(sdgColors)};
        const goals = ${JSON.stringify(goals)};
        const goalProgress = ${JSON.stringify(goalProgress)};
        
        const renderCharts = () => {
          goals.forEach(goal => {
            const progress = goalProgress[goal.goalId] || 0;
            const color = sdgColors[goal.goalId - 1] || sdgColors[0];
            
            const options = {
              series: [progress],
              chart: {
                height: 200,
                type: 'radialBar',
                animations: {
                  enabled: false
                }
              },
              plotOptions: {
                radialBar: {
                  hollow: {
                    size: '65%',
                  },
                  track: {
                    background: '#f1f5f9',
                    strokeWidth: '100%',
                  },
                  dataLabels: {
                    value: {
                      fontSize: '18px',
                      fontWeight: 'bold',
                      color: color,
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
              colors: [color],
              stroke: {
                lineCap: 'round'
              },
              fill: {
                type: 'gradient',
                gradient: {
                  shade: 'dark',
                  type: 'horizontal',
                  shadeIntensity: 0.5,
                  gradientToColors: [color],
                  inverseColors: true,
                  opacityFrom: 1,
                  opacityTo: 1,
                  stops: [0, 100]
                }
              }
            };
            
            const chartElement = document.querySelector(\`#chart-\${goal.goalId}\`);
            if (chartElement) {
              const chart = new ApexCharts(chartElement, options);
              chart.render();
            }
          });
        };
        
        // Wait for ApexCharts to load and DOM to be ready
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

    // Wait for charts to render using the new delay method
    await page.waitForFunction(
      () => document.querySelectorAll('[id^="chart-"]').length > 0,
      { timeout: 10000 }
    );

    // Additional wait to ensure charts are fully rendered
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
        'Content-Disposition': 'attachment; filename=sdg-goals-report.pdf',
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
