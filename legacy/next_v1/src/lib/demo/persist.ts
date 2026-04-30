import fs from 'fs';
import path from 'path';
import { classWall, demoCases, demoClasses, demoMediaAssets, demoNotifications, demoProfiles, demoRoutes, demoSites, demoState, demoTasks } from '@/lib/demo/store';

type RuntimeStore = {
  users: any[];
  classes: any[];
  cases: any[];
  routes: any[];
  sites: any[];
  mediaAssets: any[];
  tasks: any[];
  evidences: any[];
  progresses: any[];
  portfolios: any[];
  notifications: any[];
  highlights: any[];
  topics: any[];
  currentCaseId: string;
};

const runtimePath = path.join(process.cwd(), '.demo-runtime.json');
const isVercelRuntime = Boolean(process.env.VERCEL);

declare global {
  // eslint-disable-next-line no-var
  var __HXY_DEMO_RUNTIME__: RuntimeStore | undefined;
}

function withDefaults<T extends Record<string, any>>(item: T) {
  return item;
}

function initialRuntime(): RuntimeStore {
  const users = [
    { ...demoProfiles.student, account: 'student', email: 'student@demo.local', password: '123456' },
    { ...demoProfiles.teacher, account: 'teacher', email: 'teacher@demo.local', password: '123456' },
    { ...demoProfiles.admin, account: 'admin', email: 'admin@demo.local', password: '123456' }
  ];
  return {
    users,
    classes: structuredClone(demoClasses),
    cases: structuredClone(demoCases),
    routes: structuredClone(demoRoutes),
    sites: structuredClone(demoSites),
    mediaAssets: structuredClone(demoMediaAssets),
    tasks: structuredClone(demoTasks).map((task: any) => ({ ...task, class_ids: task.class_ids ?? ['class-7a'], status: task.status ?? 'published', due_at: task.due_at ?? '' })),
    evidences: structuredClone(demoState.evidences),
    progresses: structuredClone(demoState.progresses),
    portfolios: structuredClone(demoState.portfolios).map((portfolio: any) => ({ class_id: 'class-7a', ...portfolio })),
    notifications: structuredClone(demoNotifications),
    highlights: classWall.highlights.map((item, index) => ({
      ...item,
      student_id: 'demo-student-1',
      class_id: 'class-7a',
      site_id: index === 0 ? 'site-2' : 'site-4',
      image_url: index === 0 ? demoMediaAssets.find((asset: any) => asset.id === 'm7')?.url : demoMediaAssets.find((asset: any) => asset.id === 'm11')?.url,
      content: index === 0 ? '我用分层细节图说明台阶式边坡如何提升安全和运输效率。' : '我整理了工人故事里的协作、坚守和创新关键词。',
      created_at: new Date().toISOString()
    })),
    topics: [
      { id: 'topic-1', class_id: 'class-7a', question: '露天采矿为何常用台阶式开采？', answer: '台阶式开采能让边坡更稳定，也方便矿车分层运输。观察矿坑时可以把平台、边坡和运输路线作为证据来说明。' },
      { id: 'topic-2', class_id: 'class-7a', question: '工业遗产保护与开发如何平衡？', answer: '可以保留代表性设备和故事，同时通过生态修复、导览课程和公共空间更新让遗产继续服务学习和城市生活。' }
    ],
    currentCaseId: demoCases[0].id
  };
}

