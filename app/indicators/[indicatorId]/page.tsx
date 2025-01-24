"use client";

import { useParams } from "next/navigation"; 
import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";

type Indicator = {
  id: number;
  name: string;
  description: string;
  baseline: number;
  target: number;
  current: number;
  createdAt: number;
};

const IndicatorDetails = () => {
  const { id } = useParams(); 
  const [indicator, setIndicator] = useState<Indicator | null>(null);

  useEffect(() => {
    if (id) {
    
      const fetchedIndicator = getIndicatorById(Number(id));
      setIndicator(fetchedIndicator);
    }
  }, [id]);

  const getIndicatorById = (id: number): Indicator | null => {
    
    const indicatorData = [
      {
        id: 1,
        name: "Indicator 1",
        description: "Description of Indicator 1",
        baseline: 10.5,
        target: 15.0,
        current: 12.3,
        createdAt: Date.now(),
      },
      {
        id: 2,
        name: "Indicator 2",
        description: "Description of Indicator 2",
        baseline: 20.5,
        target: 30.0,
        current: 25.4,
        createdAt: Date.now(),
      },
    ];

    return indicatorData.find((indicator) => indicator.id === id) || null;
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default IndicatorDetails;
