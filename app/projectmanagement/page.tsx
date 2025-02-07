import { getProjects } from "../actions/actions";

export default async function ProjectManagement() {
  const projectsList = await getProjects();
  return (
    <main>
      <div>
        <h1>Manage your projects here</h1>
      </div>
      <div>
        {projectsList.map((project, index) => (
          <div key={index}>
            <p>{project.name}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