export function readRuntime(): RuntimeStore {
  if (isVercelRuntime) {
    globalThis.__HXY_DEMO_RUNTIME__ ??= initialRuntime();
    return globalThis.__HXY_DEMO_RUNTIME__;
  }

  try {
    if (fs.existsSync(runtimePath)) {
      const runtime = { ...initialRuntime(), ...JSON.parse(fs.readFileSync(runtimePath, 'utf8')) };
      runtime.users = runtime.users.map((user: any) => {
        const account = user.id === 'demo-admin-1' ? 'admin' : (user.account ?? user.email);
        const assignedClassIds = runtime.classes.filter((item: any) => item.teacher_id === user.id).map((item: any) => item.id);
        const classIds = user.role === 'teacher' ? Array.from(new Set([...(user.class_ids ?? []), ...assignedClassIds, user.class_id].filter(Boolean))) : [];
        return { ...user, account, class_ids: classIds };
      });
      runtime.portfolios = runtime.portfolios.map((portfolio: any) => {
        const user = runtime.users.find((item: any) => item.id === portfolio.student_id);
        return { ...portfolio, class_id: portfolio.class_id ?? user?.class_id ?? 'class-7a' };
      });
      runtime.evidences = runtime.evidences.map((evidence: any) => {
        const user = runtime.users.find((item: any) => item.id === evidence.student_id);
        return { review_status: 'pending', ...evidence, class_id: evidence.class_id ?? user?.class_id ?? 'class-7a' };
      });
      return runtime;
    }
  } catch {
    // Fall back to seeded demo data if the runtime file is ever corrupted.
  }
  const seeded = initialRuntime();
  writeRuntime(seeded);
  return seeded;
}

export function writeRuntime(runtime: RuntimeStore) {
  if (isVercelRuntime) {
    globalThis.__HXY_DEMO_RUNTIME__ = runtime;
    return;
  }

  fs.writeFileSync(runtimePath, JSON.stringify(runtime, null, 2), 'utf8');
}

export function getRuntimeClasses() {
  return readRuntime().classes;
}

export function createRuntimeClass(payload: any) {
  const runtime = readRuntime();
  const row = { id: `class-${Date.now()}`, created_at: new Date().toISOString(), ...payload };
  runtime.classes.unshift(row);
  writeRuntime(runtime);
  return row;
}

export function updateRuntimeClass(classId: string, patch: any) {
  const runtime = readRuntime();
  const idx = runtime.classes.findIndex((item) => item.id === classId);
  if (idx < 0) return null;
  runtime.classes[idx] = { ...runtime.classes[idx], ...patch };
  writeRuntime(runtime);
  return runtime.classes[idx];
}

export function deleteRuntimeClass(classId: string) {
  const runtime = readRuntime();
  const before = runtime.classes.length;
  runtime.classes = runtime.classes.filter((item) => item.id !== classId);
  writeRuntime(runtime);
  return runtime.classes.length < before;
}

export function getRuntimeUsers() {
  const runtime = readRuntime();
  return runtime.users.map((user) => ({
    ...user,
    account: user.account ?? user.email,
    classes: user.role === 'teacher'
      ? runtime.classes.filter((item) => (user.class_ids ?? []).includes(item.id))
      : runtime.classes.find((item) => item.id === user.class_id) ?? null,
    schools: null
  }));
}

export function getManagedClassIds(profile?: any) {
  if (!profile) return [];
  const runtime = readRuntime();
  if (profile.role === 'admin') return runtime.classes.map((item) => item.id);
  if (profile.role === 'teacher') {
    const user = runtime.users.find((item) => item.id === profile.id);
    return Array.from(new Set([...(user?.class_ids ?? []), profile.class_id].filter(Boolean)));
  }
  return [profile.class_id].filter(Boolean);
}

export function getRuntimeClassesForProfile(profile?: any) {
  const runtime = readRuntime();
  if (!profile || profile.role === 'admin') return runtime.classes;
  const classIds = getManagedClassIds(profile);
  return runtime.classes.filter((item) => classIds.includes(item.id));
}

export function findRuntimeUserByEmail(email: string) {
  return readRuntime().users.find((user) => String(user.email).toLowerCase() === email.toLowerCase());
}

export function findRuntimeUserByAccount(account: string) {
  const normalized = account.trim().toLowerCase();
  return readRuntime().users.find((user) => {
    const userAccount = String(user.account ?? user.email ?? '').toLowerCase();
    const legacyEmail = String(user.email ?? '').toLowerCase();
    return userAccount === normalized || legacyEmail === normalized;
  });
}

export function getRuntimeUserById(userId?: string | null, role?: string) {
  const runtime = readRuntime();
  return runtime.users.find((user) => user.id === userId) ?? runtime.users.find((user) => user.role === role) ?? runtime.users[0];
}

