import Link from "next/link";
import { getGoals } from "../actions/actions";

export default async function ProgressForm() {
  const goalsList = await getGoals();
  return (
    <main className="w-full min-h-screen p-10 flex flex-col items-center ">
      <div className="w-full h-full p-10 flex flex-col gap-10">
        <div>
          <h1>HELLO</h1>
        </div>
        <div className="w-full flex flex-col gap-6">
          {goalsList.map((goal, index) => (
            <div key={index}>
              <Link href={`/progressform/${goal.goal_id}`}>{goal.name}</Link>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
