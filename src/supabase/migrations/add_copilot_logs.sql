-- Create table to log AI assistant interactions
create table if not exists copilot_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete set null,
  input_text text not null,
  response_text text not null,
  created_at timestamp default now()
);

-- Optional index for faster user lookup
create index if not exists idx_copilot_user on copilot_logs(user_id);