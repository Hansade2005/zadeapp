import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Music, MapPin, Star, ArrowLeft, Share2, MessageCircle,
  CheckCircle, Instagram, Facebook, Youtube, Globe, Play,
  Calendar, Users, Award, Clock
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import Header from '../components/Header';
import Footer from '../components/Footer';
import MobileBottomNav from '../components/MobileBottomNav';

interface ArtisteProfile {
  id: string;
  user_id: string;
  stage_name: string;
  category: string;
  bio: string;
  specialties: string[];
  experience_years: number;
  hourly_rate?: number;
  rating: number;
  total_reviews: number;
  completed_events: number;
  is_verified: boolean;
  profile_image?: string;
  gallery_images?: string[];
  video_urls?: string[];
  audio_urls?: string[];
  instagram_url?: string;
  facebook_url?: string;
  youtube_url?: string;
  website_url?: string;
  created_at: string;
  users?: {
    full_name: string;
    email: string;
    location?: string;
    avatar_url?: string;
  };
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  reviewer?: {
    full_name: string;
    avatar_url?: string;
  };
}

const ArtisteDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [artiste, setArtiste] = useState<ArtisteProfile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'about' | 'gallery' | 'videos' | 'reviews'>('about');

  useEffect(() => {
    if (id) {
      fetchArtiste();
      fetchReviews();
    }
  }, [id]);

  const fetchArtiste = async () => {
    try {
      const { data, error } = await supabase
        .from('artiste_profiles')
        .select(`
          *,
          users (
            full_name,
            email,
            location,
            avatar_url
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setArtiste(data);
    } catch (error) {
      console.error('Error fetching artiste:', error);
      toast.error('Failed to load artiste profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('artiste_reviews')
        .select(`
          *,
          reviewer:users!artiste_reviews_reviewer_id_fkey(full_name, avatar_url)
        `)
        .eq('artiste_id', id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: artiste?.stage_name,
        text: `Check out ${artiste?.stage_name} on Zade!`,
        url: window.location.href,
      });
    } catch (error) {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const handleContact = () => {
    if (!user) {
      toast.info('Please login to contact this artiste');
      navigate('/login');
      return;
    }
    navigate('/messages', { state: { recipientId: artiste?.user_id } });
  };

  const formatCategory = (category: string) => {
    const categories: Record<string, string> = {
      'musician': 'Musician & Band',
      'dj': 'DJ',
      'model': 'Model',
      'usher': 'Usher & Event Staff',
      'event_organizer': 'Event Organizer',
      'venue_manager': 'Venue Manager',
      'decorator': 'Decorator',
      'stage_crew': 'Stage & Lighting Crew'
    };
    return categories[category] || category;
  };

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-20 pb-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="animate-pulse">
              <div className="h-64 bg-gray-200 rounded-lg mb-8"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            </div>
          </div>
        </div>
        <Footer />
        <MobileBottomNav />
      </div>
    );
  }

  if (!artiste) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-20 pb-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-20">
            <Music className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Artiste Not Found</h2>
            <p className="text-gray-600 mb-6">This profile may have been removed or doesn't exist.</p>
            <Link
              to="/artistes"
              className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors inline-block"
            >
              Browse All Artistes
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
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-12">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <button
              onClick={() => navigate('/artistes')}
              className="flex items-center gap-2 text-white/80 hover:text-white mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Artistes
            </button>

            <div className="flex flex-col md:flex-row gap-8 items-start">
              {/* Profile Image */}
              <div className="flex-shrink-0">
                <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-white shadow-xl">
                  {artiste.profile_image || artiste.users?.avatar_url ? (
                    <img
                      src={artiste.profile_image || artiste.users?.avatar_url}
                      alt={artiste.stage_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-purple-400 flex items-center justify-center">
                      <Music className="w-16 h-16 text-white" />
                    </div>
                  )}
                </div>
              </div>

              {/* Profile Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl md:text-4xl font-bold">{artiste.stage_name}</h1>
                  {artiste.is_verified && (
                    <CheckCircle className="w-6 h-6 text-white fill-current" />
                  )}
                </div>

                <p className="text-xl text-white/90 mb-4">{formatCategory(artiste.category)}</p>

                <div className="flex flex-wrap items-center gap-4 text-white/80 mb-6">
                  {artiste.users?.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {artiste.users.location}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {artiste.experience_years} years experience
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {artiste.completed_events} events completed
                  </span>
                </div>

                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center gap-1">
                    {renderStars(artiste.rating)}
                    <span className="ml-2 text-white/90">
                      {artiste.rating.toFixed(1)} ({artiste.total_reviews} reviews)
                    </span>
                  </div>
                </div>

                {/* Social Links */}
                <div className="flex gap-3">
                  {artiste.instagram_url && (
                    <a
                      href={artiste.instagram_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
                    >
                      <Instagram className="w-5 h-5" />
                    </a>
                  )}
                  {artiste.facebook_url && (
                    <a
                      href={artiste.facebook_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
                    >
                      <Facebook className="w-5 h-5" />
                    </a>
                  )}
                  {artiste.youtube_url && (
                    <a
                      href={artiste.youtube_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
                    >
                      <Youtube className="w-5 h-5" />
                    </a>
                  )}
                  {artiste.website_url && (
                    <a
                      href={artiste.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
                    >
                      <Globe className="w-5 h-5" />
                    </a>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-3 w-full md:w-auto">
                {artiste.hourly_rate && (
                  <div className="bg-white/20 rounded-lg p-4 text-center">
                    <p className="text-sm text-white/80">Starting from</p>
                    <p className="text-2xl font-bold">${artiste.hourly_rate}/hr</p>
                  </div>
                )}
                <button
                  onClick={handleContact}
                  className="bg-white text-purple-600 px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-5 h-5" />
                  Contact
                </button>
                <button
                  onClick={handleShare}
                  className="border-2 border-white text-white px-6 py-3 rounded-lg hover:bg-white/10 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <Share2 className="w-5 h-5" />
                  Share
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white border-b border-gray-200 sticky top-16 z-10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex gap-8 overflow-x-auto">
              {[
                { id: 'about', label: 'About' },
                { id: 'gallery', label: 'Gallery' },
                { id: 'videos', label: 'Videos' },
                { id: 'reviews', label: 'Reviews' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-2 border-b-2 font-medium whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-purple-600 text-purple-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* About Tab */}
          {activeTab === 'about' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">About</h2>
                  <p className="text-gray-700 whitespace-pre-line">{artiste.bio}</p>
                </div>

                {artiste.specialties && artiste.specialties.length > 0 && (
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Specialties</h2>
                    <div className="flex flex-wrap gap-2">
                      {artiste.specialties.map((specialty, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Stats</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Experience</span>
                      <span className="font-medium">{artiste.experience_years} years</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Events Completed</span>
                      <span className="font-medium">{artiste.completed_events}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Rating</span>
                      <span className="font-medium flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        {artiste.rating.toFixed(1)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Reviews</span>
                      <span className="font-medium">{artiste.total_reviews}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Gallery Tab */}
          {activeTab === 'gallery' && (
            <div>
              {artiste.gallery_images && artiste.gallery_images.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {artiste.gallery_images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(image)}
                      className="aspect-square rounded-lg overflow-hidden hover:opacity-90 transition-opacity"
                    >
                      <img
                        src={image}
                        alt={`Gallery ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-md p-12 text-center">
                  <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No gallery images yet</p>
                </div>
              )}
            </div>
          )}

          {/* Videos Tab */}
          {activeTab === 'videos' && (
            <div>
              {artiste.video_urls && artiste.video_urls.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {artiste.video_urls.map((url, index) => (
                    <div key={index} className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
                      <iframe
                        src={url.replace('watch?v=', 'embed/')}
                        title={`Video ${index + 1}`}
                        className="w-full h-full"
                        allowFullScreen
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-md p-12 text-center">
                  <Play className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No videos yet</p>
                </div>
              )}
            </div>
          )}

          {/* Reviews Tab */}
          {activeTab === 'reviews' && (
            <div className="space-y-6">
              {reviews.length > 0 ? (
                reviews.map((review) => (
                  <div key={review.id} className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                        {review.reviewer?.avatar_url ? (
                          <img
                            src={review.reviewer.avatar_url}
                            alt=""
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <Users className="w-6 h-6 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium text-gray-900">
                            {review.reviewer?.full_name || 'Anonymous'}
                          </p>
                          <span className="text-sm text-gray-500">
                            {new Date(review.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 mb-2">
                          {renderStars(review.rating)}
                        </div>
                        <p className="text-gray-700">{review.comment}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white rounded-lg shadow-md p-12 text-center">
                  <Star className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No reviews yet</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Image Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <img
            src={selectedImage}
            alt="Gallery"
            className="max-w-full max-h-full object-contain"
          />
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 text-white text-4xl hover:text-gray-300"
          >
            &times;
          </button>
        </div>
      )}

      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default ArtisteDetail;
