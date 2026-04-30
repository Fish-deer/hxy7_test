import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { BackLink } from '@/components/ui/back-link';
import { getSessionProfile } from '@/lib/auth/session';
import { getClassWallData } from '@/lib/demo/persist';

export default async function StudentClassWallPage({ searchParams }: { searchParams?: { topic?: string } }) {
  const { profile } = await getSessionProfile('student');
  const wall = getClassWallData(profile.class_id);
  const activeTopic = wall.hotQuestions.find((item: any) => item.id === searchParams?.topic) ?? wall.hotQuestions[0];

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border bg-gradient-to-br from-sky-50 via-white to-emerald-50 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm text-muted">班级共享空间</p>
            <h1 className="mt-1 text-2xl font-bold">班级共学页</h1>
          </div>
          <BackLink href="/student/activities" label="返回学生主页面" />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
        <Card className="space-y-3">
          <h3 className="font-semibold">优秀作品墙</h3>
          <div className="grid gap-3 md:grid-cols-2">
            {wall.highlights.map((h: any) => (
              <div key={h.id} className="overflow-hidden rounded-xl border bg-slate-50">
                {h.image_url ? <img src={h.image_url} alt={h.title} className="h-36 w-full object-cover" /> : null}
                <div className="space-y-1 p-3 text-sm">
                  <p className="font-medium">{h.student}：{h.title}</p>
                  <p className="text-muted">{h.content}</p>
                  <span className="inline-flex rounded-full bg-amber-50 px-2 py-1 text-xs text-amber-700">优秀作品</span>
                </div>
              </div>
            ))}
            {!wall.highlights.length ? <p className="text-sm text-muted">当前班级暂无优秀作品。</p> : null}
          </div>
        </Card>

        <Card className="space-y-3">
          <h3 className="font-semibold">热门话题</h3>
          <div className="space-y-2">
            {wall.hotQuestions.map((q: any, index: number) => (
              <Link key={q.id} href={`/student/class-wall?topic=${q.id}`} className={`block rounded-lg border p-2 text-sm ${q.id === activeTopic?.id ? 'border-primary bg-sky-50 text-primary' : 'bg-white'}`}>
                {index + 1}. {q.question}
              </Link>
            ))}
          </div>
          {activeTopic ? (
            <div className="rounded-xl bg-slate-50 p-3 text-sm">
              <p className="font-medium">{activeTopic.question}</p>
              <p className="mt-2 text-muted">{activeTopic.answer}</p>
            </div>
          ) : null}
        </Card>
      </div>
    </div>
  );
}
