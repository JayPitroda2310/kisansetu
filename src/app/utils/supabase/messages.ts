import { supabase } from './client';
import { requestQueue } from './requestQueue';

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  read_at: string | null;
  attachments: any;
  created_at: string;
}

export interface Conversation {
  id: string;
  participant_1_id: string;
  participant_2_id: string;
  listing_id: string | null;
  last_message: string | null;
  last_message_at: string | null;
  created_at: string;
}

export interface ConversationWithDetails extends Conversation {
  other_user: {
    id: string;
    full_name: string;
    avatar_url: string | null;
    kyc_status: string;
    business_name: string | null;
  };
  unread_count: number;
  listing?: {
    id: string;
    product_name: string;
  } | null;
}

/**
 * Get all conversations for the current user
 */
export async function getUserConversations(): Promise<{ data: ConversationWithDetails[] | null; error: any }> {
  return requestQueue.add(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { data: null, error: new Error('User not authenticated') };
      }

      // Get conversations where user is either participant
      const { data: conversations, error: convError } = await supabase
        .from('conversations')
        .select('*')
        .or(`participant_1_id.eq.${user.id},participant_2_id.eq.${user.id}`)
        .order('last_message_at', { ascending: false, nullsFirst: false });

      if (convError) {
        return { data: null, error: convError };
      }

      if (!conversations || conversations.length === 0) {
        return { data: [], error: null };
      }

      // Get details for each conversation
      const conversationsWithDetails = await Promise.all(
        conversations.map(async (conv) => {
          // Determine the other user's ID
          const otherUserId = conv.participant_1_id === user.id 
            ? conv.participant_2_id 
            : conv.participant_1_id;

          // Get other user's profile
          const { data: otherUserProfile } = await supabase
            .from('user_profiles')
            .select('id, full_name, avatar_url, kyc_status, business_name')
            .eq('id', otherUserId)
            .single();

          // Get unread message count
          const { count: unreadCount } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conv.id)
            .eq('is_read', false)
            .neq('sender_id', user.id);

          // Get listing details if exists
          let listing = null;
          if (conv.listing_id) {
            const { data: listingData } = await supabase
              .from('listings')
              .select('id, product_name')
              .eq('id', conv.listing_id)
              .single();
            listing = listingData;
          }

          return {
            ...conv,
            other_user: otherUserProfile || {
              id: otherUserId,
              full_name: 'Unknown User',
              avatar_url: null,
              kyc_status: 'unverified',
              business_name: null
            },
            unread_count: unreadCount || 0,
            listing
          };
        })
      );

      return { data: conversationsWithDetails, error: null };
    } catch (error) {
      console.error('Error getting conversations:', error);
      return { data: null, error };
    }
  });
}

/**
 * Get messages for a specific conversation
 */
export async function getConversationMessages(conversationId: string): Promise<{ data: Message[] | null; error: any }> {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error getting messages:', error);
    return { data: null, error };
  }
}

/**
 * Send a message in a conversation
 */
export async function sendMessage(
  conversationId: string,
  content: string,
  attachments?: any
): Promise<{ data: Message | null; error: any }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { data: null, error: new Error('User not authenticated') };
    }

    // Insert the message
    const { data: message, error: messageError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: user.id,
        content,
        attachments: attachments || null,
        is_read: false
      })
      .select()
      .single();

    if (messageError) {
      return { data: null, error: messageError };
    }

    // Update conversation's last_message and last_message_at
    const { error: updateError } = await supabase
      .from('conversations')
      .update({
        last_message: content,
        last_message_at: new Date().toISOString()
      })
      .eq('id', conversationId);

    if (updateError) {
      console.error('Error updating conversation:', updateError);
    }

    return { data: message, error: null };
  } catch (error) {
    console.error('Error sending message:', error);
    return { data: null, error };
  }
}

/**
 * Mark messages as read
 */
export async function markMessagesAsRead(conversationId: string): Promise<{ error: any }> {
  return requestQueue.add(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { error: new Error('User not authenticated') };
      }

      const { error } = await supabase
        .from('messages')
        .update({ 
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('conversation_id', conversationId)
        .eq('is_read', false)
        .neq('sender_id', user.id);

      return { error };
    } catch (error) {
      console.error('Error marking messages as read:', error);
      return { error };
    }
  });
}

/**
 * Create or get existing conversation
 */
export async function getOrCreateConversation(
  otherUserId: string,
  listingId?: string
): Promise<{ data: Conversation | null; error: any }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { data: null, error: new Error('User not authenticated') };
    }

    // Try to find existing conversation - check both participant orders
    let query = supabase
      .from('conversations')
      .select('*')
      .or(`and(participant_1_id.eq.${user.id},participant_2_id.eq.${otherUserId}),and(participant_1_id.eq.${otherUserId},participant_2_id.eq.${user.id})`);
    
    // Only filter by listing_id if one is provided
    if (listingId) {
      query = query.eq('listing_id', listingId);
    } else {
      query = query.is('listing_id', null);
    }

    const { data: existingConv, error: findError } = await query.maybeSingle();

    if (existingConv) {
      return { data: existingConv, error: null };
    }

    // Create new conversation only if one doesn't exist
    const { data: newConv, error } = await supabase
      .from('conversations')
      .insert({
        participant_1_id: user.id,
        participant_2_id: otherUserId,
        listing_id: listingId || null
      })
      .select()
      .single();

    if (error) {
      return { data: null, error };
    }

    return { data: newConv, error: null };
  } catch (error) {
    console.error('Error creating conversation:', error);
    return { data: null, error };
  }
}

