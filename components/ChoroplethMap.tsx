"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

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

        // ✅ Debugging: Check available properties in GeoJSON
        console.log("GeoJSON Feature Properties:", data.features[0].properties);

        // ✅ Ensure correct feature ID key
        const featureKey = "properties.NAME_3"; // Change if necessary
        const locations = data.features.map((feature: any) => feature.properties.NAME_3);

        // ✅ Generate example data values
        const values = data.features.map(() => Math.random() * 100);

        setPlotData([
          {
            type: "choroplethmapbox",
            geojson: data,
            locations: locations, // Must match featureidkey
            z: values,
            zauto: false,
            colorscale: [
              [0, "rgba(255, 255, 204, 0.4)"],  // Light Yellow, 40% transparent
              [0.5, "rgba(255, 153, 51, 0.5)"], // Orange, 50% transparent
              [1, "rgba(204, 0, 0, 0.6)"],      // Dark Red, 60% transparent
            ],
            // colorscale: "YlOrRd",
            colorbar: { title: "Data Value" },
            featureidkey: featureKey, // Key from GeoJSON
            marker: {
              line: {
                width: 1, // Ensure visible outlines
                color: [1, "rgba(204, 0, 0, 0.6)"],
              },
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
        title: "Pasig City Barangays",
        mapbox: {
          style: "carto-positron", // ✅ Alternative to Mapbox
          center: { lon: 121.08, lat: 14.58 },
          zoom: 12,
          layers: [
            {
              sourcetype: "geojson",
              source: geoData, // ✅ Ensure the GeoJSON is loaded
              type: "line", // ✅ This makes outlines appear
              color: "red",
              line: { width: 1 }, // ✅ Ensure visible borders
            },
          ],
        },
      }}
      config={{ scrollZoom: false }}
      style={{ width: "100%", height: "500px" }}
    />
  );
};

export default ChoroplethMap;
