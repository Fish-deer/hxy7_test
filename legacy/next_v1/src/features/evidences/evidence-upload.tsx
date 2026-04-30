'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/browser';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { api } from '@/features/activities/activity-helpers';

const isDemoMode = !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_FORCE_DEMO_MODE === '1';

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export function EvidenceUpload({ activityId, siteId, onSubmitted }: { activityId: string; siteId: string; onSubmitted?: () => void }) {
  const [note, setNote] = useState('');
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [msg, setMsg] = useState('');

  const chooseFile = async (nextFile: File | null) => {
    setFile(nextFile);
    setPreview(nextFile ? await readFileAsDataUrl(nextFile) : '');
  };

  const upload = async () => {
    let submitted = false;
    if (file) {
      if (isDemoMode) {
        const fileUrl = preview || await readFileAsDataUrl(file);
        await api('/api/evidences', {
          method: 'POST',
          body: JSON.stringify({ activity_id: activityId, site_id: siteId, evidence_type: 'image', file_url: fileUrl, note, in_portfolio: false, review_status: 'draft' })
        });
      } else {
        const supabase = createClient();
        const sign = await api<{ bucket: string; path: string }>('/api/uploads/sign', {
          method: 'POST',
          body: JSON.stringify({ activity_id: activityId, file_name: file.name })
        });
        const { error } = await supabase.storage.from(sign.bucket).upload(sign.path, file, { upsert: true });
        if (error) return setMsg(error.message);
        const publicUrl = supabase.storage.from(sign.bucket).getPublicUrl(sign.path).data.publicUrl;
        await api('/api/evidences', {
          method: 'POST',
          body: JSON.stringify({ activity_id: activityId, site_id: siteId, evidence_type: 'image', file_url: publicUrl, note, in_portfolio: false, review_status: 'draft' })
        });
      }
      submitted = true;
    }

    if (text.trim()) {
      await api('/api/evidences', {
        method: 'POST',
        body: JSON.stringify({ activity_id: activityId, site_id: siteId, evidence_type: 'text', text_content: text, note, in_portfolio: false, review_status: 'draft' })
      });
      submitted = true;
    }

    if (!submitted) return setMsg('请先上传图片或填写文字证据。');
    setMsg('证据已提交到证据背包，点位完成状态会同步刷新。');
    setText('');
    setNote('');
    setFile(null);
    setPreview('');
    onSubmitted?.();
  };

  return (
    <Card className="space-y-3 border-sky-100 bg-gradient-to-br from-sky-50 via-white to-emerald-50">
      <div>
        <p className="text-xs font-medium text-sky-700">过程性记录</p>
        <h3 className="font-semibold">证据背包上传</h3>
        <p className="mt-1 text-xs text-muted">提交后先进入证据背包；需要正式提交时，再在背包中加入学习档案。</p>
      </div>
      <input type="file" accept="image/*" onChange={(e) => chooseFile(e.target.files?.[0] ?? null)} />
      {preview ? <img src={preview} alt="上传图片预览" className="h-40 w-full rounded-xl border object-cover" /> : null}
      <textarea className="w-full rounded border p-2" rows={2} value={text} onChange={(e) => setText(e.target.value)} placeholder="文字证据" />
      <input className="w-full rounded border p-2" value={note} onChange={(e) => setNote(e.target.value)} placeholder="补充说明" />
      <div className="flex justify-end">
        <Button onClick={upload}>提交证据背包</Button>
      </div>
      {msg ? <p className="text-sm text-green-600">{msg}</p> : null}
    </Card>
  );
}