/**
 * Subscribe to new messages in a conversation
 */
export function subscribeToMessages(
  conversationId: string,
  callback: (message: Message) => void
) {
  const channel = supabase
    .channel(`messages:${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`
      },
      (payload) => {
        callback(payload.new as Message);
      }
    )
    .subscribe();

  return channel;
}

/**
 * Subscribe to conversation updates
 */
export function subscribeToConversations(callback: () => void) {
  // Generate a unique channel name to avoid conflicts
  const channelName = `conversations-updates-${Math.random().toString(36).substring(7)}`;
  
  const channel = supabase
    .channel(channelName)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'conversations'
      },
      () => {
        callback();
      }
    )
    .subscribe();

  return channel;
}

/**
 * Get all users in the system (excluding current user)
 */
export async function getAllUsers(): Promise<{ data: any[] | null; error: any }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { data: null, error: new Error('User not authenticated') };
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .select('id, full_name, avatar_url, kyc_status, business_name, role')
      .neq('id', user.id)
      .order('full_name', { ascending: true });

    if (error) {
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error getting all users:', error);
    return { data: null, error };
  }
}

/**
 * Get total unread message count for the current user
 */
export async function getTotalUnreadCount(): Promise<{ count: number | null; error: any }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { count: null, error: new Error('User not authenticated') };
    }

    // Get all conversations where user is a participant
    const { data: conversations, error: convError } = await supabase
      .from('conversations')
      .select('id')
      .or(`participant_1_id.eq.${user.id},participant_2_id.eq.${user.id}`);

    if (convError) {
      return { count: null, error: convError };
    }

    if (!conversations || conversations.length === 0) {
      return { count: 0, error: null };
    }

    // Count all unread messages in these conversations
    const conversationIds = conversations.map(c => c.id);
    
    const { count, error } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .in('conversation_id', conversationIds)
      .eq('is_read', false)
      .neq('sender_id', user.id);

    if (error) {
      return { count: null, error };
    }

    return { count: count || 0, error: null };
  } catch (error) {
    console.error('Error getting total unread count:', error);
    return { count: null, error };
  }
}

/**
 * Ensure storage bucket exists with proper public access
 */
async function ensureBucketExists(): Promise<boolean> {
  try {
    // Check if bucket exists
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.find(b => b.id === 'message-attachments');
    
    if (!bucketExists) {
      console.log('📦 Bucket does not exist, creating with public access...');
      
      // Create public bucket
      const { error: createError } = await supabase.storage.createBucket('message-attachments', {
        public: true,
        fileSizeLimit: 10485760, // 10MB
        allowedMimeTypes: [
          'image/jpeg',
          'image/jpg',
          'image/png',
          'image/gif',
          'image/webp',
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'text/plain'
        ]
      });
      
      if (createError) {
        console.error('❌ Failed to create bucket:', createError);
        return false;
      }
      
      console.log('✅ Public bucket created successfully');
      
      // Wait a bit for bucket to be ready
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return true;
    }
    
    console.log('✅ Bucket already exists');
    return true;
  } catch (error) {
    console.error('❌ Error checking/creating bucket:', error);
    return false;
  }
}

/**
 * Upload a file to Supabase Storage with public access
 */
export async function uploadMessageAttachment(file: File): Promise<{ data: { url: string; type: string; name: string; size: number } | null; error: any }> {
  try {
    console.log('🔐 Getting user...');
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('❌ User not authenticated');
      return { data: null, error: new Error('User not authenticated') };
    }

    console.log('✅ User authenticated:', user.id);

    // Ensure bucket exists
    const bucketReady = await ensureBucketExists();
    if (!bucketReady) {
      return { 
        data: null, 
        error: new Error('Failed to create storage bucket. Please try again.') 
      };
    }

    // Create a unique file name
    const fileExt = file.name.split('.').pop();
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    const fileName = `${user.id}/${timestamp}-${random}.${fileExt}`;
    
    console.log('📝 Uploading file:', { 
      fileName, 
      fileType: file.type, 
      fileSize: file.size,
      fileSizeMB: (file.size / 1024 / 1024).toFixed(2) + 'MB'
    });
    
    // Upload file with public access
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('message-attachments')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type || 'application/octet-stream'
      });

    if (uploadError) {
      console.error('❌ Upload error:', uploadError);
      return { data: null, error: uploadError };
    }

    console.log('✅ Upload successful:', uploadData);

    // Get public URL (since bucket is public)
    const { data: urlData } = supabase.storage
      .from('message-attachments')
      .getPublicUrl(fileName);

    const publicUrl = urlData.publicUrl;
    console.log('🔗 Public URL generated:', publicUrl);

    // Verify the URL is accessible
    try {
      const testResponse = await fetch(publicUrl, { method: 'HEAD' });
      if (!testResponse.ok) {
        console.warn('⚠️ Public URL may not be accessible yet:', testResponse.status);
      } else {
        console.log('✅ Public URL verified accessible');
      }
    } catch (e) {
      console.warn('⚠️ Could not verify URL accessibility:', e);
    }

    return {
      data: {
        url: publicUrl,
        type: file.type || 'application/octet-stream',
        name: file.name,
        size: file.size
      },
      error: null
    };
  } catch (error) {
    console.error('❌ Unexpected error in uploadMessageAttachment:', error);
    return { data: null, error };
  }
}