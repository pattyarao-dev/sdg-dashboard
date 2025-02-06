"use client";

import React, { useEffect, useState } from "react";
// import { useRouter } from "next/router";
import GaugeChart from "@/components/GaugeChart";
import LineChart from "@/components/LineChart";
import SlicerChart from "@/components/SlicerChart";
import ProgressBarChart from "@/components/ProgressBarChart";
import StackedBarChart from "@/components/StackedBarChart";
import Scorecard from "@/components/Scorecard";
// import { getSdgData } from "@/api/get-sdg-data/route.ts";

const sdgColors: { [key: string]: string } = {
  "No Poverty": "#E5243B",
  "Zero Hunger": "#DDA63A",
  "Good Health and Well-being": "#4C9F38",
  "Quality Education": "#C5192D",
  "Gender Equality": "#FF3A21",
  "Clean Water and Sanitation": "#26BDE2",
  "Affordable and Clean Energy": "#FCC30B",
  "Decent Work and Economic Growth": "#A21942",
  "Industry, Innovation and Infrastructure": "#FD6925",
  "Reduced Inequalities": "#DD1367",
  "Sustainable Cities and Communities": "#FD9D24",
  "Responsible Consumption and Production": "#BF8B2E",
  "Climate Action": "#3F7E44",
  "Life Below Water": "#0A97D9",
  "Life on Land": "#56C02B",
  "Peace, Justice and Strong Institutions": "#00689D",
  "Partnerships for the Goals": "#19486A",
};

