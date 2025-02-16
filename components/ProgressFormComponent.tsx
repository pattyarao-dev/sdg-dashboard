"use client";

import { updateValues } from "@/app/actions/actions";
import { useState } from "react";

interface SubIndicator {
  subIndicatorId: number;
  subIndicatorName: string;
}

interface Indicator {
  indicatorId: number;
  indicatorName: string;
  subIndicators: SubIndicator[];
}

interface Goal {
  goalId: number;
  goalName: string;
  indicators: Indicator[];
}

interface ProgressFormProps {
  goals: Goal[];
}

const ProgressFormComponent = ({ goals }: ProgressFormProps) => {
  const [formValues, setFormValues] = useState<Record<string, number>>({});
  const [measurementDate, setMeasurementDate] = useState<string>("");
  const [location, setLocation] = useState<string>("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: parseFloat(value) || 0,
    }));
  };

  const handleUpdateValuesSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("measurementDate", measurementDate);
    formData.append("location", location);

    goals.forEach((goal) => {
      goal.indicators.forEach((indicator) => {
        const indicatorValue =
          formValues[`indicator-${indicator.indicatorId}`] || 0;
        formData.append(
          "indicatorValues",
          JSON.stringify({
            indicator_id: indicator.indicatorId,
            value: indicatorValue,
            notes: "",
          }),
        );

        indicator.subIndicators.forEach((sub) => {
          const subIndicatorValue =
            formValues[`subindicator-${sub.subIndicatorId}`] || 0;
          formData.append(
            "subIndicatorValues",
            JSON.stringify({
              sub_indicator_id: sub.subIndicatorId,
              value: subIndicatorValue,
              notes: "",
            }),
          );
        });
      });
    });

    console.log("Submitting FormData:", [...formData.entries()]);
    await updateValues(formData);
  };

  return (
    <form onSubmit={handleUpdateValuesSubmit} className="w-full border-2 border-black p-4">
      {/* Date Picker */}
      <div className="flex flex-col mb-4">
        <label className="font-semibold" htmlFor="measurementDate">Measurement Date:</label>
        <input
          type="date"
          id="measurementDate"
          className="border rounded p-2"
          value={measurementDate}
          onChange={(e) => setMeasurementDate(e.target.value)}
          required
        />
      </div>

      {/* Location Input */}
      <div className="flex flex-col mb-4">
        <label className="font-semibold" htmlFor="location">Location:</label>
        <input
          type="text"
          id="location"
          className="border rounded p-2"
          placeholder="Enter location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          required
        />
      </div>

      {goals.map((goal) => (
        <div key={goal.goalId} className="w-full p-4 flex flex-col gap-4 border-b">
          <h2 className="p-4 bg-green-100 rounded-md font-bold">{goal.goalName}</h2>
          
          {goal.indicators.map((indicator) => (
            <div key={indicator.indicatorId} className="w-full flex flex-col gap-4">
              <div className="p-4 bg-orange-50 rounded-md flex justify-between">
                <h3 className="font-semibold">{indicator.indicatorName}</h3>
                <input
                  className="w-[100px] p-1 border rounded-md"
                  name={`indicator-${indicator.indicatorId}`}
                  type="number"
                  onChange={handleInputChange}
                />
              </div>

              {indicator.subIndicators.map((sub) => (
                <div key={sub.subIndicatorId} className="flex justify-between px-4">
                  <p>{sub.subIndicatorName}</p>
                  <input
                    className="w-[100px] p-1 border rounded-md"
                    name={`subindicator-${sub.subIndicatorId}`}
                    type="number"
                    onChange={handleInputChange}
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      ))}

      <button className="mt-4 bg-blue-500 text-white px-4 py-2 rounded" type="submit">
        Submit
      </button>
    </form>
  );
};

export default ProgressFormComponent;
