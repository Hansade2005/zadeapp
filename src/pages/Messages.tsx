import React, { useState, useEffect, useRef } from 'react';
import { Search, MessageCircle, Send, Trash2, Download, ArrowLeft, Users, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import Header from '../components/Header';
import Footer from '../components/Footer';
import MobileBottomNav from '../components/MobileBottomNav';

interface User {
  id: string;
  full_name: string;
  email: string;
  user_type: string;
  location?: string;
  created_at: string;
}

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
  sender?: User;
  receiver?: User;
}

interface Conversation {
  user: User;
  lastMessage: Message | null;
  unreadCount: number;
}

const Messages: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [userSearchResults, setUserSearchResults] = useState<User[]>([]);
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showSidebar, setShowSidebar] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (currentUser) {
      fetchConversations();
    }
  }, [currentUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.user-search-container')) {
        setShowUserSearch(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchConversations = async () => {
    try {
      // Fetch messages where current user is sender or receiver
      const { data: sentMessages, error: sentError } = await supabase
        .from('messages')
        .select(`
          *,
          receiver:users!messages_receiver_id_fkey(*)
        `)
        .eq('sender_id', currentUser?.id)
        .order('created_at', { ascending: false });

      const { data: receivedMessages, error: receivedError } = await supabase
        .from('messages')
        .select(`
          *,
          sender:users!messages_sender_id_fkey(*)
        `)
        .eq('receiver_id', currentUser?.id)
        .order('created_at', { ascending: false });

      if (sentError || receivedError) throw sentError || receivedError;

      // Combine and group by conversation
      const allMessages = [...(sentMessages || []), ...(receivedMessages || [])];
      const conversationMap = new Map<string, Conversation>();

      allMessages.forEach(message => {
        const otherUserId = message.sender_id === currentUser?.id
          ? message.receiver_id
          : message.sender_id;
        const otherUser = message.sender_id === currentUser?.id
          ? message.receiver
          : message.sender;

        if (!conversationMap.has(otherUserId)) {
          conversationMap.set(otherUserId, {
            user: otherUser as User,
            lastMessage: message,
            unreadCount: message.receiver_id === currentUser?.id && !message.is_read ? 1 : 0
          });
        } else {
          const existing = conversationMap.get(otherUserId)!;
          if (new Date(message.created_at) > new Date(existing.lastMessage?.created_at || '')) {
            existing.lastMessage = message;
          }
          if (message.receiver_id === currentUser?.id && !message.is_read) {
            existing.unreadCount++;
          }
        }
      });

      setConversations(Array.from(conversationMap.values()).sort((a, b) =>
        new Date(b.lastMessage?.created_at || '').getTime() - new Date(a.lastMessage?.created_at || '').getTime()
      ));
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectConversation = async (userId: string) => {
    setSelectedConversation(userId);
    setShowSidebar(false); // Hide sidebar on mobile when selecting conversation

    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:users!messages_sender_id_fkey(*),
          receiver:users!messages_receiver_id_fkey(*)
        `)
        .or(`and(sender_id.eq.${currentUser?.id},receiver_id.eq.${userId}),and(sender_id.eq.${userId},receiver_id.eq.${currentUser?.id})`)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);

      // Mark messages as read
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('receiver_id', currentUser?.id)
        .eq('sender_id', userId);

      // Update conversation unread count
      setConversations(prev => prev.map(conv =>
        conv.user.id === userId ? { ...conv, unreadCount: 0 } : conv
      ));

    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: currentUser?.id,
          receiver_id: selectedConversation,
          subject: 'Message', // Default subject for chat messages
          content: newMessage.trim(),
          is_read: false
        });

      if (error) throw error;

      setNewMessage('');
      // Refresh messages
      await selectConversation(selectedConversation);
      await fetchConversations();

    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    }
  };

  const searchUsers = async (query: string) => {
    if (!query.trim()) {
      setUserSearchResults([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, full_name, email, user_type, location')
        .neq('id', currentUser?.id) // Exclude current user
        .or(`full_name.ilike.%${query}%,email.ilike.%${query}%`)
        .limit(10);

      if (error) throw error;
      setUserSearchResults(data || []);
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };

  const startConversation = async (userId: string) => {
    setSelectedConversation(userId);
    setShowUserSearch(false);
    setUserSearchTerm('');
    setUserSearchResults([]);
    await selectConversation(userId);
  };

  const clearConversation = async () => {
    if (!selectedConversation || !window.confirm('Are you sure you want to clear this conversation? This action cannot be undone.')) {
      return;
    }

    try {
      // Delete all messages between current user and selected user
      const { error } = await supabase
        .from('messages')
        .delete()
        .or(`and(sender_id.eq.${currentUser?.id},receiver_id.eq.${selectedConversation}),and(sender_id.eq.${selectedConversation},receiver_id.eq.${currentUser?.id})`);

      if (error) throw error;

      setMessages([]);
      setSelectedConversation(null);
      await fetchConversations();
      alert('Conversation cleared successfully.');
    } catch (error) {
      console.error('Error clearing conversation:', error);
      alert('Failed to clear conversation. Please try again.');
    }
  };

  const exportConversation = () => {
    if (!selectedConversation || messages.length === 0) return;

    const conversationUser = conversations.find(c => c.user.id === selectedConversation)?.user;
    const csvContent = [
      ['Date', 'Sender', 'Message'],
      ...messages.map(msg => [
        new Date(msg.created_at).toLocaleString(),
        msg.sender_id === currentUser?.id ? 'You' : (conversationUser?.full_name || 'Unknown'),
        msg.content
      ])
    ];

    const csvString = csvContent.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `conversation_${conversationUser?.full_name || 'unknown'}_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const filteredConversations = conversations.filter(conversation =>
    conversation.user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conversation.user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="pt-20 pb-16 h-screen flex">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="bg-white rounded-lg shadow-md overflow-hidden h-[calc(100vh-6rem)] flex">
            {/* Sidebar - Conversations List */}
            <div className={`${showSidebar ? 'w-full md:w-1/3' : 'hidden md:block md:w-1/3'} border-r border-gray-200 flex flex-col bg-gray-50`}>
              {/* Header */}
              <div className="p-4 border-b border-gray-200 bg-white">
                <div className="flex items-center justify-between mb-4">
                  <h1 className="text-xl font-bold text-gray-900">Messages</h1>
                </div>

                {/* User Search */}
                <div className="relative user-search-container">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search users to message..."
                    value={userSearchTerm}
                    onChange={(e) => {
                      setUserSearchTerm(e.target.value);
                      setShowUserSearch(true);
                    }}
                    onFocus={() => setShowUserSearch(true)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-100 border-0 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                  />
                  {userSearchTerm && (
                    <button
                      onClick={() => {
                        setUserSearchTerm('');
                        setUserSearchResults([]);
                        setShowUserSearch(false);
                      }}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* User Search Results */}
                {showUserSearch && userSearchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                    {userSearchResults.map((user) => (
                      <div
                        key={user.id}
                        onClick={() => startConversation(user.id)}
                        className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-indigo-600">
                              {user.full_name?.[0]?.toUpperCase() || 'U'}
                            </span>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{user.full_name}</p>
                            <p className="text-xs text-gray-500 capitalize">{user.user_type}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Conversations List */}
              <div className="flex-1 overflow-y-auto">
                {filteredConversations.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-sm">No conversations yet</p>
                    <p className="text-xs mt-1">Start chatting with sellers, buyers, or other users</p>
                  </div>
                ) : (
                  filteredConversations.map((conversation) => (
                    <div
                      key={conversation.user.id}
                      onClick={() => selectConversation(conversation.user.id)}
                      className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-white transition-colors ${
                        selectedConversation === conversation.user.id ? 'bg-white border-r-2 border-r-indigo-600' : 'bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-indigo-600">
                              {conversation.user.full_name?.[0]?.toUpperCase() || 'U'}
                            </span>
                          </div>
                          {conversation.unreadCount > 0 && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                              <span className="text-xs text-white font-medium">
                                {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {conversation.user.full_name || conversation.user.email}
                            </p>
                            <span className="text-xs text-gray-500">
                              {conversation.lastMessage ? formatTime(conversation.lastMessage.created_at) : ''}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 truncate">
                            {conversation.lastMessage?.content || 'No messages yet'}
                          </p>
                          <p className="text-xs text-gray-400 capitalize mt-1">
                            {conversation.user.user_type}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Chat Area */}
            <div className={`${selectedConversation && !showSidebar ? 'flex' : 'hidden md:flex'} flex-1 flex flex-col bg-white`}>
              {selectedConversation ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => setShowSidebar(true)}
                        className="md:hidden p-2 hover:bg-gray-200 rounded-full"
                      >
                        <ArrowLeft className="w-5 h-5" />
                      </button>
                      <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-indigo-600">
                          {conversations.find(c => c.user.id === selectedConversation)?.user.full_name?.[0]?.toUpperCase() || 'U'}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {conversations.find(c => c.user.id === selectedConversation)?.user.full_name || 'User'}
                        </p>
                        <p className="text-xs text-gray-500 capitalize">
                          {conversations.find(c => c.user.id === selectedConversation)?.user.user_type}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={exportConversation}
                        disabled={messages.length === 0}
                        className="p-2 hover:bg-gray-200 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Export conversation"
                      >
                        <Download className="w-5 h-5 text-gray-600" />
                      </button>
                      <button
                        onClick={clearConversation}
                        className="p-2 hover:bg-red-200 rounded-full"
                        title="Clear conversation"
                      >
                        <Trash2 className="w-5 h-5 text-red-600" />
                      </button>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 p-4 overflow-y-auto bg-gray-50 pb-20 md:pb-4">
                    <div className="space-y-4">
                      {messages.map((message, index) => {
                        const isCurrentUser = message.sender_id === currentUser?.id;
                        const showAvatar = !isCurrentUser && (index === 0 || messages[index - 1].sender_id !== message.sender_id);
                        const showTime = index === messages.length - 1 ||
                          new Date(message.created_at).getTime() - new Date(messages[index + 1].created_at).getTime() > 300000; // 5 minutes

                        return (
                          <div
                            key={message.id}
                            className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-4`}
                          >
                            {!isCurrentUser && showAvatar && (
                              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                                <span className="text-xs font-medium text-indigo-600">
                                  {message.sender?.full_name?.[0]?.toUpperCase() || 'U'}
                                </span>
                              </div>
                            )}
                            {!isCurrentUser && !showAvatar && <div className="w-8 mr-2"></div>}

                            <div className={`max-w-xs lg:max-w-md ${isCurrentUser ? 'order-1' : 'order-2'}`}>
                              <div
                                className={`px-4 py-2 rounded-2xl ${
                                  isCurrentUser
                                    ? 'bg-indigo-600 text-white rounded-br-md'
                                    : 'bg-white text-gray-900 rounded-bl-md shadow-sm'
                                }`}
                              >
                                <p className="text-sm">{message.content}</p>
                              </div>
                              {showTime && (
                                <p className={`text-xs text-gray-500 mt-1 ${isCurrentUser ? 'text-right' : 'text-left'}`}>
                                  {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>
                  </div>

                  {/* Message Input - Desktop */}
                  <div className="hidden md:block p-4 border-t border-gray-200 bg-white">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        placeholder="Type a message..."
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                      <button
                        onClick={sendMessage}
                        disabled={!newMessage.trim()}
                        className="p-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <Send className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500 bg-gray-50">
                  <div className="text-center">
                    <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium">Select a conversation</p>
                    <p className="text-sm mt-1">Choose someone to start chatting with</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Message Input - Mobile Only */}
      {selectedConversation && (
        <div className="md:hidden fixed bottom-16 left-0 right-0 bg-white border-t border-gray-200 p-4 z-60">
          <div className="flex space-x-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Type a message..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <button
              onClick={sendMessage}
              disabled={!newMessage.trim()}
              className="p-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      <div className="md:hidden">
        <Footer />
      </div>
      <MobileBottomNav />
    </div>
  );
};

export default Messages;