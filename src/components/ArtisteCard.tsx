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
      case 'musician': return 'bg-emerald-100 text-emerald-700';
      case 'dj': return 'bg-clay-100 text-clay-700';
      case 'model': return 'bg-marigold-100 text-marigold-800';
      case 'usher': return 'bg-emerald-100 text-emerald-700';
      default: return 'bg-stone-100 text-stone-700';
    }
  };

  return (
    <div className="bg-card rounded-2xl shadow-sm ring-1 ring-stone-200/70 overflow-hidden group hover:shadow-xl hover:-translate-y-1 hover:ring-clay-200 transition-all duration-300">
      {/* Profile Image */}
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-clay-500 to-emerald-700">
        {profileImage ? (
          <img
            src={profileImage}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Music className="w-16 h-16 text-white opacity-50" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900/30 via-transparent to-transparent" />

        {/* Category Badge */}
        <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-display font-semibold ${getCategoryColor()} flex items-center gap-1 shadow-sm`}>
          {getCategoryIcon()}
          <span className="capitalize">{category}</span>
        </div>

        {/* Verified Badge */}
        {isVerified && (
          <div className="absolute top-3 right-3 bg-emerald-500 text-white p-1.5 rounded-full shadow-sm">
            <CheckCircle className="w-4 h-4" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Name and Rating */}
        <div className="mb-3">
          <h3 className="text-lg font-display font-semibold text-stone-900 mb-1 group-hover:text-clay-700 transition-colors">{name}</h3>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-marigold-400 fill-marigold-400" />
              <span className="text-sm font-medium text-stone-900">{rating.toFixed(1)}</span>
            </div>
            <span className="text-sm text-stone-500">({reviewCount} reviews)</span>
          </div>
        </div>

        {/* Location */}
        {location && (
          <div className="flex items-center gap-2 text-sm text-stone-600 mb-3">
            <MapPin className="w-4 h-4 text-clay-500" />
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
                  className="text-xs px-2 py-1 bg-stone-100 text-stone-700 rounded-full font-medium"
                >
                  {specialty}
                </span>
              ))}
              {specialties.length > 3 && (
                <span className="text-xs px-2 py-1 bg-stone-100 text-stone-700 rounded-full">
                  +{specialties.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Media Icons */}
        <div className="flex items-center gap-3 mb-3 pb-3 border-b border-stone-100">
          {hasVideo && (
            <div className="flex items-center gap-1 text-clay-600">
              <Video className="w-4 h-4" />
              <span className="text-xs">Video</span>
            </div>
          )}
          {hasAudio && (
            <div className="flex items-center gap-1 text-emerald-600">
              <Music className="w-4 h-4" />
              <span className="text-xs">Audio</span>
            </div>
          )}
          {hasGallery && (
            <div className="flex items-center gap-1 text-marigold-600">
              <ImageIcon className="w-4 h-4" />
              <span className="text-xs">Gallery</span>
            </div>
          )}
        </div>

        {/* Stats and Rate */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-stone-600">
            {completedEvents} events completed
          </div>
          <div className="text-right">
            <div className="text-lg font-display font-bold text-clay-600">${hourlyRate.toLocaleString()}</div>
            <div className="text-xs text-stone-500">per hour</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => onViewProfile(id)}
            className="flex-1 bg-clay-600 text-white py-2.5 px-4 rounded-xl hover:bg-clay-700 active:scale-[0.98] transition-all text-sm font-medium shadow-sm"
          >
            View Profile
          </button>
          <button
            onClick={() => onContact(id)}
            className="flex-1 bg-stone-100 text-stone-700 py-2.5 px-4 rounded-xl hover:bg-stone-200 active:scale-[0.98] transition-all text-sm font-medium"
          >
            Contact
          </button>
        </div>
      </div>
    </div>
  );
};

export default ArtisteCard;