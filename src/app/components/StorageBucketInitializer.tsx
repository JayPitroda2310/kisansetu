import { useState, useEffect } from 'react';
import { Database, CheckCircle, Shield, Table, Loader2 } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { toast } from "sonner"
export function StorageBucketInitializer() {
  const [isInitializing, setIsInitializing] = useState(false);
  const [isApplyingPolicies, setIsApplyingPolicies] = useState(false);
  const [isAddingColumns, setIsAddingColumns] = useState(false);
  const [bucketsInitialized, setBucketsInitialized] = useState(false);
  const [policiesApplied, setPoliciesApplied] = useState(false);
  const [columnsAdded, setColumnsAdded] = useState(false);
  const [autoRunning, setAutoRunning] = useState(false);

  // Check localStorage and auto-run migrations if needed
  useEffect(() => {
    const migrationsCompleted = localStorage.getItem('kisansetu_migrations_completed');
    
    if (migrationsCompleted === 'true') {
      // Already completed, just set the state
      setBucketsInitialized(true);
      setPoliciesApplied(true);
      setColumnsAdded(true);
    } else {
      // Auto-run migrations
      runAllMigrations();
    }
  }, []);

  const runAllMigrations = async () => {
    setAutoRunning(true);
    
    // Step 1: Initialize buckets
    await initializeBuckets();
    
    // Step 2: Apply policies
    await applyStoragePolicies();
    
    // Step 3: Add columns
    await addListingColumns();
    
    // Mark as completed
    localStorage.setItem('kisansetu_migrations_completed', 'true');
    setAutoRunning(false);
  };

  const initializeBuckets = async () => {
    try {
      setIsInitializing(true);
      if (!autoRunning) {
        toast.loading('Initializing storage buckets...', { id: 'init-buckets' });
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-8192211d/storage/init`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        if (!autoRunning) {
          toast.success('Storage buckets initialized!', {
            id: 'init-buckets',
          });
        }
        setBucketsInitialized(true);
      } else {
        if (!autoRunning) {
          toast.error('Failed to initialize buckets', {
            id: 'init-buckets',
            description: data.error || 'Unknown error',
          });
        }
      }
    } catch (error: any) {
      console.error('Error initializing buckets:', error);
      if (!autoRunning) {
        toast.error('Failed to initialize buckets', {
          id: 'init-buckets',
          description: error.message,
        });
      }
    } finally {
      setIsInitializing(false);
    }
  };

  const applyStoragePolicies = async () => {
    try {
      setIsApplyingPolicies(true);
      if (!autoRunning) {
        toast.loading('Applying storage RLS policies...', { id: 'apply-policies' });
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-8192211d/migrations/apply-storage-policies`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        if (!autoRunning) {
          toast.success('Storage policies applied successfully!', {
            id: 'apply-policies',
            description: 'You can now upload images.',
          });
        }
        setPoliciesApplied(true);
      } else {
        if (!autoRunning) {
          toast.error('Failed to apply policies', {
            id: 'apply-policies',
            description: data.error || 'Unknown error',
          });
        }
      }
    } catch (error: any) {
      console.error('Error applying policies:', error);
      if (!autoRunning) {
        toast.error('Failed to apply policies', {
          id: 'apply-policies',
          description: error.message,
        });
      }
    } finally {
      setIsApplyingPolicies(false);
    }
  };

  const addListingColumns = async () => {
    try {
      setIsAddingColumns(true);
      if (!autoRunning) {
        toast.loading('Adding listing table columns...', { id: 'add-columns' });
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-8192211d/migrations/add-listing-columns`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        const message = data.alreadyExisted 
          ? 'Columns already exist - ready to go!' 
          : 'Listing columns added successfully!';
        
        if (!autoRunning) {
          toast.success(message, {
            id: 'add-columns',
          });
        }
        setColumnsAdded(true);
      } else {
        if (!autoRunning) {
          toast.error('Failed to add columns', {
            id: 'add-columns',
            description: data.error || 'Unknown error',
          });
        }
      }
    } catch (error: any) {
      console.error('Error adding columns:', error);
      if (!autoRunning) {
        toast.error('Failed to add columns', {
          id: 'add-columns',
          description: error.message,
        });
      }
    } finally {
      setIsAddingColumns(false);
    }
  };

  return (
    null
  );
}