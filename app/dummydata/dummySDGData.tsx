const dummySDGData = [
  {
    goal_id: 1,
    title: "No Poverty",
    global_target_value: 78,
    global_current_value: [
      { year: 2020, current: 20, target: 78 },
      { year: 2021, current: 22, target: 78 },
      { year: 2022, current: 24, target: 78 },
      { year: 2023, current: 26, target: 78 }, // Stagnation
      { year: 2024, current: 25, target: 78 }, // Regression
      { year: 2025, current: 28, target: 78 },
      { year: 2026, current: 32, target: 78 },
      { year: 2027, current: 35, target: 78 },
      { year: 2028, current: 37, target: 78 }, // Slow progress
      { year: 2029, current: 42, target: 78 },
      { year: 2030, current: 50, target: 78 },
    ],
    indicators: [
      {
        name: "Poverty Rate Reduction",
        current: [20, 22, 24, 26, 25, 28, 32, 35, 37, 42, 50],
        target: [78],
        sub_indicators: [
          { name: "Extreme Poverty Reduction", current: [10, 12, 14, 14, 13, 16, 18, 21, 20, 24, 26], target: [70] },
          { name: "Access to Financial Services", current: [15, 18, 21, 23, 22, 25, 28, 30, 29, 35, 40], target: [85] },
          { name: "Education for Poverty Alleviation", current: [30, 32, 35, 38, 37, 40, 43, 47, 45, 52, 58], target: [80] },
        ],
      },
      {
        name: "Employment and Income Opportunities",
        current: [18, 20, 22, 21, 19, 25, 28, 30, 32, 37, 40],
        target: [78],
        sub_indicators: [
          { name: "Job Creation Programs", current: [15, 17, 19, 18, 17, 21, 24, 26, 25, 28, 32], target: [80] },
          { name: "Wage Growth", current: [12, 14, 16, 15, 14, 18, 20, 22, 23, 26, 30], target: [75] },
        ],
      },
    ],
    location_data: [
      {
        region: "Pasig City",
        barangay: "Bagong Ilog",
        sdg1_poverty_rate: 18.5,
        sdg2_food_security_index: 75,
      },
      {
        region: "Pasig City",
        barangay: "Bagong Katipunan",
        sdg1_poverty_rate: 22.1,
        sdg2_food_security_index: 70,
      },
    ],
  },
  {
    goal_id: 2,
    title: "Zero Hunger",
    global_target_value: 82,
    global_current_value: [
      { year: 2020, current: 25, target: 82 },
      { year: 2021, current: 28, target: 82 },
      { year: 2022, current: 32, target: 82 },
      { year: 2023, current: 34, target: 82 },
      { year: 2024, current: 31, target: 82 }, // Regression
      { year: 2025, current: 36, target: 82 },
      { year: 2026, current: 40, target: 82 },
      { year: 2027, current: 44, target: 82 },
      { year: 2028, current: 46, target: 82 }, // Slow progress
      { year: 2029, current: 50, target: 82 },
      { year: 2030, current: 55, target: 82 },
    ],
    indicators: [
      {
        name: "Food Security Index",
        current: [25, 28, 32, 34, 31, 36, 40, 44, 46, 50, 55],
        target: [82],
        sub_indicators: [
          { name: "Child Malnutrition Rate", current: [15, 17, 19, 18, 17, 21, 23, 26, 24, 28, 30], target: [75] },
          { name: "Food Distribution Efficiency", current: [50, 55, 60, 62, 60, 65, 68, 72, 70, 75, 80], target: [90] },
        ],
      },
    ],
    location_data: [
      {
        region: "Pasig City",
        barangay: "Bagong Ilog",
        sdg2_food_security_index: 80,
        sdg2_child_malnutrition_rate: 18,
      },
      {
        region: "Pasig City",
        barangay: "Bagong Katipunan",
        sdg2_food_security_index: 78,
        sdg2_child_malnutrition_rate: 22,
      },
    ],
  },
  {
    goal_id: 3,
    title: "Good Health and Well-Being",
    global_target_value: 90,
    global_current_value: [
      { year: 2020, current: 30, target: 90 },
      { year: 2021, current: 33, target: 90 },
      { year: 2022, current: 36, target: 90 },
      { year: 2023, current: 40, target: 90 },
      { year: 2024, current: 39, target: 90 }, // Regression
      { year: 2025, current: 42, target: 90 },
      { year: 2026, current: 46, target: 90 },
      { year: 2027, current: 50, target: 90 },
      { year: 2028, current: 53, target: 90 },
      { year: 2029, current: 57, target: 90 },
      { year: 2030, current: 60, target: 90 },
    ],
    indicators: [
      {
        name: "Access to Healthcare Services",
        current: [30, 33, 36, 40, 39, 42, 46, 50, 53, 57, 60],
        target: [90],
        sub_indicators: [
          { name: "Primary Healthcare Coverage", current: [20, 23, 26, 30, 28, 32, 35, 38, 41, 45, 50], target: [85] },
          { name: "Vaccination Rates", current: [60, 62, 64, 67, 65, 70, 72, 75, 78, 80, 85], target: [95] },
        ],
      },
    ],
  },
];

export default dummySDGData;
