import React, { useState, useEffect } from 'react';
import { X, Check, Clock, User, Star, MessageCircle, Ban, FileText, DollarSign, Calendar } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

interface Application {
  id: string;
  job_id: string;
  applicant_id: string;
  cover_letter: string;
  expected_salary?: number;
  availability_date?: string;
  additional_info?: string;
  status: 'pending' | 'reviewed' | 'shortlisted' | 'accepted' | 'rejected';
  created_at: string;
  applicant?: {
    full_name: string;
    email: string;
    avatar_url?: string;
  };
}

interface JobApplicationsManagerProps {
  jobId: string;
  jobTitle: string;
  company: string;
  onClose: () => void;
}

export const JobApplicationsManager: React.FC<JobApplicationsManagerProps> = ({
  jobId,
  jobTitle,
  company,
  onClose,
}) => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'reviewed' | 'shortlisted' | 'accepted' | 'rejected'>('all');
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);

  useEffect(() => {
    fetchApplications();
  }, [jobId]);

  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('job_applications')
        .select(`
          *,
          applicant:users!job_applications_applicant_id_fkey(full_name, email, avatar_url)
        `)
        .eq('job_id', jobId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async (
    applicationId: string,
    newStatus: 'reviewed' | 'shortlisted' | 'accepted' | 'rejected'
  ) => {
    try {
      const { error } = await supabase
        .from('job_applications')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', applicationId);

      if (error) throw error;

      setApplications((prev) =>
        prev.map((app) =>
          app.id === applicationId ? { ...app, status: newStatus } : app
        )
      );

      toast.success(`Application ${newStatus}!`);
      setSelectedApplication(null);
    } catch (error: any) {
      console.error('Error updating application:', error);
      toast.error(error.message || 'Failed to update application');
    }
  };

  const filteredApplications = applications.filter((app) =>
    filter === 'all' ? true : app.status === filter
  );

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      reviewed: { color: 'bg-blue-100 text-blue-800', icon: FileText },
      shortlisted: { color: 'bg-purple-100 text-purple-800', icon: Star },
      accepted: { color: 'bg-green-100 text-green-800', icon: Check },
      rejected: { color: 'bg-red-100 text-red-800', icon: Ban },
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

  const handleContactApplicant = (applicantId: string) => {
    navigate('/messages', { state: { recipientId: applicantId } });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Job Applications</h2>
            <p className="text-sm text-gray-600 mt-1">{jobTitle} at {company}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 p-4 border-b border-gray-200 overflow-x-auto">
          {['all', 'pending', 'reviewed', 'shortlisted', 'accepted', 'rejected'].map((f) => {
            const count = f === 'all' ? applications.length : applications.filter(app => app.status === f).length;
            return (
              <button
                key={f}
                onClick={() => setFilter(f as typeof filter)}
                className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap ${
                  filter === f
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)} ({count})
              </button>
            );
          })}
        </div>

        {/* Applications List */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="text-center py-12">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No applications found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredApplications.map((app) => (
                <div
                  key={app.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden">
                        {app.applicant?.avatar_url ? (
                          <img src={app.applicant.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-indigo-600 font-bold text-lg">
                            {(app.applicant?.full_name || 'A')[0].toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {app.applicant?.full_name || 'Unknown Applicant'}
                        </p>
                        <p className="text-sm text-gray-600">{app.applicant?.email}</p>
                      </div>
                    </div>
                    {getStatusBadge(app.status)}
                  </div>

                  {/* Cover Letter Excerpt */}
                  <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                    {app.cover_letter}
                  </p>

                  {/* Expected Salary & Date */}
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                    {app.expected_salary && (
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        ${app.expected_salary.toLocaleString()}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(app.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedApplication(app)}
                      className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                    >
                      View Details
                    </button>
                    {app.status === 'pending' && (
                      <>
                        <button
                          onClick={() => updateApplicationStatus(app.id, 'shortlisted')}
                          className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                          title="Shortlist"
                        >
                          <Star className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => updateApplicationStatus(app.id, 'rejected')}
                          className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                          title="Reject"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </>
                    )}
                    {app.status === 'shortlisted' && (
                      <button
                        onClick={() => updateApplicationStatus(app.id, 'accepted')}
                        className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        title="Accept"
                      >
                        <Check className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Application Detail Modal */}
        {selectedApplication && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden">
                      {selectedApplication.applicant?.avatar_url ? (
                        <img src={selectedApplication.applicant.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-indigo-600 font-bold text-2xl">
                          {(selectedApplication.applicant?.full_name || 'A')[0].toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {selectedApplication.applicant?.full_name}
                      </h3>
                      <p className="text-gray-600">{selectedApplication.applicant?.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedApplication(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                {/* Cover Letter */}
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-2">Cover Letter</h4>
                  <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 rounded-lg p-4">
                    {selectedApplication.cover_letter}
                  </p>
                </div>

                {/* Expected Salary */}
                {selectedApplication.expected_salary && (
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-900 mb-2">Expected Salary</h4>
                    <p className="text-2xl font-bold text-indigo-600">
                      ${selectedApplication.expected_salary.toLocaleString()}
                    </p>
                  </div>
                )}

                {/* Availability */}
                {selectedApplication.availability_date && (
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-900 mb-2">Availability</h4>
                    <p className="text-gray-700">
                      Available from {new Date(selectedApplication.availability_date).toLocaleDateString()}
                    </p>
                  </div>
                )}

                {/* Additional Info */}
                {selectedApplication.additional_info && (
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-900 mb-2">Additional Information</h4>
                    <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 rounded-lg p-4">
                      {selectedApplication.additional_info}
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleContactApplicant(selectedApplication.applicant_id)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Contact Applicant
                  </button>
                  {selectedApplication.status === 'pending' && (
                    <>
                      <button
                        onClick={() => updateApplicationStatus(selectedApplication.id, 'shortlisted')}
                        className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                      >
                        Shortlist
                      </button>
                      <button
                        onClick={() => updateApplicationStatus(selectedApplication.id, 'rejected')}
                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  {selectedApplication.status === 'shortlisted' && (
                    <>
                      <button
                        onClick={() => updateApplicationStatus(selectedApplication.id, 'accepted')}
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                      >
                        Accept Applicant
                      </button>
                      <button
                        onClick={() => updateApplicationStatus(selectedApplication.id, 'rejected')}
                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                      >
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobApplicationsManager;
