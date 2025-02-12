"use client";

import { useParams } from "next/navigation";

const sdgNames: { [key: string]: string } = {
  "1": "No Poverty",
  "2": "Zero Hunger",
  "3": "Good Health and Well-being",
  "4": "Quality Education",
  "5": "Gender Equality",
  "6": "Clean Water and Sanitation",
  "7": "Affordable and Clean Energy",
  "8": "Decent Work and Economic Growth",
  "9": "Industry, Innovation and Infrastructure",
  "10": "Reduced Inequalities",
  "11": "Sustainable Cities and Communities",
  "12": "Responsible Consumption and Production",
  "13": "Climate Action",
  "14": "Life Below Water",
  "15": "Life on Land",
  "16": "Peace, Justice and Strong Institutions",
  "17": "Partnerships for the Goals",
};

const ProjectDashboard = () => {
  const params = useParams();
  const sdgNumber = params.sdgNumber as string; // Extract SDG number from URL
  const sdgName = sdgNames[sdgNumber] || "Unknown SDG"; // Get SDG name or fallback

  return (
    <div>
      <h1>Projects for SDG {sdgNumber}: {sdgName}</h1>
      {/* Add project details here */}
    </div>
  );
};

export default ProjectDashboard;
