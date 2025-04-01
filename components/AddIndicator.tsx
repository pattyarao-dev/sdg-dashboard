"use client";

import { createIndicatorsBatch } from "@/app/actions/actions";
import { useEffect, useState } from "react";
import {
  IIndicator,
  ISubIndicator,
  IRequiredData,
} from "@/types/indicator.types";

interface AddIndicatorProps {
  goalName: string;
  goalId: number;
  indicators: IIndicator[];
  requiredData: IRequiredData[];
}

export default function AddIndicator({
  goalName,
  goalId,
  indicators,
  requiredData,
}: AddIndicatorProps) {
  // This is the state variable for the method for adding an indicator:
  // Can add an existing indicator to another goal
  // Can create a new indicator for this goal
  const [selectedAddMethod, setSelectedAddMethod] = useState("Select Existing");

  // This is the state variable for the selected indicators
  // An array of indicators that a user wants to add to a goal.
  const [selectedIndicators, setSelectedIndicators] = useState<
    {
      indicator_id: number;
      name: string;
      description?: string;
      global_target_value: number;
      global_baseline_value: number;
      sub_indicators: ISubIndicator[] | null | undefined;
    }[]
  >([]);

  const [newSubIndicatorName, setNewSubIndicatorName] = useState("");

  const [subIndicatorInputs, setSubIndicatorInputs] = useState<{
    [indicatorId: number]: {
      sub_indicator_id: number;
      name: string;
      global_target_value: number;
      global_baseline_value: number;
    }[];
  }>({});

  const [indicatorRequiredDataName, setIndicatorRequiredDataName] =
    useState("");

  const [subIndicatorRequiredDataName, setSubIndicatorRequiredDataName] =
    useState("");

  const [indicatorRequiredDataInputs, setIndicatorRequiredDataInputs] =
    useState<{
      [indicatorId: number]: {
        requiredDataId: number;
        name: string;
      }[];
    }>({});

  const [subIndicatorRequiredDataInputs, setSubIndicatorRequiredDataInputs] =
    useState<{
      [subIndicatorId: number]: {
        requiredDataId: number;
        name: string;
      }[];
    }>({});

  const [newIndicator, setNewIndicator] = useState({
    name: "",
    description: "",
    global_target_value: 0,
    global_baseline_value: 0,
  });

  const [message, setMessage] = useState("");

  useEffect(() => {
    console.log("Selected Indicators:", selectedIndicators);
  }, [selectedIndicators]);

  // function for adding an existing indicator to the array of selected indicators.
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
          global_target_value: 0,
          global_baseline_value: 0,
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
          global_target_value: subIndicator.global_target_value ?? 0,
          global_baseline_value: subIndicator.global_baseline_value ?? 0,
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
        global_target_value: newIndicator.global_target_value ?? 0,
        global_baseline_value: newIndicator.global_baseline_value ?? 0,
        sub_indicators: [],
      },
    ]);
    setSubIndicatorInputs((prev) => ({
      ...prev,
      [newId]: [],
    }));

    setNewIndicator({
      name: "",
      description: "",
      global_target_value: 0,
      global_baseline_value: 0,
    });
  };

  const handleUpdateIndicatorValues = (
    id: number,
    key: "global_target_value" | "global_baseline_value",
    value: number,
  ) => {
    setSelectedIndicators(
      selectedIndicators.map((indicator) =>
        indicator.indicator_id === id
          ? { ...indicator, [key]: value }
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
      global_target_value: 0,
      global_baseline_value: 0,
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
        { requiredDataId: -Date.now(), name }, // Use negative ID
      ],
    }));

    setIndicatorRequiredDataName(""); // Clear input field after adding
  };

  const handleCreateSubIndicatorRequiredData = (
    subIndicatorId: number,
    name: string,
  ) => {
    if (!name.trim()) return;

    setSubIndicatorRequiredDataInputs((prev) => ({
      ...prev,
      [subIndicatorId]: [
        ...(prev[subIndicatorId] || []),
        { requiredDataId: -Date.now(), name }, // Use negative ID
      ],
    }));

    setSubIndicatorRequiredDataName("");
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const indicatorsWithSubIndicators = selectedIndicators.map((indicator) => ({
      ...indicator,
      // Only use the sub-indicators from subIndicatorInputs
      required_data: indicatorRequiredDataInputs[indicator.indicator_id] || [],
      sub_indicators: (subIndicatorInputs[indicator.indicator_id] || []).map(
        (subIndicator) => ({
          ...subIndicator,
          required_data:
            subIndicatorRequiredDataInputs?.[subIndicator.sub_indicator_id] ||
            [],
        }),
      ),
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

  // const handleRemoveIndicatorRequiredData = (
  //   indicatorId: number,
  //   index: number,
  // ) => {
  //   setIndicatorRequiredDataInputs((prev) => ({
  //     ...prev,
  //     [indicatorId]: prev[indicatorId].filter((_, i) => i !== index),
  //   }));
  // };

  const handleUpdateSubIndicatorValue = (
    indicatorId: number,
    subIndicatorId: number,
    field: "global_target_value" | "global_baseline_value",
    value: number,
  ) => {
    setSubIndicatorInputs((prev) => ({
      ...prev,
      [indicatorId]: prev[indicatorId].map((sub) =>
        sub.sub_indicator_id === subIndicatorId
          ? { ...sub, [field]: value }
          : sub,
      ),
    }));
  };

  const handleRemoveSubIndicatorRequiredData = (
    subIndicatorId: number,
    requiredDataIndex: number,
  ) => {
    setSubIndicatorRequiredDataInputs((prev) => ({
      ...prev,
      [subIndicatorId]:
        prev[subIndicatorId]?.filter(
          (_, index) => index !== requiredDataIndex,
        ) || [], // Ensure we don't set undefined
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
                    value={indicator.global_target_value}
                    onChange={(e) =>
                      handleUpdateIndicatorValues(
                        indicator.indicator_id,
                        "global_target_value",
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
                    value={indicator.global_baseline_value}
                    onChange={(e) =>
                      handleUpdateIndicatorValues(
                        indicator.indicator_id,
                        "global_baseline_value",
                        Number(e.target.value),
                      )
                    }
                  />
                </div>
              </div>
              <div className="w-full bg-gray-300 p-4 flex flex-col gap-2 rounded-md">
                <p>
                  Identify the data to be collected. Select or Create a new one.
                </p>

                {/* Dropdown for selecting required data */}
                <div className="w-full">
                  <select
                    className="w-full p-2 border rounded-md"
                    onChange={(e) => {
                      const requiredDataId = Number(e.target.value);
                      if (!requiredDataId) return;

                      // Find the selected required data
                      const selectedData = requiredData.find(
                        (data) => data.required_data_id === requiredDataId,
                      );

                      if (selectedData) {
                        setIndicatorRequiredDataInputs((prev) => ({
                          ...prev,
                          [indicator.indicator_id]: [
                            ...(prev[indicator.indicator_id] || []),
                            {
                              requiredDataId: selectedData.required_data_id,
                              name: selectedData.name,
                            },
                          ],
                        }));
                      }

                      // Reset dropdown value
                      e.target.value = "";
                    }}
                  >
                    <option value="">-- Select data --</option>
                    {requiredData
                      .filter(
                        (data) =>
                          !(
                            indicatorRequiredDataInputs[
                              indicator.indicator_id
                            ] || []
                          ).some(
                            (d) => d.requiredDataId === data.required_data_id,
                          ),
                      )
                      .map((data) => (
                        <option
                          key={data.required_data_id}
                          value={data.required_data_id}
                        >
                          {data.name}
                        </option>
                      ))}
                  </select>
                </div>

                {/* Input field for adding new required data */}
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
                    onClick={() => {
                      // Normalize the input (lowercase + trim)
                      const normalizedInput = indicatorRequiredDataName
                        .trim()
                        .toLowerCase();

                      // Check if the name already exists in `requiredData`
                      const isDuplicate = requiredData.some(
                        (data) => data.name.toLowerCase() === normalizedInput,
                      );

                      if (isDuplicate) {
                        alert(
                          "This required data already exists! Please select it instead.",
                        );
                        return;
                      }

                      handleCreateIndicatorRequiredData(
                        indicator.indicator_id,
                        indicatorRequiredDataName,
                      );
                    }}
                  >
                    Add
                  </button>
                </div>
                {/* List of selected required data */}
                <ul className="w-full  bg-white rounded-md flex flex-col gap-4">
                  {(
                    indicatorRequiredDataInputs[indicator.indicator_id] || []
                  ).map((data) => (
                    <li
                      key={data.requiredDataId}
                      className="w-full rounded-md flex flex-col items-start gap-2"
                    >
                      <div className="w-full flex items-center justify-between">
                        {data.name}
                        <button
                          className="text-red-500"
                          onClick={() => {
                            setIndicatorRequiredDataInputs((prev) => ({
                              ...prev,
                              [indicator.indicator_id]: prev[
                                indicator.indicator_id
                              ].filter(
                                (d) => d.requiredDataId !== data.requiredDataId,
                              ),
                            }));
                          }}
                        >
                          ✕
                        </button>
                      </div>
                      <hr className="w-full border border-gray-300" />
                    </li>
                  ))}
                </ul>
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
                            global_target_value: 0,
                            global_baseline_value: 0,
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
                          <li
                            key={index}
                            className="flex flex-col items-center gap-2"
                          >
                            <span className="w-full bg-green-200">
                              {sub.name}
                            </span>
                            <div className="w-full flex items-center gap-10">
                              <div className="w-fit flex flex-col items-start gap-1">
                                <label className="text-sm font-bold text-gray-500">
                                  2030 Target
                                </label>
                                <input
                                  type="number"
                                  className="w-fit p-2 text-xs border rounded-md"
                                  placeholder="Target"
                                  value={sub.global_target_value}
                                  onChange={(e) =>
                                    handleUpdateSubIndicatorValue(
                                      indicator.indicator_id,
                                      sub.sub_indicator_id,
                                      "global_target_value",
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
                                  value={sub.global_baseline_value}
                                  onChange={(e) =>
                                    handleUpdateSubIndicatorValue(
                                      indicator.indicator_id,
                                      sub.sub_indicator_id,
                                      "global_baseline_value",
                                      Number(e.target.value),
                                    )
                                  }
                                />
                              </div>
                            </div>
                            <div className="w-full bg-gray-300 p-4 flex flex-col gap-2 rounded-md">
                              <p>
                                Identify the data to be collected for this
                                sub-indicator. Select or Create a new one.
                              </p>

                              {/* Dropdown for selecting required data */}
                              <div className="w-full">
                                <select
                                  className="w-full p-2 border rounded-md"
                                  onChange={(e) => {
                                    const requiredDataId = Number(
                                      e.target.value,
                                    );
                                    if (!requiredDataId) return;

                                    // Find the selected required data
                                    const selectedData = requiredData.find(
                                      (data) =>
                                        data.required_data_id ===
                                        requiredDataId,
                                    );

                                    if (selectedData) {
                                      setSubIndicatorRequiredDataInputs(
                                        (prev) => ({
                                          ...prev,
                                          [sub.sub_indicator_id]: [
                                            ...(prev[sub.sub_indicator_id] ||
                                              []),
                                            {
                                              requiredDataId:
                                                selectedData.required_data_id,
                                              name: selectedData.name,
                                            },
                                          ],
                                        }),
                                      );
                                    }

                                    // Reset dropdown value
                                    e.target.value = "";
                                  }}
                                >
                                  <option value="">-- Select data --</option>
                                  {requiredData
                                    .filter(
                                      (data) =>
                                        !(
                                          subIndicatorRequiredDataInputs[
                                            sub.sub_indicator_id
                                          ] || []
                                        ).some(
                                          (d) =>
                                            d.requiredDataId ===
                                            data.required_data_id,
                                        ),
                                    )
                                    .map((data) => (
                                      <option
                                        key={data.required_data_id}
                                        value={data.required_data_id}
                                      >
                                        {data.name}
                                      </option>
                                    ))}
                                </select>
                              </div>

                              {/* Input field for adding new required data to sub-indicator */}
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  placeholder="Required Data Name"
                                  className="p-2 border rounded-md flex-grow"
                                  onChange={(e) =>
                                    setSubIndicatorRequiredDataName(
                                      e.target.value,
                                    )
                                  }
                                />

                                <button
                                  className="bg-blue-500 text-white px-3 py-2 rounded-md"
                                  onClick={() => {
                                    // Normalize the input (lowercase + trim)
                                    const normalizedInput =
                                      subIndicatorRequiredDataName
                                        .trim()
                                        .toLowerCase();

                                    // Check if the name already exists in `requiredData`
                                    const isDuplicate = requiredData.some(
                                      (data) =>
                                        data.name.toLowerCase() ===
                                        normalizedInput,
                                    );

                                    if (isDuplicate) {
                                      alert(
                                        "This required data already exists! Please select it instead.",
                                      );
                                      return;
                                    }

                                    handleCreateSubIndicatorRequiredData(
                                      sub.sub_indicator_id,
                                      subIndicatorRequiredDataName,
                                    );
                                  }}
                                >
                                  Add
                                </button>
                              </div>
                              {/* List of selected required data */}
                              <ul className="w-full p-4 bg-white rounded-md flex flex-col gap-4">
                                {(
                                  subIndicatorRequiredDataInputs[
                                    sub.sub_indicator_id
                                  ] || []
                                ).map((data, index: number) => (
                                  <li
                                    key={data.requiredDataId}
                                    className="w-full rounded-md flex flex-col items-start gap-2"
                                  >
                                    <div className="w-full flex items-center justify-between">
                                      {data.name}
                                      <button
                                        className="text-red-500"
                                        onClick={() => {
                                          handleRemoveSubIndicatorRequiredData(
                                            sub.sub_indicator_id,
                                            index,
                                          );
                                        }}
                                      >
                                        ✕
                                      </button>
                                    </div>
                                    <hr className="w-full border border-gray-300" />
                                  </li>
                                ))}
                              </ul>
                            </div>
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

      <form onSubmit={handleSubmit} className="w-full flex justify-end">
        <button className="button-style">Submit</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}