// // Dummy Data for SDG Progress
// const sdgData = [
//   {
//     id: 1,
//     title: "No Poverty",
//     global_target_value: 60,
//     global_current_value: [
//       { year: 2020, current: 25, target: 60 },
//       { year: 2021, current: 35, target: 60 },
//       { year: 2022, current: 45, target: 60 },
//       { year: 2023, current: 50, target: 60 },
//       { year: 2024, current: 55, target: 60 },
//       { year: 2025, current: 58, target: 60 },
//       { year: 2026, current: 57, target: 60 },
//       { year: 2027, current: 65, target: 60 },
//       { year: 2028, current: 70, target: 60 },
//       { year: 2029, current: 50, target: 60 },
//       { year: 2030, current: 70, target: 100 },
//     ],
//     indicators: [
//       {
//         name: "Poverty Rate",
//         current: [30, 40, 45, 50, 55, 60, 65, 70, 75, 85, 100],
//         target: [50, 55, 60, 65, 70, 85, 85, 85, 85, 85, 85],
//         sub_indicators: [
//           {
//             name: "Urban Poverty",
//             current: [10, 15, 18, 22, 25, 28, 32, 35, 38, 42, 50],
//             target: [15, 18, 22, 25, 28, 30, 35, 40, 45, 50, 55],
//           },
//           {
//             name: "Rural Poverty",
//             current: [20, 25, 27, 28, 30, 32, 33, 35, 37, 43, 50],
//             target: [35, 40, 45, 50, 55, 60, 60, 60, 60, 60, 60],
//           },
//         ],
//       },
//       {
//         name: "Employment Rate",
//         current: [60, 62, 65, 68, 70, 75, 78, 80, 85, 90, 100],
//         target: [60, 62, 65, 68, 70, 80, 80, 80, 80, 80, 80],
//         sub_indicators: [
//           {
//             name: "Male Employment",
//             current: [35, 38, 40, 42, 45, 48, 50, 52, 55, 58, 60],
//             target: [40, 42, 45, 47, 50, 55, 60, 65, 70, 75, 80],
//           },
//           {
//             name: "Female Employment",
//             current: [25, 24, 25, 26, 28, 30, 33, 35, 38, 40, 45],
//             target: [20, 20, 22, 25, 28, 30, 35, 40, 45, 50, 55],
//           },
//         ],
//       },
//       {
//         name: "Social Protection Coverage",
//         current: [50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100],
//         target: [60, 65, 70, 75, 75, 75, 75, 75, 75, 75, 75],
//         sub_indicators: [
//           {
//             name: "Public Assistance Programs",
//             current: [20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70],
//             target: [30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80],
//           },
//           {
//             name: "Healthcare Access",
//             current: [30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
//             target: [30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
//           },
//         ],
//       },
//     ],
//   },
//   {
//     id: 2,
//     title: "Zero Hunger",
//     global_target_value: 60,
//     global_current_value: [
//       { year: 2020, current: 40, target: 60 },
//       { year: 2021, current: 45, target: 60 },
//       { year: 2022, current: 50, target: 60 },
//       { year: 2023, current: 55, target: 60 },
//       { year: 2024, current: 40, target: 60 },
//       { year: 2025, current: 52, target: 60 },
//       { year: 2026, current: 65, target: 60 },
//       { year: 2027, current: 45, target: 60 },
//       { year: 2028, current: 75, target: 60 },
//       { year: 2029, current: 35, target: 60 },
//       { year: 2030, current: 75, target: 100 },
//     ],
//     indicators: [
//       {
//         name: "Malnutrition Rate",
//         current: [40, 42, 45, 48, 50, 53, 55, 60, 65, 70, 100],
//         target: [50, 55, 60, 65, 70, 75, 80, 80, 80, 80, 80],
//         sub_indicators: [
//           {
//             name: "Child Malnutrition",
//             current: [15, 18, 20, 22, 23, 25, 27, 30, 33, 40, 50],
//             target: [20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70],
//           },
//           {
//             name: "Adult Malnutrition",
//             current: [25, 24, 25, 26, 27, 28, 28, 30, 32, 30, 50],
//             target: [30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
//           },
//         ],
//       },
//       {
//         name: "Food Security Index",
//         current: [55, 57, 60, 63, 65, 68, 70, 75, 80, 85, 100],
//         target: [60, 65, 70, 75, 80, 85, 85, 85, 85, 85, 85],
//         sub_indicators: [
//           {
//             name: "Urban Food Security",
//             current: [20, 22, 23, 24, 25, 28, 30, 33, 35, 40, 45],
//             target: [25, 28, 30, 32, 35, 38, 40, 42, 45, 50, 55],
//           },
//           {
//             name: "Rural Food Security",
//             current: [35, 35, 37, 39, 40, 42, 45, 48, 50, 55, 60],
//             target: [35, 37, 40, 42, 45, 50, 55, 60, 65, 70, 75],
//           },
//         ],
//       },
//       {
//         name: "Agricultural Productivity",
//         current: [65, 67, 70, 73, 75, 78, 80, 85, 90, 95, 100],
//         target: [70, 75, 80, 80, 80, 80, 80, 80, 80, 80, 80],
//         sub_indicators: [
//           {
//             name: "Cereal Production",
//             current: [25, 28, 30, 32, 34, 36, 38, 40, 42, 45, 50],
//             target: [30, 32, 35, 37, 40, 42, 45, 47, 50, 53, 55],
//           },
//           {
//             name: "Livestock Production",
//             current: [40, 42, 44, 46, 48, 50, 52, 55, 58, 60, 65],
//             target: [40, 42, 45, 47, 50, 52, 55, 58, 60, 63, 65],
//           },
//         ],
//       },
//     ],
//   },
//   {
//     id: 3,
//     title: "Good Health and Well-being",
//     global_target_value: 80,
//     global_current_value: [
//       { year: 2020, current: 50, target: 80 },
//       { year: 2021, current: 55, target: 80 },
//       { year: 2022, current: 60, target: 80 },
//       { year: 2023, current: 65, target: 80 },
//       { year: 2024, current: 70, target: 80 },
//       { year: 2025, current: 65, target: 80 },
//       { year: 2026, current: 75, target: 80 },
//       { year: 2027, current: 78, target: 80 },
//       { year: 2028, current: 82, target: 80 },
//       { year: 2029, current: 60, target: 80 },
//       { year: 2030, current: 82, target: 100 },
//     ],
//     indicators: [
//       {
//         name: "Life Expectancy",
//         current: [70, 71, 72, 73, 74, 75, 76, 78, 80, 85, 100],
//         target: [75, 76, 77, 78, 79, 80, 81, 81, 81, 81, 81],
//         sub_indicators: [
//           {
//             name: "Male Life Expectancy",
//             current: [65, 67, 68, 70, 71, 72, 73, 75, 77, 80, 85],
//             target: [70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80],
//           },
//           {
//             name: "Female Life Expectancy",
//             current: [75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85],
//             target: [80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90],
//           },
//         ],
//       },
//     ],
//   },
//   {
//     id: 4,
//     title: "Quality Education",
//     global_target_value: 90,
//     global_current_value: [
//       { year: 2020, current: 60, target: 90 },
//       { year: 2021, current: 65, target: 90 },
//       { year: 2022, current: 70, target: 90 },
//       { year: 2023, current: 75, target: 90 },
//       { year: 2024, current: 80, target: 90 },
//       { year: 2025, current: 78, target: 90 },
//       { year: 2026, current: 87, target: 90 },
//       { year: 2027, current: 88, target: 90 },
//       { year: 2028, current: 90, target: 90 },
//       { year: 2029, current: 30, target: 90 },
//       { year: 2030, current: 93, target: 100 },
//     ],
//     indicators: [
//       {
//         name: "Literacy Rate",
//         current: [80, 82, 84, 86, 88, 90, 92, 94, 96, 98, 100],
//         target: [85, 87, 89, 91, 93, 95, 97, 99, 100, 100, 100],
//         sub_indicators: [
//           {
//             name: "Urban Literacy",
//             current: [90, 92, 94, 96, 98, 100, 100, 100, 100, 100, 100],
//             target: [90, 92, 94, 96, 98, 100, 100, 100, 100, 100, 100],
//           },
//           {
//             name: "Rural Literacy",
//             current: [60, 62, 65, 68, 70, 73, 75, 78, 80, 85, 90],
//             target: [65, 68, 70, 72, 75, 78, 80, 85, 90, 95, 100],
//           },
//         ],
//       },
//     ],
//   },
//     // SDG 5: Gender Equality
//     {
//       id: 5,
//       title: "Gender Equality",
//       global_target_value: 80,
//       global_current_value: [
//         { year: 2020, current: 50, target: 80 },
//         { year: 2021, current: 55, target: 80 },
//         { year: 2022, current: 60, target: 80 },
//         { year: 2023, current: 65, target: 80 },
//         { year: 2024, current: 70, target: 80 },
//         { year: 2025, current: 72, target: 80 },
//         { year: 2026, current: 75, target: 80 },
//         { year: 2027, current: 78, target: 80 },
//         { year: 2028, current: 80, target: 80 },
//         { year: 2029, current: 85, target: 90 },
//         { year: 2030, current: 85, target: 100 },
//       ],
//       indicators: [
//         {
//           name: "Women in Leadership",
//           current: [30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80],
//           target: [40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90],
//           sub_indicators: [
//             {
//               name: "Women in Politics",
//               current: [25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75],
//               target: [35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85],
//             },
//             {
//               name: "Women in Business",
//               current: [30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80],
//               target: [40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90],
//             },
//           ],
//         },
//         {
//           name: "Gender Pay Gap",
//           current: [20, 18, 16, 14, 12, 10, 8, 7, 6, 5, 4],
//           target: [10, 8, 6, 4, 2, 0, 0, 0, 0, 0, 0],
//           sub_indicators: [],
//         },
//       ],
//     },
  
