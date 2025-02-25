"use client";

import { createIndicatorsBatch } from "@/app/actions/actions";
import { useEffect, useState } from "react";
import { IIndicator, ISubIndicator } from "@/types/indicator.types";

interface AddIndicatorProps {
  goalName: string;
  goalId: number;
  indicators: IIndicator[];
}

export default function AddIndicator({
  goalName,
  goalId,
  indicators,
}: AddIndicatorProps) {
  const [selectedAddMethod, setSelectedAddMethod] = useState("Select Existing");
  const [selectedIndicators, setSelectedIndicators] = useState<
    {
      indicator_id: number;
      name: string;
      description?: string;
      target?: number;
      sub_indicators: ISubIndicator[] | null | undefined;
    }[]
  >([]);

  const [newSubIndicatorName, setNewSubIndicatorName] = useState("");

  const [subIndicatorInputs, setSubIndicatorInputs] = useState<{
    [indicatorId: number]: {
      sub_indicator_id: number;
      name: string;
      target: number;
    }[];
  }>({});

  const [indicatorRequiredDataName, setIndicatorRequiredDataName] =
    useState("");

  const [indicatorRequiredDataInputs, setIndicatorRequiredDataInputs] =
    useState<{
      [indicatorId: number]: {
        requiredDataId: number;
        name: string;
      }[];
    }>({});

  const [newIndicator, setNewIndicator] = useState({
    name: "",
    description: "",
  });

  const [message, setMessage] = useState("");

  useEffect(() => {
    console.log("Selected Indicators:", selectedIndicators);
  }, [selectedIndicators]);

  const handleAddExistingIndicator = (id: number, name: string) => {
    const selectedIndicator = indicators.find(
      (indicator) => indicator.indicator_id === id,
    );

    if (
      selectedIndicator &&
      !selectedIndicators.some((i) => i.indicator_id === id)
    ) {
      setSelectedIndicators([
        ...selectedIndicators,
        {
          indicator_id: id,
          name,
          target: 0,
          sub_indicators: [],
        },
      ]);
      setSubIndicatorInputs((prev) => ({
        ...prev,
        [id]: [],
      }));
      setIndicatorRequiredDataInputs((prev) => ({
        ...prev,
        [id]: [],
      }));
    }
  };

  const handleAssignSubIndicator = (
    indicatorId: number,
    subIndicator: ISubIndicator,
  ) => {
    setSubIndicatorInputs((prev) => ({
      ...prev,
      [indicatorId]: [
        ...(prev[indicatorId] || []),
        {
          sub_indicator_id: subIndicator.sub_indicator_id,
          name: subIndicator.name,
          target: subIndicator.target ?? 0,
        },
      ],
    }));

    setSelectedIndicators((prevIndicators) =>
      prevIndicators.map((indicator) =>
        indicator.indicator_id === indicatorId
          ? {
              ...indicator,
              sub_indicators: [
                ...(indicator.sub_indicators || []),
                subIndicator,
              ],
            }
          : indicator,
      ),
    );
  };

  const handleCreateNewIndicator = () => {
    if (!newIndicator.name.trim()) return;

    const newId = Date.now();
    setSelectedIndicators([
      ...selectedIndicators,
      {
        indicator_id: newId,
        name: newIndicator.name,
        description: newIndicator.description,
        target: 0,
        sub_indicators: [],
      },
    ]);
    setSubIndicatorInputs((prev) => ({
      ...prev,
      [newId]: [],
    }));

    setNewIndicator({ name: "", description: "" });
  };

  const handleUpdateIndicatorValues = (id: number, value: number) => {
    setSelectedIndicators(
      selectedIndicators.map((indicator) =>
        indicator.indicator_id === id
          ? { ...indicator, target: value }
          : indicator,
      ),
    );
  };

  const handleRemoveIndicator = (id: number) => {
    setSelectedIndicators(
      selectedIndicators.filter((i) => i.indicator_id !== id),
    );
    setSubIndicatorInputs((prev) => {
      const newInputs = { ...prev };
      delete newInputs[id];
      return newInputs;
    });
  };

  const handleCreateSubIndicator = (
    indicatorId: number,
    subIndicatorName: string,
  ) => {
    if (!subIndicatorName.trim()) return;

    const newSubIndicator: ISubIndicator = {
      sub_indicator_id: Date.now(), // Temporary unique ID
      name: subIndicatorName,
      target: 0,
    };

    handleAssignSubIndicator(indicatorId, newSubIndicator);
  };

  const handleRemoveSubIndicator = (
    indicatorId: number,
    subIndicatorIndex: number,
  ) => {
    setSubIndicatorInputs((prev) => ({
      ...prev,
      [indicatorId]: prev[indicatorId].filter(
        (_, index) => index !== subIndicatorIndex,
      ),
    }));
  };

  const handleCreateIndicatorRequiredData = (
    indicatorId: number,
    name: string,
  ) => {
    if (!name.trim()) return; // Prevent empty inputs

    setIndicatorRequiredDataInputs((prev) => ({
      ...prev,
      [indicatorId]: [
        ...(prev[indicatorId] || []),
        { requiredDataId: Date.now(), name },
      ],
    }));

    setIndicatorRequiredDataName(""); // Clear input field after adding
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const indicatorsWithSubIndicators = selectedIndicators.map((indicator) => ({
      ...indicator,
      // Only use the sub-indicators from subIndicatorInputs
      sub_indicators: subIndicatorInputs[indicator.indicator_id] || [],
    }));

    const formData = new FormData();
    formData.append("goalId", goalId.toString());
    formData.append("indicators", JSON.stringify(indicatorsWithSubIndicators));

    const result = await createIndicatorsBatch(formData);

    console.log("Server Response:", result);
    setMessage(result.message || "❌ No indicators were added.");
    setSelectedIndicators([]);
  };

  const handleEditIndicatorName = (id: number, newName: string) => {
    setSelectedIndicators((prev) =>
      prev.map((indicator) =>
        indicator.indicator_id === id
          ? { ...indicator, name: newName }
          : indicator,
      ),
    );
  };

  const handleRemoveIndicatorRequiredData = (
    indicatorId: number,
    index: number,
  ) => {
    setIndicatorRequiredDataInputs((prev) => ({
      ...prev,
      [indicatorId]: prev[indicatorId].filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="z-0 w-full p-10 flex flex-col gap-10 rounded-xl drop-shadow-md">
      <div>Create Indicators for {goalName}</div>
      <div className="w-full flex items-start justify-between gap-10">
        <div
          className="w-2/5 p-10 bg-gray-100 flex flex-col gap-10"
          id="indicator_form"
        >
          <div className="w-full bg-gray-400 flex items-center">
            <button
              type="button"
              className={`w-1/2 px-2 py-1 text-center border border-gray-600 ${
                selectedAddMethod === "Select Existing"
                  ? "bg-gray-500 text-white"
                  : ""
              }`}
              onClick={() => setSelectedAddMethod("Select Existing")}
            >
              Select existing indicator
            </button>
            <button
              type="button"
              className={`w-1/2 px-2 py-1 text-center border border-gray-600 ${
                selectedAddMethod === "Create New"
                  ? "bg-gray-500 text-white"
                  : ""
              }`}
              onClick={() => setSelectedAddMethod("Create New")}
            >
              Create a new indicator
            </button>
          </div>

          {selectedAddMethod === "Create New" && (
            <div className="w-full flex flex-col gap-6">
              <input
                type="text"
                placeholder="Indicator Name"
                value={newIndicator.name}
                onChange={(e) =>
                  setNewIndicator((prev) => ({ ...prev, name: e.target.value }))
                }
                className="p-2 rounded-md"
              />
              <input
                type="text"
                placeholder="Description"
                value={newIndicator.description}
                onChange={(e) =>
                  setNewIndicator({
                    ...newIndicator,
                    description: e.target.value,
                  })
                }
                className="p-2 rounded-md"
              />
              <button
                className="px-4 py-2 bg-green-500 text-white rounded"
                onClick={handleCreateNewIndicator}
              >
                Add Indicator
              </button>
            </div>
          )}

          {selectedAddMethod === "Select Existing" && (
            <div className="w-full flex flex-col gap-4">
              <p>Select an Indicator:</p>
              <div className="border p-4 rounded-lg">
                {indicators.map((indicator) => (
                  <p
                    key={indicator.indicator_id}
                    className="p-2 cursor-pointer hover:bg-gray-200"
                    onClick={() =>
                      handleAddExistingIndicator(
                        indicator.indicator_id,
                        indicator.name,
                      )
                    }
                  >
                    {indicator.name}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>

        <ul className="w-4/5 flex flex-col gap-4">
          {selectedIndicators.map((indicator) => (
            <li
              key={indicator.indicator_id}
              className="w-full flex flex-col gap-4 bg-gray-100 p-4 rounded-lg"
            >
              <input
                type="text"
                className="w-full text-wrap bg-transparent font-semibold"
                value={indicator.name}
                onChange={(e) =>
                  handleEditIndicatorName(
                    indicator.indicator_id,
                    e.target.value,
                  )
                }
              />

              <div className="w-full flex items-center gap-10">
                <div className="w-fit flex flex-col items-start gap-1">
                  <label className="text-sm font-bold text-gray-500">
                    2030 Target
                  </label>
                  <input
                    type="number"
                    className="w-fit p-2 text-xs border rounded-md"
                    placeholder="Target"
                    value={indicator.target ?? ""}
                    onChange={(e) =>
                      handleUpdateIndicatorValues(
                        indicator.indicator_id,
                        Number(e.target.value),
                      )
                    }
                  />
                </div>
                <div className="w-fit flex flex-col items-start gap-1">
                  <label className="text-sm font-bold text-gray-500">
                    Baseline
                  </label>
                  <input
                    type="number"
                    className="w-fit p-2 text-xs border rounded-md"
                    placeholder="Target"
                    value={indicator.target ?? ""}
                    onChange={(e) =>
                      handleUpdateIndicatorValues(
                        indicator.indicator_id,
                        Number(e.target.value),
                      )
                    }
                  />
                </div>
              </div>
              <div>
                <p>Identify the data needed to be collected:</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Required Data Name"
                    className="p-2 border rounded-md flex-grow"
                    value={indicatorRequiredDataName}
                    onChange={(e) =>
                      setIndicatorRequiredDataName(e.target.value)
                    }
                  />

                  <button
                    className="bg-blue-500 text-white px-3 py-2 rounded-md"
                    onClick={() =>
                      handleCreateIndicatorRequiredData(
                        indicator.indicator_id,
                        indicatorRequiredDataName,
                      )
                    }
                  >
                    Add
                  </button>
                </div>

                {/* Show Assigned Required Data */}
                {indicatorRequiredDataInputs[indicator.indicator_id]?.length >
                  0 && (
                  <div className="mt-2 p-2 bg-white rounded-md shadow">
                    <p className="font-semibold">Required Data:</p>
                    <ul className="mt-2 space-y-2">
                      {indicatorRequiredDataInputs[indicator.indicator_id].map(
                        (data, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <span className="flex-grow">{data.name}</span>

                            <button
                              className="text-red-500 hover:text-red-700"
                              onClick={() =>
                                handleRemoveIndicatorRequiredData(
                                  indicator.indicator_id,
                                  index,
                                )
                              }
                            >
                              ✖
                            </button>
                          </li>
                        ),
                      )}
                    </ul>
                  </div>
                )}
              </div>

              {/* Sub-Indicator Selection & Creation */}
              <div className="w-full p-4 flex flex-col gap-4 bg-gray-300 rounded-md">
                <p>Select or Add Sub-Indicators:</p>

                {/* Dropdown for Existing Sub-Indicators */}
                <select
                  className="p-2 border rounded-md"
                  onChange={(e) => {
                    const subIndicatorId = Number(e.target.value);
                    if (!subIndicatorId) return;

                    const subIndicator = indicators
                      .find(
                        (ind) => ind.indicator_id === indicator.indicator_id,
                      )
                      ?.md_sub_indicator?.find(
                        (sub) => sub.sub_indicator_id === subIndicatorId,
                      );

                    if (subIndicator) {
                      setSubIndicatorInputs((prev) => ({
                        ...prev,
                        [indicator.indicator_id]: [
                          ...(prev[indicator.indicator_id] || []),
                          {
                            sub_indicator_id: subIndicator.sub_indicator_id, // Ensure ID exists
                            name: subIndicator.name,
                            target: 0,
                          },
                        ],
                      }));
                    }
                  }}
                >
                  <option value="">-- Select a sub-indicator --</option>
                  {indicators
                    .find((ind) => ind.indicator_id === indicator.indicator_id)
                    ?.md_sub_indicator?.map((sub) => (
                      <option
                        key={sub.sub_indicator_id}
                        value={sub.sub_indicator_id}
                      >
                        {sub.name}
                      </option>
                    ))}
                </select>

                {/* Input for Creating a New Sub-Indicator */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="New Sub-Indicator"
                    className="p-2 border rounded-md flex-grow"
                    value={newSubIndicatorName}
                    onChange={(e) => setNewSubIndicatorName(e.target.value)}
                  />

                  <button
                    className="bg-blue-500 text-white px-3 py-2 rounded-md"
                    onClick={() => {
                      handleCreateSubIndicator(
                        indicator.indicator_id,
                        newSubIndicatorName,
                      );
                      setNewSubIndicatorName(""); // Clear input after adding
                    }}
                  >
                    Add
                  </button>
                </div>

                {/* Show Assigned Sub-Indicators */}
                {subIndicatorInputs[indicator.indicator_id]?.length > 0 && (
                  <div className="mt-2 p-2 bg-white rounded-md shadow">
                    <p className="font-semibold">Selected Sub-Indicators:</p>
                    <ul className="mt-2 space-y-2">
                      {subIndicatorInputs[indicator.indicator_id].map(
                        (sub, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <span className="flex-grow">{sub.name}</span>
                            <input
                              type="number"
                              className="p-1 border rounded-md w-20"
                              value={sub.target}
                              onChange={(e) => {
                                const updatedTarget = Number(e.target.value);
                                setSubIndicatorInputs((prev) => ({
                                  ...prev,
                                  [indicator.indicator_id]: prev[
                                    indicator.indicator_id
                                  ].map((s, i) =>
                                    i === index
                                      ? { ...s, target: updatedTarget }
                                      : s,
                                  ),
                                }));
                              }}
                            />
                            <button
                              className="text-red-500 hover:text-red-700"
                              onClick={() =>
                                handleRemoveSubIndicator(
                                  indicator.indicator_id,
                                  index,
                                )
                              }
                            >
                              ✖
                            </button>
                          </li>
                        ),
                      )}
                    </ul>
                  </div>
                )}
              </div>

              {/* <button
                className="text-red-500 text-sm"
                onClick={() =>
                  setSelectedIndicators((prevIndicators) =>
                    prevIndicators.map((ind) =>
                      ind.indicator_id === indicator.indicator_id
                        ? {
                            ...ind,
                            sub_indicators: ind.sub_indicators?.filter(
                              (s) => s.sub_indicator_id !== sub.sub_indicator_id,
                            ),
                          }
                        : ind,
                    ),
                  )
                }
              >
                Remove
              </button> */}
              <button
                onClick={() => {
                  handleRemoveIndicator(indicator.indicator_id);
                }}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      </div>

      <form onSubmit={handleSubmit}>
        <button className="mt-4 bg-blue-500 text-white px-4 py-2 rounded">
          Submit
        </button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}
