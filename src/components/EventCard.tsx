import React from 'react';
import { Link } from 'react-router-dom';
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
      className="bg-card rounded-2xl shadow-sm ring-1 ring-stone-200/70 overflow-hidden group hover:shadow-xl hover:-translate-y-1 hover:ring-clay-200 transition-all duration-300"
    >
      {/* Event Image */}
      <div className="relative h-48 overflow-hidden bg-stone-100">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900/30 via-transparent to-transparent" />
        <div className="absolute top-3 left-3">
          <span className="px-2.5 py-1 bg-white/90 backdrop-blur text-stone-800 text-xs font-display font-semibold rounded-full shadow-sm uppercase tracking-wide">
            {category}
          </span>
        </div>
        <div className="absolute top-3 right-3">
          <span className={`px-2.5 py-1 text-xs font-display font-bold rounded-full shadow-md ${
            isFree
              ? 'bg-emerald-500 text-white'
              : 'bg-marigold-400 text-stone-900'
          }`}>
            {isFree ? 'Free' : `$${price.toLocaleString()}`}
          </span>
        </div>
      </div>

      {/* Event Details */}
      <div className="p-4">
        <Link to={`/event/${id}`} className="font-display font-semibold text-stone-900 mb-2 line-clamp-2 hover:text-clay-600 transition-colors block leading-tight">{title}</Link>

        <div className="space-y-2 mb-4 text-sm text-stone-600">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-clay-500" />
            <span>{date}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-clay-500" />
            <span>{time}</span>
          </div>
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-clay-500" />
            <span className="truncate">{location}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-clay-500" />
            <span>{attendees} attending</span>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <p className="text-xs text-stone-400">By {organizer}</p>
          {spotsLeft <= 10 && spotsLeft > 0 && (
            <span className="text-xs text-clay-600 font-medium">
              Only {spotsLeft} spots left!
            </span>
          )}
        </div>

        <button
          onClick={() => onRegister?.(id)}
          disabled={spotsLeft === 0}
          className={`w-full py-2.5 px-4 rounded-xl font-medium transition-all ${
            spotsLeft === 0
              ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
              : 'bg-clay-600 text-white hover:bg-clay-700 active:scale-[0.98] shadow-sm'
          }`}
        >
          {spotsLeft === 0 ? 'Sold Out' : 'Register Now'}
        </button>
      </div>
    </div>
  );
};

export default EventCard;