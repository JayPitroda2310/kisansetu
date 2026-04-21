-- Storage Policies for make-8192211d-product-images bucket
-- Allow authenticated users to upload their own images
CREATE POLICY "Users can upload their own product images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'make-8192211d-product-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow public read access to product images
CREATE POLICY "Public read access to product images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'make-8192211d-product-images');

-- Allow users to update their own images
CREATE POLICY "Users can update their own product images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'make-8192211d-product-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own images
CREATE POLICY "Users can delete their own product images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'make-8192211d-product-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Storage Policies for make-8192211d-user-avatars bucket
-- Allow authenticated users to upload their own avatars
CREATE POLICY "Users can upload their own avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'make-8192211d-user-avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow public read access to avatars
CREATE POLICY "Public read access to avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'make-8192211d-user-avatars');

-- Allow users to update their own avatars
CREATE POLICY "Users can update their own avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'make-8192211d-user-avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own avatars
CREATE POLICY "Users can delete their own avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'make-8192211d-user-avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Storage Policies for make-8192211d-kyc-documents bucket
-- Allow authenticated users to upload their own KYC documents
CREATE POLICY "Users can upload their own KYC documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'make-8192211d-kyc-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to read their own KYC documents
CREATE POLICY "Users can read their own KYC documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'make-8192211d-kyc-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to update their own KYC documents
CREATE POLICY "Users can update their own KYC documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'make-8192211d-kyc-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own KYC documents
CREATE POLICY "Users can delete their own KYC documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'make-8192211d-kyc-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
