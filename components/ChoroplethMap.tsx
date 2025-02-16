"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

const ChoroplethMap = ({ onBarangaySelect }: { onBarangaySelect: (barangay: string) => void }) => {
  const [geoData, setGeoData] = useState<any>(null);
  const [plotData, setPlotData] = useState<any[]>([]);
  const [sdgData, setSdgData] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch the GeoJSON file
        const geoResponse = await fetch("/pasigcity.0.01.json");
        const geoJson = await geoResponse.json();
        setGeoData(geoJson);

        // Fetch SDG data from API
        const sdgResponse = await fetch("/api/get-sdg-data");
        const sdgJson = await sdgResponse.json();
        setSdgData(sdgJson);

        // Extract barangay names from GeoJSON
        const locations = geoJson.features.map((feature: any) => feature.properties.NAME_3);

        // Match API data with barangay names
        const values = locations.map((barangayName: string) => {
          const sdgEntry = sdgJson.find((sdg: any) =>
            sdg.location_data?.some((loc: any) => loc.barangay === barangayName)
          );

          if (!sdgEntry) return null; // No data found for this barangay

          const locationData = sdgEntry.location_data.find((loc: any) => loc.barangay === barangayName);
          return locationData?.sdg1_poverty_rate ?? null; // Use SDG indicator value
        });

        // Set the plot data
        setPlotData([
          {
            type: "choroplethmapbox",
            geojson: geoJson,
            locations: locations,
            z: values.map((v) => (v !== null ? v : -1)), // Assign -1 for missing data
            zauto: false,
            zmin: 0,
            zmax: 1,
            colorscale: [
              [-1, "rgba(200, 200, 200, 0.7)"], // Gray for missing data
              [0, "rgba(0, 255, 0, 0.8)"], // Green (good progress)
              [0.5, "rgba(255, 165, 0, 0.8)"], // Orange (moderate progress)
              [1, "rgba(255, 0, 0, 0.8)"], // Red (poor progress)
            ],
            colorbar: { title: "SDG Progress" },
            featureidkey: "properties.NAME_3",
            marker: {
              line: { width: 1, color: "black" }, // Black border for better visibility
            },
          },
        ]);
      } catch (error) {
        console.error("Error loading GeoJSON or API data:", error);
      }
    };

    fetchData();
  }, []);

  if (!geoData) return <p>Loading map...</p>;

  return (
    <Plot
      data={plotData}
      layout={{
        title: "Pasig City Barangays - SDG Progress",
        mapbox: {
          style: "carto-positron",
          center: { lon: 121.08, lat: 14.58 },
          zoom: 12,
          layers: [
            {
              sourcetype: "geojson",
              source: geoData,
              type: "line",
              color: "black",
              line: { width: 1 },
            },
          ],
        },
      }}
      config={{ scrollZoom: true }}
      style={{ width: "100%", height: "1000px" }}
    />
  );
};

export default ChoroplethMap;
