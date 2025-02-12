"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import dummySDGData from "@/app/dummydata/dummySDGData";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

const ChoroplethMap = () => {
  const [geoData, setGeoData] = useState<any>(null);
  const [plotData, setPlotData] = useState<any[]>([]);

  useEffect(() => {
    const fetchGeoJSON = async () => {
      try {
        const response = await fetch("/pasigcity.0.01.json"); // Load GeoJSON file
        const data = await response.json();
        setGeoData(data);

        console.log("GeoJSON Feature Properties:", data.features[0].properties);

        const featureKey = "properties.NAME_3"; // Barangay names
        const locations = data.features.map((feature: any) => feature.properties.NAME_3);

        // Map SDG data to the features in GeoJSON based on barangay names
        const values = data.features.map((feature: any) => {
          const barangayName = feature.properties.NAME_3;

          // Find SDG data for each barangay
          const sdgEntry = dummySDGData.find((sdg: any) =>
            sdg.location_data?.some((loc: any) => loc.barangay === barangayName)
          );

          if (!sdgEntry) return null; // No data, set to null for gray

          // Select an SDG indicator dynamically (e.g., poverty rate)
          const locationData = sdgEntry.location_data.find((loc: any) => loc.barangay === barangayName);
          const sdgValue = locationData?.sdg1_poverty_rate ?? null; // Use appropriate SDG metric

          return sdgValue;
        });

        setPlotData([
          {
            type: "choroplethmapbox",
            geojson: data,
            locations: locations, // Must match featureidkey
            z: values.map((v) => (v !== null ? v : -1)), // Assign -1 for missing data
            zauto: false,
            zmin: 0,
            zmax: 1,
            colorscale: [
              [-1, "rgba(200, 200, 200, 0.7)"], // Gray for missing data
              [0, "rgba(0, 255, 0, 0.8)"],      // Green (good progress)
              [0.5, "rgba(255, 165, 0, 0.8)"],  // Orange (moderate progress)
              [1, "rgba(255, 0, 0, 0.8)"],      // Red (poor progress)
            ],
            colorbar: { title: "SDG Progress" },
            featureidkey: featureKey, // Must match the key in GeoJSON properties
            marker: {
              line: { width: 1, color: "black" }, // Black border for better visibility
            },
          },
        ]);
      } catch (error) {
        console.error("Error loading GeoJSON:", error);
      }
    };

    fetchGeoJSON();
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
