import React from "react";
import GaugeChart from "@/components/GaugeChart";

const Dashboard: React.FC = () => {
    const gaugeData = Array.from({ length: 17 }, (_, index) => ({
        title: `Gauge ${index + 1}`, // Title for each gauge
        value: Math.floor(Math.random() * 100), // Random value for demonstration (0-100)
        color: `hsl(${(index * 20) % 360}, 100%, 50%)` // Different color for each gauge
    }));

    return (
        <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
            <h1>Welcome to the Dashboard</h1>

            {/* Container for the gauges */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(9, 1fr)",
                    marginTop: "auto", // Pushes the gauges to the bottom of the page
                }}
            >
                {gaugeData.map((gauge, index) => (
                    <div key={index}>
                        <GaugeChart title={gauge.title} value={gauge.value} color={gauge.color} />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Dashboard;
