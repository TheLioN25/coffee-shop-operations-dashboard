create table public.perfiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    es_admin BOOLEAN NOT NULL DEFAULT FALSE,
    fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

alter table public.perfiles enable row level security;

revoke all on table public.perfiles from anon, authenticated;

create or replace function public.es_usuario_admin()
returns BOOLEAN
language sql
stable
security definer
set search_path = ''
as $$
    select exists (
        select 1
        from public.perfiles
        where public.perfiles.id = (select auth.uid())
          and public.perfiles.es_admin = true
    );
$$;

revoke execute on function public.es_usuario_admin() from public;
revoke execute on function public.es_usuario_admin() from anon;
grant execute on function public.es_usuario_admin() to authenticated;