"use client";

import { updateBaselineValues } from "@/app/actions/actions";
import { useState, useEffect } from "react";

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

interface BaselineFormProps {
  goals: Goal[];
}

const BaselineFormComponent = ({ goals }: BaselineFormProps) => {
  const [formValues, setFormValues] = useState<Record<string, number>>({});
  const [baselineDate, setBaselineDate] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [locationOptions, setLocationOptions] = useState<string[]>([]);

  // Load the GeoJSON data
  useEffect(() => {
    const fetchGeoJson = async () => {
      try {
        const response = await fetch("/pasigcity.0.01.json"); // Path to your GeoJSON file
        const geoJson = await response.json();

        // Extract the location names from GeoJSON (NAME_3)
        const locations = geoJson.features.map((feature: any) => feature.properties.NAME_3);
        setLocationOptions(locations);
      } catch (error) {
        console.error("Error loading GeoJSON:", error);
      }
    };

    fetchGeoJson();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: parseFloat(value) || 0,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!baselineDate || !location) {
      alert("Please enter a valid date and location.");
      return;
    }

    const formData = new FormData();
    formData.append("baselineDate", baselineDate);
    formData.append("location", location);

    goals.forEach((goal) => {
      goal.indicators.forEach((indicator) => {
        const indicatorValue =
          formValues[`indicator-${indicator.indicatorId}`] || 0;
        formData.append(
          "goalIndicators",
          JSON.stringify({
            indicator_id: indicator.indicatorId,
            value: indicatorValue,
          }),
        );

        indicator.subIndicators.forEach((sub) => {
          const subIndicatorValue =
            formValues[`subindicator-${sub.subIndicatorId}`] || 0;
          formData.append(
            "goalSubIndicators",
            JSON.stringify({
              sub_indicator_id: sub.subIndicatorId,
              value: subIndicatorValue,
            }),
          );
        });
      });
    });

    console.log("Submitting FormData:", [...formData.entries()]);
    await updateBaselineValues(formData);
  };

  return (
    <div className="p-4 w-full">
      <form onSubmit={handleSubmit} className="border-2 border-black p-4 rounded-md">
        {/* Date & Location Fields */}
        <div className="mb-6 flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <label className="font-semibold">Baseline Date:</label>
            <input
              type="date"
              className="border p-2 rounded-md"
              value={baselineDate}
              onChange={(e) => setBaselineDate(e.target.value)}
              required
            />
          </div>

          <div className="flex items-center gap-4">
            <label className="font-semibold">Location:</label>
            <select
              className="border p-2 rounded-md w-full"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            >
              <option value="">Select a Location</option>
              {locationOptions.map((loc, index) => (
                <option key={index} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>
        </div>

        {goals.map((goal) => (
          <div key={goal.goalId} className="mb-6 border-b pb-4">
            <h2 className="p-4 bg-gradient-to-br from-green-50 to-orange-50 rounded-md drop-shadow text-gray-600 text-lg font-bold">
              {goal.goalName}
            </h2>

            {goal.indicators.map((indicator) => (
              <div key={indicator.indicatorId} className="flex flex-col gap-4 mt-4">
                <div className="px-4 py-2 flex items-center justify-between bg-orange-50 rounded-md">
                  <h3 className="text-md font-semibold">{indicator.indicatorName}</h3>
                  <div className="flex items-center gap-4">
                    <label htmlFor={`indicator-${indicator.indicatorId}`}>Baseline Value:</label>
                    <input
                      className="w-[100px] p-1 border border-gray-700 rounded-md focus:outline-none"
                      name={`indicator-${indicator.indicatorId}`}
                      type="number"
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="p-4 flex flex-col gap-4">
                  {indicator.subIndicators.length > 0 ? (
                    indicator.subIndicators.map((sub) => (
                      <div key={sub.subIndicatorId} className="flex items-center justify-between">
                        <p className="text-sm">{sub.subIndicatorName}</p>
                        <div className="flex items-center gap-4 text-sm">
                          <label htmlFor={`subindicator-${sub.subIndicatorId}`}>
                            Sub-Indicator Baseline:
                          </label>
                          <input
                            className="w-[100px] p-1 border border-gray-700 rounded-md focus:outline-none"
                            name={`subindicator-${sub.subIndicatorId}`}
                            type="number"
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="pl-6 text-gray-500 italic">No sub-indicators</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ))}

        <button
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
          type="submit"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default BaselineFormComponent;
