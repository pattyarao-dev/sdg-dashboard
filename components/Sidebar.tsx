"use client";
import { useState } from 'react';

const Sidebar = () => {
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [isIndicatorsOpen, setIsIndicatorsOpen] = useState(false);
  const [isProjectsOpen, setIsProjectsOpen] = useState(false);
  const [isDataConsolidationOpen, setIsDataConsolidationOpen] = useState(false);

  return (
    <div className="bg-black h-screen text-white w-64 p-7">
      <h1 className="text-xl font-semibold mb-6">SDG Dashboard</h1>
      <ul className="space-y-4">
        {/* Dashboard */}
        <li>
          <div
            className="flex items-center justify-between cursor-pointer text-yellow-500 hover:text-white"
            onClick={() => setIsDashboardOpen(!isDashboardOpen)}
          >
            <span>Dashboard</span>
            {/* <span>{isDashboardOpen ? '-' : '+'}</span> */}
          </div>
        </li>

        {/* Indicators */}
        <li>
          <div
            className="flex items-center justify-between cursor-pointer text-yellow-500 hover:text-white"
            onClick={() => setIsIndicatorsOpen(!isIndicatorsOpen)}
          >
            <span>Indicators</span>
            <span>{isIndicatorsOpen ? '-' : '+'}</span>
          </div>
          {isIndicatorsOpen && (
            <ul className="ml-4 mt-2 space-y-2">
              <li>
                <a href="indicator-management" className="hover:text-yellow-500">
                  Manage Indicators
                </a>
              </li>
              <li>
                <a href="add-indicator" className="hover:text-yellow-500">
                  Add Indicator
                </a>
              </li>
            </ul>
          )}
        </li>

        {/* Projects */}
        <li>
          <div
            className="flex items-center justify-between cursor-pointer text-yellow-500 hover:text-white"
            onClick={() => setIsProjectsOpen(!isProjectsOpen)}
          >
            <span>Projects</span>
            <span>{isProjectsOpen ? '-' : '+'}</span>
          </div>
          {isProjectsOpen && (
            <ul className="ml-4 mt-2 space-y-2">
              <li>
                <a href="/projects/active" className="hover:text-yellow-500">
                  Add Projects
                </a>
              </li>
            </ul>
          )}
        </li>

        {/* Data Consolidation */}
        <li>
          <div
            className="flex items-center justify-between cursor-pointer text-yellow-500 hover:text-white"
            onClick={() => setIsDataConsolidationOpen(!isDataConsolidationOpen)}
          >
            <span>Data Consolidation</span>
            <span>{isDataConsolidationOpen ? '-' : '+'}</span>
          </div>
          {isDataConsolidationOpen && (
            <ul className="ml-4 mt-2 space-y-2">
              <li>
                <a href="/data-consolidation/import" className="hover:text-yellow-500">
                  Import Data
                </a>
              </li>
            </ul>
          )}
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
