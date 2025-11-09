create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  github_id text unique,
  email text unique not null,
  role text not null default 'member',
  consent_flags jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create table if not exists articles (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references users(id) on delete cascade,
  title text not null,
  slug text unique not null,
  status text not null default 'draft',
  current_version_id uuid,
  trust_score numeric default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists article_versions (
  id uuid primary key default gen_random_uuid(),
  article_id uuid not null references articles(id) on delete cascade,
  content_md text not null,
  content_html text not null,
  ai_report_id uuid,
  created_at timestamptz default now()
);

create table if not exists ai_reports (
  id uuid primary key default gen_random_uuid(),
  article_version_id uuid not null references article_versions(id) on delete cascade,
  ai_provider text not null,
  result_json jsonb not null,
  score_fact numeric,
  score_logic numeric,
  score_coverage numeric,
  generated_at timestamptz default now(),
  latency_ms integer,
  cost_usd numeric
);

create table if not exists human_input_scores (
  id uuid primary key default gen_random_uuid(),
  article_version_id uuid not null references article_versions(id) on delete cascade,
  detector text not null,
  score numeric,
  raw_data_ref text,
  created_at timestamptz default now()
);

create table if not exists interactions (
  id uuid primary key default gen_random_uuid(),
  article_id uuid not null references articles(id) on delete cascade,
  user_id uuid references users(id) on delete set null,
  type text not null,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null,
  entity_id uuid not null,
  action text not null,
  actor_id uuid references users(id) on delete set null,
  payload jsonb,
  created_at timestamptz default now()
);

alter table articles
  add constraint fk_articles_current_version
  foreign key (current_version_id)
  references article_versions(id)
  on delete set null;

alter table article_versions
  add constraint fk_article_versions_ai_report
  foreign key (ai_report_id)
  references ai_reports(id)
  on delete set null;

create index if not exists idx_articles_status on articles(status);
create index if not exists idx_article_versions_article on article_versions(article_id);
create index if not exists idx_ai_reports_article_version on ai_reports(article_version_id);
