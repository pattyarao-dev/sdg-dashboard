"use client";

import React, { createContext, useContext, useState } from "react";

export enum IndicatorStatus {
    Active = "active",
    Disabled = "disabled",
  }

export type Indicator = {
    id: number;
    name: string;
    baseline: { value: number; year: number };
    target: { value: number; year: number };
    current: { value: number; year: number };
    description: string;
    status: IndicatorStatus;
    sdgs: number[];

};

interface IndicatorContextProps {
  indicators: Indicator[];
  addIndicator: (indicator: Omit<Indicator, "id">) => void;
  updateIndicatorStatus: (id: number, status: IndicatorStatus.Active | IndicatorStatus.Disabled) => void;
}

const IndicatorContext = createContext<IndicatorContextProps | undefined>(undefined);

export const IndicatorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [idCounter, setIdCounter] = useState(1);

  const addIndicator = (newIndicator: Omit<Indicator, "id">) => {
    const id = idCounter; 
    setIndicators([...indicators, { ...newIndicator, id }]);
    setIdCounter(id + 1);
  };
  
  const updateIndicatorStatus = (id: number, status: IndicatorStatus) => {
    setIndicators((prev) =>
      prev.map((ind) => (ind.id === id ? { ...ind, status } : ind))
    );
  };

  return (
    <IndicatorContext.Provider value={{ indicators, addIndicator, updateIndicatorStatus }}>
      {children}
    </IndicatorContext.Provider>
  );
};

export const useIndicators = (): IndicatorContextProps => {
  const context = useContext(IndicatorContext);
  if (!context) {
    throw new Error("useIndicators must be used within an IndicatorProvider");
  }
  return context;
};
