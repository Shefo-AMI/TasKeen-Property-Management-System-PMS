-- Add foreign key: leases.tenant_id → tenants.id
alter table leases
  add constraint fk_leases_tenant
  foreign key (tenant_id) references tenants(id) on delete cascade;

-- Add foreign key: leases.unit_id → units.id
alter table leases
  add column unit_id uuid,
  add constraint fk_leases_unit
  foreign key (unit_id) references units(id) on delete set null;

-- Add foreign key: payments.lease_id → leases.id
alter table payments
  add constraint fk_payments_lease
  foreign key (lease_id) references leases(id) on delete cascade;

-- Add AI assistant log table
create table if not exists copilot_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  input_text text,
  response_text text,
  created_at timestamp default now()
);

-- Add index for faster lease lookup
create index if not exists idx_leases_tenant on leases(tenant_id);
create index if not exists idx_payments_lease on payments(lease_id);