"use client";
import { useState } from "react";
import { HiDotsHorizontal } from "react-icons/hi";
import { updateProjectStatus } from "@/app/actions/actions_projectmanagement";
import { useRouter } from "next/navigation";

export default function ProjectStatusManager({ project }) {
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const router = useRouter();

  const openStatusModal = () => {
    setShowStatusModal(true);
  };

  const closeStatusModal = () => {
    setShowStatusModal(false);
  };

  const changeStatus = async (newStatus) => {
    if (isUpdating) return;

    setIsUpdating(true);
    try {
      await updateProjectStatus(project.projectId, newStatus);
      closeStatusModal();
      router.refresh(); // Refresh the page to show updated data
    } catch (error) {
      console.error("Failed to update project status:", error);
      alert("Failed to update project status. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <>
      <div className="relative">
        <HiDotsHorizontal
          className="text-xl cursor-pointer hover:text-gray-600"
          onClick={openStatusModal}
        />
      </div>

      {/* Status Change Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">
              Change Project Status
            </h3>
            <p className="text-sm text-gray-600 mb-2">
              Project: <span className="font-medium">{project.name}</span>
            </p>
            <p className="text-sm text-gray-600 mb-6">
              Current status:{" "}
              <span className="font-medium">{project.status || "ongoing"}</span>
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => changeStatus("ongoing")}
                disabled={isUpdating}
                className={`px-4 py-2 rounded-lg border-2 transition-colors disabled:opacity-50 ${
                  project.status === "ongoing" || !project.status
                    ? "border-blue-500 bg-blue-50 text-blue-800"
                    : "border-gray-300 hover:border-blue-300"
                }`}
              >
                {isUpdating ? "Updating..." : "Mark as Ongoing"}
              </button>
              <button
                onClick={() => changeStatus("complete")}
                disabled={isUpdating}
                className={`px-4 py-2 rounded-lg border-2 transition-colors disabled:opacity-50 ${
                  project.status === "complete"
                    ? "border-green-500 bg-green-50 text-green-800"
                    : "border-gray-300 hover:border-green-300"
                }`}
              >
                {isUpdating ? "Updating..." : "Mark as Complete"}
              </button>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={closeStatusModal}
                disabled={isUpdating}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
