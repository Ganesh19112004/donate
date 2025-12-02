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
