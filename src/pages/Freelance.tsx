import React, { useState, useEffect } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Search, Star, Filter, MapPin, Monitor, Palette, TrendingUp, PenTool, Film, Music } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

import Header from '../components/Header';
import Footer from '../components/Footer';
import MobileBottomNav from '../components/MobileBottomNav';
import FreelancerCard from '../components/FreelancerCard';
import { ContactFreelancerModal } from '../components/ContactFreelancerModal';

const Freelance: React.FC = () => {
  const [freelancers, setFreelancers] = useState<any[]>([]);
  const [filteredFreelancers, setFilteredFreelancers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('All Locations');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [selectedFreelancer, setSelectedFreelancer] = useState<any>(null);

  useEffect(() => {
    const fetchFreelancers = async () => {
      try {
        const { data, error } = await supabase
          .from('freelancer_profiles')
          .select('*');

        if (error) {
          console.error('Error fetching freelancers:', error);
          return;
        }

        // Map database fields to component expected format
        const mappedFreelancers = data.map((freelancer: any) => ({
          id: freelancer.id,
          userId: freelancer.user_id, // Add user_id for messaging
          name: freelancer.full_name || freelancer.user_id, // Fallback if full_name not set
          title: freelancer.title,
          location: freelancer.location ? `${freelancer.location}, Canada` : 'Canada',
          rating: freelancer.rating,
          reviewCount: freelancer.total_reviews,
          hourlyRate: freelancer.hourly_rate,
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100', // Default avatar
          skills: freelancer.skills || [],
          isVerified: freelancer.is_verified,
          responseTime: `${freelancer.response_time_hours || 24} hours`,
          completedJobs: freelancer.completed_jobs
        }));

        setFreelancers(mappedFreelancers);
      } catch (error) {
        console.error('Error fetching freelancers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFreelancers();
  }, []);

  // Filter freelancers based on search, location, and category
  useEffect(() => {
    let filtered = freelancers;

    // Filter by search query (skills or title)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(freelancer =>
        freelancer.title.toLowerCase().includes(query) ||
        freelancer.skills.some((skill: string) => skill.toLowerCase().includes(query)) ||
        freelancer.name.toLowerCase().includes(query)
      );
    }

    // Filter by location
    if (locationFilter !== 'All Locations') {
      filtered = filtered.filter(freelancer =>
        freelancer.location.toLowerCase().includes(locationFilter.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(freelancer =>
        freelancer.title.toLowerCase().includes(selectedCategory.toLowerCase()) ||
        freelancer.skills.some((skill: string) =>
          skill.toLowerCase().includes(selectedCategory.toLowerCase())
        )
      );
    }

    setFilteredFreelancers(filtered);
  }, [freelancers, searchQuery, locationFilter, selectedCategory]);

  const handleContact = (freelancer: any) => {
    setSelectedFreelancer(freelancer);
    setShowContactModal(true);
  };

  const serviceCategories = [
    { name: 'Web Development', count: freelancers.filter(f => f.title?.toLowerCase().includes('web') || f.skills?.some((s: string) => s.toLowerCase().includes('web') || s.toLowerCase().includes('developer') || s.toLowerCase().includes('frontend') || s.toLowerCase().includes('backend'))).length, icon: Monitor as LucideIcon },
    { name: 'Design', count: freelancers.filter(f => f.title?.toLowerCase().includes('design') || f.skills?.some((s: string) => s.toLowerCase().includes('design') || s.toLowerCase().includes('graphic') || s.toLowerCase().includes('ui') || s.toLowerCase().includes('ux'))).length, icon: Palette as LucideIcon },
    { name: 'Marketing', count: freelancers.filter(f => f.title?.toLowerCase().includes('marketing') || f.skills?.some((s: string) => s.toLowerCase().includes('marketing') || s.toLowerCase().includes('seo') || s.toLowerCase().includes('social'))).length, icon: TrendingUp as LucideIcon },
    { name: 'Writing', count: freelancers.filter(f => f.title?.toLowerCase().includes('write') || f.skills?.some((s: string) => s.toLowerCase().includes('write') || s.toLowerCase().includes('content') || s.toLowerCase().includes('copy'))).length, icon: PenTool as LucideIcon },
    { name: 'Video & Animation', count: freelancers.filter(f => f.title?.toLowerCase().includes('video') || f.title?.toLowerCase().includes('animation') || f.skills?.some((s: string) => s.toLowerCase().includes('video') || s.toLowerCase().includes('animation') || s.toLowerCase().includes('motion'))).length, icon: Film as LucideIcon },
    { name: 'Music & Audio', count: freelancers.filter(f => f.title?.toLowerCase().includes('music') || f.title?.toLowerCase().includes('audio') || f.skills?.some((s: string) => s.toLowerCase().includes('music') || s.toLowerCase().includes('audio') || s.toLowerCase().includes('sound'))).length, icon: Music as LucideIcon }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="pb-20 md:pb-0">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-4">Find Talented Freelancers</h1>
              <p className="text-xl text-green-100 mb-8">
                Connect with skilled professionals across Canada for your projects
              </p>
              
              {/* Freelancer Search */}
              <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-lg p-4 shadow-lg">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        placeholder="Search skills or services..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                      />
                    </div>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <select
                        value={locationFilter}
                        onChange={(e) => setLocationFilter(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 appearance-none"
                      >
                        <option>All Locations</option>
                        <option>Lagos</option>
                        <option>Abuja</option>
                        <option>Port Harcourt</option>
                        <option>Kano</option>
                      </select>
                    </div>
                    <button
                      onClick={() => console.log('Searching...', searchQuery, locationFilter)}
                      className="bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors font-medium"
                    >
                      Find Freelancers
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Service Categories */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Browse by Category</h2>
              <p className="text-gray-600">Find the right talent for your specific needs</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {serviceCategories.map((category, index) => (
                <div
                  key={category.name}
                  onClick={() => setSelectedCategory(category.name === selectedCategory ? '' : category.name)}
                  className={`bg-gray-50 p-6 rounded-lg text-center hover:bg-green-50 transition-colors cursor-pointer ${
                    selectedCategory === category.name ? 'ring-2 ring-green-600 bg-green-50' : ''
                  }`}
                >
                  <div className="text-3xl mb-3">
                    <category.icon className="w-8 h-8 text-green-600 mx-auto" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{category.name}</h3>
                  <p className="text-sm text-gray-500">{category.count} freelancers</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Filters and Controls */}
        <section className="py-8 bg-gray-50 border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-white">
                  <Filter className="w-4 h-4" />
                  <span>Filters</span>
                </button>
                
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Sort by:</span>
                  <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent">
                    <option>Relevance</option>
                    <option>Rating</option>
                    <option>Price: Low to High</option>
                    <option>Price: High to Low</option>
                    <option>Most Reviews</option>
                  </select>
                </div>
              </div>

              <div className="text-sm text-gray-600">
                {filteredFreelancers.length} {filteredFreelancers.length === 1 ? 'freelancer' : 'freelancers'} found
              </div>
            </div>
          </div>
        </section>

        {/* Featured Freelancers */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {searchQuery || locationFilter !== 'All Locations' || selectedCategory ? 'Search Results' : 'Top Freelancers'}
              </h2>
              <p className="text-gray-600">
                {searchQuery || locationFilter !== 'All Locations' || selectedCategory
                  ? `${filteredFreelancers.length} freelancer${filteredFreelancers.length === 1 ? '' : 's'} matching your criteria`
                  : 'Highly rated professionals ready to work on your projects'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {loading ? (
                <div className="col-span-full text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                </div>
              ) : filteredFreelancers.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-600 text-lg">No freelancers found matching your criteria.</p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setLocationFilter('All Locations');
                      setSelectedCategory('');
                    }}
                    className="mt-4 text-green-600 hover:text-green-800 font-medium"
                  >
                    Clear filters
                  </button>
                </div>
              ) : (
                filteredFreelancers.map((freelancer) => (
                  <div key={freelancer.id}>
                    <FreelancerCard {...freelancer} onContact={handleContact} />
                  </div>
                ))
              )}
            </div>

            {/* Load More */}
            <div className="text-center mt-12">
              <button className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                Load More Freelancers
              </button>
            </div>
          </div>
        </section>

        {/* Post Project CTA */}
        <section className="py-16 bg-gradient-to-r from-blue-600 to-green-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Need Work Done?</h2>
            <p className="text-xl text-blue-100 mb-8">
              Post your job and get proposals from talented freelancers
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/my-jobs"
                className="bg-white text-blue-600 px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors font-medium inline-block"
              >
                Post a Job
              </Link>
              <button
                onClick={() => setShowHowItWorks(true)}
                className="border-2 border-white text-white px-8 py-3 rounded-lg hover:bg-white hover:text-blue-600 transition-colors font-medium"
              >
                How It Works
              </button>
            </div>
          </div>
        </section>

        {/* How It Works Modal */}
        {showHowItWorks && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 sm:p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-3xl font-bold text-gray-900">How It Works</h2>
                  <button
                    onClick={() => setShowHowItWorks(false)}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ×
                  </button>
                </div>

                <div className="space-y-8">
                  {/* For Clients */}
                  <div>
                    <h3 className="text-2xl font-bold text-green-600 mb-4">For Clients (Hiring)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <span className="text-2xl font-bold text-green-600">1</span>
                        </div>
                        <h4 className="font-bold text-gray-900 mb-2">Post Your Job</h4>
                        <p className="text-gray-600 text-sm">
                          Create a detailed job posting describing what you need. Include requirements, budget, and timeline.
                        </p>
                      </div>

                      <div className="text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <span className="text-2xl font-bold text-green-600">2</span>
                        </div>
                        <h4 className="font-bold text-gray-900 mb-2">Review Proposals</h4>
                        <p className="text-gray-600 text-sm">
                          Receive proposals from qualified freelancers. Review their profiles, portfolios, and rates.
                        </p>
                      </div>

                      <div className="text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <span className="text-2xl font-bold text-green-600">3</span>
                        </div>
                        <h4 className="font-bold text-gray-900 mb-2">Hire & Work</h4>
                        <p className="text-gray-600 text-sm">
                          Choose the best freelancer and start working. Communicate through our messaging system.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* For Freelancers */}
                  <div>
                    <h3 className="text-2xl font-bold text-blue-600 mb-4">For Freelancers (Getting Hired)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <span className="text-2xl font-bold text-blue-600">1</span>
                        </div>
                        <h4 className="font-bold text-gray-900 mb-2">Create Your Profile</h4>
                        <p className="text-gray-600 text-sm">
                          Build a professional profile showcasing your skills, experience, and portfolio samples.
                        </p>
                      </div>

                      <div className="text-center">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <span className="text-2xl font-bold text-blue-600">2</span>
                        </div>
                        <h4 className="font-bold text-gray-900 mb-2">Browse Jobs</h4>
                        <p className="text-gray-600 text-sm">
                          Search for jobs matching your skills. Submit compelling proposals with your best pitch.
                        </p>
                      </div>

                      <div className="text-center">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <span className="text-2xl font-bold text-blue-600">3</span>
                        </div>
                        <h4 className="font-bold text-gray-900 mb-2">Get Hired & Paid</h4>
                        <p className="text-gray-600 text-sm">
                          Complete projects, receive ratings, and get paid securely through the platform.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Platform Features</h3>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <li className="flex items-center gap-2 text-gray-700">
                        <span className="text-green-600">✓</span>
                        Secure messaging system
                      </li>
                      <li className="flex items-center gap-2 text-gray-700">
                        <span className="text-green-600">✓</span>
                        Portfolio showcase
                      </li>
                      <li className="flex items-center gap-2 text-gray-700">
                        <span className="text-green-600">✓</span>
                        Rating and review system
                      </li>
                      <li className="flex items-center gap-2 text-gray-700">
                        <span className="text-green-600">✓</span>
                        Verified freelancer badges
                      </li>
                      <li className="flex items-center gap-2 text-gray-700">
                        <span className="text-green-600">✓</span>
                        Location-based search
                      </li>
                      <li className="flex items-center gap-2 text-gray-700">
                        <span className="text-green-600">✓</span>
                        Safe payment processing
                      </li>
                    </ul>
                  </div>

                  <div className="text-center pt-4">
                    <Link
                      to="/my-jobs"
                      onClick={() => setShowHowItWorks(false)}
                      className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium inline-block"
                    >
                      Get Started - Post a Job
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
      <MobileBottomNav />

      {showContactModal && selectedFreelancer && (
        <ContactFreelancerModal
          freelancerId={selectedFreelancer.userId}
          freelancerName={selectedFreelancer.name}
          freelancerTitle={selectedFreelancer.title}
          onClose={() => {
            setShowContactModal(false);
            setSelectedFreelancer(null);
          }}
        />
      )}
    </div>
  );
};

export default Freelance;