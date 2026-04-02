# Supabase — esquema `alenya_*`

DDL de referencia para leads, conversaciones y configuración por cliente. Ajustar `project_id`, RLS y políticas según el proyecto real.

```sql
-- Leads capturados por WhatsApp / otros canales
create table if not exists public.alenya_leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  phone text,
  wa_id text unique,
  nombre text,
  empresa text,
  rubro text,
  etapa text not null default 'nuevo',
  metadata jsonb default '{}'::jsonb,
  notas_internas text
);

create index if not exists idx_alenya_leads_wa_id on public.alenya_leads (wa_id);
create index if not exists idx_alenya_leads_etapa on public.alenya_leads (etapa);

-- Mensajes / turnos por conversación
create table if not exists public.alenya_conversaciones (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  lead_id uuid not null references public.alenya_leads (id) on delete cascade,
  rol text not null check (rol in ('user', 'assistant', 'system', 'human')),
  contenido text not null,
  intent text,
  metadata jsonb default '{}'::jsonb
);

create index if not exists idx_alenya_conv_lead on public.alenya_conversaciones (lead_id, created_at);

-- Config por tenant / bot (una fila por despliegue o por cliente)
create table if not exists public.alenya_config (
  id uuid primary key default gen_random_uuid(),
  updated_at timestamptz not null default now(),
  clave text not null unique,
  valor jsonb not null default '{}'::jsonb
);

-- Ejemplo: clave = 'bot_principal', valor = { BOT_NOMBRE, RUBRO, ... }
```

Habilitar RLS y políticas que permitan solo al servicio (service role) o al portal autenticado según el diseño de Melania.
