'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { api } from '@/features/activities/activity-helpers';

export function SiteCompletion({ siteId }: { siteId: string }) {
  const [note, setNote] = useState('');
  const [msg, setMsg] = useState('');

  const complete = async () => {
    await api(`/api/sites/${siteId}/complete`, { method: 'POST', body: JSON.stringify({ note }) });
    setMsg('已标记点位完成');
  };

  return (
    <Card className="space-y-2">
      <h3 className="font-semibold">点位完成</h3>
      <input className="w-full rounded border p-2" value={note} onChange={(e) => setNote(e.target.value)} placeholder="完成备注（可选）" />
      <div className="flex justify-end">
        <Button onClick={complete}>标记点位完成</Button>
      </div>
      {msg ? <p className="text-sm text-green-600">{msg}</p> : null}
    </Card>
  );
}
