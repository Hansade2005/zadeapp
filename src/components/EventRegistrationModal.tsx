import React, { useState } from 'react';
import { X, Calendar, MapPin, Users, CreditCard, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { toast } from 'react-toastify';

interface EventRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  eventPrice: number;
  maxAttendees: number;
  currentAttendees: number;
  onRegistrationSuccess?: () => void;
}

const EventRegistrationModal: React.FC<EventRegistrationModalProps> = ({
  isOpen,
  onClose,
  eventId,
  eventTitle,
  eventDate,
  eventTime,
  eventLocation,
  eventPrice,
  maxAttendees,
  currentAttendees,
  onRegistrationSuccess
}) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    specialRequests: '',
    agreeToTerms: false
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const isFree = eventPrice === 0;
  const spotsLeft = maxAttendees - currentAttendees;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.agreeToTerms) return;

    setSubmitting(true);
    try {
      // Check if user already registered for this event
      const { data: existingRegistration } = await supabase
        .from('event_registrations')
        .select('id')
        .eq('event_id', eventId)
        .eq('attendee_id', user.id)
        .single();

      if (existingRegistration) {
        toast.error('You have already registered for this event.');
        return;
      }

      // Check if event is full
      if (spotsLeft <= 0) {
        toast.error('This event is sold out.');
        return;
      }

      // Register for the event
      const { error } = await supabase
        .from('event_registrations')
        .insert({
          event_id: eventId,
          attendee_id: user.id,
          full_name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          special_requests: formData.specialRequests,
          registration_date: new Date().toISOString(),
          status: isFree ? 'confirmed' : 'pending_payment',
          payment_status: isFree ? 'paid' : 'pending'
        });

      if (error) throw error;

      // Update event attendee count
      const { error: updateError } = await supabase
        .from('events')
        .update({ current_attendees: currentAttendees + 1 })
        .eq('id', eventId);

      if (updateError) {
        console.error('Error updating attendee count:', updateError);
        // Don't throw here as registration was successful
      }

      setSubmitted(true);
      toast.success('Registration successful!');

      onRegistrationSuccess?.();

      // Auto close after 3 seconds
      setTimeout(() => {
        onClose();
        setSubmitted(false);
        // Reset form
        setFormData({
          fullName: '',
          email: '',
          phone: '',
          specialRequests: '',
          agreeToTerms: false
        });
      }, 3000);

    } catch (error) {
      console.error('Error registering for event:', error);
      toast.error('Failed to register for event. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Registration Successful!</h3>
          <p className="text-gray-600 mb-4">
            You have successfully registered for <strong>{eventTitle}</strong>.
          </p>
          {!isFree && (
            <p className="text-sm text-gray-500">
              Payment instructions will be sent to your email.
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Register for Event</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Event Details */}
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{eventTitle}</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>{eventDate}</span>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4" />
              <span>{eventLocation}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>{currentAttendees}/{maxAttendees} attendees</span>
            </div>
            <div className="flex items-center space-x-2">
              <CreditCard className="w-4 h-4" />
              <span className={isFree ? 'text-green-600 font-medium' : 'text-indigo-600 font-medium'}>
                {isFree ? 'Free' : `$${eventPrice.toLocaleString()}`}
              </span>
            </div>
          </div>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter your email"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number *
            </label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter your phone number"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Special Requests (Optional)
            </label>
            <textarea
              value={formData.specialRequests}
              onChange={(e) => setFormData(prev => ({ ...prev, specialRequests: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Any special requirements or requests..."
            />
          </div>

          {!isFree && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <CreditCard className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-yellow-800">Payment Required</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    This event requires payment of ${eventPrice.toLocaleString()}.
                    You will receive payment instructions after registration.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              id="agreeToTerms"
              checked={formData.agreeToTerms}
              onChange={(e) => setFormData(prev => ({ ...prev, agreeToTerms: e.target.checked }))}
              className="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="agreeToTerms" className="text-sm text-gray-700">
              I agree to the event terms and conditions and understand the cancellation policy. *
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !formData.agreeToTerms || spotsLeft === 0}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                submitting || !formData.agreeToTerms || spotsLeft === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              {submitting ? 'Registering...' : spotsLeft === 0 ? 'Sold Out' : 'Complete Registration'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventRegistrationModal;