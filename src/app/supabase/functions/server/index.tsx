import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'jsr:@supabase/supabase-js@2';

const app = new Hono();

// Middleware
app.use('*', cors());
app.use('*', logger(console.log));

// Initialize Supabase client with service role key
const getSupabaseAdmin = () => {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );
};

// Initialize storage buckets on server startup
const initializeStorageBuckets = async () => {
  try {
    const supabase = getSupabaseAdmin();
    const buckets = [
      { name: 'make-8192211d-product-images', public: true },
      { name: 'make-8192211d-user-avatars', public: true },
      { name: 'make-8192211d-kyc-documents', public: false }
    ];

    const { data: existingBuckets } = await supabase.storage.listBuckets();
    console.log('Existing buckets:', existingBuckets?.map(b => b.name));
    
    for (const bucket of buckets) {
      const bucketExists = existingBuckets?.some(b => b.name === bucket.name);
      
      if (!bucketExists) {
        const { error } = await supabase.storage.createBucket(bucket.name, {
          public: bucket.public,
          fileSizeLimit: 5242880, // 5MB
        });
        
        if (error) {
          console.error(`❌ Error creating bucket ${bucket.name}:`, error);
        } else {
          console.log(`✅ Created storage bucket: ${bucket.name} (public: ${bucket.public})`);
        }
      } else {
        console.log(`✓ Bucket already exists: ${bucket.name}`);
      }
    }
  } catch (error) {
    console.error('Error initializing storage buckets:', error);
  }
};

// Initialize buckets when server starts
initializeStorageBuckets();

