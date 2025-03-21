"use client"

import React, { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, GeoJSON, Tooltip } from 'react-leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { GeoJSONFeature, IndicatorValue } from '@/types/dashboard.types';

// Fix for Leaflet marker icons in Next.js
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: '/images/marker-icon-2x.png',
    iconUrl: '/images/marker-icon.png',
    shadowUrl: '/images/marker-shadow.png',
  });
}

interface ChoroplethMapProps {
  filters: {
    year: number;
    month: number | null;
    location: string | null;
    goal_id: number | null;
    project_id: number | null;
  };
  height?: string;
  width?: string;
  onLocationSelect: (locationName: string | null) => void;
}

const ChoroplethMap: React.FC<ChoroplethMapProps> = ({ 
  filters, 
  height = "500px", 
  width = "100%",
  onLocationSelect
}) => {
  const [geoData, setGeoData] = useState<any>(null);
  const [locationData, setLocationData] = useState<IndicatorValue[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(filters.location);

  // Fetch GeoJSON data
  useEffect(() => {
    const fetchGeoData = async () => {
      try {
        // Adjust this to your actual GeoJSON file path or API endpoint
        const response = await fetch('/pasigcity.0.01.json');
        const data = await response.json();
        setGeoData(data);
      } catch (error) {
        console.error('Error fetching GeoJSON:', error);
      }
    };

    fetchGeoData();
  }, []);

  // Update selected location when filters change
  useEffect(() => {
    setSelectedLocation(filters.location);
  }, [filters.location]);

  // Fetch indicator data based on filters
  useEffect(() => {
    const fetchLocationData = async () => {
      setLoading(true);
      try {
        // Build query params
        const params = {};
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== null) {
            params[key] = value;
          }
        });

        // Fetch indicator values
        const response = await axios.get('http://localhost:8000/api/indicators/values', { params });
        setLocationData(response.data.data);
      } catch (error) {
        console.error('Error fetching location data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLocationData();
  }, [filters]);

  // Get min and max values for color scaling
  const { minValue, maxValue } = useMemo(() => {
    if (locationData.length === 0) return { minValue: 0, maxValue: 100 };
    
    let min = Number.MAX_VALUE;
    let max = Number.MIN_VALUE;
    
    locationData.forEach(item => {
      if (item.value < min) min = item.value;
      if (item.value > max) max = item.value;
    });
    
    return { minValue: min, maxValue: max };
  }, [locationData]);

  // Function to get color based on value
  const getColor = (value: number) => {
    // If no range, use a default color
    if (minValue === maxValue) return '#CCCCCC';
    
    // Create a color scale from yellow to red
    const ratio = (value - minValue) / (maxValue - minValue);
    
    // If goal is filtered, use that goal's color
    if (filters.goal_id) {
      // SDG goal colors from your dashboard
      const goalColors = {
        1: "#E5243B", 2: "#DDA63A", 3: "#4C9F38", 4: "#C5192D",
        5: "#FF3A21", 6: "#26BDE2", 7: "#FCC30B", 8: "#A21942",
        9: "#FD6925", 10: "#DD1367", 11: "#FD9D24", 12: "#BF8B2E",
        13: "#3F7E44", 14: "#0A97D9", 15: "#56C02B", 16: "#00689D",
        17: "#19486A"
      };
      
      const baseColor = goalColors[filters.goal_id as keyof typeof goalColors] || '#CCCCCC';
      
      // Lighten the color based on the ratio
      return lightenColor(baseColor, 1 - ratio);
    }
    
    // Default color scale
    return  ratio > 0.75 ? '#228B22' :  // Dark Green (High Performance)
            ratio > 0.5  ? '#66C266' :  // Light Green (Moderate-High)
            ratio > 0.25 ? '#FFD700' :  // Yellow (Moderate-Low)
                            '#BD0026';   // Dark Red (Low Performance)
  };

  // Helper function to lighten a hex color
  const lightenColor = (color: string, amount: number) => {
    const hex = color.replace('#', '');
    const r = Math.min(255, parseInt(hex.substring(0, 2), 16) + (255 - parseInt(hex.substring(0, 2), 16)) * amount);
    const g = Math.min(255, parseInt(hex.substring(2, 4), 16) + (255 - parseInt(hex.substring(2, 4), 16)) * amount);
    const b = Math.min(255, parseInt(hex.substring(4, 6), 16) + (255 - parseInt(hex.substring(4, 6), 16)) * amount);
    
    return `#${Math.round(r).toString(16).padStart(2, '0')}${Math.round(g).toString(16).padStart(2, '0')}${Math.round(b).toString(16).padStart(2, '0')}`;
  };

  // Style function for GeoJSON features
  const style = (feature: GeoJSONFeature) => {
    // Find matching data for this location
    const locationName = feature.properties.NAME_3;
    const matchingData = locationData.find(item => item.location === locationName);
    
    const value = matchingData ? matchingData.value : 0;
    const isSelected = selectedLocation === locationName;
    
    return {
      fillColor: getColor(value),
      weight: isSelected ? 4 : 2,
      opacity: 1,
      color: isSelected ? '#000' : 'white',
      dashArray: isSelected ? '' : '3',
      fillOpacity: isSelected ? 0.9 : 0.7
    };
  };

  // Function to handle mouseover events
  const highlightFeature = (e: any) => {
    const layer = e.target;
    const locationName = e.target.feature.properties.NAME_3;
    
    // Don't highlight if already selected
    if (selectedLocation === locationName) return;
    
    layer.setStyle({
      weight: 3,
      color: '#666',
      dashArray: '',
      fillOpacity: 0.8
    });
    
    layer.bringToFront();
  };

  // Function to reset highlight on mouseout
  const resetHighlight = (e: any) => {
    const locationName = e.target.feature.properties.NAME_3;
    
    // Don't reset if this is the selected location
    if (selectedLocation === locationName) return;
    
    e.target.setStyle(style(e.target.feature));
  };

  // Handle location selection
  const handleLocationClick = (e: any) => {
    const locationName = e.target.feature.properties.NAME_3;
    
    // If clicking the already selected location, deselect it
    if (selectedLocation === locationName) {
      setSelectedLocation(null);
      onLocationSelect(null);
    } else {
      setSelectedLocation(locationName);
      onLocationSelect(locationName);
    }
  };

  // Function to handle events for each feature
  const onEachFeature = (feature: GeoJSONFeature, layer: any) => {
    const locationName = feature.properties.NAME_3;
    const matchingData = locationData.find(item => item.location === locationName);
    
    // Create tooltip content
    const tooltipContent = matchingData ? 
      `<b>${locationName}</b><br/>Value: ${matchingData.value}<br/>Goal: ${matchingData.goal_name}<br/>Indicator: ${matchingData.indicator_name}` :
      `<b>${locationName}</b><br/>No data available`;
    
    layer.bindTooltip(tooltipContent);
    
    layer.on({
      mouseover: highlightFeature,
      mouseout: resetHighlight,
      click: handleLocationClick
    });
  };

  if (!geoData) {
    return <div style={{ height, width, display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f0f0f0' }}>Loading map data...</div>;
  }

  // Calculate the center of the GeoJSON data
  const calculateCenter = () => {
    if (!geoData || !geoData.features || geoData.features.length === 0) {
      // Default to center of Philippines if no features
      return [14.5995, 121.0339];
    }
    
    // Use the first feature to determine center
    const coordinates = geoData.features[0].geometry.coordinates[0];
    const lats = coordinates.map((coord: number[]) => coord[1]);
    const lngs = coordinates.map((coord: number[]) => coord[0]);
    
    const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;
    const centerLng = (Math.min(...lngs) + Math.max(...lngs)) / 2;
    
    return [centerLat, centerLng];
  };

  return (
    <div style={{ height, width }}>
      <MapContainer 
        center={calculateCenter()} 
        zoom={13} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {geoData && (
          <GeoJSON 
            key={selectedLocation} // Force re-render when selection changes
            data={geoData} 
            style={style}
            onEachFeature={onEachFeature}
          />
        )}
      </MapContainer>
      
      {/* Legend */}
      <div className="map-legend" style={{ 
        position: 'relative', 
        bottom: '100px', 
        right: '10px',
        zIndex: 1000,
        backgroundColor: 'white',
        padding: '10px',
        borderRadius: '5px',
        boxShadow: '0 0 5px rgba(0,0,0,0.2)',
        maxWidth: '200px',
        marginLeft: 'auto'
      }}>
        <h4 style={{ margin: '0 0 8px 0' }}>
          {filters.goal_id ? `Goal ${filters.goal_id} Performance` : 'Performance'}
        </h4>
        {[1, 0.75, 0.5, 0.25, 0].map((ratio, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
            <div style={{ 
              width: '20px', 
              height: '20px', 
              backgroundColor: getColor(minValue + ratio * (maxValue - minValue)),
              marginRight: '8px'
            }}></div>
            <span>
              {Math.round(minValue + ratio * (maxValue - minValue))}
              {i === 4 ? '+' : ''}
            </span>
          </div>
        ))}
        {selectedLocation && (
          <div style={{ marginTop: '10px', fontSize: '14px' }}>
            <strong>Selected:</strong> {selectedLocation}
            <button 
              onClick={() => {
                setSelectedLocation(null);
                onLocationSelect(null);
              }}
              className="ml-2 px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded"
            >
              Clear
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChoroplethMap;