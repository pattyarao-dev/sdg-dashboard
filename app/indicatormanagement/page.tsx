import prisma from "@/utils/prisma";

export default async function IndicatorManagement() {
  const indicatorsList = await prisma.md_indicator.findMany();
  const projectsList = await prisma.td_project.findMany();
  return (
    <div className="w-full min-h-screen p-10 flex  flex-col items-start justify-between">
      <h1 className="text-2xl">Indicators</h1>
      {indicatorsList.map((indicator, index) => (
        <div key={index} className="w-full flex gap-10">
          <p className="w-[500px]">{indicator.name}</p>
          <p>{indicator.description}</p>
        </div>
      ))}

      <h1 className="text-2xl">Projects</h1>
      {projectsList.map((project, index) => (
        <div key={index}>
          <p>{project.name}</p>
        </div>
      ))}

      <button>
        <a href="/addindicator">Add new indicator</a>
      </button>
    </div>
  );
}
