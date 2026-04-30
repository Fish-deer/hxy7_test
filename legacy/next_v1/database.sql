-- 黄小游 MVP 数据库初始化 SQL（Supabase/Postgres）
create extension if not exists "pgcrypto";

create table if not exists schools (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists classes (
  id uuid primary key default gen_random_uuid(),
  school_id uuid references schools(id) on delete cascade,
  name text not null,
  grade text,
  head_teacher_id uuid,
  created_at timestamptz not null default now()
);
alter table classes add column if not exists invite_code text;
alter table classes add column if not exists teacher_id uuid references profiles(id);
create unique index if not exists idx_classes_invite_code on classes(invite_code) where invite_code is not null;

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('admin','teacher','student')),
  name text not null,
  school_id uuid references schools(id),
  class_id uuid references classes(id),
  student_no text,
  created_at timestamptz not null default now()
);
alter table profiles add column if not exists temp_password text;
alter table profiles add column if not exists password_updated_at timestamptz;

create table if not exists activities (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  theme text,
  target_grade text,
  status text not null default 'draft' check(status in ('draft','published','finished')),
  start_date date,
  end_date date,
  teacher_id uuid not null references profiles(id),
  created_at timestamptz not null default now()
);
create index if not exists idx_activities_teacher on activities(teacher_id);

create table if not exists activity_classes (
  id uuid primary key default gen_random_uuid(),
  activity_id uuid not null references activities(id) on delete cascade,
  class_id uuid not null references classes(id) on delete cascade,
  unique(activity_id, class_id)
);

create table if not exists activity_sites (
  id uuid primary key default gen_random_uuid(),
  activity_id uuid not null references activities(id) on delete cascade,
  name text not null,
  order_index int not null default 1,
  intro text,
  knowledge_text text,
  key_facts text,
  problem_chain jsonb not null default '[]'::jsonb,
  evidence_checklist jsonb not null default '[]'::jsonb,
  qr_code_value text,
  created_at timestamptz not null default now()
);

create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  activity_id uuid not null references activities(id) on delete cascade,
  site_id uuid references activity_sites(id) on delete set null,
  phase text not null check(phase in ('learn','research','visit')),
  title text not null,
  description text,
  task_type text not null default 'text' check(task_type in ('text','upload','mixed')),
  sort_order int not null default 1,
  required boolean not null default true,
  created_at timestamptz not null default now()
);
alter table tasks add column if not exists class_ids uuid[] default '{}';
alter table tasks add column if not exists status text not null default 'published';
alter table tasks add column if not exists due_at date;

create table if not exists activity_members (
  id uuid primary key default gen_random_uuid(),
  activity_id uuid not null references activities(id) on delete cascade,
  student_id uuid not null references profiles(id) on delete cascade,
  joined_at timestamptz not null default now(),
  unique(activity_id, student_id)
);

create table if not exists question_items (
  id uuid primary key default gen_random_uuid(),
  activity_id uuid not null references activities(id) on delete cascade,
  student_id uuid not null references profiles(id) on delete cascade,
  site_id uuid references activity_sites(id) on delete set null,
  phase text not null check(phase in ('learn','research','visit')),
  content text not null,
  category text not null default 'inquiry',
  source text not null default 'student_manual',
  created_at timestamptz not null default now()
);

create table if not exists evidences (
  id uuid primary key default gen_random_uuid(),
  activity_id uuid not null references activities(id) on delete cascade,
  student_id uuid not null references profiles(id) on delete cascade,
  site_id uuid references activity_sites(id) on delete set null,
  task_id uuid references tasks(id) on delete set null,
  evidence_type text not null check(evidence_type in ('image','audio','text')),
  file_url text,
  text_content text,
  note text,
  created_at timestamptz not null default now()
);

