import Sidebar from "@/components/Sidebar";

const IndicatorManagement = () => {
  return (
    <div className="flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 p-7">
        <h1 className="text-2xl font-semibold mb-6">Indicator Management</h1>

        {/* Content Section */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold text-black mb-4">Manage Your Indicators</h2>

          {/* Add an Indicator Form */}
          <div className="space-y-4">
            <div>
              <label htmlFor="indicator-name" className="block text-sm font-medium text-gray-700">
                Indicator Name
              </label>
              <input
                type="text"
                id="indicator-name"
                className="w-full p-3 border border-gray-300 rounded-md"
                placeholder="Enter the indicator name"
              />
            </div>

            <div>
              <label htmlFor="indicator-description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="indicator-description"
                className="w-full p-3 border border-gray-300 rounded-md"
                placeholder="Describe the indicator"
              ></textarea>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IndicatorManagement;
