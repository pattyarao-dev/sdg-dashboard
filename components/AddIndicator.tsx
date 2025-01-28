"use client";

import { addExistingIndicator, createIndicator } from "@/app/actions/actions";
import { useState } from "react";
import { IIndicator } from "@/types/indicator.types";

interface AddIndicatorProps {
  goalId: number;
  indicators: IIndicator[];
}

export default function AddIndicator({
  goalId,
  indicators,
}: AddIndicatorProps) {
  const [selectedAddMethod, setSelectedAddMethod] = useState("");

  return (
    <div>
      <div>
        <button
          type="button"
          onClick={() => setSelectedAddMethod("Select Existing")}
        >
          Select existing indicator
        </button>
        <button
          type="button"
          onClick={() => setSelectedAddMethod("Create New")}
        >
          Create a new indicator
        </button>
      </div>

      {selectedAddMethod === "Create New" ? (
        <>
          <form action={createIndicator}>
            <div>
              <p>Create an indicator for Goal:</p>
              <input type="number" name="goalNum" value={goalId} readOnly />
            </div>
            <div>
              <p>Indicator Name</p>
              <input type="text" name="name" required />
            </div>
            <div>
              <p>Indicator Description</p>
              <input type="text" name="description" required />
            </div>
            <div>
              <p>Target Value</p>
              <input
                type="number"
                name="globalTarget"
                className="bg-green-100"
                required
              />
            </div>
            <div>
              <p>Baseline Value</p>
              <input
                type="number"
                name="globalBaseline"
                className="bg-green-100"
                required
              />
            </div>
            <div>
              <p>Current Value</p>
              <input
                type="number"
                name="globalCurrent"
                className="bg-green-100"
                required
              />
            </div>

            <button type="submit">Create Indicator</button>
          </form>
        </>
      ) : (
        <form action={addExistingIndicator}>
          <p>Select an existing indicator:</p>
          <div>
            <p>Create an indicator for Goal:</p>
            <input type="number" name="goalId" value={goalId} readOnly />
          </div>
          <select name="existingIndicatorId" required>
            <option value="">--Select an Indicator--</option>
            {indicators.map((indicator) => (
              <option
                key={indicator.indicator_id}
                value={indicator.indicator_id}
              >
                {indicator.name}
              </option>
            ))}
          </select>
          <div>
            <p>Target Value</p>
            <input
              type="number"
              name="globalTarget"
              className="bg-green-100"
              required
            />
          </div>
          <div>
            <p>Baseline Value</p>
            <input
              type="number"
              name="globalBaseline"
              className="bg-green-100"
              required
            />
          </div>
          <div>
            <p>Current Value</p>
            <input
              type="number"
              name="globalCurrent"
              className="bg-green-100"
              required
            />
          </div>

          <button type="submit">Create Indicator</button>
        </form>
      )}
    </div>
  );
}