//     // SDG 6: Clean Water and Sanitation
//     {
//       id: 6,
//       title: "Clean Water and Sanitation",
//       global_target_value: 90,
//       global_current_value: [
//         { year: 2020, current: 70, target: 90 },
//         { year: 2021, current: 72, target: 90 },
//         { year: 2022, current: 75, target: 90 },
//         { year: 2023, current: 77, target: 90 },
//         { year: 2024, current: 80, target: 90 },
//         { year: 2025, current: 82, target: 90 },
//         { year: 2026, current: 84, target: 90 },
//         { year: 2027, current: 85, target: 90 },
//         { year: 2028, current: 87, target: 90 },
//         { year: 2029, current: 88, target: 90 },
//         { year: 2030, current: 90, target: 100 },
//       ],
//       indicators: [
//         {
//           name: "Access to Clean Water",
//           current: [60, 65, 70, 75, 80, 85, 88, 90, 92, 95, 100],
//           target: [70, 75, 80, 85, 90, 95, 100, 100, 100, 100, 100],
//           sub_indicators: [
//             {
//               name: "Urban Access to Water",
//               current: [85, 87, 90, 93, 95, 97, 98, 99, 100, 100, 100],
//               target: [90, 92, 94, 96, 98, 100, 100, 100, 100, 100, 100],
//             },
//             {
//               name: "Rural Access to Water",
//               current: [50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100],
//               target: [60, 65, 70, 75, 80, 85, 90, 95, 100, 100, 100],
//             },
//           ],
//         },
//         {
//           name: "Sanitation Access",
//           current: [50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100],
//           target: [60, 65, 70, 75, 80, 85, 90, 95, 100, 100, 100],
//           sub_indicators: [],
//         },
//       ],
//     },
  
