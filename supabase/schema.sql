create table if not exists public.calls (
 id uuid primary key default gen_random_uuid(),
 prospect text not null, company text not null,
 furthest_stage integer not null default 0 check (furthest_stage between 0 and 7),
 outcome text, started_at timestamptz not null default now(), closed_at timestamptz
);
create table if not exists public.stage_results (
 id uuid primary key default gen_random_uuid(),
 call_id uuid not null references public.calls(id) on delete cascade,
 stage integer not null check (stage between 0 and 7),
 happened text not null default '', prospect_words text not null default '',
 created_at timestamptz not null default now()
);
create index if not exists stage_results_call_id_idx on public.stage_results(call_id);
alter table public.calls enable row level security;
alter table public.stage_results enable row level security;
-- Backend uses service role key. Never expose this key to browser or commit it.
