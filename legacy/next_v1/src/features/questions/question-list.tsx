'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { api } from '@/features/activities/activity-helpers';

interface Question {
  id: string;
  content: string;
  phase: string;
}

export function QuestionList({ activityId, phase }: { activityId: string; phase: 'learn' | 'research' | 'visit' }) {
  const [content, setContent] = useState('');
  const [list, setList] = useState<Question[]>([]);

  const load = async () => {
    const data = await api<Question[]>(`/api/activities/${activityId}/questions`);
    setList(data.filter((q) => q.phase === phase));
  };

  useEffect(() => {
    load();
  }, []);

  const addQuestion = async () => {
    if (!content.trim()) return;
    await api(`/api/activities/${activityId}/questions`, {
      method: 'POST',
      body: JSON.stringify({ phase, content, category: 'inquiry', source: 'student_manual' })
    });
    setContent('');
    load();
  };

  return (
    <Card className="space-y-2">
      <h3 className="font-semibold">我的问题清单</h3>
      <div className="flex gap-2">
        <input className="flex-1 rounded border p-2" value={content} onChange={(e) => setContent(e.target.value)} placeholder="保存你的问题" />
        <Button onClick={addQuestion}>保存</Button>
      </div>
      <ul className="list-disc space-y-1 pl-5 text-sm">
        {list.map((item) => (
          <li key={item.id}>{item.content}</li>
        ))}
      </ul>
    </Card>
  );
}
