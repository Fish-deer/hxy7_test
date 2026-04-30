import Link from 'next/link';
import { Card } from '@/components/ui/card';

export default function AdminResourcesPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">邀请码 / 密码重置</h1>
        <p className="mt-1 text-sm text-muted">管理端已收口为平台管理后台，不再配置案例、点位或教学任务。</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="space-y-2">
          <h3 className="font-semibold">邀请码生成 / 重置</h3>
          <p className="text-sm text-muted">班级邀请码真实关联班级数据，可在班级管理中生成和重置。</p>
          <Link className="text-sm text-primary" href="/admin/schools-classes">进入班级管理</Link>
        </Card>
        <Card className="space-y-2">
          <h3 className="font-semibold">密码重置</h3>
          <p className="text-sm text-muted">教师和学生账号的密码重置统一放在账号管理中处理。</p>
          <Link className="text-sm text-primary" href="/admin/users">进入账号管理</Link>
        </Card>
      </div>
    </div>
  );
}
