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
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-300"
    >
      {/* Header */}
      <div className="flex items-start space-x-4 mb-4">
        <div className="relative">
          <img
            src={avatar}
            alt={name}
            className="w-16 h-16 rounded-full object-cover"
          />
          {isVerified && (
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-white" />
            </div>
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <h3 className="font-semibold text-gray-900">{name}</h3>
            {isVerified && (
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                Verified
              </span>
            )}
          </div>
          <p className="text-gray-600 text-sm mb-2">{title}</p>
          <div className="flex items-center space-x-1 text-sm text-gray-500">
            <MapPin className="w-3 h-3" />
            <span>{location}</span>
          </div>
        </div>
      </div>

      {/* Rating and Stats */}
      <div className="flex items-center justify-between mb-4 text-sm">
        <div className="flex items-center space-x-1">
          <Star className="w-4 h-4 text-yellow-400 fill-current" />
          <span className="font-medium">{rating}</span>
          <span className="text-gray-500">({reviewCount} reviews)</span>
        </div>
        <div className="text-right">
          <p className="font-semibold text-indigo-600">${hourlyRate.toLocaleString()}/hr</p>
        </div>
      </div>

      {/* Skills */}
      <div className="mb-4">
        <div className="flex flex-wrap gap-1">
          {skills.slice(0, 4).map((skill, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
            >
              {skill}
            </span>
          ))}
          {skills.length > 4 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded">
              +{skills.length - 4} more
            </span>
          )}
        </div>
      </div>

      {/* Additional Info */}
      <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
        <div className="flex items-center space-x-1">
          <Clock className="w-3 h-3" />
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
        className="w-full bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
      >
        Contact Freelancer
      </button>
    </div>
  );
};

export default FreelancerCard;