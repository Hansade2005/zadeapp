import React, { useState, useEffect } from 'react';
import { X, Check, Clock, User, Mail, Ticket, DollarSign, Calendar, Download, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

interface Registration {
  id: string;
  event_id: string;
  user_id: string;
  ticket_quantity: number;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'attended';
  payment_status: 'pending' | 'paid' | 'refunded';
  created_at: string;
  attendee?: {
    full_name: string;
    email: string;
    avatar_url?: string;
  };
}

interface EventRegistrationsManagerProps {
  eventId: string;
  eventTitle: string;
  eventDate: string;
  maxAttendees?: number;
  onClose: () => void;
}

export const EventRegistrationsManager: React.FC<EventRegistrationsManagerProps> = ({
  eventId,
  eventTitle,
  eventDate,
  maxAttendees,
  onClose,
}) => {
  const navigate = useNavigate();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'confirmed' | 'pending' | 'cancelled' | 'attended'>('all');

  useEffect(() => {
    fetchRegistrations();
  }, [eventId]);

  const fetchRegistrations = async () => {
    try {
      const { data, error } = await supabase
        .from('event_registrations')
        .select(`
          *,
          attendee:users!event_registrations_user_id_fkey(full_name, email, avatar_url)
        `)
        .eq('event_id', eventId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRegistrations(data || []);
    } catch (error) {
      console.error('Error fetching registrations:', error);
      toast.error('Failed to load registrations');
    } finally {
      setLoading(false);
    }
  };

  const updateRegistrationStatus = async (
    registrationId: string,
    newStatus: 'confirmed' | 'cancelled' | 'attended'
  ) => {
    try {
      const { error } = await supabase
        .from('event_registrations')
        .update({ status: newStatus })
        .eq('id', registrationId);

      if (error) throw error;

      setRegistrations((prev) =>
        prev.map((reg) =>
          reg.id === registrationId ? { ...reg, status: newStatus } : reg
        )
      );

      toast.success(`Registration ${newStatus}!`);
    } catch (error: any) {
      console.error('Error updating registration:', error);
      toast.error(error.message || 'Failed to update registration');
    }
  };

  const filteredRegistrations = registrations.filter((reg) =>
    filter === 'all' ? true : reg.status === filter
  );

  const totalTickets = registrations.reduce((sum, reg) => sum + reg.ticket_quantity, 0);
  const totalRevenue = registrations.reduce((sum, reg) => sum + reg.total_amount, 0);
  const confirmedCount = registrations.filter(r => r.status === 'confirmed' || r.status === 'attended').length;

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      confirmed: { color: 'bg-green-100 text-green-800', icon: Check },
      cancelled: { color: 'bg-red-100 text-red-800', icon: X },
      attended: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
    };

    const badge = badges[status as keyof typeof badges] || badges.pending;
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Tickets', 'Amount', 'Status', 'Payment', 'Date'];
    const rows = registrations.map(reg => [
      reg.attendee?.full_name || 'N/A',
      reg.attendee?.email || 'N/A',
      reg.ticket_quantity,
      reg.total_amount,
      reg.status,
      reg.payment_status,
      new Date(reg.created_at).toLocaleDateString()
    ]);

    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${eventTitle.replace(/\s+/g, '_')}_registrations.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Registrations exported!');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Event Registrations</h2>
            <p className="text-sm text-gray-600 mt-1">{eventTitle} - {eventDate}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 border-b border-gray-200">
          <div className="bg-white rounded-lg p-3 text-center shadow-sm">
            <p className="text-2xl font-bold text-gray-900">{registrations.length}</p>
            <p className="text-xs text-gray-600">Registrations</p>
          </div>
          <div className="bg-white rounded-lg p-3 text-center shadow-sm">
            <p className="text-2xl font-bold text-gray-900">{totalTickets}</p>
            <p className="text-xs text-gray-600">Total Tickets</p>
          </div>
          <div className="bg-white rounded-lg p-3 text-center shadow-sm">
            <p className="text-2xl font-bold text-gray-900">{confirmedCount}</p>
            <p className="text-xs text-gray-600">Confirmed</p>
          </div>
          <div className="bg-white rounded-lg p-3 text-center shadow-sm">
            <p className="text-2xl font-bold text-green-600">${totalRevenue.toLocaleString()}</p>
            <p className="text-xs text-gray-600">Revenue</p>
          </div>
        </div>

        {/* Filter Tabs & Export */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex gap-2 overflow-x-auto">
            {['all', 'confirmed', 'pending', 'attended', 'cancelled'].map((f) => {
              const count = f === 'all' ? registrations.length : registrations.filter(reg => reg.status === f).length;
              return (
                <button
                  key={f}
                  onClick={() => setFilter(f as typeof filter)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap ${
                    filter === f
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)} ({count})
                </button>
              );
            })}
          </div>
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>

        {/* Registrations List */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            </div>
          ) : filteredRegistrations.length === 0 ? (
            <div className="text-center py-12">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No registrations found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attendee</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tickets</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRegistrations.map((reg) => (
                    <tr key={reg.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center overflow-hidden">
                            {reg.attendee?.avatar_url ? (
                              <img src={reg.attendee.avatar_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-purple-600 font-bold">
                                {(reg.attendee?.full_name || 'A')[0].toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{reg.attendee?.full_name}</div>
                            <div className="text-sm text-gray-500">{reg.attendee?.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <Ticket className="w-4 h-4 mr-1 text-gray-400" />
                          {reg.ticket_quantity}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${reg.total_amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(reg.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          reg.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
                          reg.payment_status === 'refunded' ? 'bg-purple-100 text-purple-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {reg.payment_status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(reg.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          {reg.status === 'confirmed' && (
                            <button
                              onClick={() => updateRegistrationStatus(reg.id, 'attended')}
                              className="text-blue-600 hover:text-blue-900"
                              title="Mark as attended"
                            >
                              <CheckCircle className="w-5 h-5" />
                            </button>
                          )}
                          {reg.status === 'pending' && (
                            <>
                              <button
                                onClick={() => updateRegistrationStatus(reg.id, 'confirmed')}
                                className="text-green-600 hover:text-green-900"
                                title="Confirm"
                              >
                                <Check className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => updateRegistrationStatus(reg.id, 'cancelled')}
                                className="text-red-600 hover:text-red-900"
                                title="Cancel"
                              >
                                <X className="w-5 h-5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventRegistrationsManager;
