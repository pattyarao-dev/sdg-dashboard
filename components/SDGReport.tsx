// import React from 'react';
// import { ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar } from 'recharts';
//
// const SDGReport = ({ data, goals, indicators, filters, locations }) => {
//   // SDG goal colors (already defined in your code)
//   const goalColors = {
//     1: "#E5243B", 2: "#DDA63A", 3: "#4C9F38", 4: "#C5192D", 
//     5: "#FF3A21", 6: "#26BDE2", 7: "#FCC30B", 8: "#A21942", 
//     9: "#FD6925", 10: "#DD1367", 11: "#FD9D24", 12: "#BF8B2E", 
//     13: "#3F7E44", 14: "#0A97D9", 15: "#56C02B", 16: "#00689D", 
//     17: "#19486A"
//   };
//
//   // Format number with commas
//   const formatNumber = (num) => {
//     return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
//   };
//
//   // Generate time series data based on your measurements
//   const generateTimeSeriesData = () => {
//     if (!data || data.length === 0) return [];
//
//     // Group data by date
//     const groupedData = data.reduce((acc, item) => {
//       const date = item.measurement_date.split('T')[0];
//       if (!acc[date]) {
//         acc[date] = {
//           date,
//           quarter: `Q${Math.floor((new Date(date).getMonth() + 3) / 3)} ${new Date(date).getFullYear()}`
//         };
//       }
//
//       // Add goal data
//       if (item.goal_id) {
//         acc[date][`goal_${item.goal_id}`] = (acc[date][`goal_${item.goal_id}`] || 0) + parseFloat(item.value);
//       }
//
//       return acc;
//     }, {});
//
//     // Convert to array and sort by date
//     return Object.values(groupedData).sort((a, b) => new Date(a.date) - new Date(b.date));
//   };
//
//   // Calculate status for indicators
//   const calculateIndicatorStatus = () => {
//     if (!indicators) return { performing: 0, atRisk: 0, critical: 0 };
//
//     let performing = 0, atRisk = 0, critical = 0;
//
//     indicators.forEach(indicator => {
//       const progress = indicator.current_value / indicator.global_target_value * 100;
//       if (progress > 75) performing++;
//       else if (progress > 50) atRisk++;
//       else critical++;
//     });
//
//     return { performing, atRisk, critical };
//   };
//
//   const timeSeriesData = generateTimeSeriesData();
//   const statusCounts = calculateIndicatorStatus();
//
//   // Prepare data for goal progress bar chart
//   const goalProgressData = goals.map(goal => ({
//     name: `Goal ${goal.goal_id}`,
//     progress: goal.progress || Math.floor(Math.random() * 100), // Fallback to random if no progress data
//     color: goal.color || goalColors[goal.goal_id]
//   }));
//
//   // Get indicators status summary data for pie chart
//   const statusSummaryData = [
//     { name: 'Performing', value: statusCounts.performing, color: '#4CAF50' },
//     { name: 'At Risk', value: statusCounts.atRisk, color: '#FFC107' },
//     { name: 'Critical', value: statusCounts.critical, color: '#F44336' }
//   ];
//
//   // Filter indicators by selected goal
//   const filteredIndicators = filters.goal_id 
//     ? indicators.filter(indicator => indicator.goal_id === filters.goal_id)
//     : indicators;
//
//   return (
//     <div className="bg-gray-50 min-h-screen p-6">
//       <div className="max-w-6xl mx-auto">
//         <header className="mb-8 text-center">
//           <h1 className="text-3xl font-bold mb-2">SDG Progress Report</h1>
//           <p className="text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
//         </header>
//
//         {/* Summary Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
//           <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
//             <h3 className="text-gray-500 text-sm uppercase mb-1">Goals Tracked</h3>
//             <p className="text-3xl font-bold">{goals.length}</p>
//           </div>
//
//           <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
//             <h3 className="text-gray-500 text-sm uppercase mb-1">Indicators</h3>
//             <p className="text-3xl font-bold">{indicators.length}</p>
//           </div>
//
//           <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
//             <h3 className="text-gray-500 text-sm uppercase mb-1">Locations</h3>
//             <p className="text-3xl font-bold">{locations.length}</p>
//           </div>
//
//           <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
//             <h3 className="text-gray-500 text-sm uppercase mb-1">Measurements</h3>
//             <p className="text-3xl font-bold">{formatNumber(data.length)}</p>
//           </div>
//         </div>
//
//         {/* Charts Row */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
//           {/* Indicator Status Pie Chart */}
//           <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
//             <h2 className="text-lg font-semibold mb-4">Indicator Status</h2>
//             <div className="h-64">
//               <ResponsiveContainer width="100%" height="100%">
//                 <PieChart>
//                   <Pie
//                     data={statusSummaryData}
//                     dataKey="value"
//                     nameKey="name"
//                     cx="50%"
//                     cy="50%"
//                     outerRadius={80}
//                     label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
//                   >
//                     {statusSummaryData.map((entry, index) => (
//                       <Cell key={`cell-${index}`} fill={entry.color} />
//                     ))}
//                   </Pie>
//                   <Tooltip formatter={(value) => [value, 'Indicators']} />
//                   <Legend />
//                 </PieChart>
//               </ResponsiveContainer>
//             </div>
//           </div>
//
//           {/* Goal Progress Trend */}
//           <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
//             <h2 className="text-lg font-semibold mb-4">Progress Trend</h2>
//             <div className="h-64">
//               <ResponsiveContainer width="100%" height="100%">
//                 <LineChart data={timeSeriesData}>
//                   <CartesianGrid strokeDasharray="3 3" />
//                   <XAxis 
//                     dataKey="quarter" 
//                     tick={{fontSize: 12}}
//                   />
//                   <YAxis 
//                     domain={[0, 100]}
//                     tickFormatter={(value) => `${value}%`}
//                   />
//                   <Tooltip formatter={(value) => [`${value}%`, 'Progress']} />
//                   <Legend />
//                   {filters.goal_id ? (
//                     <Line 
//                       type="monotone" 
//                       dataKey={`goal_${filters.goal_id}`} 
//                       name={`Goal ${filters.goal_id}`}
//                       stroke={goalColors[filters.goal_id]}
//                       strokeWidth={2}
//                     />
//                   ) : (
//                     // Show top 5 goals if no specific goal is selected
//                     goals.slice(0, 5).map(goal => (
//                       <Line 
//                         key={goal.goal_id}
//                         type="monotone" 
//                         dataKey={`goal_${goal.goal_id}`} 
//                         name={`Goal ${goal.goal_id}`}
//                         stroke={goalColors[goal.goal_id]}
//                         strokeWidth={2}
//                       />
//                     ))
//                   )}
//                 </LineChart>
//               </ResponsiveContainer>
//             </div>
//           </div>
//         </div>
//
//         {/* Goal Progress Overview */}
//         <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-8">
//           <h2 className="text-lg font-semibold mb-4">Goal Progress Overview</h2>
//           <div className="h-96">
//             <ResponsiveContainer width="100%" height="100%">
//               <BarChart 
//                 data={goalProgressData}
//                 layout="vertical"
//                 margin={{ top: 5, right: 30, left: 50, bottom: 5 }}
//               >
//                 <CartesianGrid strokeDasharray="3 3" />
//                 <XAxis 
//                   type="number" 
//                   domain={[0, 100]}
//                   tickFormatter={(value) => `${value}%`}
//                 />
//                 <YAxis 
//                   type="category" 
//                   dataKey="name" 
//                   tick={{fontSize: 12}}
//                   width={80}
//                 />
//                 <Tooltip formatter={(value) => [`${value}%`, 'Progress']} />
//                 <Bar 
//                   dataKey="progress" 
//                   name="Progress"
//                 >
//                   {goalProgressData.map((entry, index) => (
//                     <Cell key={`cell-${index}`} fill={entry.color} />
//                   ))}
//                 </Bar>
//               </BarChart>
//             </ResponsiveContainer>
//           </div>
//         </div>
//
//         {/* Indicator Table */}
//         <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
//           <h2 className="text-lg font-semibold mb-4">
//             {filters.goal_id ? `Goal ${filters.goal_id} Indicators` : 'All Indicators'}
//           </h2>
//
//           <div className="overflow-x-auto">
//             <table className="min-w-full divide-y divide-gray-200">
//               <thead className="bg-gray-50">
//                 <tr>
//                   <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Indicator
//                   </th>
//                   <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Current Value
//                   </th>
//                   <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Target
//                   </th>
//                   <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Progress
//                   </th>
//                   <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Status
//                   </th>
//                   <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Trend
//                   </th>
//                 </tr>
//               </thead>
//               <tbody className="bg-white divide-y divide-gray-200">
//                 {filteredIndicators.map((indicator) => {
//                   // Calculate indicator progress
//                   const progress = (indicator.current_value / indicator.global_target_value) * 100;
//
//                   // Determine status
//                   let status = 'critical';
//                   if (progress > 75) status = 'performing';
//                   else if (progress > 50) status = 'at-risk';
//
//                   // Determine trend
//                   const trend = Math.random() > 0.5 ? 'increasing' : 'decreasing';
//
//                   return (
//                     <tr key={indicator.indicator_id} className="hover:bg-gray-50">
//                       <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
//                         <div className="flex items-center">
//                           <div className="w-3 h-3 rounded-full mr-2" style={{ 
//                             backgroundColor: goalColors[indicator.goal_id] 
//                           }}></div>
//                           {indicator.indicator_code}: {indicator.name}
//                         </div>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm">
//                         {indicator.current_value}{indicator.unit_of_measurement}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm">
//                         {indicator.global_target_value}{indicator.unit_of_measurement}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm">
//                         <div className="w-full bg-gray-200 rounded-full h-2.5">
//                           <div 
//                             className="h-2.5 rounded-full" 
//                             style={{ 
//                               width: `${progress}%`,
//                               backgroundColor: status === 'performing' ? '#4CAF50' : 
//                                               status === 'at-risk' ? '#FFC107' : '#F44336'
//                             }}
//                           ></div>
//                         </div>
//                         <span className="text-xs mt-1 inline-block">{progress.toFixed(1)}%</span>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm">
//                         <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
//                           style={{ 
//                             backgroundColor: status === 'performing' ? 'rgba(76, 175, 80, 0.1)' : 
//                                            status === 'at-risk' ? 'rgba(255, 193, 7, 0.1)' : 'rgba(244, 67, 54, 0.1)', 
//                             color: status === 'performing' ? '#4CAF50' : 
//                                    status === 'at-risk' ? '#FFC107' : '#F44336'
//                           }}
//                         >
//                           {status.charAt(0).toUpperCase() + status.slice(1)}
//                         </span>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm">
//                         {trend === 'increasing' ? (
//                           <span className="text-green-600">↑ Improving</span>
//                         ) : (
//                           <span className="text-red-600">↓ Declining</span>
//                         )}
//                       </td>
//                     </tr>
//                   );
//                 })}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };
//
// export default SDGReport;