create table if not exists ai_conversations (
  id uuid primary key default gen_random_uuid(),
  activity_id uuid not null references activities(id) on delete cascade,
  student_id uuid not null references profiles(id) on delete cascade,
  site_id uuid references activity_sites(id) on delete set null,
  phase text not null check(phase in ('learn','research','visit')),
  user_message text not null,
  ai_message text not null,
  created_at timestamptz not null default now()
);

create table if not exists portfolios (
  id uuid primary key default gen_random_uuid(),
  activity_id uuid not null references activities(id) on delete cascade,
  student_id uuid not null references profiles(id) on delete cascade,
  summary text,
  teacher_comment text,
  teacher_score numeric,
  status text not null default 'draft' check(status in ('draft','reviewed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(activity_id, student_id)
);

create table if not exists portfolio_items (
  id uuid primary key default gen_random_uuid(),
  portfolio_id uuid not null references portfolios(id) on delete cascade,
  item_type text not null check(item_type in ('question','task','evidence','conclusion')),
  content jsonb not null,
  sort_order int not null default 1
);



create table if not exists site_progresses (
  id uuid primary key default gen_random_uuid(),
  activity_id uuid not null references activities(id) on delete cascade,
  site_id uuid not null references activity_sites(id) on delete cascade,
  student_id uuid not null references profiles(id) on delete cascade,
  status text not null default 'completed' check(status in ('completed')),
  note text,
  completed_at timestamptz not null default now(),
  unique(activity_id, site_id, student_id)
);

create table if not exists resource_templates (
  id uuid primary key default gen_random_uuid(),
  type text not null check(type in ('question_chain','task','site')),
  title text not null,
  content jsonb not null,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

alter table schools enable row level security;
alter table classes enable row level security;
alter table profiles enable row level security;
alter table activities enable row level security;
alter table activity_classes enable row level security;
alter table activity_sites enable row level security;
alter table tasks enable row level security;
alter table activity_members enable row level security;
alter table question_items enable row level security;
alter table evidences enable row level security;
alter table ai_conversations enable row level security;
alter table portfolios enable row level security;
alter table portfolio_items enable row level security;
alter table site_progresses enable row level security;
alter table resource_templates enable row level security;

create or replace function current_role() returns text language sql stable as $$
  select role from profiles where id = auth.uid();
$$;

create policy "admin all" on schools for all using (current_role()='admin') with check (current_role()='admin');
create policy "admin all classes" on classes for all using (current_role()='admin') with check (current_role()='admin');
create policy "profile self read" on profiles for select using (id=auth.uid() or current_role()='admin');

create policy "activity teacher read own" on activities for select using (
  current_role()='admin' or teacher_id=auth.uid() or
  exists(select 1 from activity_members m where m.activity_id=activities.id and m.student_id=auth.uid())
);
create policy "activity teacher write" on activities for all using (teacher_id=auth.uid() or current_role()='admin') with check (teacher_id=auth.uid() or current_role()='admin');

create policy "sites read linked" on activity_sites for select using (
  current_role()='admin' or exists(select 1 from activities a where a.id=activity_sites.activity_id and a.teacher_id=auth.uid()) or
  exists(select 1 from activity_members m where m.activity_id=activity_sites.activity_id and m.student_id=auth.uid())
);
create policy "sites teacher write" on activity_sites for all using (
  current_role()='admin' or exists(select 1 from activities a where a.id=activity_sites.activity_id and a.teacher_id=auth.uid())
) with check (
  current_role()='admin' or exists(select 1 from activities a where a.id=activity_sites.activity_id and a.teacher_id=auth.uid())
);

create policy "tasks linked read" on tasks for select using (
  current_role()='admin' or exists(select 1 from activities a where a.id=tasks.activity_id and a.teacher_id=auth.uid()) or
  exists(select 1 from activity_members m where m.activity_id=tasks.activity_id and m.student_id=auth.uid())
);
create policy "tasks teacher write" on tasks for all using (
  current_role()='admin' or exists(select 1 from activities a where a.id=tasks.activity_id and a.teacher_id=auth.uid())
) with check (
  current_role()='admin' or exists(select 1 from activities a where a.id=tasks.activity_id and a.teacher_id=auth.uid())
);

create policy "question owner" on question_items for all using (
  current_role()='admin' or student_id=auth.uid() or
  exists(select 1 from activities a where a.id=question_items.activity_id and a.teacher_id=auth.uid())
) with check (current_role()='admin' or student_id=auth.uid());

create policy "evidence owner/teacher" on evidences for all using (
  current_role()='admin' or student_id=auth.uid() or
  exists(select 1 from activities a where a.id=evidences.activity_id and a.teacher_id=auth.uid())
) with check (current_role()='admin' or student_id=auth.uid());

create policy "ai owner" on ai_conversations for all using (current_role()='admin' or student_id=auth.uid()) with check (current_role()='admin' or student_id=auth.uid());

create policy "portfolio owner teacher" on portfolios for select using (
  current_role()='admin' or student_id=auth.uid() or exists(select 1 from activities a where a.id=portfolios.activity_id and a.teacher_id=auth.uid())
);
create policy "portfolio student insert" on portfolios for insert with check (student_id=auth.uid() or current_role()='admin');
create policy "portfolio update self/teacher" on portfolios for update using (
  current_role()='admin' or student_id=auth.uid() or exists(select 1 from activities a where a.id=portfolios.activity_id and a.teacher_id=auth.uid())
);
create policy "portfolio items linked" on portfolio_items for all using (
  current_role()='admin' or exists(select 1 from portfolios p where p.id=portfolio_items.portfolio_id and p.student_id=auth.uid()) or
  exists(select 1 from portfolios p join activities a on a.id=p.activity_id where p.id=portfolio_items.portfolio_id and a.teacher_id=auth.uid())
) with check (
  current_role()='admin' or exists(select 1 from portfolios p where p.id=portfolio_items.portfolio_id and p.student_id=auth.uid())
);

create policy "activity_members read linked" on activity_members for select using (
  current_role()='admin' or student_id=auth.uid() or exists(select 1 from activities a where a.id=activity_members.activity_id and a.teacher_id=auth.uid())
);
create policy "activity_members teacher insert" on activity_members for insert with check (
  current_role()='admin' or exists(select 1 from activities a where a.id=activity_members.activity_id and a.teacher_id=auth.uid())
);



create policy "site progress owner/teacher" on site_progresses for all using (
  current_role()='admin' or student_id=auth.uid() or exists(select 1 from activities a where a.id=site_progresses.activity_id and a.teacher_id=auth.uid())
) with check (
  current_role()='admin' or student_id=auth.uid()
);

create policy "resource template admin read" on resource_templates for select using (
  current_role() in ('admin','teacher')
);
create policy "resource template admin write" on resource_templates for all using (
  current_role()='admin'
) with check (
  current_role()='admin'
);

insert into storage.buckets(id, name, public) values ('evidences','evidences', true) on conflict (id) do nothing;

-- demo seed（需先在 auth.users 创建对应邮箱用户，再替换 UUID）
-- insert into schools(id,name) values ('11111111-1111-1111-1111-111111111111','黄石实验学校') on conflict do nothing;
-- insert into classes(id,school_id,name,grade) values ('22222222-2222-2222-2222-222222222222','11111111-1111-1111-1111-111111111111','七年级1班','七年级') on conflict do nothing;
-- insert into profiles(id,role,name,school_id,class_id) values
-- ('<admin-uuid>','admin','系统管理员','11111111-1111-1111-1111-111111111111',null),
-- ('<teacher-uuid>','teacher','李老师','11111111-1111-1111-1111-111111111111',null),
-- ('<student-uuid>','student','张同学','11111111-1111-1111-1111-111111111111','22222222-2222-2222-2222-222222222222');
