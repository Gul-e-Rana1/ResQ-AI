-- Camp managers need to look up a user's id by email to invite them as a
-- team member, but the "profiles can read own profile" RLS policy blocks
-- reading other users' rows. This function exposes only the id for a given
-- email, bypassing RLS via security definer without leaking full profiles.
create or replace function public.find_profile_id_by_email(p_email text)
returns uuid
language sql
security definer
set search_path = public
stable
as $$
  select id from public.profiles where email = lower(trim(p_email)) limit 1;
$$;

revoke all on function public.find_profile_id_by_email(text) from public;
grant execute on function public.find_profile_id_by_email(text) to authenticated;

-- The "profiles can update own profile" policy blocks a camp manager from
-- updating a newly-added team member's role, so that update silently
-- affects 0 rows. This function performs the role switch on behalf of the
-- caller, but only after verifying the caller actually manages a camp that
-- p_user_id belongs to (or is an admin), preventing arbitrary role escalation.
create or replace function public.sync_team_member_role(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not (
    public.current_app_role() = 'admin'
    or exists (
      select 1
      from public.camp_team_members ctm
      join public.relief_camps c on c.id = ctm.camp_id
      where ctm.user_id = p_user_id and c.manager_id = auth.uid()
    )
  ) then
    raise exception 'not authorized';
  end if;

  update public.profiles set role = 'camp_team_member' where id = p_user_id;
end;
$$;

revoke all on function public.sync_team_member_role(uuid) from public;
grant execute on function public.sync_team_member_role(uuid) to authenticated;
