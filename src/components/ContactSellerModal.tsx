import React, { useState } from 'react';
import { X, Send, MessageCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

interface ContactSellerModalProps {
  sellerId: string;
  sellerName: string;
  productTitle: string;
  productId: string;
  onClose: () => void;
}

export const ContactSellerModal: React.FC<ContactSellerModalProps> = ({
  sellerId,
  sellerName,
  productTitle,
  productId,
  onClose,
}) => {
  const { user } = useAuth();
  const [subject, setSubject] = useState(`Inquiry about: ${productTitle}`);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error('Please login to contact the seller');
      return;
    }

    if (!message.trim()) {
      toast.error('Please enter a message');
      return;
    }

    setSending(true);

    try {
      const { error } = await supabase.from('messages').insert({
        sender_id: user.id,
        receiver_id: sellerId,
        subject: subject,
        content: message,
        thread_id: null, // Start new conversation
      });

      if (error) throw error;

      toast.success('Message sent successfully!');
      onClose();
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast.error(error.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <MessageCircle className="h-6 w-6 text-indigo-600" />
            <h3 className="text-xl font-bold text-gray-900">Contact Seller</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">Contacting:</p>
            <p className="font-medium text-gray-900">{sellerName}</p>
            <p className="text-sm text-gray-500">About: {productTitle}</p>
          </div>

          {/* Subject */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Enter subject..."
            />
          </div>

          {/* Message */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message *
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              placeholder="Write your message to the seller..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              required
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={sending || !message.trim()}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {sending ? (
                'Sending...'
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Send Message
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};