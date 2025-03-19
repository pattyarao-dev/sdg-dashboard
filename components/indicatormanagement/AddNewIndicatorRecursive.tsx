import { useState } from "react";

interface Indicator {
  name: string;
  description: string;
  global_target_value: number;
  global_baseline_value: number;
  subIndicators: Indicator[];
}

const IndicatorForm = () => {
  const [newIndicator, setNewIndicator] = useState<Indicator>({
    name: "",
    description: "",
    global_target_value: 0,
    global_baseline_value: 0,
    subIndicators: [],
  });

  const handleInputChange = (field: keyof Indicator, value: any) => {
    setNewIndicator((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddSubIndicator = (parentIndicator: Indicator) => {
    const newSubIndicator: Indicator = {
      name: "",
      description: "",
      global_target_value: 0,
      global_baseline_value: 0,
      subIndicators: [],
    };
    setNewIndicator((prev) => {
      const updateIndicators = (indicator: Indicator): Indicator => {
        if (indicator === parentIndicator) {
          return {
            ...indicator,
            subIndicators: [...indicator.subIndicators, newSubIndicator],
          };
        }
        return {
          ...indicator,
          subIndicators: indicator.subIndicators.map(updateIndicators),
        };
      };
      return updateIndicators(prev);
    });
  };

  const handleRemoveSubIndicator = (
    parentIndicator: Indicator,
    index: number,
  ) => {
    setNewIndicator((prev) => {
      const updateIndicators = (indicator: Indicator): Indicator => {
        if (indicator === parentIndicator) {
          return {
            ...indicator,
            subIndicators: indicator.subIndicators.filter(
              (_, i) => i !== index,
            ),
          };
        }
        return {
          ...indicator,
          subIndicators: indicator.subIndicators.map(updateIndicators),
        };
      };
      return updateIndicators(prev);
    });
  };

  const renderIndicatorForm = (
    indicator: Indicator,
    parentIndicator?: Indicator,
  ) => {
    return (
      <div
        key={indicator.name}
        className={`w-full p-4 border ${parentIndicator ? "border-gray-300" : "border-orange-400"}`}
      >
        <h2
          className={`${parentIndicator ? "text-gray-600" : "text-orange-400"} font-bold`}
        >
          {parentIndicator ? "Sub-Indicator" : "Indicator"}
        </h2>
        <div className="w-full flex flex-col gap-2">
          <input
            type="text"
            placeholder="Indicator Name"
            value={indicator.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            className="w-full p-2 border border-gray-300"
          />
          <input
            type="text"
            placeholder="Indicator Description"
            value={indicator.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            className="w-full p-2 border border-gray-300"
          />
          <div className="w-full flex gap-4">
            <input
              type="number"
              placeholder="2030 Target"
              value={indicator.global_target_value}
              onChange={(e) =>
                handleInputChange("global_target_value", Number(e.target.value))
              }
              className="w-1/2 p-2 border border-gray-300"
            />
            <input
              type="number"
              placeholder="Baseline"
              value={indicator.global_baseline_value}
              onChange={(e) =>
                handleInputChange(
                  "global_baseline_value",
                  Number(e.target.value),
                )
              }
              className="w-1/2 p-2 border border-gray-300"
            />
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => handleAddSubIndicator(indicator)}
              className="px-4 py-2 bg-green-500 text-white rounded"
            >
              + Add Sub-Indicator
            </button>
            {parentIndicator && (
              <button
                onClick={() =>
                  handleRemoveSubIndicator(
                    parentIndicator,
                    parentIndicator.subIndicators.indexOf(indicator),
                  )
                }
                className="px-4 py-2 bg-red-500 text-white rounded"
              >
                Remove
              </button>
            )}
          </div>
        </div>

        <div className="ml-6">
          {indicator.subIndicators.map((subIndicator) => (
            <div key={subIndicator.name}>
              {renderIndicatorForm(subIndicator, indicator)}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full p-10 bg-white drop-shadow-lg flex flex-col gap-8">
      <div className="w-full flex flex-col gap-2">
        <p className="text-lg font-semibold text-orange-400">
          Add a New Indicator
        </p>
        <hr className="w-full border border-orange-400" />
      </div>

      {renderIndicatorForm(newIndicator)}

      <button
        onClick={() => console.log(newIndicator)}
        className="px-6 py-2 bg-blue-500 text-white rounded"
      >
        Submit Indicator
      </button>
    </div>
  );
};

export default IndicatorForm;
