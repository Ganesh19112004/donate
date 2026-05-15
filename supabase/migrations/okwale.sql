🟩 1. Allow PUBLIC READ (images visible)

Go to:

Storage → ngo_images → Policies → “New Policy”

Paste:

create policy "Allow public read"
on storage.objects for select
to public
using (bucket_id = 'ngo_images');

🟦 2. Allow UPLOAD (authenticated users)

Paste:

create policy "Allow authenticated upload"
on storage.objects for insert
to authenticated
with check (bucket_id = 'ngo_images');

🟨 3. Allow UPDATE / DELETE (optional but recommended)
create policy "Allow update for owner"
on storage.objects for update
to authenticated
using (bucket_id = 'ngo_images');

create policy "Allow delete for owner"
on storage.objects for delete
to authenticated
using (bucket_id = 'ngo_images');🟩 1. Allow PUBLIC READ (images visible)

Go to:

Storage → ngo_images → Policies → “New Policy”

Paste:

create policy "Allow public read"
on storage.objects for select
to public
using (bucket_id = 'ngo_images');

🟦 2. Allow UPLOAD (authenticated users)

Paste:

create policy "Allow authenticated upload"
on storage.objects for insert
to authenticated
with check (bucket_id = 'ngo_images');

🟨 3. Allow UPDATE / DELETE (optional but recommended)
create policy "Allow update for owner"
on storage.objects for update
to authenticated
using (bucket_id = 'ngo_images');

create policy "Allow delete for owner"
on storage.objects for delete
to authenticated
using (bucket_id = 'ngo_images');


-- INSERT
CREATE POLICY "NGO upload images"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'ngo_gallery_images');
-- SELECT
CREATE POLICY "Public read images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'ngo_gallery_images');

create policy "Volunteer can update own location"
on volunteer_live_location
for all
using (auth.uid() = volunteer_id);



-- ===============================
-- DONATION IMAGES BUCKET POLICIES
-- ===============================

-- PUBLIC READ
CREATE POLICY "Public can view donation images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'donation_images');

-- AUTHENTICATED UPLOAD
CREATE POLICY "Authenticated users can upload donation images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'donation_images');

-- AUTHENTICATED UPDATE
CREATE POLICY "Authenticated users can update donation images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'donation_images');

-- AUTHENTICATED DELETE
CREATE POLICY "Authenticated users can delete donation images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'donation_images');

-- PUBLIC READ
CREATE POLICY "Public read donation images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'donation-images');

-- AUTHENTICATED UPLOAD
CREATE POLICY "Authenticated upload donation images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'donation-images');

-- UPDATE
CREATE POLICY "Authenticated update donation images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'donation-images');

-- DELETE
CREATE POLICY "Authenticated delete donation images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'donation-images');

-- REMOVE OLD POLICIES FIRST
DROP POLICY IF EXISTS "Public read donation images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated upload donation images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated update donation images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated delete donation images" ON storage.objects;

-- PUBLIC READ
CREATE POLICY "Public read donation images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'donation-images');

-- ALLOW ANYONE TO UPLOAD
CREATE POLICY "Anyone can upload donation images"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'donation-images');

-- ALLOW UPDATE
CREATE POLICY "Anyone can update donation images"
ON storage.objects
FOR UPDATE
TO public
USING (bucket_id = 'donation-images');

-- ALLOW DELETE
CREATE POLICY "Anyone can delete donation images"
ON storage.objects
FOR DELETE
TO public
USING (bucket_id = 'donation-images');