"use client";

import React, { useState } from "react";

interface TimeFilterProps {
  onFilterChange: (year: number | null, month: number | null) => void;
  initialYear?: number;
  initialMonth?: number | null;
}

const monthNames = [
  "January", "February", "March", "April", "May", "June", 
  "July", "August", "September", "October", "November", "December"
];

export const TimeFilter: React.FC<TimeFilterProps> = ({
  onFilterChange,
  initialYear = new Date().getFullYear(),
  initialMonth = null,
}) => {
  const [year, setYear] = useState<number | null>(initialYear);
  const [month, setMonth] = useState<number | null>(initialMonth);

  const years = Array.from({ length: 5 }, (_, i) => initialYear - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newYear = e.target.value === "all" ? null : parseInt(e.target.value);
    setYear(newYear);
    setMonth(null); // Reset month when changing year
    onFilterChange(newYear, null);
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMonth = e.target.value === "all" ? null : parseInt(e.target.value);
    setMonth(newMonth);
    onFilterChange(year, newMonth);
  };

  const handleResetFilters = () => {
    setYear(null);
    setMonth(null);
    onFilterChange(null, null);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center mb-6 p-4 bg-gray-50 rounded-lg">
      {/* Year Selector */}
      <div>
        <label htmlFor="year-filter" className="block text-sm font-medium text-gray-700 mb-1">
          Year
        </label>
        <select
          id="year-filter"
          value={year === null ? "all" : year}
          onChange={handleYearChange}
          className="border border-gray-300 rounded-md p-2 bg-white"
        >
          <option value="all">All Years</option>
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      {/* Month Selector */}
      <div>
        <label htmlFor="month-filter" className="block text-sm font-medium text-gray-700 mb-1">
          Month
        </label>
        <select
          id="month-filter"
          value={month === null ? "all" : month}
          onChange={handleMonthChange}
          className="border border-gray-300 rounded-md p-2 bg-white"
          disabled={year === null} // Disable month selection if no year is selected
        >
          <option value="all">All Months</option>
          {months.map((m) => (
            <option key={m} value={m}>
              {monthNames[m - 1]}
            </option>
          ))}
        </select>
      </div>

      {/* Reset Filters Button */}
      <button
        onClick={handleResetFilters}
        className="mt-6 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
      >
        Reset Filters
      </button>

      {/* Filter Status Display */}
      {(year !== null || month !== null) && (
        <div className="mt-6 ml-auto py-2 px-4 bg-blue-50 border border-blue-200 rounded-md">
          <span className="text-sm text-blue-800">
            {month === null && year !== null && `Showing data for ${year}`}
            {month !== null && year !== null && `Showing data for ${monthNames[month - 1]} ${year}`}
          </span>
        </div>
      )}
    </div>
  );
};