export function createRuntimeUser(body: any) {
  const runtime = readRuntime();
  const role = body.role === 'teacher' ? 'teacher' : 'student';
  const account = String(body.account ?? body.email ?? '').trim();
  const classIds = role === 'teacher' ? (Array.isArray(body.class_ids) ? body.class_ids.filter(Boolean) : [body.class_id].filter(Boolean)) : [];
  const item = withDefaults({
    id: `${role}-${Date.now()}`,
    name: String(body.name ?? '').trim(),
    account,
    email: account.includes('@') ? account : `${account || role}-${Date.now()}@demo.local`,
    password: String(body.password ?? '123456'),
    role,
    school_id: 'demo-school-1',
    class_id: role === 'teacher' ? (classIds[0] ?? null) : (body.class_id || null),
    class_ids: classIds,
    student_no: body.student_no || null
  });
  runtime.users.unshift(item);
  if (role === 'teacher') {
    runtime.classes = runtime.classes.map((row) => classIds.includes(row.id) ? { ...row, teacher_id: item.id } : row);
  }
  writeRuntime(runtime);
  return item;
}

export function updateRuntimeUser(userId: string, body: any) {
  const runtime = readRuntime();
  const idx = runtime.users.findIndex((user) => user.id === userId);
  if (idx < 0) return null;
  const patch = { ...body };
  if (patch.account) patch.email = String(patch.account).includes('@') ? patch.account : `${patch.account}@demo.local`;
  if (patch.role === 'teacher' || runtime.users[idx].role === 'teacher') {
    const classIds = Array.isArray(patch.class_ids) ? patch.class_ids.filter(Boolean) : [patch.class_id].filter(Boolean);
    patch.class_ids = classIds;
    patch.class_id = classIds[0] ?? null;
    runtime.classes = runtime.classes.map((row) => row.teacher_id === userId && !classIds.includes(row.id) ? { ...row, teacher_id: null } : row);
    runtime.classes = runtime.classes.map((row) => classIds.includes(row.id) ? { ...row, teacher_id: userId } : row);
  }
  runtime.users[idx] = { ...runtime.users[idx], ...patch };
  writeRuntime(runtime);
  return runtime.users[idx];
}

export function deleteRuntimeUser(userId: string) {
  const runtime = readRuntime();
  const idx = runtime.users.findIndex((user) => user.id === userId);
  if (idx < 0) return false;
  runtime.users.splice(idx, 1);
  writeRuntime(runtime);
  return true;
}

export function getRuntimeCases(profile?: any) {
  const runtime = readRuntime();
  if (!profile || profile.role === 'admin') return runtime.cases;
  if (profile.role === 'teacher') {
    const managedClassIds = getManagedClassIds(profile);
    return runtime.cases.filter((item) => {
      const classIds = item.published_class_ids ?? [];
      return item.teacher_id === profile.id || classIds.some((id: string) => managedClassIds.includes(id)) || item.id === runtime.currentCaseId;
    });
  }
  return runtime.cases.filter((item) => (item.published_class_ids ?? []).includes(profile.class_id));
}

export function createRuntimeCase(body: any, teacherId: string) {
  const runtime = readRuntime();
  const id = `case-${Date.now()}`;
  const item = {
    id,
    title: body.title || '未命名案例',
    cover_image: body.cover_image || 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1600&q=80',
    summary: body.summary || '新的课堂云游案例',
    status: 'draft',
    route_id: `route-${Date.now()}`,
    published_class_ids: body.class_ids ?? [],
    version: 1,
    teacher_id: teacherId,
    from_template_case_id: body.from_template_case_id || null
  };
  runtime.cases.unshift(item);
  runtime.currentCaseId = id;
  writeRuntime(runtime);
  return item;
}

export function copyRuntimeCase(caseId: string) {
  const runtime = readRuntime();
  const source = runtime.cases.find((item) => item.id === caseId);
  if (!source) return null;
  const cloned = { ...source, id: `case-${Date.now()}`, title: `${source.title}（副本）`, status: 'draft', version: 1, from_template_case_id: source.id };
  runtime.cases.unshift(cloned);
  writeRuntime(runtime);
  return cloned;
}