//     // SDG 7: Affordable and Clean Energy
//     {
//       id: 7,
//       title: "Affordable and Clean Energy",
//       global_target_value: 80,
//       global_current_value: [
//         { year: 2020, current: 60, target: 80 },
//         { year: 2021, current: 63, target: 80 },
//         { year: 2022, current: 67, target: 80 },
//         { year: 2023, current: 70, target: 80 },
//         { year: 2024, current: 73, target: 80 },
//         { year: 2025, current: 75, target: 80 },
//         { year: 2026, current: 77, target: 80 },
//         { year: 2027, current: 80, target: 80 },
//         { year: 2028, current: 82, target: 80 },
//         { year: 2029, current: 85, target: 85 },
//         { year: 2030, current: 90, target: 100 },
//       ],
//       indicators: [
//         {
//           name: "Access to Electricity",
//           current: [60, 65, 70, 75, 80, 85, 90, 95, 100, 100, 100],
//           target: [70, 75, 80, 85, 90, 95, 100, 100, 100, 100, 100],
//           sub_indicators: [],
//         },
//         {
//           name: "Renewable Energy Share",
//           current: [20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70],
//           target: [30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80],
//           sub_indicators: [],
//         },
//       ],
//     },
  
//     // SDG 8: Decent Work and Economic Growth
//     {
//       id: 8,
//       title: "Decent Work and Economic Growth",
//       global_target_value: 75,
//       global_current_value: [
//         { year: 2020, current: 55, target: 75 },
//         { year: 2021, current: 58, target: 75 },
//         { year: 2022, current: 60, target: 75 },
//         { year: 2023, current: 62, target: 75 },
//         { year: 2024, current: 65, target: 75 },
//         { year: 2025, current: 68, target: 75 },
//         { year: 2026, current: 70, target: 75 },
//         { year: 2027, current: 72, target: 75 },
//         { year: 2028, current: 75, target: 75 },
//         { year: 2029, current: 80, target: 85 },
//         { year: 2030, current: 85, target: 100 },
//       ],
//       indicators: [
//         {
//           name: "Unemployment Rate",
//           current: [10, 8, 7, 6, 5, 4, 3, 2, 1, 1, 0],
//           target: [5, 4, 3, 2, 1, 0, 0, 0, 0, 0, 0],
//           sub_indicators: [],
//         },
//         {
//           name: "Wage Growth",
//           current: [2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15],
//           target: [5, 6, 7, 8, 9, 10, 12, 13, 14, 15, 20],
//           sub_indicators: [],
//         },
//       ],
//     },
  
