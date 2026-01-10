import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { toast } from 'react-toastify';
import Header from '../components/Header';
import Footer from '../components/Footer';
import MobileBottomNav from '../components/MobileBottomNav';
import JobForm from '../components/JobForm';
import { BoostManager } from '../components/BoostManager';
import { Briefcase, MapPin, Users, Calendar, Trash2, Plus, Edit, Zap } from 'lucide-react';

interface Job {
  id: string;
  employer_id: string;
  title: string;
  company: string;
  description: string;
  requirements: string[];
  location: string;
  job_type: string;
  salary_min: number;
  salary_max: number;
  salary_currency: string;
  experience_level: string;
  category: string;
  skills_required: string[];
  application_deadline: string;
  is_active: boolean;
  featured: boolean;
  created_at: string;
  updated_at: string;
  type?: string; // For backward compatibility
  applications_count?: number; // For display
}

const MyJobs: React.FC = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [showJobForm, setShowJobForm] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [boostingJob, setBoostingJob] = useState<string | null>(null);

  useEffect(() => {
    fetchJobs();
  }, [user]);

  const fetchJobs = async () => {
    try {
      if (!user?.id) return;

      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('employer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setJobs(data || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job posting?')) return;

    try {
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', jobId);

      if (error) throw error;
      setJobs(jobs.filter(job => job.id !== jobId));
    } catch (error) {
      console.error('Error deleting job:', error);
      alert('Failed to delete job. Please try again.');
    }
  };

  const formatSalary = (min: number, max: number) => {
    if (min && max) {
      return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    } else if (min) {
      return `From $${min.toLocaleString()}`;
    } else if (max) {
      return `Up to $${max.toLocaleString()}`;
    }
    return 'Salary not specified';
  };

  const handleCreateJob = () => {
    setEditingJob(null);
    setShowJobForm(true);
  };

  const handleEditJob = (job: Job) => {
    setEditingJob(job);
    setShowJobForm(true);
  };

  const handleJobFormSuccess = () => {
    fetchJobs();
  };

  const handleCloseJobForm = () => {
    setShowJobForm(false);
    setEditingJob(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
              <div className="space-y-4">
                <div className="h-32 bg-gray-200 rounded"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
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
      <div className="pt-20 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-md">
            {/* Header */}
            <div className="px-8 py-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">My Job Postings</h1>
                  <p className="text-gray-600 mt-1">Manage your job listings and applications</p>
                </div>
                <button
                  onClick={handleCreateJob}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Post New Job</span>
                </button>
              </div>
            </div>

            {/* Jobs List */}
            <div className="px-8 py-6">
              {jobs.length === 0 ? (
                <div className="text-center py-12">
                  <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No job postings yet</h3>
                  <p className="text-gray-600 mb-6">Create your first job posting to attract talent</p>
                  <button className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors">
                    Post Your First Job
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {jobs.map((job) => (
                    <div key={job.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{job.title}</h3>
                          <p className="text-gray-600 text-sm">{job.company}</p>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditJob(job)}
                            className="text-indigo-600 hover:text-indigo-800 p-1"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteJob(job.id)}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">{job.description}</p>

                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="w-4 h-4 mr-2" />
                          <span>{job.location}</span>
                        </div>

                        <div className="flex items-center text-sm text-gray-600">
                          <Briefcase className="w-4 h-4 mr-2" />
                          <span>{job.type}</span>
                        </div>

                        <div className="flex items-center text-sm text-gray-600">
                          <Users className="w-4 h-4 mr-2" />
                          <span>{job.applications_count} applications</span>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-lg font-semibold text-indigo-600">
                            {formatSalary(job.salary_min, job.salary_max)}
                          </span>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">
                            Posted {new Date(job.created_at).toLocaleDateString()}
                          </span>
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => handleEditJob(job)}
                              className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center gap-1"
                            >
                              <Edit className="w-4 h-4" />
                              Edit
                            </button>
                            <button 
                              onClick={() => setBoostingJob(job.id)}
                              className="text-purple-600 hover:text-purple-800 text-sm font-medium flex items-center gap-1"
                              title="Boost this job"
                            >
                              <Zap className="w-4 h-4" />
                              Boost
                            </button>
                            <button
                              onClick={() => handleDeleteJob(job.id)}
                              className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center gap-1"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
      <MobileBottomNav />

      <JobForm
        isOpen={showJobForm}
        onClose={handleCloseJobForm}
        onSuccess={handleJobFormSuccess}
        initialData={editingJob ? {
          title: editingJob.title,
          company: editingJob.company,
          description: editingJob.description,
          location: editingJob.location,
          job_type: editingJob.job_type as any,
          experience_level: editingJob.experience_level as any,
          category: editingJob.category,
          salary_min: editingJob.salary_min,
          salary_max: editingJob.salary_max,
          salary_currency: editingJob.salary_currency,
          application_deadline: editingJob.application_deadline ? new Date(editingJob.application_deadline).toISOString().split('T')[0] : '',
          requirements: editingJob.requirements || [],
          skills_required: editingJob.skills_required || [],
        } : undefined}
        isEditing={!!editingJob}
        jobId={editingJob?.id}
      />

      {boostingJob && (
        <BoostManager
          entityType="job"
          entityId={boostingJob}
          entityTitle={jobs.find(j => j.id === boostingJob)?.title || 'Job'}
          onClose={() => setBoostingJob(null)}
          onBoostSuccess={() => {
            setBoostingJob(null);
            toast.success('Job boosted successfully!');
          }}
        />
      )}
    </div>
  );
};

export default MyJobs;