"use client";

import { updateValues } from "@/app/actions/actions";
import { useState, useEffect } from "react";

interface RequiredData {
  requiredDataId: number;
  requiredDataName: string;
  requiredDataValue: number;
}

interface SubIndicator {
  subIndicatorId: number;
  subIndicatorName: string;
  requiredData: RequiredData[];
}

interface Indicator {
  indicatorId: number;
  indicatorName: string;
  subIndicators: SubIndicator[];
  requiredData: RequiredData[];
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
  const [locationOptions, setLocationOptions] = useState<string[]>([]);

  // Load the GeoJSON data
  useEffect(() => {
    const fetchGeoJson = async () => {
      try {
        const response = await fetch("/pasigcity.0.01.json"); // Path to your GeoJSON file
        const geoJson = await response.json();

        // Extract the location names from GeoJSON (NAME_3)
        const locations = geoJson.features.map(
          (feature: any) => feature.properties.NAME_3,
        );
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
      [name]: parseFloat(value) || 0, // Ensure numeric input
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!measurementDate || !location) {
      alert("Please enter a valid date and location.");
      return;
    }

    const formData = new FormData();

    formData.append("measurementDate", measurementDate);
    formData.append("location", location);

    goals.forEach((goal) => {
      formData.append("goalIndicatorId", goal.goalId.toString());

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

    console.log("Submitting FormData:", [...formData.entries()]); // Debugging
    await updateValues(formData);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full border-2 border-black p-4 rounded-md"
    >
      {/* Date & Location Fields */}
      <div className="mb-6 flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <label className="font-semibold">Measurement Date:</label>
          <input
            type="date"
            className="border p-2 rounded-md"
            value={measurementDate}
            onChange={(e) => setMeasurementDate(e.target.value)}
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
        <div
          key={goal.goalId}
          className="w-full p-4 flex flex-col gap-4 border-b"
        >
          <h2 className="w-full p-4 bg-gradient-to-br from-green-50 to-orange-50 rounded-md drop-shadow text-gray-600 text-lg font-bold">
            {goal.goalName}
          </h2>

          {goal.indicators.map((indicator) => (
            <div
              key={indicator.indicatorId}
              className="w-full flex flex-col gap-4"
            >
              {/* Indicator Name and Input */}
              <div className="w-full px-4 py-2 flex flex-col gap-2 bg-orange-50 rounded-md">
                <div className="flex items-center justify-between gap-10">
                  <h3 className="text-md font-semibold">
                    {indicator.indicatorName}
                  </h3>
                  {/* <div className="flex items-center gap-4">
                    <label htmlFor={`indicator-${indicator.indicatorId}`}>
                      Indicator Current Value:
                    </label>
                    <input
                      className="w-[100px] p-1 focus:outline-none border border-gray-700 rounded-md"
                      name={`indicator-${indicator.indicatorId}`}
                      type="number"
                      onChange={handleInputChange}
                    />
                  </div> */}
                </div>

                {/* Indicator Required Data */}
                {indicator.requiredData.length > 0 && (
                  <div className="w-full flex flex-col gap-4">
                    <p className="font-semibold">Required Data:</p>
                    {/* <ul className="w-full flex flex-col gap-2">
                      {indicator.requiredData.map((data) => (
                        <li
                          key={data.requiredDataId}
                          className={`w-full flex p-2 items-center justify-between border-[0.5px] border-black rounded-lg`}
                        >
                          <p>{data.requiredDataName}</p>
                          <div className="flex items-center gap-2">
                            <label
                              htmlFor={`requiredData-${data.requiredDataName}`}
                            >
                              Reqiored Data Current Value:
                            </label>
                            <input
                              className="w-[100px] p-1 focus:outline-none border border-gray-700 rounded-md"
                              name={`requiredData-${data.requiredDataName}`}
                              type="number"
                              onChange={handleInputChange}
                            />
                          </div>
                        </li>
                      ))}
                    </ul> */}
                  </div>
                )}
              </div>

              {/* Sub-Indicators */}
              <div className="w-full p-4 flex flex-col gap-4">
                <h1>Sub-Indicators for {indicator.indicatorName}:</h1>
                {indicator.subIndicators.length > 0 ? (
                  indicator.subIndicators.map((sub) => (
                    <div
                      key={sub.subIndicatorId}
                      className="w-full flex flex-col gap-2"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-lg font-black uppercase text-green-900">
                          {sub.subIndicatorName}
                        </p>
                        <div className="flex items-center gap-4 text-sm">
                          {/* <label htmlFor={`subindicator-${sub.subIndicatorId}`}>
                            Sub-Indicator Current Value:
                          </label> */}
                          {/* <input
                            className="w-[100px] p-1 focus:outline-none border border-gray-700 rounded-md"
                            name={`subindicator-${sub.subIndicatorId}`}
                            type="number"
                            onChange={handleInputChange}
                          /> */}
                        </div>
                      </div>

                      {/* Sub-Indicator Required Data */}
                      {sub.requiredData.length > 0 && (
                        <div className="w-full flex flex-col gap-4">
                          <p className="font-semibold">Required Data:</p>
                          <ul className="w-full flex flex-col gap-2">
                            {sub.requiredData.map((data) => (
                              <li
                                key={data.requiredDataId}
                                className={`w-full flex p-2 items-center justify-between border-[0.5px] border-black rounded-lg`}
                              >
                                <p>{data.requiredDataName}</p>
                                <div className="flex items-center gap-2">
                                  <label
                                    htmlFor={`requiredData-${data.requiredDataName}`}
                                  >
                                    Required Data Current Value:
                                  </label>
                                  <input
                                    className="w-[100px] p-1 focus:outline-none border border-gray-700 rounded-md"
                                    name={`requiredData-${data.requiredDataName}`}
                                    type="number"
                                    onChange={handleInputChange}
                                  />
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
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
        Submit Progress
      </button>
    </form>
  );
};

export default ProgressFormComponent;