//     // SDG 9: Industry, Innovation, and Infrastructure
//     {
//       id: 9,
//       title: "Industry, Innovation, and Infrastructure",
//       global_target_value: 80,
//       global_current_value: [
//         { year: 2020, current: 55, target: 80 },
//         { year: 2021, current: 58, target: 80 },
//         { year: 2022, current: 60, target: 80 },
//         { year: 2023, current: 63, target: 80 },
//         { year: 2024, current: 65, target: 80 },
//         { year: 2025, current: 68, target: 80 },
//         { year: 2026, current: 70, target: 80 },
//         { year: 2027, current: 73, target: 80 },
//         { year: 2028, current: 75, target: 80 },
//         { year: 2029, current: 78, target: 85 },
//         { year: 2030, current: 85, target: 100 },
//       ],
//       indicators: [
//         {
//           name: "Industrialization",
//           current: [40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90],
//           target: [50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100],
//           sub_indicators: [],
//         },
//         {
//           name: "Innovation Index",
//           current: [50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100],
//           target: [60, 65, 70, 75, 80, 85, 90, 95, 100, 100, 100],
//           sub_indicators: [],
//         },
//       ],
//     },
  
//     // SDG 10: Reduced Inequalities
//     {
//       id: 10,
//       title: "Reduced Inequalities",
//       global_target_value: 75,
//       global_current_value: [
//         { year: 2020, current: 55, target: 75 },
//         { year: 2021, current: 57, target: 75 },
//         { year: 2022, current: 60, target: 75 },
//         { year: 2023, current: 63, target: 75 },
//         { year: 2024, current: 65, target: 75 },
//         { year: 2025, current: 68, target: 75 },
//         { year: 2026, current: 70, target: 75 },
//         { year: 2027, current: 73, target: 75 },
//         { year: 2028, current: 75, target: 75 },
//         { year: 2029, current: 80, target: 85 },
//         { year: 2030, current: 85, target: 100 },
//       ],
//       indicators: [
//         {
//           name: "Income Inequality",
//           current: [30, 28, 25, 22, 20, 18, 15, 12, 10, 8, 5],
//           target: [15, 13, 10, 8, 6, 4, 3, 2, 1, 1, 0],
//           sub_indicators: [],
//         },
//         {
//           name: "Access to Resources",
//           current: [40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90],
//           target: [50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100],
//           sub_indicators: [],
//         },
//       ],
//     },
  
//     // SDG 11: Sustainable Cities and Communities
//     {
//       id: 11,
//       title: "Sustainable Cities and Communities",
//       global_target_value: 85,
//       global_current_value: [
//         { year: 2020, current: 60, target: 85 },
//         { year: 2021, current: 63, target: 85 },
//         { year: 2022, current: 65, target: 85 },
//         { year: 2023, current: 68, target: 85 },
//         { year: 2024, current: 70, target: 85 },
//         { year: 2025, current: 73, target: 85 },
//         { year: 2026, current: 75, target: 85 },
//         { year: 2027, current: 78, target: 85 },
//         { year: 2028, current: 80, target: 85 },
//         { year: 2029, current: 82, target: 85 },
//         { year: 2030, current: 85, target: 100 },
//       ],
//       indicators: [
//         {
//           name: "Urban Green Spaces",
//           current: [40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90],
//           target: [50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100],
//           sub_indicators: [],
//         },
//         {
//           name: "Waste Management",
//           current: [30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80],
//           target: [40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90],
//           sub_indicators: [],
//         },
//       ],
//     },
  
