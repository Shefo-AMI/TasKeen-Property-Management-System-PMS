
-- Link leases to tenants
alter table leases
  add column if not exists tenant_id uuid,
  add constraint if not exists fk_leases_tenant
  foreign key (tenant_id) references tenants(id) on delete cascade;

-- Link leases to units
alter table leases
  add column if not exists unit_id uuid,
  add constraint if not exists fk_leases_unit
  foreign key (unit_id) references units(id) on delete set null;

-- Link payments to leases
alter table payments
  add column if not exists lease_id uuid,
  add constraint if not exists fk_payments_lease
  foreign key (lease_id) references leases(id) on delete cascade;

-- Add indexes for performance
create index if not exists idx_leases_tenant on leases(tenant_id);
create index if not exists idx_leases_unit on leases(unit_id);
create index if not exists idx_payments_lease on payments(lease_id);
