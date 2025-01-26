import { addIndicator } from "../actions/actions";
import { getProjects } from "../actions/actions";
// import ProjectSelector from "@/components/ProjectSelector";

export default async function AddIndicator() {
  const projectsList = await getProjects(); // Fetch projects

  return (
    <div>
      Create an indicator here
      <form
        action={addIndicator}
        className="w-2/3 p-3 flex flex-col gap-2 bg-neutral-200"
      >
        <label>Indicator Name</label>
        <input type="text" name="name" placeholder="Indicator Name" />
        <label>Indicator Description</label>
        <input
          type="textarea"
          name="description"
          placeholder="Indicator Description"
        />
        <label>Projects</label>
        <select name="projects" multiple>
          {projectsList.map((project) => (
            <option key={project.project_id} value={project.project_id}>
              {project.name}
            </option>
          ))}
        </select>
        <button type="submit">Add Indicator</button>
      </form>
    </div>
  );
}
