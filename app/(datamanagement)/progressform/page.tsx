"use client";

import { useState } from "react";

const ProgressFormComponent = ({ goals }: { goals: any[] }) => {
  const [selectedGoal, setSelectedGoal] = useState("");
  const [indicatorValue, setIndicatorValue] = useState("");
  const [measurementDate, setMeasurementDate] = useState("");
  const [location, setLocation] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      goal_id: selectedGoal,
      value: parseFloat(indicatorValue),
      measurement_date: new Date(measurementDate),
      location,
    };

    const response = await fetch("/api/progress", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      alert("Progress recorded successfully!");
      setIndicatorValue("");
      setMeasurementDate("");
      setLocation("");
    } else {
      alert("Error recording progress.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4 border rounded">
      <label>
        Select Goal:
        <select value={selectedGoal} onChange={(e) => setSelectedGoal(e.target.value)} required>
          <option value="">-- Choose a Goal --</option>
          {goals.map((goal) => (
            <option key={goal.goal_id} value={goal.goal_id}>
              {goal.name}
            </option>
          ))}
        </select>
      </label>

      <label>
        Indicator Value:
        <input
          type="number"
          value={indicatorValue}
          onChange={(e) => setIndicatorValue(e.target.value)}
          required
        />
      </label>

      <label>
        Measurement Date:
        <input
          type="date"
          value={measurementDate}
          onChange={(e) => setMeasurementDate(e.target.value)}
          required
        />
      </label>

      <label>
        Location:
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          required
        />
      </label>

      <button type="submit" className="bg-blue-500 text-white p-2 rounded">
        Submit Progress
      </button>
    </form>
  );
};

export default ProgressFormComponent;
