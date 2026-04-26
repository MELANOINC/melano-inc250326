-- Ejecutar en Supabase SQL Editor (ajustar RLS según tu política).
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  nombre text,
  whatsapp text,
  presupuesto text,
  zona text,
  etapa text default 'nuevo',
  created_at timestamptz default now()
);

-- Ejemplo: permitir insert solo con service_role (sin política pública).
alter table public.leads enable row level security;
