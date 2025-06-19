// "use client";
//
// import { useEffect, useState } from "react";
// import { getBabyIndicator } from "@/app/actions/actions_projectmanagement";
// import {
//   IGoalWithIndicators,
//   IGoalIndicatorSimple,
//   IGoalSubIndicatorSimple,
// } from "@/types/indicator.types";
// import { MdKeyboardArrowDown, MdKeyboardArrowUp } from "react-icons/md";
//
// const AddProjectIndicatorsRecursive = ({
//   gols,
// }: {
//   gols: IGoalWithIndicators[];
// }) => {
//   const [goals, setGoals] = useState<IGoalWithIndicators[]>(gols);
//   const [openGoals, setOpenGoals] = useState<Record<string, boolean>>({});
//   const [showMoreIndicators, setShowMoreIndicators] = useState<
//     Record<string, boolean>
//   >({});
//
//   useEffect(() => {
//     console.log("effect goals:");
//     console.log(goals);
//   }, [goals]);
//
//   const toggleGoal = (goalId: number) => {
//     setOpenGoals((prev) => ({
//       ...prev,
//       [goalId]: !prev[goalId],
//     }));
//   };
//
//   const toggleMoreIndicators = (indicatorId: number) => {
//     setShowMoreIndicators((prev) => ({
//       ...prev,
//       [indicatorId]: !prev[indicatorId],
//     }));
//   };
//
//   const [selectedIndicators, setSelectedIndicators] = useState<
//     IGoalIndicatorSimple[]
//   >([]);
//
//   const handleIndicatorSelect = (indicator: IGoalIndicatorSimple) => {
//     if (selectedIndicators.includes(indicator)) {
//       setSelectedIndicators(
//         selectedIndicators.filter(
//           (i) => i.goal_indicator_id !== indicator.goal_indicator_id,
//         ),
//       );
//     } else {
//       setSelectedIndicators([...selectedIndicators, indicator]);
//     }
//   };
//
//   const addSubIndicator = (
//     indicators: IGoalSubIndicatorSimple[],
//     parentId: number,
//     newSubIndicators: IGoalSubIndicatorSimple[],
//   ): IGoalSubIndicatorSimple[] => {
//     return indicators.map((indicator) => {
//       if (indicator.goal_sub_indicator_id === parentId) {
//         return {
//           ...indicator,
//           sub_indicators: [...indicator.sub_indicators, ...newSubIndicators],
//         };
//       }
//       return {
//         ...indicator,
//         sub_indicators: addSubIndicator(
//           indicator.sub_indicators,
//           parentId,
//           newSubIndicators,
//         ),
//       };
//     });
//   };
//
//   const deepUpdateSubIndicator = (
//     indicators: IGoalSubIndicatorSimple[],
//     parentId: number,
//     newSubIndicators: IGoalSubIndicatorSimple[],
//   ): IGoalSubIndicatorSimple[] => {
//     return indicators.map((indicator) => {
//       if (indicator.goal_sub_indicator_id === parentId) {
//         return {
//           ...indicator,
//           sub_indicators: [...indicator.sub_indicators, ...newSubIndicators],
//         };
//       }
//
//       // Recursively check and update sub-indicators at deeper levels
//       return {
//         ...indicator,
//         sub_indicators: deepUpdateSubIndicator(
//           indicator.sub_indicators,
//           parentId,
//           newSubIndicators,
//         ),
//       };
//     });
//   };
//
//   const updateSubIndicators = (
//     subIndicators: IGoalSubIndicatorSimple[],
//     parentId: number,
//     newSubIndicators: IGoalSubIndicatorSimple[],
//   ): IGoalSubIndicatorSimple[] => {
//     return subIndicators.map((sub) => {
//       // Log each sub-indicator being checked
//       console.log(`Checking sub-indicator: ${sub.goal_sub_indicator_id}`);
//
//       // If this is the correct parent, update its `sub_indicators`
//       if (sub.goal_sub_indicator_id === parentId) {
//         console.log(`Updating sub-indicator: ${parentId}`);
//         return {
//           ...sub,
//           sub_indicators: [...sub.sub_indicators, ...newSubIndicators], // ✅ Correctly appending new sub-indicators
//         };
//       }
//
//       // Recursively update deeper levels
//       const updatedSubIndicators = updateSubIndicators(
//         sub.sub_indicators,
//         parentId,
//         newSubIndicators,
//       );
//
//       if (updatedSubIndicators !== sub.sub_indicators) {
//         console.log(
//           `Updated child sub-indicator for: ${sub.goal_sub_indicator_id}`,
//         );
//       }
//
//       return {
//         ...sub,
//         sub_indicators: updatedSubIndicators,
//       };
//     });
//   };
//
//   const insertNewIndicator = (
//     parentId: number,
//     newIndicators: IGoalSubIndicatorSimple[],
//   ) => {
//     setGoals((prevGoals) =>
//       prevGoals.map((goal) => ({
//         ...goal,
//         indicators: goal.indicators.map((indicator) => {
//           // Check if the indicator is actually a sub-indicator before updating
//           if ("goal_sub_indicator_id" in indicator) {
//             return {
//               ...indicator,
//               sub_indicators: updateSubIndicators(
//                 indicator.sub_indicators,
//                 parentId,
//                 newIndicators,
//               ),
//             };
//           }
//           return indicator;
//         }),
//       })),
//     );
//   };
//
//   function findSubIndicatorById(
//     subIndicators: IGoalSubIndicatorSimple[],
//     targetId: number,
//   ): IGoalSubIndicatorSimple | null {
//     for (const subIndicator of subIndicators) {
//       if (subIndicator.sub_indicator_id === targetId) {
//         return subIndicator;
//       }
//       // Recursively search in sub-indicators
//       console.log(targetId);
//       const found = findSubIndicatorById(subIndicator.sub_indicators, targetId);
//       if (found) {
//         console.log("found!");
//         return found;
//       }
//     }
//     return null; // Not found
//   }
//
//   const newSolution = (
//     parentId: number,
//     newIndicator: IGoalSubIndicatorSimple[],
//   ) => {
//     const newGoals = goals.map((goal) => {
//       goal.indicators.map((indicator) => {
//         findSubIndicatorById(indicator.sub_indicators, parentId);
//       });
//     });
//   };
//
//   const handleGetMoreIndicators = async (
//     subIndicatorId: number | undefined,
//   ) => {
//     if (!subIndicatorId) {
//       console.log("Invalid sub-indicator ID");
//       return;
//     }
//     console.log(subIndicatorId);
//     const newSubIndicators = await getBabyIndicator(subIndicatorId);
//
//     if (!newSubIndicators || newSubIndicators.length === 0) {
//       console.log("No new sub-indicators found.");
//       return;
//     }
//
//     // Assuming you have your goals data stored somewhere
//     // For example: const [goals, setGoals] = useState<IGoalWithIndicators[]>([]);
//
//     setGoals((prevGoals) => {
//       // Create a deep copy to avoid direct state mutation
//       const updatedGoals = JSON.parse(
//         JSON.stringify(prevGoals),
//       ) as IGoalWithIndicators[];
//
//       // Recursive function to find and update the matching sub-indicator
//       const updateSubIndicators = (
//         items: IGoalSubIndicatorSimple[],
//       ): boolean => {
//         for (let i = 0; i < items.length; i++) {
//           const item = items[i];
//
//           // Check if this is the sub-indicator we're looking for
//           if (item.sub_indicator_id === subIndicatorId) {
//             // Update its sub_indicators array with the new data
//
//             item.sub_indicators = [...item.sub_indicators, ...newSubIndicators];
//             return true; // Found and updated
//           }
//
//           // If not found, recursively check this item's sub-indicators
//           if (item.sub_indicators.length > 0) {
//             const found = updateSubIndicators(item.sub_indicators);
//             if (found) return true;
//           }
//         }
//
//         return false; // Not found in this branch
//       };
//
//       // Check each goal's indicators
//       for (const goal of updatedGoals) {
//         for (const indicator of goal.indicators) {
//           // Try to find and update in this indicator's sub-indicators
//           if (updateSubIndicators(indicator.sub_indicators)) {
//             return updatedGoals; // Return updated state if found
//           }
//         }
//       }
//
//       console.log(
//         `Sub-indicator with ID ${subIndicatorId} not found in the current structure.`,
//       );
//       return prevGoals; // Return unchanged state if not found
//     });
//   };
//
//   const RenderSubIndicators = ({
//     subIndicators,
//   }: {
//     subIndicators: IGoalSubIndicatorSimple[];
//   }) => {
//     return (
//       <div className="w-full flex flex-col gap-2">
//         {subIndicators.map((sub, index) => (
//           <div
//             key={index}
//             className="w-full p-4 flex flex-col gap-2 bg-gray-100"
//           >
//             <div className="w-full flex items-center justify-between">
//               <p>{sub.indicator_name}</p>
//               <p>{sub.indicator_target}</p>
//             </div>
//
//             {/* Only show fetch button if this sub-indicator has a sub_indicator_id */}
//             {sub.sub_indicator_id && (
//               <div>
//                 <button
//                   onClick={() => handleGetMoreIndicators(sub.sub_indicator_id)}
//                   className="w-full p-2 text-start bg-gray-200 flex items-center justify-between"
//                 >
//                   {/* <span>
//                     {showMoreIndicators[sub.sub_indicator_id!]
//                       ? "Hide child indicators"
//                       : "Show child indicators"}
//                   </span>
//                   {showMoreIndicators[sub.sub_indicator_id!] ? (
//                     <MdKeyboardArrowUp />
//                   ) : (
//                     <MdKeyboardArrowDown />
//                   )} */}
//                   View More Indicators
//                 </button>
//               </div>
//             )}
//
//             {/* Show child sub-indicators if expanded */}
//             {/* {showMoreIndicators[sub.sub_indicator_id!] &&
//               sub.sub_indicators.length > 0 && (
//                 <div className="ml-4 border-l-2 border-green-200 pl-2">
//                   <RenderSubIndicators subIndicators={sub.sub_indicators} />
//                 </div>
//               )} */}
//
//             {sub.sub_indicators.map((child, index) => (
//               <div
//                 key={index}
//                 className="ml-4 border-l-2 border-green-200 pl-2"
//               >
//                 <RenderSubIndicators subIndicators={child.sub_indicators} />
//               </div>
//             ))}
//           </div>
//         ))}
//       </div>
//     );
//   };
//
//   const renderIndicator = (
//     selectedIndicators: IGoalIndicatorSimple[],
//     // indicator: IGoalIndicatorSimple | IGoalSubIndicatorSimple,
//   ) => {
//     return (
//       <>
//         {goals.map((goal, index) => {
//           const goalIndicators = selectedIndicators.filter((ind) =>
//             goal.indicators.some(
//               (goalIndicator) =>
//                 goalIndicator.goal_indicator_id === ind.goal_indicator_id,
//             ),
//           );
//
//           return (
//             goalIndicators.length > 0 && (
//               <div key={index} className="w-full flex flex-col gap-2">
//                 <p className="w-full p-4 bg-gray-200 text-xl font-bold uppercase">
//                   {goal.name}
//                 </p>
//                 {goalIndicators.map((indicator, index) => (
//                   <div
//                     key={index}
//                     className="w-full py-2 px-4 flex flex-col items-start justify-center gap-4 border border-gray-300"
//                   >
//                     <div className="w-full flex flex-col gap-2">
//                       <div className="w-full flex items-center justify-between">
//                         <div className="w-3/4">
//                           <p className="text-sm font-semibold text-green-800">
//                             Indicator:
//                           </p>
//                           <p className="font-black uppercase text-gray-700">
//                             {indicator.indicator_name}
//                           </p>
//                         </div>
//                         <div className="w-1/4 text-end ">
//                           <p className="text-sm font-semibold text-green-800">
//                             2030 Target
//                           </p>
//                           <p className="text-lg font-black">
//                             {indicator.indicator_target}
//                           </p>
//                         </div>
//                       </div>
//                       <hr className="w-full border border-gray-200" />
//                     </div>
//                     <div className="w-full flex flex-col gap-2">
//                       <div className="w-full flex items-center justify-between">
//                         <p className="text-green-800 font-bold text-sm">
//                           Sub-Indicators:
//                         </p>
//                         <p className="text-green-800 font-bold text-sm">
//                           2030 Target
//                         </p>
//                       </div>
//                       <div className="w-full flex flex-col gap-4">
//                         <div className="w-full flex flex-col gap-4">
//                           <RenderSubIndicators
//                             subIndicators={indicator.sub_indicators}
//                           />
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )
//           );
//         })}
//       </>
//     );
//   };
//
//   return (
//     <>
//       <div className="w-full min-h-screen p-10 flex items-center justify-center bg-green-50">
//         <div className="w-full p-10 flex flex-col gap-10 bg-white drop-shadow-lg">
//           <div>
//             <h1>Add Project Indicators</h1>
//           </div>
//           <div className="w-full flex items-start justify-between gap-10">
//             <div className="w-[40%] border-2 border-gray-300 flex flex-col">
//               {goals.map((goal) => (
//                 <div key={goal.goal_id} className="w-full flex flex-col gap-2">
//                   <div className="w-full p-4 flex items-center justify-between bg-gray-200">
//                     <h1 className="text-lg font-bold text-green-800">
//                       {goal.name}
//                     </h1>
//                     <button onClick={() => toggleGoal(goal.goal_id)}>
//                       {" "}
//                       {openGoals[goal.goal_id] ? (
//                         <MdKeyboardArrowUp className="text-xl" />
//                       ) : (
//                         <MdKeyboardArrowDown className="text-xl" />
//                       )}
//                     </button>
//                   </div>
//                   {openGoals[goal.goal_id] && (
//                     <div className="w-full p-2 flex flex-col gap-4">
//                       {goal.indicators.map((indicator) => (
//                         <button
//                           key={indicator.goal_indicator_id}
//                           className={`w - full p-2 text-start ${selectedIndicators.includes(indicator) ? "bg-gradient-to-r from-green-100 to-orange-50" : "bg-gray-100"}`}
//                           onClick={() => handleIndicatorSelect(indicator)}
//                         >
//                           {indicator.indicator_name}
//                         </button>
//                       ))}
//                     </div>
//                   )}
//                 </div>
//               ))}
//             </div>
//             <div className="w-[60%]">
//               {selectedIndicators.length > 0 ? (
//                 <>{renderIndicator(selectedIndicators)}</>
//               ) : (
//                 <div className="w-full text-lg font-semibold text-gray-500">
//                   Select indicators for this project
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//       ) : {""}
//     </>
//   );
// };
//
// export default AddProjectIndicatorsRecursive;
