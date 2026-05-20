create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create index if not exists analyses_user_id_updated_at_idx on public.analyses (user_id, updated_at desc);
create index if not exists analysis_notes_analysis_id_created_at_idx on public.analysis_notes (analysis_id, created_at desc);
create index if not exists analysis_notes_user_id_created_at_idx on public.analysis_notes (user_id, created_at desc);
create index if not exists activity_logs_user_id_created_at_idx on public.activity_logs (user_id, created_at desc);
create index if not exists analysis_documents_analysis_id_idx on public.analysis_documents (analysis_id);
create index if not exists analysis_documents_user_id_idx on public.analysis_documents (user_id);

alter policy "Users can view own profile"
on public.profiles
using ((select auth.uid()) = id);

alter policy "Users can update own profile"
on public.profiles
using ((select auth.uid()) = id);

alter policy "Users can insert own profile"
on public.profiles
with check ((select auth.uid()) = id);

alter policy "Users can view own analyses"
on public.analyses
using ((select auth.uid()) = user_id);

alter policy "Users can insert own analyses"
on public.analyses
with check ((select auth.uid()) = user_id);

alter policy "Users can update own analyses"
on public.analyses
using ((select auth.uid()) = user_id);

alter policy "Users can delete own analyses"
on public.analyses
using ((select auth.uid()) = user_id);

alter policy "Users can view own analysis notes"
on public.analysis_notes
using ((select auth.uid()) = user_id);

alter policy "Users can insert own analysis notes"
on public.analysis_notes
with check ((select auth.uid()) = user_id);

alter policy "Users can update own analysis notes"
on public.analysis_notes
using ((select auth.uid()) = user_id);

alter policy "Users can delete own analysis notes"
on public.analysis_notes
using ((select auth.uid()) = user_id);

alter policy "Users can view own activity logs"
on public.activity_logs
using ((select auth.uid()) = user_id);

alter policy "Users can insert own activity logs"
on public.activity_logs
with check ((select auth.uid()) = user_id);

alter policy "Users can view own documents"
on public.analysis_documents
using ((select auth.uid()) = user_id);

alter policy "Users can insert own documents"
on public.analysis_documents
with check ((select auth.uid()) = user_id);

alter policy "Users can update own documents"
on public.analysis_documents
using ((select auth.uid()) = user_id);

alter policy "Users can delete own documents"
on public.analysis_documents
using ((select auth.uid()) = user_id);
