"use client";

import dynamic from "next/dynamic";
import React from "react";

// Import Plotly, if you need charts later on
const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

interface Indicator {
  name: string;
  // hasData: boolean;
  // inProject: boolean;
  sub_indicators: SubIndicator[];
}

interface SubIndicator {
  name: string;
  // hasData: boolean;
  // inProject: boolean;
}

interface Sdgs {
  title: string;
  indicators: Indicator[];
}

interface ScorecardProps {
  sdgData: Sdgs[];
}

const Scorecard: React.FC<ScorecardProps> = ({ sdgData }) => {
  const sdgScores = sdgData.map(sdg => {
    let totalIndicators = 0;
    let indicatorsWithData = 0;
    let indicatorsInProject = 0;

    sdg.indicators.forEach(indicator => {
      // Count total indicators (including sub-indicators)
      totalIndicators++;
      // if (indicator.hasData) indicatorsWithData++;
      // if (indicator.inProject) indicatorsInProject++;

      indicator.sub_indicators.forEach(subIndicator => {
        totalIndicators++;
        // if (subIndicator.hasData) indicatorsWithData++;
        // if (subIndicator.inProject) indicatorsInProject++;
      });
    });

    return {
      title: sdg.title,
      totalIndicators,
      // indicatorsWithData,
      // indicatorsInProject,
    };
  });

  // Sort SDGs by totalIndicators in descending order
  sdgScores.sort((a, b) => b.totalIndicators - a.totalIndicators);

  return (
    <div className="scorecard">
      <h2>SDG Scorecard</h2>
      <table>
        <thead>
          <tr>
            <th>SDG Title</th>
            <th>Total Indicators</th>
            {/* <th>Indicators with Data</th>
            <th>Indicators in Projects</th> */}
          </tr>
        </thead>
        <tbody>
          {sdgScores.map((sdg, index) => (
            <tr key={index}>
              <td>{sdg.title}</td>
              <td>{sdg.totalIndicators}</td>
              {/* <td>{sdg.indicatorsWithData}</td>
              <td>{sdg.indicatorsInProject}</td> */}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Scorecard;
