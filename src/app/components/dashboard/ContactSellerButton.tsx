import { useState } from 'react';
import { MessageSquare, Loader2 } from 'lucide-react';
import { getOrCreateConversation } from '../../utils/supabase/messages';
import { toast } from 'sonner';

interface ContactSellerButtonProps {
  sellerId: string;
  listingId?: string;
  onNavigate?: (view: string, conversationId?: string) => void;
  variant?: 'primary' | 'secondary';
  className?: string;
  children?: React.ReactNode;
}

export function ContactSellerButton({
  sellerId,
  listingId,
  onNavigate,
  variant = 'primary',
  className = '',
  children
}: ContactSellerButtonProps) {
  const [isCreating, setIsCreating] = useState(false);

  const handleContactSeller = async () => {
    try {
      setIsCreating(true);
      
      // Create or get existing conversation
      const { data: conversation, error } = await getOrCreateConversation(
        sellerId,
        listingId
      );

      if (error) {
        console.error('Error creating conversation:', error);
        toast.error('Failed to start conversation', {
          description: 'Please try again later.'
        });
        return;
      }

      if (conversation) {
        toast.success('Opening conversation...');
        
        // Navigate to messages page
        if (onNavigate) {
          onNavigate('messages', conversation.id);
        }
      }
    } catch (error) {
      console.error('Error handling contact seller:', error);
      toast.error('Failed to start conversation');
    } finally {
      setIsCreating(false);
    }
  };

  const baseStyles = variant === 'primary'
    ? 'bg-[#64b900] hover:bg-[#559900] text-white'
    : 'border-2 border-[#64b900]/30 text-black hover:bg-[#64b900]/5 hover:border-[#64b900]';

  return (
    <button
      onClick={handleContactSeller}
      disabled={isCreating}
      className={`
        w-full px-4 py-3 font-['Geologica:SemiBold',sans-serif] 
        transition-all duration-200 shadow-md hover:shadow-lg 
        flex items-center justify-center gap-2 rounded-xl text-sm
        disabled:opacity-50 disabled:cursor-not-allowed
        ${baseStyles}
        ${className}
      `}
    >
      {isCreating ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Opening...</span>
        </>
      ) : (
        <>
          <MessageSquare className="w-4 h-4" />
          <span>{children || 'Contact Seller'}</span>
        </>
      )}
    </button>
  );
}
