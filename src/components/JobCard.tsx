import React, { useState } from 'react';
import { MapPin, Clock, DollarSign, Building, CheckCircle } from 'lucide-react';

interface JobCardProps {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  description: string;
  postedDate: string;
  logo?: string;
  isRemote?: boolean;
  onApply?: (id: string) => void;
}

const JobCard: React.FC<JobCardProps> = ({
  id,
  title,
  company,
  location,
  type,
  salary,
  description,
  postedDate,
  logo,
  isRemote = false,
  onApply
}) => {
  return (
    <div
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-300"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-4">
          {logo ? (
            <img
              src={logo}
              alt={`${company} logo`}
              className="w-12 h-12 rounded-lg object-cover"
            />
          ) : (
            <div className="w-12 h-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Building className="w-6 h-6 text-white" />
            </div>
          )}
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
            <p className="text-gray-600 font-medium">{company}</p>
          </div>
        </div>
        <span className="text-xs text-gray-500">{postedDate}</span>
      </div>

      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{description}</p>

      <div className="flex flex-wrap items-center gap-4 mb-4 text-sm text-gray-600">
        <div className="flex items-center space-x-1">
          <MapPin className="w-4 h-4" />
          <span>{isRemote ? 'Remote' : location}</span>
        </div>
        <div className="flex items-center space-x-1">
          <Clock className="w-4 h-4" />
          <span>{type}</span>
        </div>
        <div className="flex items-center space-x-1">
          <DollarSign className="w-4 h-4" />
          <span>{salary}</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {isRemote && (
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
              Remote
            </span>
          )}
          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
            {type}
          </span>
        </div>
        <button
          onClick={() => onApply?.(id)}
          className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Apply Now
        </button>
      </div>
    </div>
  );
};

export default JobCard;