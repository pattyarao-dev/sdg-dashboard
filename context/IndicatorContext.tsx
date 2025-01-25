"use client";

import React, { createContext, useContext, useState } from "react";

export enum IndicatorStatus {
    Active = "active",
    Disabled = "disabled",
  }

type Indicator = {
  id: number;
  name: string;
  baseline: number;
  target: number;
  current: number;
  description: string;
  status: IndicatorStatus;
};

interface IndicatorContextProps {
  indicators: Indicator[];
  addIndicator: (indicator: Indicator) => void;
  updateIndicatorStatus: (id: number, status: ndicatorStatus.Active | IndicatorStatus.Disabled) => void;
}

const IndicatorContext = createContext<IndicatorContextProps | undefined>(undefined);

export const IndicatorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [indicators, setIndicators] = useState<Indicator[]>([]);

  const addIndicator = (indicator: Indicator) => {
    setIndicators((prev) => [...prev, indicator]);
  };

  const updateIndicatorStatus = (id: number, status: IndicatorStatus.Active | IndicatorStatus.Disabled) => {
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
