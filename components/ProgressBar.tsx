// import React from 'react';
//
// // ProgressBar component that dynamically handles different indicator types and their targets
// const ProgressBar = ({
//   value = 0,                    // Current progress value
//   currentValue = null,          // Current value (if different from normalized value)
//   target = 100,                 // Target value (can come from global_target_value or project_target_value)
//   baseline = 0,                 // Baseline value (can come from global_baseline_value or project_baseline_value)
//   color = "#4C9F38",            // Default color (can be overridden with SDG goal colors)
//   height = "0.75rem",           // Height of the progress bar
//   showValue = true,             // Whether to show the value text
//   showTarget = true,            // Whether to show the target
//   showBaseline = false,         // Whether to show the baseline
//   label = "",                   // Optional label for the progress bar
//   className = "",               // Additional CSS classes
//   valueSuffix = "",             // Suffix for the value (%, points, etc.)
//   targetSuffix = "",            // Suffix for the target
//   valuePrefix = "",             // Prefix for the value
//   animated = true,              // Whether to show animation
//   progressDirection = "up"      // Whether higher values are better ('up') or lower values are better ('down')
// }) => {
//   // Determine the actual current value to display
//   const displayValue = currentValue !== null ? currentValue : value;
//
//   // Calculate percentage of completion based on baseline and target
//   const calculatePercentage = () => {
//     // If target and baseline are the same, we can't calculate percentage
//     if (target === baseline) return 0;
//
//     // Normalize the range based on direction
//     if (progressDirection === "up") {
//       // Higher is better
//       const range = target - baseline;
//       const progress = value - baseline;
//       return Math.min(100, Math.max(0, (progress / range) * 100));
//     } else {
//       // Lower is better (inverted calculation)
//       const range = baseline - target;
//       const progress = baseline - value;
//       return Math.min(100, Math.max(0, (progress / range) * 100));
//     }
//   };
//
//   const percentage = calculatePercentage();
//
//   // Determine color class based on percentage
//   const getColorClass = () => {
//     if (color) return "";
//
//     if (percentage >= 90) return "bg-green-500";
//     if (percentage >= 70) return "bg-green-400";
//     if (percentage >= 50) return "bg-yellow-400";
//     if (percentage >= 30) return "bg-orange-400";
//     return "bg-red-500";
//   };
//
//   // Format a number to one decimal place if it has decimals
//   const formatNumber = (num) => {
//     return Number.isInteger(num) ? num : Math.round(num * 10) / 10;
//   };
//
//   return (
//     <div className={`w-full ${className}`}>
//       {/* Label row with current/target values */}
//       {(label || showValue || showTarget || showBaseline) && (
//         <div className="flex justify-between items-center mb-1 text-sm">
//           {label && <div className="font-medium">{label}</div>}
//
//           <div className="flex gap-2 ml-auto text-gray-600">
//             {showValue && (
//               <span>
//                 {valuePrefix}{formatNumber(displayValue)}{valueSuffix}
//               </span>
//             )}
//
//             {showTarget && (
//               <span className="flex gap-1">
//                 {showValue && <span>/</span>}
//                 <span title="Target value">
//                   Target: {formatNumber(target)}{targetSuffix}
//                 </span>
//               </span>
//             )}
//
//             {showBaseline && baseline !== 0 && (
//               <span className="text-xs text-gray-500" title="Baseline value">
//                 (Baseline: {formatNumber(baseline)})
//               </span>
//             )}
//           </div>
//         </div>
//       )}
//
//       {/* Progress bar container */}
//       <div
//         className="w-full bg-gray-200 rounded-full overflow-hidden"
//         style={{ height }}
//       >
//         {/* Actual progress bar */}
//         <div
//           className={`h-full rounded-full ${getColorClass()} ${animated ? 'transition-all duration-500 ease-out' : ''}`}
//           style={{
//             width: `${percentage}%`,
//             backgroundColor: color || undefined
//           }}
//           role="progressbar"
//           aria-valuenow={percentage}
//           aria-valuemin="0"
//           aria-valuemax="100"
//           title={`${Math.round(percentage)}% progress`}
//         />
//       </div>
//
//       {/* Optional percentage display below the bar */}
//       {!showValue && percentage > 0 && (
//         <div className="text-right text-xs mt-1 text-gray-500">
//           {Math.round(percentage)}%
//         </div>
//       )}
//     </div>
//   );
// };
//
// export default ProgressBar;
