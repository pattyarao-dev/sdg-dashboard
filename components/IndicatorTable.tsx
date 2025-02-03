import React from 'react';

const IndicatorTable: React.FC<{ sdgData: any }> = ({ sdgData }) => {
  // Prepare table data
  const tableData = sdgData.map(sdg => {
    const indicatorsWithData = sdg.indicators.filter(indicator => indicator.hasData); // Filter for indicators being worked on
    return {
      title: sdg.title,
      totalIndicators: sdg.indicators.length,
      indicatorsWithData: indicatorsWithData.length,
    };
  });

  return (
    <table>
      <thead>
        <tr>
          <th>SDG</th>
          <th>Total Indicators</th>
          <th>Indicators Being Worked On</th>
        </tr>
      </thead>
      <tbody>
        {tableData.map((row, index) => (
          <tr key={index}>
            <td>{row.title}</td>
            <td>{row.totalIndicators}</td>
            <td>{row.indicatorsWithData}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
