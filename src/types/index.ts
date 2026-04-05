export interface DashboardHabit {
  _id: string;
  title: string;
  themeColor: string;
  icon: string;
  targetDays: number[];
  subtasks: { _id?: string; title: string; duration: number }[];
  streak: number;
  archivedAt?: string;
  logs: Date[];
}
