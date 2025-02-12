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

        const featureKey = "properties.NAME_3"; // This is the key for barangay names
        const locations = data.features.map((feature: any) => feature.properties.NAME_3);

        // Map SDG data to the features in GeoJSON based on barangay names
        const values = data.features.map((feature: any) => {
          const barangayName = feature.properties.NAME_3;

          // Find SDG data for each barangay by matching it with the location_data
          const sdgData = dummySDGData.find((sdg: any) =>
            sdg.location_data && sdg.location_data.some((loc: any) => loc.barangay === barangayName)
          );

          // Access sdg1_poverty_rate safely using a type guard
          const povertyRate = sdgData?.location_data?.find(
            (loc: any) => loc.barangay === barangayName
          )?.sdg1_poverty_rate;

          // If sdg1_poverty_rate is not found, or the property doesn't exist, default to 0
          return povertyRate !== undefined ? povertyRate : 0;
        });

        setPlotData([
          {
            type: "choroplethmapbox",
            geojson: data,
            locations: locations, // Must match featureidkey
            z: values, // SDG values mapped to barangays
            zauto: false,
            colorscale: [
              [0, "rgba(0, 255, 0, 0.7)"],  // Green (good performance), 70% opacity
              [0.5, "rgba(255, 165, 0, 0.7)"],  // Orange (moderate performance), 70% opacity
              [1, "rgba(255, 0, 0, 0.8)"],      // Red (poor performance), 80% opacity
            ],
            colorbar: { title: "Poverty Rate" }, // Change this based on the SDG
            featureidkey: featureKey, // Must match the key in GeoJSON properties
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