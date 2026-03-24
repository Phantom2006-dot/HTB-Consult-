
-- Allow mentors to view bookings for their mentor profile
CREATE POLICY "Mentors can view own bookings"
ON public.bookings
FOR SELECT
TO authenticated
USING (
  mentor_id IN (
    SELECT id FROM public.mentors WHERE user_id = auth.uid()
  )
);

-- Allow mentors to update bookings (accept/decline/complete)
CREATE POLICY "Mentors can update own bookings"
ON public.bookings
FOR UPDATE
TO authenticated
USING (
  mentor_id IN (
    SELECT id FROM public.mentors WHERE user_id = auth.uid()
  )
);

-- Allow authenticated users to view profiles of other users (needed for mentor to see student names)
CREATE POLICY "Authenticated users can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

-- Drop the restrictive select policy that only allows own profile viewing
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