//     // SDG 12: Responsible Consumption and Production
//     {
//       id: 12,
//       title: "Responsible Consumption and Production",
//       global_target_value: 80,
//       global_current_value: [
//         { year: 2020, current: 60, target: 80 },
//         { year: 2021, current: 62, target: 80 },
//         { year: 2022, current: 65, target: 80 },
//         { year: 2023, current: 67, target: 80 },
//         { year: 2024, current: 70, target: 80 },
//         { year: 2025, current: 72, target: 80 },
//         { year: 2026, current: 75, target: 80 },
//         { year: 2027, current: 78, target: 80 },
//         { year: 2028, current: 80, target: 80 },
//         { year: 2029, current: 82, target: 85 },
//         { year: 2030, current: 85, target: 100 },
//       ],
//       indicators: [
//         {
//           name: "Recycling Rate",
//           current: [25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75],
//           target: [30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80],
//           sub_indicators: [],
//         },
//         {
//           name: "Sustainable Product Designs",
//           current: [15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65],
//           target: [20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70],
//           sub_indicators: [],
//         },
//       ],
//     },
  
//     // SDG 13: Climate Action
//     {
//       id: 13,
//       title: "Climate Action",
//       global_target_value: 75,
//       global_current_value: [
//         { year: 2020, current: 60, target: 75 },
//         { year: 2021, current: 62, target: 75 },
//         { year: 2022, current: 64, target: 75 },
//         { year: 2023, current: 65, target: 75 },
//         { year: 2024, current: 67, target: 75 },
//         { year: 2025, current: 69, target: 75 },
//         { year: 2026, current: 71, target: 75 },
//         { year: 2027, current: 73, target: 75 },
//         { year: 2028, current: 75, target: 75 },
//         { year: 2029, current: 78, target: 80 },
//         { year: 2030, current: 80, target: 100 },
//       ],
//       indicators: [
//         {
//           name: "Greenhouse Gas Emissions",
//           current: [30, 32, 34, 35, 36, 37, 38, 39, 40, 41, 42],
//           target: [35, 32, 30, 27, 25, 20, 18, 15, 12, 10, 5],
//           sub_indicators: [],
//         },
//         {
//           name: "Renewable Energy Adoption",
//           current: [30, 33, 35, 38, 40, 42, 45, 48, 50, 55, 60],
//           target: [40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90],
//           sub_indicators: [],
//         },
//       ],
//     },
    
//     // SDG 14: Life Below Water
//     {
//       id: 14,
//       title: "Life Below Water",
//       global_target_value: 80,
//       global_current_value: [
//         { year: 2020, current: 50, target: 80 },
//         { year: 2021, current: 53, target: 80 },
//         { year: 2022, current: 55, target: 80 },
//         { year: 2023, current: 57, target: 80 },
//         { year: 2024, current: 59, target: 80 },
//         { year: 2025, current: 61, target: 80 },
//         { year: 2026, current: 63, target: 80 },
//         { year: 2027, current: 65, target: 80 },
//         { year: 2028, current: 67, target: 80 },
//         { year: 2029, current: 70, target: 85 },
//         { year: 2030, current: 75, target: 100 },
//       ],
//       indicators: [
//         {
//           name: "Ocean Pollution",
//           current: [40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90],
//           target: [50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100],
//           sub_indicators: [],
//         },
//         {
//           name: "Marine Biodiversity",
//           current: [30, 32, 35, 37, 39, 40, 43, 46, 50, 54, 60],
//           target: [40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90],
//           sub_indicators: [],
//         },
//       ],
//     },
//     {
//       id: 15,
//       title: "Life on Land",
//       global_target_value: 80,
//       global_current_value: [
//         { year: 2020, current: 55, target: 80 },
//         { year: 2021, current: 58, target: 80 },
//         { year: 2022, current: 60, target: 80 },
//         { year: 2023, current: 62, target: 80 },
//         { year: 2024, current: 64, target: 80 },
//         { year: 2025, current: 66, target: 80 },
//         { year: 2026, current: 68, target: 80 },
//         { year: 2027, current: 70, target: 80 },
//         { year: 2028, current: 72, target: 80 },
//         { year: 2029, current: 74, target: 85 },
//         { year: 2030, current: 80, target: 100 },
//       ],
//       indicators: [
//         {
//           name: "Deforestation Rate",
//           current: [10, 8, 7, 6, 5, 4, 3, 2, 1, 0, 0],
//           target: [5, 4, 3, 2, 1, 0, 0, 0, 0, 0, 0],
//           sub_indicators: [],
//         },
//         {
//           name: "Protected Land Areas",
//           current: [20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70],
//           target: [25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75],
//           sub_indicators: [],
//         },
//       ],
//     },
  
