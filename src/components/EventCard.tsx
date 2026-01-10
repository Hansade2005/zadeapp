import React from 'react';
import { Calendar, MapPin, Users, Clock } from 'lucide-react';


interface EventCardProps {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  price: number;
  attendees: number;
  maxAttendees: number;
  image: string;
  category: string;
  organizer: string;
  onRegister?: (id: string) => void;
}

const EventCard: React.FC<EventCardProps> = ({
  id,
  title,
  date,
  time,
  location,
  price,
  attendees,
  maxAttendees,
  image,
  category,
  organizer,
  onRegister
}) => {
  const isFree = price === 0;
  const spotsLeft = maxAttendees - attendees;

  return (
    <div
      className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
    >
      {/* Event Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-3 left-3">
          <span className="px-2 py-1 bg-white/90 text-gray-800 text-xs font-medium rounded">
            {category}
          </span>
        </div>
        <div className="absolute top-3 right-3">
          <span className={`px-2 py-1 text-xs font-medium rounded ${
            isFree 
              ? 'bg-green-100 text-green-800' 
              : 'bg-indigo-100 text-indigo-800'
          }`}>
            {isFree ? 'Free' : `$${price.toLocaleString()}`}
          </span>
        </div>
      </div>

      {/* Event Details */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{title}</h3>
        
        <div className="space-y-2 mb-4 text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4" />
            <span>{date}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4" />
            <span>{time}</span>
          </div>
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4" />
            <span className="truncate">{location}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4" />
            <span>{attendees} attending</span>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <p className="text-xs text-gray-500">By {organizer}</p>
          {spotsLeft <= 10 && spotsLeft > 0 && (
            <span className="text-xs text-orange-600 font-medium">
              Only {spotsLeft} spots left!
            </span>
          )}
        </div>

        <button
          onClick={() => onRegister?.(id)}
          disabled={spotsLeft === 0}
          className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
            spotsLeft === 0
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-indigo-600 text-white hover:bg-indigo-700'
          }`}
        >
          {spotsLeft === 0 ? 'Sold Out' : 'Register Now'}
        </button>
      </div>
    </div>
  );
};

export default EventCard;