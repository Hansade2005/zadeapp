import React, { useState, useEffect } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Search, MapPin, Briefcase, Clock, Monitor, TrendingUp, Building, Palette, DollarSign, Stethoscope } from 'lucide-react';
import { supabase } from '../lib/supabase';

import Header from '../components/Header';
import Footer from '../components/Footer';
import MobileBottomNav from '../components/MobileBottomNav';
import JobCard from '../components/JobCard';
import JobApplicationModal from '../components/JobApplicationModal';
import { JobFilterPanel } from '../components/JobFilterPanel';
import type { JobFilters } from '../components/JobFilterPanel';
import { filterByRadius, formatDistance } from '../lib/locationUtils';

const Jobs: React.FC = () => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<JobFilters>({
    searchQuery: '',
    jobType: '',
    category: '',
    experienceLevel: '',
    minSalary: '',
    maxSalary: '',
    city: '',
    state: '',
    radiusKm: 50,
    sortBy: 'newest',
  });
  const [applicationModal, setApplicationModal] = useState({
    isOpen: false,
    jobId: '',
    jobTitle: '',
    company: ''
  });

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const { data, error } = await supabase
          .from('jobs')
          .select('*')
          .eq('is_active', true);

        if (error) {
          console.error('Error fetching jobs:', error);
          return;
        }

        setJobs(data || []);
      } catch (error) {
        console.error('Error fetching jobs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  // Advanced filtering based on JobFilterPanel
  useEffect(() => {
    let filtered = [...jobs];

    // Search filter
    if (filters.searchQuery.trim()) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(job =>
        job.title?.toLowerCase().includes(query) ||
        job.company?.toLowerCase().includes(query) ||
        job.description?.toLowerCase().includes(query) ||
        (typeof job.requirements === 'string' && job.requirements.toLowerCase().includes(query))
      );
    }

    // Job type filter
    if (filters.jobType) {
      filtered = filtered.filter(job => job.job_type === filters.jobType);
    }

    // Category filter (search in title/description)
    if (filters.category) {
      const catQuery = filters.category.toLowerCase();
      filtered = filtered.filter(job =>
        job.title?.toLowerCase().includes(catQuery) ||
        job.description?.toLowerCase().includes(catQuery)
      );
    }

    // Experience level filter
    if (filters.experienceLevel) {
      filtered = filtered.filter(job =>
        job.experience_level === filters.experienceLevel ||
        job.title?.toLowerCase().includes(filters.experienceLevel.replace('-', ' '))
      );
    }

    // Salary range filter
    if (filters.minSalary) {
      const minSal = parseFloat(filters.minSalary);
      filtered = filtered.filter(job => !job.salary_min || job.salary_min >= minSal);
    }
    if (filters.maxSalary) {
      const maxSal = parseFloat(filters.maxSalary);
      filtered = filtered.filter(job => !job.salary_max || job.salary_max <= maxSal);
    }

    // City filter
    if (filters.city) {
      filtered = filtered.filter(job => job.city === filters.city);
    }

    // Radius filter (if user location is available)
    if (filters.userLat && filters.userLon && filters.radiusKm) {
      filtered = filterByRadius(
        filtered,
        filters.userLat,
        filters.userLon,
        filters.radiusKm
      );
    }

    // Sorting
    switch (filters.sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'salary_high':
        filtered.sort((a, b) => (b.salary_max || 0) - (a.salary_max || 0));
        break;
      case 'salary_low':
        filtered.sort((a, b) => (a.salary_min || Infinity) - (b.salary_min || Infinity));
        break;
      case 'boosted':
        filtered.sort((a, b) => {
          if (a.is_boosted && !b.is_boosted) return -1;
          if (!a.is_boosted && b.is_boosted) return 1;
          return (b.boost_score || 0) - (a.boost_score || 0);
        });
        break;
      case 'distance':
        // Already sorted by filterByRadius
        break;
    }

    setFilteredJobs(filtered);
  }, [jobs, filters]);

  const handleApply = (jobId: string) => {
    const job = jobs.find(j => j.id === jobId);
    if (job) {
      setApplicationModal({
        isOpen: true,
        jobId,
        jobTitle: job.title,
        company: job.company
      });
    }
  };

  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    const counts: Record<string, number> = {};
    jobs.forEach(job => {
      const category = job.category || job.title.split(' ')[0] || 'Other';
      counts[category] = (counts[category] || 0) + 1;
    });
    setCategoryCounts(counts);
  }, [jobs]);

  const jobCategories = [
    { name: 'Technology', count: jobs.filter(j => j.category === 'Technology' || j.title?.toLowerCase().includes('developer') || j.title?.toLowerCase().includes('engineer') || j.title?.toLowerCase().includes('tech')).length, icon: Monitor as LucideIcon },
    { name: 'Marketing', count: jobs.filter(j => j.category === 'Marketing' || j.title?.toLowerCase().includes('marketing') || j.description?.toLowerCase().includes('marketing')).length, icon: TrendingUp as LucideIcon },
    { name: 'Sales', count: jobs.filter(j => j.category === 'Sales' || j.title?.toLowerCase().includes('sales')).length, icon: Building as LucideIcon },
    { name: 'Design', count: jobs.filter(j => j.category === 'Design' || j.title?.toLowerCase().includes('design') || j.title?.toLowerCase().includes('creative')).length, icon: Palette as LucideIcon },
    { name: 'Finance', count: jobs.filter(j => j.category === 'Finance' || j.title?.toLowerCase().includes('finance') || j.title?.toLowerCase().includes('accounting') || j.title?.toLowerCase().includes('financial')).length, icon: DollarSign as LucideIcon },
    { name: 'Healthcare', count: jobs.filter(j => j.category === 'Healthcare' || j.title?.toLowerCase().includes('health') || j.title?.toLowerCase().includes('medical') || j.title?.toLowerCase().includes('nurse') || j.title?.toLowerCase().includes('doctor')).length, icon: Stethoscope as LucideIcon }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="pb-20 md:pb-0">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-4">Find Your Dream Job</h1>
              <p className="text-xl text-indigo-100 mb-8">
                Discover thousands of opportunities from top Canadian companies
              </p>
            </div>
          </div>
        </section>

        {/* Job Filter Panel */}
        <section className="py-8 bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <JobFilterPanel onFilterChange={setFilters} />
          </div>
        </section>

        {/* Job Categories */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Browse by Category</h2>
              <p className="text-gray-600">Find jobs in your field of expertise</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {jobCategories.map((category) => (
                <div
                  key={category.name}
                  onClick={() => setFilters({ ...filters, category: category.name })}
                  className={`bg-gray-50 p-6 rounded-lg text-center hover:bg-indigo-50 transition-colors cursor-pointer ${
                    filters.category === category.name ? 'ring-2 ring-indigo-600 bg-indigo-50' : ''
                  }`}
                >
                  <div className="text-3xl mb-3">
                    <category.icon className="w-8 h-8 text-indigo-600 mx-auto" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{category.name}</h3>
                  <p className="text-sm text-gray-500">{category.count} jobs</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Job Listings */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {filters.searchQuery || filters.category || filters.city ? 'Search Results' : 'Latest Job Openings'}
              </h2>
              <p className="text-gray-600">
                {filteredJobs.length} {filteredJobs.length === 1 ? 'job' : 'jobs'} found
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {loading ? (
                <>
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-white p-6 rounded-lg border border-gray-200 animate-pulse">
                      <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
                      <div className="h-10 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </>
              ) : filteredJobs.length === 0 ? (
                <div className="col-span-2 text-center py-12">
                  <Briefcase className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-600 text-lg">No jobs found matching your criteria.</p>
                  <button
                    onClick={() => setFilters({
                      searchQuery: '',
                      jobType: '',
                      category: '',
                      experienceLevel: '',
                      minSalary: '',
                      maxSalary: '',
                      city: '',
                      state: '',
                      radiusKm: 50,
                      sortBy: 'newest',
                    })}
                    className="mt-4 text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    Clear all filters
                  </button>
                </div>
              ) : (
                filteredJobs.map((job) => {
                  const distance = filters.userLat && filters.userLon && job.latitude && job.longitude
                    ? formatDistance(
                        Math.sqrt(
                          Math.pow(job.latitude - filters.userLat, 2) +
                          Math.pow(job.longitude - filters.userLon, 2)
                        ) * 111
                      )
                    : undefined;

                  return (
                    <div key={job.id} className="relative">
                      {job.is_boosted && (
                        <div className="absolute top-2 right-2 z-10">
                          <span className="bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold">
                            FEATURED
                          </span>
                        </div>
                      )}
                      {distance && (
                        <div className="absolute top-2 left-2 z-10">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {distance} away
                          </span>
                        </div>
                      )}
                      <JobCard 
                        id={job.id}
                        title={job.title}
                        company={job.company}
                        location={job.location || `${job.city || ''}, ${job.state || ''}`.trim()}
                        type={job.job_type?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Full-time'}
                        salary={job.salary_min && job.salary_max ?
                          `$${job.salary_min.toLocaleString()} - $${job.salary_max.toLocaleString()}/year` :
                          'Salary not specified'}
                        description={job.description}
                        postedDate={new Date(job.created_at).toLocaleDateString()}
                        logo="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100"
                        isRemote={job.job_type === 'remote'}
                        onApply={handleApply}
                      />
                    </div>
                  );
                })
              )}
            </div>

            {/* Load More */}
            <div className="text-center mt-12">
              <button className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                Load More Jobs
              </button>
            </div>
          </div>
        </section>

        {/* Job Alerts */}
        <section className="py-16 bg-indigo-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Never Miss an Opportunity</h2>
            <p className="text-xl text-indigo-100 mb-8">
              Get job alerts delivered to your inbox based on your preferences
            </p>
            <div className="max-w-md mx-auto flex">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-l-lg text-gray-900 focus:ring-2 focus:ring-white focus:outline-none"
              />
              <button className="bg-white text-indigo-600 px-6 py-3 rounded-r-lg hover:bg-gray-100 transition-colors font-medium">
                Subscribe
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <MobileBottomNav />

      {/* Job Application Modal */}
      <JobApplicationModal
        isOpen={applicationModal.isOpen}
        jobId={applicationModal.jobId}
        jobTitle={applicationModal.jobTitle}
        company={applicationModal.company}
        onClose={() => setApplicationModal(prev => ({ ...prev, isOpen: false }))}
        onApplicationSubmitted={() => {
          // Refresh jobs or update UI as needed
          console.log('Application submitted successfully');
        }}
      />
    </div>
  );
};

export default Jobs;
