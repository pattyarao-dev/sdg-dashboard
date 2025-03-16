export interface IProject {
  project_id: number;
  name: string;
  description: string | null;
  project_status: string;
  start_date: Date | null;
  end_date: Date | null;
}