export function updateRuntimeCase(caseId: string, body: any) {
  const runtime = readRuntime();
  const idx = runtime.cases.findIndex((item) => item.id === caseId);
  if (idx < 0) return null;
  runtime.cases[idx] = { ...runtime.cases[idx], ...body };
  if (body.set_current) runtime.currentCaseId = caseId;
  writeRuntime(runtime);
  return runtime.cases[idx];
}

export function deleteRuntimeCase(caseId: string) {
  const runtime = readRuntime();
  const idx = runtime.cases.findIndex((item) => item.id === caseId);
  if (idx < 0) return false;
  runtime.cases.splice(idx, 1);
  runtime.tasks = runtime.tasks.filter((task) => task.case_id !== caseId);
  if (runtime.currentCaseId === caseId) runtime.currentCaseId = runtime.cases[0]?.id ?? '';
  writeRuntime(runtime);
  return true;
}

export function getCurrentRuntimeCase() {
  const runtime = readRuntime();
  return runtime.cases.find((item) => item.id === runtime.currentCaseId) ?? runtime.cases[0];
}

export function getDemoTasks(profile?: any) {
  const runtime = readRuntime();
  if (!profile || profile.role === 'admin') return runtime.tasks;
  if (profile.role === 'teacher') {
    const managedClassIds = getManagedClassIds(profile);
    return runtime.tasks.filter((task) => !task.class_ids?.length || task.class_ids.some((id: string) => managedClassIds.includes(id)));
  }
  return runtime.tasks.filter((task) => task.status === 'published' && (task.class_ids ?? []).includes(profile.class_id));
}

export function createDemoTask(body: any) {
  const runtime = readRuntime();
  const item = { id: `task-${Date.now()}`, activity_id: 'demo-activity-1', required_assets: [], key_clue_assets: [], status: 'published', class_ids: [], due_at: '', ...body };
  runtime.tasks.push(item);
  writeRuntime(runtime);
  return item;
}

export function updateDemoTask(taskId: string, body: any) {
  const runtime = readRuntime();
  const idx = runtime.tasks.findIndex((task) => task.id === taskId);
  if (idx < 0) return null;
  runtime.tasks[idx] = { ...runtime.tasks[idx], ...body };
  writeRuntime(runtime);
  return runtime.tasks[idx];
}

export function deleteDemoTask(taskId: string) {
  const runtime = readRuntime();
  const idx = runtime.tasks.findIndex((task) => task.id === taskId);
  if (idx < 0) return false;
  runtime.tasks.splice(idx, 1);
  writeRuntime(runtime);
  return true;
}

export function createDemoEvidence(body: any, studentId: string) {
  const runtime = readRuntime();
  const student = runtime.users.find((user) => user.id === studentId);
  const relatedTask = runtime.tasks.find((task) => task.site_id === body.site_id && (task.class_ids ?? []).includes(student?.class_id));
  const item = { id: `e-${Date.now()}`, review_status: 'draft', in_portfolio: false, task_id: body.task_id ?? relatedTask?.id, ...body, student_id: studentId, class_id: student?.class_id ?? body.class_id, created_at: new Date().toISOString() };
  runtime.evidences.unshift(item);
  const progress = runtime.progresses.find((p) => p.activity_id === body.activity_id && p.site_id === body.site_id && p.student_id === studentId);
  if (!progress) {
    runtime.progresses.unshift({ id: `p-${Date.now()}`, activity_id: body.activity_id, site_id: body.site_id, student_id: studentId, status: 'completed', note: '提交证据后自动完成', completed_at: new Date().toISOString() });
  }
  if (!item.in_portfolio) {
    writeRuntime(runtime);
    return item;
  }
  const existingProgress = runtime.progresses.find((p) => p.activity_id === body.activity_id && p.site_id === body.site_id && p.student_id === studentId);
  if (!existingProgress) {
    runtime.progresses.unshift({ id: `p-${Date.now()}`, activity_id: body.activity_id, site_id: body.site_id, student_id: studentId, status: 'completed', note: '提交证据后自动完成', completed_at: new Date().toISOString() });
  }

  const portfolioIndex = runtime.portfolios.findIndex((portfolio) => portfolio.activity_id === body.activity_id && portfolio.student_id === studentId);
  const submittedPortfolio = { summary: '学生已提交新证据，等待教师批改。', teacher_score: null, teacher_comment: null, status: 'submitted', updated_at: new Date().toISOString() };
  if (portfolioIndex >= 0) runtime.portfolios[portfolioIndex] = { ...runtime.portfolios[portfolioIndex], ...submittedPortfolio };
  else runtime.portfolios.unshift({ id: `pf-${Date.now()}`, activity_id: body.activity_id, student_id: studentId, class_id: student?.class_id, ...submittedPortfolio });
  writeRuntime(runtime);
  return item;
}

