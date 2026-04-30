import { PageTitle } from '@/components/layout/page-title';
import { BackLink } from '@/components/ui/back-link';
import { ChatBox } from '@/features/ai/chat-box';
import { QuestionList } from '@/features/questions/question-list';
import { getSessionProfile } from '@/lib/auth/session';

export default async function LearnPage({ params }: { params: { id: string } }) {
  await getSessionProfile('student');
  return (
    <div className="space-y-3">
      <BackLink href={`/student/activities/${params.id}`} label="返回活动" />
      <PageTitle title="学板块：课前导学" desc="先提问，再保存问题清单" />
      <ChatBox activityId={params.id} phase="learn" />
      <QuestionList activityId={params.id} phase="learn" />
    </div>
  );
}
