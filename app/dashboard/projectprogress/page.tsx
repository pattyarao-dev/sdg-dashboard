import { getProjects } from "@/app/actions/actions";
import Link from "next/link";

export default async function ProjectProgress() {
  const projectsList = await getProjects();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ongoing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'complete':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4">
      <div className="w-full flex justify-center mb-8">
        <h1 className="text-4xl font-bold uppercase text-gray-800">
          Project Progress Dashboard
        </h1>
      </div>

      {projectsList.length === 0 ? (
        <div className="w-full flex justify-center items-center h-64">
          <p className="text-xl text-gray-500">No projects found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projectsList.map((project) => (
            <Link
              key={project.projectId}
              href={`/dashboard/projectprogress/${project.projectId}`}
            >
              <div className="w-full h-[300px] p-6 flex flex-col justify-between bg-gradient-to-br from-green-100/80 to-orange-100/80 rounded-lg hover:shadow-lg transition-all duration-300 hover:scale-105 border border-gray-200">
                {/* Header */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-start justify-between">
                    <h3 className="text-lg font-bold text-gray-800 line-clamp-2">
                      {project.name}
                    </h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(project.status)}`}>
                      {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                    </span>
                  </div>

                  {project.description && (
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {project.description}
                    </p>
                  )}
                </div>

                {/* Project Info */}
                <div className="flex flex-col gap-2 text-xs text-gray-600">
                  <div className="flex justify-between">
                    <span className="font-medium">Start Date:</span>
                    <span>{formatDate(project.startDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">End Date:</span>
                    <span>{formatDate(project.endDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Indicators:</span>
                    <span className="font-semibold text-gray-800">
                      {project.projectIndicators.length}
                    </span>
                  </div>
                </div>

                {/* Footer */}
                <div className="pt-3 border-t border-gray-300/50">
                  <p className="text-xs text-center text-gray-500 font-medium">
                    Click to view detailed progress
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
