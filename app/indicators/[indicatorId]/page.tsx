"use client";

import { useParams } from "next/navigation"; 
import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import { useIndicators } from "@/context/IndicatorContext";
import { Indicator } from "@/context/IndicatorContext";

const IndicatorDetails = () => {
  const { id } = useParams(); 
  const { indicators } = useIndicators();
  const [indicator, setIndicator] = useState<Indicator | null>(null);

  useEffect(() => {
    if (id) {
      const fetchedIndicator = getIndicatorById(Number(id));
      setIndicator(fetchedIndicator);
    }
  }, [id, indicators]);

  const getIndicatorById = (id: number): Indicator | null => {
    return indicators.find((indicator) => indicator.id === id) || null;
  };

  if (!indicator) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="flex-1 p-7">Loading indicator...</div>
      </div>
    );
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-7">
        <h1 className="text-2xl font-semibold mb-6">Indicator Details</h1>
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold">{indicator.name}</h2>
          <p className="text-gray-600">{indicator.description}</p>

          <div className="mt-4">
            <h3 className="text-lg font-semibold">Values</h3>
            <p><strong>Baseline:</strong> {indicator.baseline}</p>
            <p><strong>Target:</strong> {indicator.target}</p>
            <p><strong>Current:</strong> {indicator.current}</p>
            <p><strong>Status:</strong> {indicator.status}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IndicatorDetails;