export function getDemoEvidences(activityId: string, studentId?: string, classId?: string) {
  return readRuntime().evidences.filter((item) => item.activity_id === activityId && (!studentId || item.student_id === studentId) && (!classId || item.class_id === classId));
}

export function updateDemoEvidence(evidenceId: string, studentId: string, body: any) {
  const runtime = readRuntime();
  const idx = runtime.evidences.findIndex((item) => item.id === evidenceId && item.student_id === studentId);
  if (idx < 0) return null;
  const next = { ...runtime.evidences[idx], ...body };
  if (body.in_portfolio === true) {
    next.review_status = next.review_status === 'reviewed' ? 'reviewed' : 'submitted';
    const portfolioIndex = runtime.portfolios.findIndex((portfolio) => portfolio.activity_id === next.activity_id && portfolio.student_id === studentId);
    const portfolioPatch = { summary: '学生已加入新的正式学习档案，等待教师逐条评价。', teacher_score: null, teacher_comment: null, status: 'submitted', updated_at: new Date().toISOString() };
    if (portfolioIndex >= 0) runtime.portfolios[portfolioIndex] = { ...runtime.portfolios[portfolioIndex], ...portfolioPatch };
    else runtime.portfolios.unshift({ id: `pf-${Date.now()}`, activity_id: next.activity_id, student_id: studentId, class_id: next.class_id, ...portfolioPatch });
  }
  runtime.evidences[idx] = next;
  writeRuntime(runtime);
  return runtime.evidences[idx];
}

export function reviewDemoEvidence(evidenceId: string, teacherProfile: any, body: any) {
  const runtime = readRuntime();
  const managedClassIds = getManagedClassIds(teacherProfile);
  const idx = runtime.evidences.findIndex((item) => item.id === evidenceId && item.in_portfolio && managedClassIds.includes(item.class_id));
  if (idx < 0) return null;
  runtime.evidences[idx] = {
    ...runtime.evidences[idx],
    teacher_score: body.teacher_score,
    teacher_comment: body.teacher_comment,
    review_status: 'reviewed',
    reviewed_at: new Date().toISOString()
  };
  const evidence = runtime.evidences[idx];
  const portfolioIndex = runtime.portfolios.findIndex((portfolio) => portfolio.activity_id === evidence.activity_id && portfolio.student_id === evidence.student_id);
  if (portfolioIndex >= 0) {
    const allFormal = runtime.evidences.filter((item) => item.activity_id === evidence.activity_id && item.student_id === evidence.student_id && item.in_portfolio);
    const allReviewed = allFormal.length > 0 && allFormal.every((item) => item.review_status === 'reviewed');
    runtime.portfolios[portfolioIndex] = { ...runtime.portfolios[portfolioIndex], status: allReviewed ? 'reviewed' : 'submitted', updated_at: new Date().toISOString() };
  }
  runtime.notifications.unshift({ id: `n-${Date.now()}`, user_id: evidence.student_id, type: 'review', title: '教师已批改一条学习档案', content: `评分 ${body.teacher_score ?? '--'}，请查看对应档案评语。`, read: false, created_at: new Date().toISOString() });
  writeRuntime(runtime);
  return runtime.evidences[idx];
}

export function deleteDemoEvidence(evidenceId: string, studentId: string) {
  const runtime = readRuntime();
  const before = runtime.evidences.length;
  runtime.evidences = runtime.evidences.filter((item) => !(item.id === evidenceId && item.student_id === studentId));
  writeRuntime(runtime);
  return runtime.evidences.length < before;
}

