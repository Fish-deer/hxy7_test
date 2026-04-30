export type UserRole = 'admin' | 'teacher' | 'student';

export interface Profile {
  id: string;
  name: string;
  role: UserRole;
  school_id: string | null;
  class_id: string | null;
  student_no: string | null;
}

export interface Activity {
  id: string;
  title: string;
  description: string | null;
  theme: string | null;
  target_grade: string | null;
  status: 'draft' | 'published' | 'finished';
  start_date: string | null;
  end_date: string | null;
  teacher_id: string;
}
