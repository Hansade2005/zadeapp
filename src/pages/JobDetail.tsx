import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Briefcase, MapPin, Clock, DollarSign, Calendar, Building,
  ArrowLeft, Share2, Bookmark, Send, CheckCircle, Users, Globe
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import Header from '../components/Header';
import Footer from '../components/Footer';
import MobileBottomNav from '../components/MobileBottomNav';
import JobApplicationModal from '../components/JobApplicationModal';

interface Job {
  id: string;
  employer_id: string;
  title: string;
  company: string;
  description: string;
  requirements: string[] | string;
  location: string;
  job_type: string;
  salary_min?: number;
  salary_max?: number;
  salary_currency: string;
  experience_level: string;
  category: string;
  skills_required: string[];
  application_deadline?: string;
  is_active: boolean;
  featured: boolean;
  is_boosted?: boolean;
  created_at: string;
  employer?: {
    full_name: string;
    email: string;
    avatar_url?: string;
  };
}

const JobDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [similarJobs, setSimilarJobs] = useState<Job[]>([]);

  useEffect(() => {
    if (id) {
      fetchJob();
      checkIfApplied();
    }
  }, [id, user]);

  const fetchJob = async () => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          employer:users!jobs_employer_id_fkey(full_name, email, avatar_url)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setJob(data);

      // Fetch similar jobs
      if (data) {
        const { data: similar } = await supabase
          .from('jobs')
          .select('*')
          .eq('is_active', true)
          .neq('id', id)
          .or(`category.eq.${data.category},job_type.eq.${data.job_type}`)
          .limit(3);

        setSimilarJobs(similar || []);
      }
    } catch (error) {
      console.error('Error fetching job:', error);
      toast.error('Failed to load job details');
    } finally {
      setLoading(false);
    }
  };

  const checkIfApplied = async () => {
    if (!user || !id) return;

    try {
      const { data } = await supabase
        .from('job_applications')
        .select('id')
        .eq('job_id', id)
        .eq('applicant_id', user.id)
        .single();

      setHasApplied(!!data);
    } catch (error) {
      // No application found
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: job?.title,
        text: `Check out this job: ${job?.title} at ${job?.company}`,
        url: window.location.href,
      });
    } catch (error) {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    toast.success(isBookmarked ? 'Removed from saved jobs' : 'Job saved!');
  };

  const formatSalary = () => {
    if (!job?.salary_min && !job?.salary_max) return 'Salary not disclosed';
    if (job.salary_min && job.salary_max) {
      return `$${job.salary_min.toLocaleString()} - $${job.salary_max.toLocaleString()}/year`;
    }
    if (job.salary_min) return `From $${job.salary_min.toLocaleString()}/year`;
    if (job.salary_max) return `Up to $${job.salary_max.toLocaleString()}/year`;
    return 'Salary not disclosed';
  };

  const formatJobType = (type: string) => {
    return type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatExperienceLevel = (level: string) => {
    const levels: Record<string, string> = {
      'entry': 'Entry Level',
      'mid': 'Mid Level',
      'senior': 'Senior Level',
      'executive': 'Executive'
    };
    return levels[level] || level;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-20 pb-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
              <div className="bg-white rounded-lg shadow-md p-8">
                <div className="h-64 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
        <MobileBottomNav />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-20 pb-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-20">
            <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Job Not Found</h2>
            <p className="text-gray-600 mb-6">This job posting may have been removed or doesn't exist.</p>
            <Link
              to="/jobs"
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors inline-block"
            >
              Browse All Jobs
            </Link>
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
          {/* Breadcrumb */}
          <div className="mb-6">
            <button
              onClick={() => navigate('/jobs')}
              className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Jobs
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Job Header */}
              <div className="bg-white rounded-lg shadow-md p-6">
                {job.is_boosted && (
                  <span className="inline-block bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold mb-4">
                    FEATURED
                  </span>
                )}

                <h1 className="text-3xl font-bold text-gray-900 mb-2">{job.title}</h1>

                <div className="flex items-center gap-4 text-gray-600 mb-4">
                  <div className="flex items-center gap-1">
                    <Building className="w-4 h-4" />
                    <span>{job.company}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{job.location}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 mb-6">
                  <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium">
                    {formatJobType(job.job_type)}
                  </span>
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    {formatExperienceLevel(job.experience_level)}
                  </span>
                  <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                    {job.category}
                  </span>
                </div>

                <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                  <div className="flex items-center gap-2 text-2xl font-bold text-gray-900">
                    <DollarSign className="w-6 h-6 text-green-600" />
                    {formatSalary()}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleBookmark}
                      className={`p-2 rounded-full ${isBookmarked ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-600'} hover:bg-indigo-100`}
                    >
                      <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
                    </button>
                    <button
                      onClick={handleShare}
                      className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
                    >
                      <Share2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Job Description */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Job Description</h2>
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-700 whitespace-pre-line">{job.description}</p>
                </div>
              </div>

              {/* Requirements */}
              {job.requirements && job.requirements.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Requirements</h2>
                  <ul className="space-y-2">
                    {(typeof job.requirements === 'string'
                      ? job.requirements.split('\n').filter(r => r.trim())
                      : job.requirements
                    ).map((req, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Skills Required */}
              {job.skills_required && job.skills_required.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Skills Required</h2>
                  <div className="flex flex-wrap gap-2">
                    {job.skills_required.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Apply Card */}
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Apply for this job</h3>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>Posted {new Date(job.created_at).toLocaleDateString()}</span>
                  </div>
                  {job.application_deadline && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>Deadline: {new Date(job.application_deadline).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                {hasApplied ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                    <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <p className="text-green-800 font-medium">You've already applied!</p>
                    <p className="text-green-600 text-sm">We'll notify you of any updates.</p>
                  </div>
                ) : user ? (
                  <button
                    onClick={() => setShowApplicationModal(true)}
                    className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Apply Now
                  </button>
                ) : (
                  <div className="space-y-3">
                    <Link
                      to="/login"
                      className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center justify-center gap-2"
                    >
                      Login to Apply
                    </Link>
                    <p className="text-center text-sm text-gray-600">
                      Don't have an account?{' '}
                      <Link to="/signup" className="text-indigo-600 hover:underline">
                        Sign up
                      </Link>
                    </p>
                  </div>
                )}
              </div>

              {/* Company Info */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">About the Company</h3>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                    <Building className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{job.company}</p>
                    <p className="text-sm text-gray-600">{job.location}</p>
                  </div>
                </div>
                {job.employer && (
                  <p className="text-sm text-gray-600">
                    Posted by: {job.employer.full_name}
                  </p>
                )}
              </div>

              {/* Similar Jobs */}
              {similarJobs.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Similar Jobs</h3>
                  <div className="space-y-4">
                    {similarJobs.map((similarJob) => (
                      <Link
                        key={similarJob.id}
                        to={`/job/${similarJob.id}`}
                        className="block p-3 border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
                      >
                        <p className="font-medium text-gray-900">{similarJob.title}</p>
                        <p className="text-sm text-gray-600">{similarJob.company}</p>
                        <p className="text-sm text-indigo-600">{formatJobType(similarJob.job_type)}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <MobileBottomNav />

      {/* Application Modal */}
      <JobApplicationModal
        isOpen={showApplicationModal}
        jobId={job.id}
        jobTitle={job.title}
        company={job.company}
        onClose={() => setShowApplicationModal(false)}
        onApplicationSubmitted={() => {
          setHasApplied(true);
          toast.success('Application submitted successfully!');
        }}
      />
    </div>
  );
};

export default JobDetail;