//     // SDG 16: Peace, Justice, and Strong Institutions
//     {
//       id: 16,
//       title: "Peace, Justice, and Strong Institutions",
//       global_target_value: 80,
//       global_current_value: [
//         { year: 2020, current: 55, target: 80 },
//         { year: 2021, current: 58, target: 80 },
//         { year: 2022, current: 60, target: 80 },
//         { year: 2023, current: 62, target: 80 },
//         { year: 2024, current: 64, target: 80 },
//         { year: 2025, current: 66, target: 80 },
//         { year: 2026, current: 68, target: 80 },
//         { year: 2027, current: 70, target: 80 },
//         { year: 2028, current: 72, target: 80 },
//         { year: 2029, current: 75, target: 85 },
//         { year: 2030, current: 80, target: 100 },
//       ],
//       indicators: [
//         {
//           name: "Rule of Law",
//           current: [60, 62, 64, 66, 68, 70, 72, 74, 76, 78, 80],
//           target: [65, 67, 69, 71, 73, 75, 77, 79, 81, 83, 85],
//           sub_indicators: [],
//         },
//         {
//           name: "Access to Justice",
//           current: [50, 52, 54, 56, 58, 60, 62, 64, 66, 68, 70],
//           target: [55, 57, 59, 61, 63, 65, 67, 69, 71, 73, 75],
//           sub_indicators: [],
//         },
//       ],
//     },
  
//     // SDG 17: Partnerships for the Goals
//     {
//       id: 17,
//       title: "Partnerships for the Goals",
//       global_target_value: 90,
//       global_current_value: [
//         { year: 2020, current: 70, target: 90 },
//         { year: 2021, current: 72, target: 90 },
//         { year: 2022, current: 75, target: 90 },
//         { year: 2023, current: 77, target: 90 },
//         { year: 2024, current: 80, target: 90 },
//         { year: 2025, current: 82, target: 90 },
//         { year: 2026, current: 85, target: 90 },
//         { year: 2027, current: 87, target: 90 },
//         { year: 2028, current: 89, target: 90 },
//         { year: 2029, current: 90, target: 90 },
//         { year: 2030, current: 95, target: 100 },
//       ],
//       indicators: [
//         {
//           name: "International Cooperation",
//           current: [60, 65, 70, 75, 80, 85, 90, 92, 95, 98, 100],
//           target: [65, 70, 75, 80, 85, 90, 95, 100, 100, 100, 100],
//           sub_indicators: [],
//         },
//         {
//           name: "Development Assistance",
//           current: [45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95],
//           target: [50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100],
//           sub_indicators: [],
//         },
//       ],
//     },
//   ];

