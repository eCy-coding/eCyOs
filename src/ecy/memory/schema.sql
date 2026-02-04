
-- Galactic Archive Schema (v1005.0)

-- Table: Debates (Stores the outcome of Multi-Agent discussions)
create table if not exists debates (
  id uuid default gen_random_uuid() primary key,
  query text not null,
  final_answer text not null,
  debate_history jsonb not null, -- Stores full turn-by-turn conversation
  timestamp timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Table: System Logs (Telemetry)
create table if not exists system_logs (
  id uuid default gen_random_uuid() primary key,
  level text not null, -- INFO, WARN, ERROR
  message text not null,
  source text not null, -- e.g., 'Brain', 'Healer', 'Portal'
  timestamp timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Table: Artifacts (Code files, plans generated)
create table if not exists artifacts (
  id uuid default gen_random_uuid() primary key,
  filename text not null,
  content text not null,
  type text not null, -- 'code', 'plan', 'image'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Setup Realtime
alter publication supabase_realtime add table debates;
alter publication supabase_realtime add table system_logs;
