import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Briefcase, MapPin, Clock, DollarSign, CheckCircle, XCircle,
  ArrowLeft, Building, Calendar, Eye, MessageCircle, RefreshCw
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import Header from '../components/Header';
import Footer from '../components/Footer';
import MobileBottomNav from '../components/MobileBottomNav';

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
  updated_at: string;
  job?: {
    id: string;
    title: string;
    company: string;
    location: string;
    job_type: string;
    salary_min?: number;
    salary_max?: number;
    employer_id: string;
  };
}

const MyApplications: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'reviewed' | 'shortlisted' | 'accepted' | 'rejected'>('all');
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchApplications();
  }, [user, navigate]);

  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('job_applications')
        .select(`
          *,
          job:jobs!job_applications_job_id_fkey(
            id, title, company, location, job_type, salary_min, salary_max, employer_id
          )
        `)
        .eq('applicant_id', user?.id)
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'reviewed':
        return <Eye className="w-5 h-5 text-blue-600" />;
      case 'shortlisted':
        return <CheckCircle className="w-5 h-5 text-purple-600" />;
      case 'accepted':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'reviewed':
        return 'bg-blue-100 text-blue-800';
      case 'shortlisted':
        return 'bg-purple-100 text-purple-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Your application is being reviewed by the employer';
      case 'reviewed':
        return 'The employer has viewed your application';
      case 'shortlisted':
        return 'Congratulations! You have been shortlisted';
      case 'accepted':
        return 'Your application has been accepted!';
      case 'rejected':
        return 'Unfortunately, your application was not successful';
      default:
        return 'Application submitted';
    }
  };

  const filteredApplications = applications.filter(app => {
    if (filter === 'all') return true;
    return app.status === filter;
  });

  const handleWithdrawApplication = async (applicationId: string) => {
    if (!confirm('Are you sure you want to withdraw this application?')) return;

    try {
      const { error } = await supabase
        .from('job_applications')
        .delete()
        .eq('id', applicationId);

      if (error) throw error;

      setApplications(applications.filter(app => app.id !== applicationId));
      toast.success('Application withdrawn successfully');
    } catch (error) {
      console.error('Error withdrawing application:', error);
      toast.error('Failed to withdraw application');
    }
  };

  const formatSalary = (min?: number, max?: number) => {
    if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    if (min) return `From $${min.toLocaleString()}`;
    if (max) return `Up to $${max.toLocaleString()}`;
    return 'Not specified';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-20 pb-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-lg shadow-md p-6">
                  <div className="h-24 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <Footer />
        <MobileBottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="pt-20 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">My Job Applications</h1>
                <p className="text-gray-600 mt-1">Track the status of your job applications</p>
              </div>
              <button
                onClick={fetchApplications}
                className="flex items-center gap-2 px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            {[
              { label: 'Total', value: applications.length, color: 'bg-gray-100' },
              { label: 'Pending', value: applications.filter(a => a.status === 'pending').length, color: 'bg-yellow-100' },
              { label: 'Reviewed', value: applications.filter(a => a.status === 'reviewed').length, color: 'bg-blue-100' },
              { label: 'Accepted', value: applications.filter(a => a.status === 'accepted').length, color: 'bg-green-100' },
              { label: 'Rejected', value: applications.filter(a => a.status === 'rejected').length, color: 'bg-red-100' },
            ].map((stat) => (
              <div key={stat.label} className={`${stat.color} rounded-lg p-4 text-center`}>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-600">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'all', label: 'All Applications' },
                { value: 'pending', label: 'Pending' },
                { value: 'reviewed', label: 'Reviewed' },
                { value: 'shortlisted', label: 'Shortlisted' },
                { value: 'accepted', label: 'Accepted' },
                { value: 'rejected', label: 'Rejected' }
              ].map((f) => (
                <button
                  key={f.value}
                  onClick={() => setFilter(f.value as any)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm ${
                    filter === f.value
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Applications List */}
          {filteredApplications.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">No Applications Found</h2>
              <p className="text-gray-600 mb-6">
                {filter === 'all'
                  ? "You haven't applied to any jobs yet."
                  : `No ${filter} applications found.`}
              </p>
              <Link
                to="/jobs"
                className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors inline-block"
              >
                Browse Jobs
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredApplications.map((application) => (
                <div key={application.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      {/* Job Info */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <Link
                              to={`/job/${application.job?.id}`}
                              className="text-xl font-semibold text-gray-900 hover:text-indigo-600"
                            >
                              {application.job?.title}
                            </Link>
                            <div className="flex items-center gap-2 text-gray-600 mt-1">
                              <Building className="w-4 h-4" />
                              <span>{application.job?.company}</span>
                            </div>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.status)}`}>
                            {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            <span>{application.job?.location}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Briefcase className="w-4 h-4" />
                            <span>{application.job?.job_type}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            <span>{formatSalary(application.job?.salary_min, application.job?.salary_max)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>Applied {new Date(application.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>

                        {/* Status Message */}
                        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg mb-4">
                          {getStatusIcon(application.status)}
                          <span className="text-sm text-gray-700">{getStatusMessage(application.status)}</span>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap gap-3">
                          <button
                            onClick={() => setSelectedApplication(application)}
                            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                          >
                            <Eye className="w-4 h-4" />
                            View Application
                          </button>
                          {application.job?.employer_id && (
                            <button
                              onClick={() => navigate('/messages', { state: { recipientId: application.job?.employer_id } })}
                              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                            >
                              <MessageCircle className="w-4 h-4" />
                              Contact Employer
                            </button>
                          )}
                          {application.status === 'pending' && (
                            <button
                              onClick={() => handleWithdrawApplication(application.id)}
                              className="flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50"
                            >
                              <XCircle className="w-4 h-4" />
                              Withdraw
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Application Detail Modal */}
      {selectedApplication && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Application Details</h2>
                <button
                  onClick={() => setSelectedApplication(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  &times;
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Job Info */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Job Position</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="font-medium text-gray-900">{selectedApplication.job?.title}</p>
                  <p className="text-gray-600">{selectedApplication.job?.company}</p>
                  <p className="text-sm text-gray-500">{selectedApplication.job?.location}</p>
                </div>
              </div>

              {/* Cover Letter */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Your Cover Letter</h3>
                <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 rounded-lg p-4">
                  {selectedApplication.cover_letter}
                </p>
              </div>

              {/* Expected Salary */}
              {selectedApplication.expected_salary && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Expected Salary</h3>
                  <p className="text-gray-700 p-4 bg-gray-50 rounded-lg">
                    ${selectedApplication.expected_salary.toLocaleString()}
                  </p>
                </div>
              )}

              {/* Additional Info */}
              {selectedApplication.additional_info && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Additional Information</h3>
                  <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 rounded-lg p-4">
                    {selectedApplication.additional_info}
                  </p>
                </div>
              )}

              {/* Dates */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Timeline</h3>
                <div className="space-y-2 p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Applied</span>
                    <span>{new Date(selectedApplication.created_at).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Updated</span>
                    <span>{new Date(selectedApplication.updated_at).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200">
              <button
                onClick={() => setSelectedApplication(null)}
                className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default MyApplications;
