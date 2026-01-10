import React from 'react';
import { Star, MapPin, Music, Video, Image as ImageIcon, Instagram, Facebook, Youtube, CheckCircle } from 'lucide-react';

interface ArtisteCardProps {
  id: string;
  name: string;
  category: string;
  location?: string;
  rating: number;
  reviewCount: number;
  hourlyRate: number;
  profileImage?: string;
  isVerified: boolean;
  completedEvents: number;
  specialties: string[];
  hasVideo: boolean;
  hasAudio: boolean;
  hasGallery: boolean;
  onViewProfile: (id: string) => void;
  onContact: (id: string) => void;
}

const ArtisteCard: React.FC<ArtisteCardProps> = ({
  id,
  name,
  category,
  location,
  rating,
  reviewCount,
  hourlyRate,
  profileImage,
  isVerified,
  completedEvents,
  specialties,
  hasVideo,
  hasAudio,
  hasGallery,
  onViewProfile,
  onContact
}) => {
  const getCategoryIcon = () => {
    switch (category) {
      case 'musician': return <Music className="w-4 h-4" />;
      case 'dj': return <Music className="w-4 h-4" />;
      default: return <Music className="w-4 h-4" />;
    }
  };

  const getCategoryColor = () => {
    switch (category) {
      case 'musician': return 'bg-purple-100 text-purple-700';
      case 'dj': return 'bg-blue-100 text-blue-700';
      case 'model': return 'bg-pink-100 text-pink-700';
      case 'usher': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {/* Profile Image */}
      <div className="relative h-48 bg-gradient-to-br from-indigo-500 to-purple-600">
        {profileImage ? (
          <img
            src={profileImage}
            alt={name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Music className="w-16 h-16 text-white opacity-50" />
          </div>
        )}
        
        {/* Category Badge */}
        <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor()} flex items-center gap-1`}>
          {getCategoryIcon()}
          <span className="capitalize">{category}</span>
        </div>

        {/* Verified Badge */}
        {isVerified && (
          <div className="absolute top-3 right-3 bg-green-500 text-white p-1.5 rounded-full">
            <CheckCircle className="w-4 h-4" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Name and Rating */}
        <div className="mb-3">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{name}</h3>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span className="text-sm font-medium text-gray-900">{rating.toFixed(1)}</span>
            </div>
            <span className="text-sm text-gray-500">({reviewCount} reviews)</span>
          </div>
        </div>

        {/* Location */}
        {location && (
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
            <MapPin className="w-4 h-4" />
            <span>{location}</span>
          </div>
        )}

        {/* Specialties */}
        {specialties.length > 0 && (
          <div className="mb-3">
            <div className="flex flex-wrap gap-1">
              {specialties.slice(0, 3).map((specialty, index) => (
                <span
                  key={index}
                  className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full"
                >
                  {specialty}
                </span>
              ))}
              {specialties.length > 3 && (
                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
                  +{specialties.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Media Icons */}
        <div className="flex items-center gap-3 mb-3 pb-3 border-b border-gray-100">
          {hasVideo && (
            <div className="flex items-center gap-1 text-indigo-600">
              <Video className="w-4 h-4" />
              <span className="text-xs">Video</span>
            </div>
          )}
          {hasAudio && (
            <div className="flex items-center gap-1 text-purple-600">
              <Music className="w-4 h-4" />
              <span className="text-xs">Audio</span>
            </div>
          )}
          {hasGallery && (
            <div className="flex items-center gap-1 text-pink-600">
              <ImageIcon className="w-4 h-4" />
              <span className="text-xs">Gallery</span>
            </div>
          )}
        </div>

        {/* Stats and Rate */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-gray-600">
            {completedEvents} events completed
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-indigo-600">${hourlyRate.toLocaleString()}</div>
            <div className="text-xs text-gray-500">per hour</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => onViewProfile(id)}
            className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
          >
            View Profile
          </button>
          <button
            onClick={() => onContact(id)}
            className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
          >
            Contact
          </button>
        </div>
      </div>
    </div>
  );
};

export default ArtisteCard;