const Dashboard: React.FC = () => {

  // const router = useRouter();

  // const handleGaugeClick = (sdgTitle: string) => {
  //   // Redirect to the project dashboard based on the SDG title
  //   router.push(`/projectdashboard/${sdgTitle}`);
  // };

  const [selectedYear, setSelectedYear] = useState(2020);
  const [selectedSDG, setSelectedSDG] = useState<string>("");
  const [sdgData, setSdgData] = useState<any[]>([]); // State to store SDG data
  const [selectedIndicator, setSelectedIndicator] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/get-sdg-data"); // Call the API
        const data = await res.json();
        console.log("Fetched SDG Data:", data); // Debugging
        setSdgData(data);
        if (data.length > 0) {
          setSelectedSDG(data[0].goal_id.toString());
        }
      } catch (error) {
        console.error("Error fetching SDG data:", error);
      }
    };
  
    fetchData();
  }, []);

  const selectedSDGData = sdgData.find((sdg) => sdg.goal_id.toString() === selectedSDG) || null;

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", padding: "20px" }}>
      <h1>LGU SDG Dashboard</h1>

      {/* Grid Layout for Filters, LineChart & ProgressBars */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 2fr",
          gap: "20px",
          alignItems: "start",
        }}
      >

        {/* Filters (SDG & Year) */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          <SlicerChart
            selectedYear={selectedYear}
            setSelectedYear={setSelectedYear}
            selectedSDG={selectedSDG}
            setSelectedSDG={setSelectedSDG}
          />

          <div>
          <Scorecard sdgData={sdgData} />  {/* Pass sdgData as a prop to Scorecard */}
          </div>

          {/* Scrollable ProgressBars */}
          <div style={{ maxHeight: "300px", overflowY: "auto", marginTop: "20px", padding: "10px", border: "1px solid #ddd", borderRadius: "8px" }}>
            {selectedSDGData && (
              <>
                <h2>Indicator Progress for {selectedSDGData.title}</h2>
                {selectedSDGData.indicators.map((indicator: { 
                    name: string; 
                    current: number[]; 
                    target: number[]; 
                  }, index: number) => (
                  <ProgressBarChart
                    key={index}
                    label={indicator.name}
                    progress={(indicator.current[selectedYear - 2020] / indicator.target[selectedYear - 2020]) * 100}
                    target={indicator.target[selectedYear - 2020]}
                    onClick={() => setSelectedIndicator(indicator.name)}
                  />
                ))}
              </>
            )}
          </div>
          {/* Display the StackedBarChart if an SDG and indicator are selected */}
          {selectedSDG && selectedIndicator && (
              <StackedBarChart selectedIndicator={selectedIndicator} sdgData={sdgData} />
            )}
        </div>

        {/* LineChart & ProgressBars */}
        <div>
          {/* LineChart */}
          <h2>SDG {selectedSDG} Achievement Level by Year</h2>
          {selectedSDGData && (
            <LineChart
            data={[
              {
                x: selectedSDGData.global_current_value.map((item: { year: number; current: number; target: number }) => item.year),
                y: selectedSDGData.global_current_value.map((item: { year: number; current: number; target: number }) => item.current),
                type: "scatter",
                mode: "lines+markers",
                marker: { color: sdgColors[selectedSDGData.title] || "blue" },
                line: { color: sdgColors[selectedSDGData.title] || "blue" },
                name: "Current Progress",
              },        
              // {
              //   x: selectedSDGData.global_current_value.map((item) => item.year),
              //   y: selectedSDGData.global_current_value.map((item) => item.target),
              //   type: "scatter",
              //   mode: "lines+markers",
              //   marker: { color: "red" },
              //   name: "Target Progress",
              // },
              ]}
            />
          )}
        </div>
      </div>

      {/* SDG Progress Gauges */}
      <h2>SDG Progress Overview</h2>
      {/* <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(9, minmax(120px, 1fr))",
          gap: "10px",
          marginTop: "20px",
          padding: "20px",
        }}
      >
        {sdgData.slice(0, 9).map((sdg) => (
          <GaugeChart 
              key={sdg.id} 
              title={sdg.title} value={(sdg.global_current_value.find(item => item.year === selectedYear)?.current || 0) / sdg.global_target_value * 100} />
        ))}
      </div> */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(8, minmax(120px, 1fr))",
          gap: "10px",
          marginTop: "25px",
          padding: "20px",
        }}
      >
        {sdgData.slice(0, 9).map((sdg) => (
          <GaugeChart
          key={sdg.goal_id}
          title={sdg.title}
          value={(sdg.global_current_value.find((item: { year: number; current: number; target: number }) => item.year === selectedYear)?.current || 0) /
            sdg.global_target_value * 100}
        />        
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
