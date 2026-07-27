-- fetchCampTeamMembers embeds profiles(full_name, email, phone, avatar_url) via
-- PostgREST resource embedding, which is subject to the profiles table's RLS.
-- "profiles can read own profile" only allows id = auth.uid() (or admin), so a
-- camp manager listing their team sees profiles: null for every teammate,
-- showing as "Unnamed member". Allow reading a profile when the viewer manages
-- (or belongs to) the same camp that profile's owner is a team member of.
drop policy if exists "camp members can read teammate profiles" on public.profiles;
create policy "camp members can read teammate profiles"
on public.profiles for select
using (
  exists (
    select 1
    from public.camp_team_members ctm
    join public.relief_camps c on c.id = ctm.camp_id
    where ctm.user_id = profiles.id
      and (c.manager_id = auth.uid() or public.is_camp_member(ctm.camp_id))
  )
);
