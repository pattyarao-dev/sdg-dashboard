import ProgressFormComponent from "@/components/ProgressFormComponent";
import { getGoalsInformation } from "@/app/actions/actions";

export default async function ProgressForm() {
  const processedGoals = await getGoalsInformation();

  return (
    <main className="w-full min-h-screen p-10 flex flex-col items-center ">
      <div className="w-full h-full p-10 flex flex-col gap-10">
        <div>
          <h1>Update the progress of your indicators.</h1>
        </div>
        {/* <div className="w-full flex flex-col gap-6">
          {goalNames.map((goal, index) => (
            <div key={index}>
              <p>{goal}</p>
            </div>
          ))}
        </div> */}
        <ProgressFormComponent goals={processedGoals} />
      </div>
    </main>
  );
}
