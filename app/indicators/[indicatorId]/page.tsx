"use client";

import { useParams } from "next/navigation"; 
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import { useIndicators } from "@/context/IndicatorContext";
import { Indicator } from "@/context/IndicatorContext";

const IndicatorDetails = () => {
  const params = useParams();
  const router = useRouter();
  const indicatorId = params?.indicatorId;

  const { indicators } = useIndicators();
  const [indicator, setIndicator] = useState<Indicator | null>(null);

  useEffect(() => {
    if (indicatorId) {
      const fetchedIndicator = getIndicatorById(Number(indicatorId));
      setIndicator(fetchedIndicator);
    }
  }, [indicatorId, indicators]);

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
        <button 
          className="flex items-center hover:text-yellow-500 mb-4" 
          onClick={() => router.push("/indicator-management")} 
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            strokeWidth="2" 
            stroke="currentColor" 
            className="w-5 h-5 mr-2"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              d="M15 19l-7-7 7-7" 
            />
          </svg>
          Back to Indicator List
        </button>
        
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl text-black font-semibold">{indicator.name}</h2>
          <p className="text-black-600">{indicator.description}</p>

          <div className="mt-4 text-black">
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