export function getDemoProgresses(activityId?: string, studentId?: string) {
  return readRuntime().progresses.filter((item) => (!activityId || item.activity_id === activityId) && (!studentId || item.student_id === studentId));
}

export function completeRuntimeSite(activityId: string, siteId: string, studentId: string, note?: string) {
  const runtime = readRuntime();
  const item = {
    id: `p-${Date.now()}`,
    activity_id: activityId,
    site_id: siteId,
    student_id: studentId,
    status: 'completed',
    note,
    completed_at: new Date().toISOString()
  };
  runtime.progresses = runtime.progresses.filter((x) => !(x.activity_id === activityId && x.site_id === siteId && x.student_id === studentId));
  runtime.progresses.unshift(item);
  writeRuntime(runtime);
  return item;
}

export function getDemoPortfolios(activityId?: string, studentId?: string, classId?: string) {
  return readRuntime().portfolios.filter((item) => (!activityId || item.activity_id === activityId) && (!studentId || item.student_id === studentId) && (!classId || item.class_id === classId));
}

export function getDemoNotifications(studentId: string) {
  return readRuntime().notifications.filter((item) => item.user_id === studentId);
}

export function reviewDemoPortfolio(portfolioId: string, body: any) {
  const runtime = readRuntime();
  const idx = runtime.portfolios.findIndex((portfolio) => portfolio.id === portfolioId);
  if (idx < 0) return null;
  runtime.portfolios[idx] = { ...runtime.portfolios[idx], ...body, status: 'reviewed', updated_at: new Date().toISOString() };
  runtime.evidences = runtime.evidences.map((evidence) =>
    evidence.student_id === runtime.portfolios[idx].student_id && evidence.activity_id === runtime.portfolios[idx].activity_id
      ? { ...evidence, review_status: evidence.in_portfolio ? 'reviewed' : evidence.review_status, teacher_score: evidence.in_portfolio ? body.teacher_score : evidence.teacher_score, teacher_comment: evidence.in_portfolio ? body.teacher_comment : evidence.teacher_comment }
      : evidence
  );
  runtime.notifications.unshift({ id: `n-${Date.now()}`, user_id: runtime.portfolios[idx].student_id, type: 'review', title: '教师已批改学习档案', content: `评分 ${body.teacher_score ?? '--'}，请查看教师评语。`, read: false, created_at: new Date().toISOString() });
  writeRuntime(runtime);
  return runtime.portfolios[idx];
}

export function setExcellentEvidence(evidenceId: string) {
  const runtime = readRuntime();
  const evidence = runtime.evidences.find((item) => item.id === evidenceId);
  if (!evidence) return null;
  const student = runtime.users.find((user) => user.id === evidence.student_id);
  const asset = runtime.mediaAssets.find((item) => item.id === evidence.resource_asset_id);
  const site = runtime.sites.find((item) => item.id === evidence.site_id);
  const item = {
    id: `w-${Date.now()}`,
    evidence_id: evidence.id,
    student_id: evidence.student_id,
    student: student?.name ?? '学生',
    class_id: evidence.class_id ?? student?.class_id,
    site_id: evidence.site_id,
    title: `${site?.name ?? '点位'}优秀证据`,
    image_url: asset?.type === 'image' ? asset.url : evidence.file_url,
    content: evidence.observation || evidence.text_content || evidence.note || '优秀作品证据',
    likes: 0,
    created_at: new Date().toISOString()
  };
  runtime.highlights.unshift(item);
  writeRuntime(runtime);
  return item;
}

export function getClassWallData(classId?: string | null) {
  const runtime = readRuntime();
  return {
    highlights: runtime.highlights.filter((item) => !classId || item.class_id === classId),
    hotQuestions: runtime.topics.filter((item) => !classId || item.class_id === classId),
    groupProgress: classWall.groupProgress
  };
}

export function getRuntimeMediaAssets() {
  return readRuntime().mediaAssets;
}

export function getRuntimeSites() {
  return readRuntime().sites;
}
