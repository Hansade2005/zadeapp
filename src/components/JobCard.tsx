import React, { useState } from 'react';
import { Link } from 'react-router-dom';
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
      className="bg-card rounded-2xl shadow-sm ring-1 ring-stone-200/70 p-6 group hover:shadow-xl hover:-translate-y-1 hover:ring-clay-200 transition-all duration-300"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-4">
          {logo ? (
            <div className="w-12 h-12 rounded-xl overflow-hidden ring-1 ring-stone-200 shrink-0">
              <img
                src={logo}
                alt={`${company} logo`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          ) : (
            <div className="w-12 h-12 bg-gradient-to-br from-clay-500 to-clay-700 rounded-xl flex items-center justify-center shadow-sm shrink-0">
              <Building className="w-6 h-6 text-white" />
            </div>
          )}
          <div>
            <Link to={`/job/${id}`} className="font-display font-semibold text-stone-900 mb-1 hover:text-clay-600 transition-colors block leading-tight">{title}</Link>
            <p className="text-stone-600 font-medium">{company}</p>
          </div>
        </div>
        <span className="text-xs text-stone-400 shrink-0 ml-2">{postedDate}</span>
      </div>

      <p className="text-stone-600 text-sm mb-4 line-clamp-2">{description}</p>

      <div className="flex flex-wrap items-center gap-4 mb-4 text-sm text-stone-600">
        <div className="flex items-center space-x-1">
          <MapPin className="w-4 h-4 text-clay-500" />
          <span>{isRemote ? 'Remote' : location}</span>
        </div>
        <div className="flex items-center space-x-1">
          <Clock className="w-4 h-4 text-clay-500" />
          <span>{type}</span>
        </div>
        <div className="flex items-center space-x-1">
          <DollarSign className="w-4 h-4 text-clay-500" />
          <span>{salary}</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-stone-100">
        <div className="flex items-center space-x-2">
          {isRemote && (
            <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-xs font-display font-semibold rounded-full">
              Remote
            </span>
          )}
          <span className="px-2.5 py-1 bg-marigold-100 text-marigold-800 text-xs font-display font-semibold rounded-full">
            {type}
          </span>
        </div>
        <button
          onClick={() => onApply?.(id)}
          className="px-4 py-2 bg-clay-600 text-white text-sm font-medium rounded-xl hover:bg-clay-700 active:scale-[0.98] transition-all shadow-sm"
        >
          Apply Now
        </button>
      </div>
    </div>
  );
};

export default JobCard;