// Endpoint to apply storage policies
app.post('/make-server-8192211d/migrations/apply-storage-policies', async (c) => {
  try {
    // Import postgres client
    const { Client } = await import('https://deno.land/x/postgres@v0.17.0/mod.ts');
    
    const client = new Client(Deno.env.get('SUPABASE_DB_URL'));
    await client.connect();
    
    try {
      // Apply storage policies one by one
      const policies = [
        // Product images - INSERT
        `DROP POLICY IF EXISTS "Users can upload their own product images" ON storage.objects;`,
        `CREATE POLICY "Users can upload their own product images"
         ON storage.objects FOR INSERT TO authenticated
         WITH CHECK (
           bucket_id = 'make-8192211d-product-images' AND
           (storage.foldername(name))[1] = auth.uid()::text
         );`,
        
        // Product images - SELECT  
        `DROP POLICY IF EXISTS "Public read access to product images" ON storage.objects;`,
        `CREATE POLICY "Public read access to product images"
         ON storage.objects FOR SELECT TO public
         USING (bucket_id = 'make-8192211d-product-images');`,
        
        // Product images - UPDATE
        `DROP POLICY IF EXISTS "Users can update their own product images" ON storage.objects;`,
        `CREATE POLICY "Users can update their own product images"
         ON storage.objects FOR UPDATE TO authenticated
         USING (
           bucket_id = 'make-8192211d-product-images' AND
           (storage.foldername(name))[1] = auth.uid()::text
         );`,
        
        // Product images - DELETE
        `DROP POLICY IF EXISTS "Users can delete their own product images" ON storage.objects;`,
        `CREATE POLICY "Users can delete their own product images"
         ON storage.objects FOR DELETE TO authenticated
         USING (
           bucket_id = 'make-8192211d-product-images' AND
           (storage.foldername(name))[1] = auth.uid()::text
         );`,
        
        // User avatars - INSERT
        `DROP POLICY IF EXISTS "Users can upload their own avatars" ON storage.objects;`,
        `CREATE POLICY "Users can upload their own avatars"
         ON storage.objects FOR INSERT TO authenticated
         WITH CHECK (
           bucket_id = 'make-8192211d-user-avatars' AND
           (storage.foldername(name))[1] = auth.uid()::text
         );`,
        
        // User avatars - SELECT
        `DROP POLICY IF EXISTS "Public read access to avatars" ON storage.objects;`,
        `CREATE POLICY "Public read access to avatars"
         ON storage.objects FOR SELECT TO public
         USING (bucket_id = 'make-8192211d-user-avatars');`,
        
        // User avatars - UPDATE
        `DROP POLICY IF EXISTS "Users can update their own avatars" ON storage.objects;`,
        `CREATE POLICY "Users can update their own avatars"
         ON storage.objects FOR UPDATE TO authenticated
         USING (
           bucket_id = 'make-8192211d-user-avatars' AND
           (storage.foldername(name))[1] = auth.uid()::text
         );`,
        
        // User avatars - DELETE
        `DROP POLICY IF EXISTS "Users can delete their own avatars" ON storage.objects;`,
        `CREATE POLICY "Users can delete their own avatars"
         ON storage.objects FOR DELETE TO authenticated
         USING (
           bucket_id = 'make-8192211d-user-avatars' AND
           (storage.foldername(name))[1] = auth.uid()::text
         );`,
        
        // KYC documents - INSERT
        `DROP POLICY IF EXISTS "Users can upload their own KYC documents" ON storage.objects;`,
        `CREATE POLICY "Users can upload their own KYC documents"
         ON storage.objects FOR INSERT TO authenticated
         WITH CHECK (
           bucket_id = 'make-8192211d-kyc-documents' AND
           (storage.foldername(name))[1] = auth.uid()::text
         );`,
        
        // KYC documents - SELECT
        `DROP POLICY IF EXISTS "Users can read their own KYC documents" ON storage.objects;`,
        `CREATE POLICY "Users can read their own KYC documents"
         ON storage.objects FOR SELECT TO authenticated
         USING (
           bucket_id = 'make-8192211d-kyc-documents' AND
           (storage.foldername(name))[1] = auth.uid()::text
         );`,
        
        // KYC documents - UPDATE
        `DROP POLICY IF EXISTS "Users can update their own KYC documents" ON storage.objects;`,
        `CREATE POLICY "Users can update their own KYC documents"
         ON storage.objects FOR UPDATE TO authenticated
         USING (
           bucket_id = 'make-8192211d-kyc-documents' AND
           (storage.foldername(name))[1] = auth.uid()::text
         );`,
        
        // KYC documents - DELETE
        `DROP POLICY IF EXISTS "Users can delete their own KYC documents" ON storage.objects;`,
        `CREATE POLICY "Users can delete their own KYC documents"
         ON storage.objects FOR DELETE TO authenticated
         USING (
           bucket_id = 'make-8192211d-kyc-documents' AND
           (storage.foldername(name))[1] = auth.uid()::text
         );`,
      ];

      for (const sql of policies) {
        await client.queryArray(sql);
      }

      console.log('✅ Storage policies applied successfully');
      return c.json({ success: true, message: 'Storage policies applied successfully' });
      
    } finally {
      await client.end();
    }

  } catch (error: any) {
    console.error('Migration error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Endpoint to add listing columns
app.post('/make-server-8192211d/migrations/add-listing-columns', async (c) => {
  try {
    // Import postgres client
    const { Client } = await import('https://deno.land/x/postgres@v0.17.0/mod.ts');
    
    const client = new Client(Deno.env.get('SUPABASE_DB_URL'));
    await client.connect();
    
    try {
      // First check if columns exist
      const checkResult = await client.queryObject(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'listings' 
        AND column_name IN ('moq', 'packaging_type', 'storage_type')
      `);
      
      const existingColumns = checkResult.rows.map((r: any) => r.column_name);
      const allColumnsExist = existingColumns.length === 3;
      
      if (allColumnsExist) {
        console.log('✅ All listing columns already exist');
        return c.json({ 
          success: true, 
          message: 'All columns already exist',
          alreadyExisted: true 
        });
      }

      // Add missing columns
      const queries = [
        'ALTER TABLE listings ADD COLUMN IF NOT EXISTS moq DECIMAL(10,2);',
        'ALTER TABLE listings ADD COLUMN IF NOT EXISTS packaging_type TEXT;',
        'ALTER TABLE listings ADD COLUMN IF NOT EXISTS storage_type TEXT;',
      ];

      for (const sql of queries) {
        await client.queryArray(sql);
      }

      console.log('✅ Listing columns added successfully');
      return c.json({ 
        success: true, 
        message: 'Listing columns added successfully',
        alreadyExisted: false 
      });
      
    } finally {
      await client.end();
    }

  } catch (error: any) {
    console.error('Migration error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Endpoint to manually initialize storage buckets
app.post('/make-server-8192211d/storage/init', async (c) => {
  try {
    await initializeStorageBuckets();
    return c.json({ success: true, message: 'Storage buckets initialized' });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Health check
app.get('/make-server-8192211d/health', (c) => {
  return c.json({ status: 'ok', message: 'KisanSetu server is running' });
});

// Sign up endpoint
app.post('/make-server-8192211d/auth/signup', async (c) => {
  try {
    const body = await c.req.json();
    const { email, password, fullName, phone, role, location } = body;

    // Validate required fields
    if (!email || !password || !fullName || !phone || !role) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    const supabase = getSupabaseAdmin();

    // Create user with auto-confirmed email
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email since we haven't configured email server
      user_metadata: {
        full_name: fullName,
        phone,
        role,
        location,
      },
    });

    if (error) {
      console.error('Error creating user:', error);
      return c.json({ error: error.message }, 400);
    }

    // Create user profile
    if (data.user) {
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: data.user.id,
          full_name: fullName,
          phone,
          role,
          location: location || '',
          profile_completed: false,
        });

      if (profileError) {
        console.error('Error creating profile:', profileError);
        return c.json({ error: 'Failed to create user profile: ' + profileError.message }, 500);
      }
    }

    return c.json({ 
      success: true, 
      user: data.user,
      message: 'Account created successfully'
    });

  } catch (error: any) {
    console.error('Sign up error:', error);
    return c.json({ error: error.message || 'Sign up failed' }, 500);
  }
});

// Start server
Deno.serve(app.fetch);