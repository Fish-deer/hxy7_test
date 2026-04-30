import { redirect } from 'next/navigation';

export default async function TeacherNewActivityPage() {
  redirect('/teacher/dashboard');
}
