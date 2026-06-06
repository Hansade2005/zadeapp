import React from 'react';
import { Star, MapPin, Clock, CheckCircle } from 'lucide-react';

interface FreelancerCardProps {
  id: string;
  userId: string;
  name: string;
  title: string;
  location: string;
  rating: number;
  reviewCount: number;
  hourlyRate: number;
  avatar: string;
  skills: string[];
  isVerified?: boolean;
  responseTime: string;
  completedJobs: number;
  onContact?: (freelancer: FreelancerCardProps) => void;
}

const FreelancerCard: React.FC<FreelancerCardProps> = ({
  id,
  userId,
  name,
  title,
  location,
  rating,
  reviewCount,
  hourlyRate,
  avatar,
  skills,
  isVerified = false,
  responseTime,
  completedJobs,
  onContact
}) => {
  return (
    <div
      className="bg-card rounded-2xl shadow-sm ring-1 ring-stone-200/70 p-6 group hover:shadow-xl hover:-translate-y-1 hover:ring-clay-200 transition-all duration-300"
    >
      {/* Header */}
      <div className="flex items-start space-x-4 mb-4">
        <div className="relative shrink-0">
          <img
            src={avatar}
            alt={name}
            className="w-16 h-16 rounded-full object-cover ring-2 ring-stone-100 group-hover:ring-clay-200 transition-all"
          />
          {isVerified && (
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center ring-2 ring-white">
              <CheckCircle className="w-4 h-4 text-white" />
            </div>
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <h3 className="font-display font-semibold text-stone-900 group-hover:text-clay-700 transition-colors">{name}</h3>
            {isVerified && (
              <span className="text-xs font-display font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                Verified
              </span>
            )}
          </div>
          <p className="text-stone-600 text-sm mb-2">{title}</p>
          <div className="flex items-center space-x-1 text-sm text-stone-500">
            <MapPin className="w-3 h-3 text-clay-500" />
            <span>{location}</span>
          </div>
        </div>
      </div>

      {/* Rating and Stats */}
      <div className="flex items-center justify-between mb-4 text-sm">
        <div className="flex items-center space-x-1">
          <Star className="w-4 h-4 text-marigold-400 fill-current" />
          <span className="font-medium">{rating}</span>
          <span className="text-stone-500">({reviewCount} reviews)</span>
        </div>
        <div className="text-right">
          <p className="font-display font-bold text-clay-600">${hourlyRate.toLocaleString()}/hr</p>
        </div>
      </div>

      {/* Skills */}
      <div className="mb-4">
        <div className="flex flex-wrap gap-1">
          {skills.slice(0, 4).map((skill, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-stone-100 text-stone-700 text-xs rounded-full font-medium"
            >
              {skill}
            </span>
          ))}
          {skills.length > 4 && (
            <span className="px-2 py-1 bg-stone-100 text-stone-500 text-xs rounded-full">
              +{skills.length - 4} more
            </span>
          )}
        </div>
      </div>

      {/* Additional Info */}
      <div className="flex items-center justify-between text-xs text-stone-500 mb-4 pt-4 border-t border-stone-100">
        <div className="flex items-center space-x-1">
          <Clock className="w-3 h-3 text-clay-500" />
          <span>Responds in {responseTime}</span>
        </div>
        <span>{completedJobs} jobs completed</span>
      </div>

      {/* Contact Button */}
      <button
        onClick={() => onContact?.({
          id,
          userId,
          name,
          title,
          location,
          rating,
          reviewCount,
          hourlyRate,
          avatar,
          skills,
          isVerified,
          responseTime,
          completedJobs,
          onContact
        })}
        className="w-full bg-clay-600 text-white py-2.5 rounded-xl font-medium hover:bg-clay-700 active:scale-[0.98] transition-all shadow-sm"
      >
        Contact Freelancer
      </button>
    </div>
  );
};

export default FreelancerCard;