import { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Send, 
  Paperclip, 
  Plus,
  Smile,
  CheckCheck,
  Filter,
  Mic,
  BadgeCheck,
  ArrowLeft,
  Loader2,
  X,
  UserPlus,
  Download,
  FileText,
  Image as ImageIcon
} from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { 
  getUserConversations, 
  getConversationMessages, 
  sendMessage, 
  markMessagesAsRead,
  subscribeToMessages,
  subscribeToConversations,
  getOrCreateConversation,
  getAllUsers,
  uploadMessageAttachment,
  type ConversationWithDetails,
  type Message
} from '../../utils/supabase/messages';
import { supabase } from '../../utils/supabase/client';
import { toast } from 'sonner@2.0.3';
import { StorageSetupModal } from '../StorageSetupModal';

interface MessagesPageProps {
  initialConversationId?: string;
}

export function MessagesPage({ initialConversationId }: MessagesPageProps = {}) {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(initialConversationId || null);
  const [newMessage, setNewMessage] = useState('');
  const [conversations, setConversations] = useState<ConversationWithDetails[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showStorageSetup, setShowStorageSetup] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const markAsReadTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMarkingAsReadRef = useRef(false);

  // Get current user
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
      }
    };
    getCurrentUser();
  }, []);

  // Load conversations
  useEffect(() => {
    loadConversations();
  }, []);

  // Subscribe to conversation updates
  useEffect(() => {
    const channel = subscribeToConversations(() => {
      loadConversations();
    });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Load messages when conversation is selected
  useEffect(() => {
    if (selectedConversationId) {
      loadMessages(selectedConversationId);
      
      // Debounce mark as read to prevent lock conflicts
      if (markAsReadTimeoutRef.current) {
        clearTimeout(markAsReadTimeoutRef.current);
      }
      
      markAsReadTimeoutRef.current = setTimeout(() => {
        if (!isMarkingAsReadRef.current) {
          isMarkingAsReadRef.current = true;
          markMessagesAsRead(selectedConversationId)
            .catch((err) => {
              if (!err.message?.includes('Lock')) {
                console.error('Error marking messages as read:', err);
              }
            })
            .finally(() => {
              isMarkingAsReadRef.current = false;
            });
        }
      }, 500);
    }
    
    return () => {
      if (markAsReadTimeoutRef.current) {
        clearTimeout(markAsReadTimeoutRef.current);
      }
    };
  }, [selectedConversationId]);

  // Subscribe to new messages in selected conversation
  useEffect(() => {
    if (!selectedConversationId || !currentUserId) return;

    const channel = subscribeToMessages(selectedConversationId, (newMsg) => {
      setMessages(prev => [...prev, newMsg]);
      
      // Mark as read if not sent by current user (debounced)
      if (newMsg.sender_id !== currentUserId && !isMarkingAsReadRef.current) {
        if (markAsReadTimeoutRef.current) {
          clearTimeout(markAsReadTimeoutRef.current);
        }
        
        markAsReadTimeoutRef.current = setTimeout(() => {
          isMarkingAsReadRef.current = true;
          markMessagesAsRead(selectedConversationId)
            .catch((err) => {
              // Silently ignore lock errors
              if (!err.message?.includes('Lock') && !err.message?.includes('AbortError')) {
                console.error('Error marking messages as read:', err);
              }
            })
            .finally(() => {
              isMarkingAsReadRef.current = false;
            });
        }, 1000);
      }
      
      // Refresh conversations to update last message
      loadConversations();
    });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedConversationId, currentUserId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadConversations = async () => {
    try {
      setIsLoadingConversations(true);
      const { data, error } = await getUserConversations();
      
      if (error) {
        console.error('Error loading conversations:', error);
        toast.error('Failed to load conversations');
      } else if (data) {
        setConversations(data);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setIsLoadingConversations(false);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      setIsLoadingMessages(true);
      const { data, error } = await getConversationMessages(conversationId);
      
      if (error) {
        console.error('Error loading messages:', error);
        toast.error('Failed to load messages');
      } else if (data) {
        setMessages(data);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversationId) return;

    try {
      setIsSending(true);
      const { data, error } = await sendMessage(selectedConversationId, newMessage.trim());
      
      if (error) {
        console.error('Error sending message:', error);
        toast.error('Failed to send message');
      } else if (data) {
        // Don't manually add the message here - let the subscription handle it
        // This prevents duplicate messages
        setNewMessage('');
        
        // Refresh conversations to update last message
        loadConversations();
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversationId(conversationId);
    setMessages([]);
  };

  const selectedConv = conversations.find(c => c.id === selectedConversationId);

  const filteredConversations = conversations.filter(conv => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    return (
      conv.other_user.full_name.toLowerCase().includes(searchLower) ||
      conv.last_message?.toLowerCase().includes(searchLower) ||
      conv.listing?.product_name.toLowerCase().includes(searchLower)
    );
  });

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    if (days < 7) return date.toLocaleDateString('en-US', { weekday: 'short', hour: 'numeric', minute: '2-digit' });
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getAvatarFallback = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Check if message is a single emoji or only emojis (WhatsApp style)
  const isEmojiOnly = (text: string): boolean => {
    // Remove all emojis and check if anything is left
    const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F018}-\u{1F270}\u{238C}-\u{2454}\u{20D0}-\u{20FF}\u{FE0F}\u{1F004}\u{1F0CF}\u{1F18E}\u{3030}\u{2B50}\u{2B55}\u{2934}\u{2935}\u{2B05}-\u{2B07}\u{2B1B}\u{2B1C}\u{3297}\u{3299}\u{303D}\u{00A9}\u{00AE}\u{2122}\u{23F0}\u{23F3}\u{2602}\u{2603}\u{2604}\u{260E}\u{2611}\u{2614}\u{2615}\u{2618}\u{261D}\u{2620}\u{2622}\u{2623}\u{2626}\u{262A}\u{262E}\u{262F}\u{2638}-\u{263A}\u{2648}-\u{2653}\u{2660}\u{2663}\u{2665}\u{2666}\u{2668}\u{267B}\u{267F}\u{2692}-\u{2697}\u{2699}\u{269B}\u{269C}\u{26A0}\u{26A1}\u{26AA}\u{26AB}\u{26B0}\u{26B1}\u{26BD}\u{26BE}\u{26C4}\u{26C5}\u{26C8}\u{26CE}\u{26CF}\u{26D1}\u{26D3}\u{26D4}\u{26E9}\u{26EA}\u{26F0}-\u{26F5}\u{26F7}-\u{26FA}\u{26FD}]/gu;
    const textWithoutEmojis = text.replace(emojiRegex, '').trim();
    const emojiCount = (text.match(emojiRegex) || []).length;
    
    // Return true if text is only emojis and has 1-3 emojis
    return textWithoutEmojis === '' && emojiCount > 0 && emojiCount <= 3;
  };

  const loadAllUsers = async () => {
    try {
      setIsLoadingUsers(true);
      const { data, error } = await getAllUsers();
      
      if (error) {
        console.error('Error loading users:', error);
        toast.error('Failed to load users');
      } else if (data) {
        setAllUsers(data);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const filteredUsers = allUsers.filter(user => {
    if (!userSearchQuery) return true;
    const searchLower = userSearchQuery.toLowerCase();
    return (
      user.full_name.toLowerCase().includes(searchLower) ||
      user.business_name?.toLowerCase().includes(searchLower)
    );
  });

  const handleStartNewConversation = async (userId: string) => {
    if (!userId) return;

    try {
      const { data, error } = await getOrCreateConversation(userId);
      
      if (error) {
        console.error('Error creating conversation:', error);
        toast.error('Failed to create conversation');
      } else if (data) {
        setSelectedConversationId(data.id);
        setMessages([]);
        setShowNewMessageModal(false);
        
        // Refresh conversations to update last message
        loadConversations();
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast.error('Failed to create conversation');
    }
  };

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log('📎 File selected:', {
      name: file.name,
      size: file.size,
      type: file.type,
      sizeMB: (file.size / 1024 / 1024).toFixed(2) + 'MB'
    });

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      console.error('❌ File too large:', (file.size / 1024 / 1024).toFixed(2) + 'MB');
      toast.error('File size must be less than 10MB');
      return;
    }

    if (!selectedConversationId) {
      console.error('❌ No conversation selected');
      toast.error('Please select a conversation first');
      return;
    }

    console.log('✅ Validation passed, starting upload...');

    try {
      setIsSending(true);
      const loadingToast = toast.loading('Uploading file...');

      console.log('📤 Calling uploadMessageAttachment...');
      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await uploadMessageAttachment(file);
      
      console.log('📥 Upload response:', { uploadData, uploadError });
      
      toast.dismiss(loadingToast);
      
      if (uploadError) {
        console.error('❌ Upload error:', uploadError);
        toast.error(uploadError.message || 'Failed to upload file');
        return;
      }

      if (!uploadData) {
        console.error('❌ No upload data returned');
        toast.error('Failed to upload file - no data returned');
        return;
      }

      console.log('✅ File uploaded successfully, sending message...');

      // Send message with attachment
      const { data: messageData, error: messageError } = await sendMessage(
        selectedConversationId,
        file.name, // Use filename as message content
        uploadData
      );

      if (messageError) {
        console.error('❌ Error sending message with attachment:', messageError);
        toast.error('Failed to send message with attachment');
        return;
      }

      console.log('✅ Message sent successfully:', messageData);
      toast.success('File uploaded successfully!');
      
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Refresh conversations to update last message
      loadConversations();
    } catch (error) {
      console.error('❌ Unexpected error:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsSending(false);
    }
  };

  const handleEmojiClick = (emoji: string) => {
    setNewMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  // Function to properly download files
  const downloadFile = async (url: string, filename: string) => {
    try {
      console.log('📥 Downloading file:', { url, filename });
      
      // Method 1: Try direct window.open (works for most cases)
      window.open(url, '_blank');
      
      console.log('✅ File opened in new tab');
      toast.success('Opening file...');
    } catch (error) {
      console.error('❌ Download error:', error);
      toast.error('Failed to open file. Please try again.');
    }
  };

  // Common emojis
  const commonEmojis = ['😊', '👍', '❤️', '😂', '🎉', '🔥', '✅', '🙏', '💯', '👏', '🌟', '💪', '🎯', '✨', '😍', '🤝', '📦', '🚚', '🌾', '🥕', '🍅', '🌽'];

  return (
    <div className="h-full flex bg-white overflow-hidden">
      {/* Conversation List - Left Side */}
      <div className={`
        ${selectedConversationId ? 'hidden md:flex' : 'flex'} 
        w-full md:w-[360px] lg:w-[400px] border-r border-gray-200 flex-col bg-gray-50
      `}>
        {/* Search Bar */}
        <div className="p-4 bg-white border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2 rounded-lg bg-gray-50 border-0 focus:bg-white focus:ring-1 focus:ring-gray-300 focus:outline-none font-['Geologica:Regular',sans-serif] text-sm text-gray-700 placeholder:text-gray-400"
              />
              <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
            <button
              onClick={() => {
                setShowNewMessageModal(true);
                loadAllUsers();
              }}
              className="p-2 bg-[#64b900] text-white rounded-lg hover:bg-[#559900] transition-colors flex-shrink-0"
              title="New Message"
            >
              <UserPlus className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto bg-white">
          {isLoadingConversations ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 text-[#64b900] animate-spin" />
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <p className="font-['Geologica:Regular',sans-serif] text-sm text-gray-600">
                {searchQuery ? 'No conversations found' : 'No messages yet'}
              </p>
              <p className="font-['Geologica:Regular',sans-serif] text-xs text-gray-500 mt-1">
                {searchQuery ? 'Try a different search term' : 'Start chatting with buyers and sellers'}
              </p>
            </div>
          ) : (
            filteredConversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => handleSelectConversation(conv.id)}
                className={`w-full px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors text-left ${
                  selectedConversationId === conv.id ? 'bg-gray-50' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    {conv.other_user.avatar_url ? (
                      <img 
                        src={conv.other_user.avatar_url} 
                        alt={conv.other_user.full_name} 
                        className="w-11 h-11 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-[#64b900]/10 flex items-center justify-center">
                        <span className="font-['Geologica:SemiBold',sans-serif] text-[#64b900] text-lg">
                          {getAvatarFallback(conv.other_user.full_name)}
                        </span>
                      </div>
                    )}
                    {/* Online indicator could be added here if needed */}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-0.5">
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-['Geologica:Regular',sans-serif] text-sm text-gray-900 font-medium truncate">
                          {conv.other_user.full_name}
                        </h4>
                        {conv.other_user.kyc_status === 'verified' && (
                          <BadgeCheck className="w-3.5 h-3.5 text-[#64b900] flex-shrink-0" fill="#64b900" />
                        )}
                      </div>
                      <span className="font-['Geologica:Regular',sans-serif] text-xs text-gray-500 flex-shrink-0 ml-2">
                        {conv.last_message_at && formatMessageTime(conv.last_message_at)}
                      </span>
                    </div>
                    {conv.listing && (
                      <p className="font-['Geologica:Regular',sans-serif] text-xs text-[#64b900] mb-0.5">
                        Re: {conv.listing.product_name}
                      </p>
                    )}
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-['Geologica:Regular',sans-serif] text-xs text-gray-500 truncate flex-1">
                        {conv.last_message || ''}
                      </p>
                      {conv.unread_count > 0 && (
                        <div className="flex items-center justify-center min-w-[18px] h-[18px] px-1.5 bg-[#64b900] rounded-full flex-shrink-0">
                          <span className="font-['Geologica:SemiBold',sans-serif] text-white text-[10px]">
                            {conv.unread_count > 9 ? '9+' : conv.unread_count}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Window - Right Side */}
      {selectedConv ? (
        <div className="flex-1 flex flex-col bg-white">
          {/* Chat Header */}
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200 bg-white">
            <div className="flex items-center gap-3">
              {/* Back button for mobile */}
              <button
                onClick={() => setSelectedConversationId(null)}
                className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-700" />
              </button>
              
              <div className="relative">
                {selectedConv.other_user.avatar_url ? (
                  <img 
                    src={selectedConv.other_user.avatar_url} 
                    alt={selectedConv.other_user.full_name} 
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-[#64b900]/10 flex items-center justify-center">
                    <span className="font-['Geologica:SemiBold',sans-serif] text-[#64b900] text-xl">
                      {getAvatarFallback(selectedConv.other_user.full_name)}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-['Geologica:Regular',sans-serif] text-base text-gray-900 font-semibold truncate">
                    {selectedConv.other_user.full_name}
                  </h3>
                  {selectedConv.other_user.kyc_status === 'verified' && (
                    <BadgeCheck className="w-4 h-4 text-[#64b900] flex-shrink-0" fill="#64b900" />
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {selectedConv.other_user.business_name && (
                    <span className="font-['Geologica:Regular',sans-serif] text-xs text-gray-500">
                      {selectedConv.other_user.business_name}
                    </span>
                  )}
                  {selectedConv.listing && (
                    <>
                      {selectedConv.other_user.business_name && (
                        <span className="text-gray-400">•</span>
                      )}
                      <span className="font-['Geologica:Regular',sans-serif] text-xs text-[#64b900]">
                        {selectedConv.listing.product_name}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
            {isLoadingMessages ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 text-[#64b900] animate-spin" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                  <Send className="w-8 h-8 text-gray-400" />
                </div>
                <p className="font-['Geologica:Regular',sans-serif] text-sm text-gray-600">
                  No messages yet
                </p>
                <p className="font-['Geologica:Regular',sans-serif] text-xs text-gray-500 mt-1">
                  Start the conversation!
                </p>
              </div>
            ) : (
              <>
                {messages.map((msg) => {
                  const isCurrentUser = msg.sender_id === currentUserId;
                  const hasAttachment = msg.attachments && msg.attachments.url;
                  const isOnlyEmoji = !hasAttachment && isEmojiOnly(msg.content);
                  
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                    >
                      {!isCurrentUser && selectedConv.other_user.avatar_url ? (
                        <img 
                          src={selectedConv.other_user.avatar_url} 
                          alt={selectedConv.other_user.full_name} 
                          className="w-8 h-8 rounded-full object-cover mr-2 flex-shrink-0"
                        />
                      ) : !isCurrentUser ? (
                        <div className="w-8 h-8 rounded-full bg-[#64b900]/10 flex items-center justify-center mr-2 flex-shrink-0">
                          <span className="font-['Geologica:SemiBold',sans-serif] text-[#64b900] text-xs">
                            {getAvatarFallback(selectedConv.other_user.full_name)}
                          </span>
                        </div>
                      ) : null}
                      <div className="flex flex-col max-w-md">
                        {isOnlyEmoji ? (
                          // Emoji-only message (WhatsApp style - large, no background)
                          <div className="text-6xl leading-none py-1">
                            {msg.content}
                          </div>
                        ) : (
                          // Regular message
                          <div
                            className={`px-4 py-2.5 ${
                              isCurrentUser
                                ? 'bg-[#e8f5d6] text-gray-800 rounded-2xl rounded-br-md'
                                : 'bg-white text-gray-800 rounded-2xl rounded-bl-md border border-gray-200'
                            }`}
                          >
                            {hasAttachment && (
                              <div className="mb-2">
                                {msg.attachments.type.startsWith('image/') ? (
                                  // Image preview - opens in new tab on click
                                  <a href={msg.attachments.url} target="_blank" rel="noopener noreferrer">
                                    <img 
                                      src={msg.attachments.url} 
                                      alt={msg.attachments.name} 
                                      className="max-w-full rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                                      style={{ maxHeight: '300px' }}
                                      onError={(e) => {
                                        console.error('❌ Image load error for:', msg.attachments.url);
                                        // Hide broken image and show file download instead
                                        const parent = e.currentTarget.parentElement;
                                        if (parent) {
                                          parent.innerHTML = `
                                            <div class="flex items-center gap-2 p-3 bg-gray-100 rounded-lg">
                                              <div class="p-2 bg-white rounded-lg">
                                                <svg class="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                                </svg>
                                              </div>
                                              <div class="flex-1">
                                                <p class="text-sm text-gray-900">${msg.attachments.name}</p>
                                                <p class="text-xs text-red-600">Failed to load image</p>
                                              </div>
                                            </div>
                                          `;
                                        }
                                      }}
                                    />
                                  </a>
                                ) : msg.attachments.type === 'application/pdf' ? (
                                  // PDF - show inline preview with download option
                                  <div className="bg-gray-100 rounded-lg overflow-hidden">
                                    <div className="flex items-center justify-between p-3 bg-gray-200">
                                      <div className="flex items-center gap-2">
                                        <FileText className="w-5 h-5 text-red-600" />
                                        <div>
                                          <p className="font-['Geologica:Medium',sans-serif] text-sm text-gray-900">
                                            {msg.attachments.name}
                                          </p>
                                          <p className="font-['Geologica:Regular',sans-serif] text-xs text-gray-500">
                                            {(msg.attachments.size / 1024).toFixed(1)} KB • PDF Document
                                          </p>
                                        </div>
                                      </div>
                                      <button 
                                        onClick={() => downloadFile(msg.attachments.url, msg.attachments.name)}
                                        className="p-2 bg-[#64b900] text-white rounded-lg hover:bg-[#559900] transition-colors"
                                        title="Download PDF"
                                      >
                                        <Download className="w-4 h-4" />
                                      </button>
                                    </div>
                                    {/* PDF preview iframe */}
                                    <iframe 
                                      src={msg.attachments.url}
                                      className="w-full h-64 border-0"
                                      title={msg.attachments.name}
                                      onError={(e) => {
                                        console.error('❌ PDF preview error for:', msg.attachments.url);
                                        // Hide iframe on error
                                        e.currentTarget.style.display = 'none';
                                      }}
                                    />
                                  </div>
                                ) : (
                                  // Other files - download button
                                  <button 
                                    onClick={() => downloadFile(msg.attachments.url, msg.attachments.name)}
                                    className="flex items-center gap-2 p-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer w-full text-left"
                                  >
                                    <div className="p-2 bg-white rounded-lg">
                                      <FileText className="w-5 h-5 text-[#64b900]" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="font-['Geologica:Medium',sans-serif] text-sm text-gray-900 truncate">
                                        {msg.attachments.name}
                                      </p>
                                      <p className="font-['Geologica:Regular',sans-serif] text-xs text-gray-500">
                                        {(msg.attachments.size / 1024).toFixed(1)} KB • Click to download
                                      </p>
                                    </div>
                                    <Download className="w-4 h-4 text-gray-500 flex-shrink-0" />
                                  </button>
                                )}
                              </div>
                            )}
                            <p className="font-['Geologica:Regular',sans-serif] text-sm whitespace-pre-wrap leading-relaxed">
                              {msg.content}
                            </p>
                          </div>
                        )}
                        <div className={`flex items-center gap-1 mt-1 px-1 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                          <span className="font-['Geologica:Regular',sans-serif] text-xs text-gray-400">
                            {formatMessageTime(msg.created_at)}
                          </span>
                          {isCurrentUser && msg.is_read && (
                            <CheckCheck className="w-3.5 h-3.5 text-[#64b900]" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Message Input */}
          <div className="px-3 sm:px-6 py-3 sm:py-4 border-t border-gray-200 bg-white">
            <div className="flex items-center gap-1 sm:gap-2 relative">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Type your message..."
                disabled={isSending}
                className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg bg-gray-50 border-0 focus:bg-white focus:ring-1 focus:ring-gray-300 focus:outline-none font-['Geologica:Regular',sans-serif] text-sm placeholder:text-gray-400 disabled:opacity-50"
              />
              
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,application/pdf,.doc,.docx"
                onChange={handleFileChange}
                className="hidden"
              />
              
              {/* Attachment button */}
              <button 
                onClick={handleFileUpload}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500"
                title="Attach file"
              >
                <Paperclip className="w-5 h-5" />
              </button>
              
              {/* Emoji button */}
              <div className="relative hidden sm:block">
                <button 
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500"
                  title="Add emoji"
                >
                  <Smile className="w-5 h-5" />
                </button>
                
                {/* Emoji Picker Popup */}
                {showEmojiPicker && (
                  <div className="absolute bottom-full right-0 mb-2 bg-white rounded-lg shadow-lg border border-gray-200 p-3 w-64 z-50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-['Geologica:SemiBold',sans-serif] text-xs text-gray-700">Pick an emoji</span>
                      <button 
                        onClick={() => setShowEmojiPicker(false)}
                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                      >
                        <X className="w-3 h-3 text-gray-500" />
                      </button>
                    </div>
                    <div className="grid grid-cols-8 gap-1">
                      {commonEmojis.map((emoji, index) => (
                        <button
                          key={index}
                          onClick={() => handleEmojiClick(emoji)}
                          className="text-xl p-1.5 hover:bg-gray-100 rounded transition-colors"
                          title={emoji}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <button 
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || isSending}
                className="p-2 sm:p-2.5 bg-[#64b900] text-white rounded-lg hover:bg-[#559900] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Send className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="font-['Geologica:SemiBold',sans-serif] text-lg text-gray-900 mb-2">
              Select a conversation
            </h3>
            <p className="font-['Geologica:Regular',sans-serif] text-sm text-gray-500">
              Choose a conversation from the left to start messaging
            </p>
          </div>
        </div>
      )}

      {/* New Message Modal */}
      {showNewMessageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[400px] max-w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-['Geologica:SemiBold',sans-serif] text-lg text-gray-900">
                New Message
              </h3>
              <button
                onClick={() => setShowNewMessageModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2 rounded-lg bg-gray-50 border-0 focus:bg-white focus:ring-1 focus:ring-gray-300 focus:outline-none font-['Geologica:Regular',sans-serif] text-sm text-gray-700 placeholder:text-gray-400"
              />
            </div>
            <div className="mt-4 max-h-[200px] overflow-y-auto">
              {isLoadingUsers ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 text-[#64b900] animate-spin" />
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                    <Search className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="font-['Geologica:Regular',sans-serif] text-sm text-gray-600">
                    No users found
                  </p>
                  <p className="font-['Geologica:Regular',sans-serif] text-xs text-gray-500 mt-1">
                    Try a different search term
                  </p>
                </div>
              ) : (
                filteredUsers.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => handleStartNewConversation(user.id)}
                    className="w-full px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="flex items-start gap-3">
                      {/* Avatar */}
                      <div className="relative flex-shrink-0">
                        {user.avatar_url ? (
                          <img 
                            src={user.avatar_url} 
                            alt={user.full_name} 
                            className="w-11 h-11 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-11 h-11 rounded-full bg-[#64b900]/10 flex items-center justify-center">
                            <span className="font-['Geologica:SemiBold',sans-serif] text-[#64b900] text-lg">
                              {getAvatarFallback(user.full_name)}
                            </span>
                          </div>
                        )}
                        {/* Online indicator could be added here if needed */}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-0.5">
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-['Geologica:Regular',sans-serif] text-sm text-gray-900 font-medium truncate">
                              {user.full_name}
                            </h4>
                            {user.kyc_status === 'verified' && (
                              <BadgeCheck className="w-3.5 h-3.5 text-[#64b900] flex-shrink-0" fill="#64b900" />
                            )}
                          </div>
                        </div>
                        {user.business_name && (
                          <p className="font-['Geologica:Regular',sans-serif] text-xs text-gray-500 mb-0.5">
                            {user.business_name}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
            <div className="mt-4">
              <button
                onClick={() => loadAllUsers()}
                className="w-full px-4 py-2 bg-[#64b900] text-white rounded-lg hover:bg-[#559900] transition-colors"
              >
                Load All Users
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Storage Setup Modal */}
      {showStorageSetup && (
        <StorageSetupModal
          onClose={() => setShowStorageSetup(false)}
          onSetupComplete={() => {
            setShowStorageSetup(false);
            toast.success('Storage configured successfully!');
          }}
        />
      )}
    </div>
  );
}