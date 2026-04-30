'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { api } from '@/features/activities/activity-helpers';

export function ChatBox({
  title = 'AI 导学',
  activityId,
  siteId,
  phase
}: {
  title?: string;
  activityId: string;
  siteId?: string;
  phase: 'learn' | 'research' | 'visit';
}) {
  const [message, setMessage] = useState('');
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(false);

  const ask = async () => {
    if (!message.trim()) return;
    setLoading(true);
    try {
      const data = await api<{ reply: string }>('/api/ai/chat', {
        method: 'POST',
        body: JSON.stringify({ activity_id: activityId, site_id: siteId ?? null, phase, message })
      });
      setReply(data.reply);
    } catch {
      setReply('可以先从一个具体证据开始：你看到了什么现象？它可能说明什么原因？这个原因和黄石矿冶历史、工程安全或生态修复有什么关系？');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="space-y-2">
      <h3 className="font-semibold">{title}</h3>
      <textarea
        className="w-full rounded border p-2"
        rows={3}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="输入你的问题或观察"
      />
      <div className="flex justify-end">
        <Button onClick={ask} disabled={loading}>
          {loading ? '思考中...' : '发送'}
        </Button>
      </div>
      {reply ? <p className="rounded bg-slate-50 p-2 text-sm">{reply}</p> : null}
    </Card>
  );
}
