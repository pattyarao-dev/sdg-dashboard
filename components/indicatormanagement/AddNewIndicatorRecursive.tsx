// import { useState } from "react";
// import {
//   GoalIndicator,
//   GoalSubIndicator,
//   SubIndicator,
//   Indicator,
// } from "@/types/goal.types";
//
// const IndicatorForm = () => {
//   const [newIndicator, setNewIndicator] = useState({
//     name: "",
//     description: "",
//     global_target_value: 0,
//     global_baseline_value: 0,
//     required_Data: [],
//     subIndicators: [],
//   });
//
//   const handleInputChange = (field: keyof GoalIndicator, value: any) => {
//     setNewIndicator((prev) => ({ ...prev, [field]: value }));
//   };
//
//   const handleAddSubIndicator = (parentIndicator: GoalSubIndicator) => {
//     const newSubIndicator = {
//       name: "",
//       description: "",
//       global_target_value: 0,
//       global_baseline_value: 0,
//       required_data: [],
//       subIndicators: [],
//     };
//     setNewIndicator((prev) => {
//       const updateIndicators = (indicator: GoalSubIndicator) => {
//         if (indicator === parentIndicator) {
//           return {
//             ...indicator,
//             subIndicators: [...indicator.subIndicators, newSubIndicator],
//           };
//         }
//         return {
//           ...indicator,
//           subIndicators: indicator.subIndicators.map(updateIndicators),
//         };
//       };
//       return updateIndicators(prev);
//     });
//   };
//
//   const handleRemoveSubIndicator = (
//     parentIndicator: Indicator,
//     index: number,
//   ) => {
//     setNewIndicator((prev) => {
//       const updateIndicators = (indicator: Indicator): Indicator => {
//         if (indicator === parentIndicator) {
//           return {
//             ...indicator,
//             subIndicators: indicator.subIndicators.filter(
//               (_, i) => i !== index,
//             ),
//           };
//         }
//         return {
//           ...indicator,
//           subIndicators: indicator.subIndicators.map(updateIndicators),
//         };
//       };
//       return updateIndicators(prev);
//     });
//   };
//
//   const renderIndicatorForm = (
//     indicator: GoalIndicator,
//     parentIndicator?: GoalIndicator,
//   ) => {
//     return (
//       <div
//         key={indicator.name}
//         className={`w-full p-4 border ${parentIndicator ? "border-gray-300" : "border-orange-400"}`}
//       >
//         <h2
//           className={`${parentIndicator ? "text-gray-600" : "text-orange-400"} font-bold`}
//         >
//           {parentIndicator ? "Sub-Indicator" : "Indicator"}
//         </h2>
//         <div className="w-full flex flex-col gap-2">
//           <div className="w-full flex flex-col gap-8">
//             <div className="w-full flex flex-col gap-2">
//               <p className="text-sm text-green-800 font-semibold uppercase">
//                 Indicator Name:
//               </p>
//               <input
//                 type="text"
//                 placeholder="Indicator Name"
//                 value={newIndicator.name}
//                 onChange={(e) =>
//                   setNewIndicator({
//                     ...newIndicator,
//                     name: e.target.value,
//                   })
//                 }
//                 className="w-full p-2 border border-gray-300"
//               />
//             </div>
//             <div className="w-full flex flex-col gap-4">
//               <p className="text-sm text-green-800 font-semibold uppercase">
//                 Indicator Description:
//               </p>
//               <input
//                 type="text"
//                 placeholder="Indicator Description"
//                 value={newIndicator.description}
//                 onChange={(e) =>
//                   setNewIndicator({
//                     ...newIndicator,
//                     description: e.target.value,
//                   })
//                 }
//                 className="w-full p-2 border border-gray-300"
//               />
//             </div>
//
//             <div className="w-full flex items-center justify-between gap-8">
//               <div className="w-1/2 flex flex-col gap-4">
//                 <p className="text-sm text-green-800 font-semibold uppercase">
//                   2030 Target
//                 </p>
//                 <input
//                   type="number"
//                   placeholder="2030 Target"
//                   value={newIndicator.global_target_value}
//                   onChange={(e) =>
//                     setNewIndicator({
//                       ...newIndicator,
//                       global_target_value: Number(e.target.value),
//                     })
//                   }
//                   className="w-full p-2 border border-gray-300"
//                 />
//               </div>
//               <div className="w-1/2 flex flex-col gap-4">
//                 <p className="text-sm text-green-800 font-semibold uppercase">
//                   Baseline
//                 </p>
//                 <input
//                   type="number"
//                   placeholder="Baseline"
//                   value={newIndicator.global_baseline_value}
//                   onChange={(e) =>
//                     setNewIndicator({
//                       ...newIndicator,
//                       global_baseline_value: Number(e.target.value),
//                     })
//                   }
//                   className="w-full p-2 border border-gray-300"
//                 />
//               </div>
//             </div>
//             <div className="w-full flex flex-col flex-grow gap-4">
//               <p className="text-sm text-green-800 font-semibold uppercase">
//                 Input the required data to be collected for this indicator:
//               </p>
//               <div className="w-full h-[200px] overflow-y-scroll flex flex-col gap-2">
//                 {requiredData.map((data, index) => (
//                   <div
//                     key={index}
//                     className={`w-full p-2 flex items-center gap-2 ${requiredDataList.includes(data) ? "bg-green-50 border border-green-800" : "border border-gray-200"}`}
//                   >
//                     <button
//                       onClick={() => handleSelectRequiredData(data)}
//                       className="w-full text-left"
//                     >
//                       {data.name}
//                     </button>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//
//           <div className="flex gap-4">
//             <button
//               onClick={() => handleAddSubIndicator(indicator)}
//               className="px-4 py-2 bg-green-500 text-white rounded"
//             >
//               + Add Sub-Indicator
//             </button>
//             {parentIndicator && (
//               <button
//                 onClick={() =>
//                   handleRemoveSubIndicator(
//                     parentIndicator,
//                     parentIndicator.subIndicators.indexOf(indicator),
//                   )
//                 }
//                 className="px-4 py-2 bg-red-500 text-white rounded"
//               >
//                 Remove
//               </button>
//             )}
//           </div>
//         </div>
//
//         <div className="ml-6">
//           {indicator.subIndicators.map((subIndicator, index) => (
//             <div key={index}>
//               {renderIndicatorForm(subIndicator, indicator)}
//             </div>
//           ))}
//         </div>
//       </div>
//     );
//   };
//
//   return (
//     <div className="w-full p-10 bg-white drop-shadow-lg flex flex-col gap-8">
//       <div className="w-full flex flex-col gap-2">
//         <p className="text-lg font-semibold text-orange-400">
//           Add a New Indicator
//         </p>
//         <hr className="w-full border border-orange-400" />
//       </div>
//
//       {renderIndicatorForm(newIndicator)}
//
//       <button
//         onClick={() => console.log(newIndicator)}
//         className="px-6 py-2 bg-blue-500 text-white rounded"
//       >
//         Submit Indicator
//       </button>
//     </div>
//   );
// };
//
// export default IndicatorForm;
