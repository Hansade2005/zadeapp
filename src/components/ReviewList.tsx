import React, { useState, useEffect } from 'react';
import { Star, ThumbsUp, MessageCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Review {
  id: string;
  user_id: string;
  rating: number;
  comment: string;
  created_at: string;
  user?: {
    full_name: string;
    avatar_url?: string;
  };
}

interface ReviewListProps {
  entityType: 'product' | 'job' | 'event' | 'artiste' | 'freelancer';
  entityId: string;
  averageRating: number;
  reviewCount: number;
}

export const ReviewList: React.FC<ReviewListProps> = ({
  entityType,
  entityId,
  averageRating,
  reviewCount,
}) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [ratingDistribution, setRatingDistribution] = useState<Record<number, number>>({
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0,
  });

  useEffect(() => {
    fetchReviews();
  }, [entityType, entityId]);

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('entity_type', entityType)
        .eq('entity_id', entityId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching reviews:', error);
        return;
      }

      // Fetch user details for each review
      const reviewsWithUsers = await Promise.all(
        (data || []).map(async (review) => {
          const { data: userData } = await supabase
            .from('users')
            .select('full_name, avatar_url')
            .eq('id', review.user_id)
            .single();

          return {
            ...review,
            user: userData || { full_name: 'Anonymous User' },
          };
        })
      );

      setReviews(reviewsWithUsers);

      // Calculate rating distribution
      const distribution: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      reviewsWithUsers.forEach((review) => {
        distribution[review.rating] = (distribution[review.rating] || 0) + 1;
      });
      setRatingDistribution(distribution);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number, size = 'md') => {
    const sizeClasses = {
      sm: 'h-4 w-4',
      md: 'h-5 w-5',
      lg: 'h-6 w-6',
    };

    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClasses[size]} ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Rating Summary */}
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Customer Reviews</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Overall Rating */}
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
              <span className="text-4xl font-bold text-gray-900">
                {averageRating > 0 ? averageRating.toFixed(1) : '0.0'}
              </span>
              <div>
                {renderStars(Math.round(averageRating), 'lg')}
                <p className="text-sm text-gray-600">
                  Based on {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
                </p>
              </div>
            </div>
          </div>

          {/* Rating Distribution */}
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = ratingDistribution[rating] || 0;
              const percentage = reviewCount > 0 ? (count / reviewCount) * 100 : 0;

              return (
                <div key={rating} className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 w-6">{rating}</span>
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-8 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="divide-y divide-gray-200">
        {reviews.length === 0 ? (
          <div className="p-6 text-center">
            <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No reviews yet. Be the first to review!</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="p-6">
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  {review.user?.avatar_url ? (
                    <img
                      src={review.user.avatar_url}
                      alt={review.user.full_name}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                      <span className="text-indigo-600 font-medium">
                        {review.user?.full_name?.[0]?.toUpperCase() || 'A'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Review Content */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-medium text-gray-900">
                        {review.user?.full_name || 'Anonymous User'}
                      </p>
                      <div className="flex items-center gap-2">
                        {renderStars(review.rating, 'sm')}
                        <span className="text-sm text-gray-500">
                          {new Date(review.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {review.comment && (
                    <p className="text-gray-700 mt-2">{review.comment}</p>
                  )}

                  {/* Review Actions (Future: helpful, report, etc.) */}
                  <div className="flex items-center gap-4 mt-3">
                    <button className="text-sm text-gray-600 hover:text-indigo-600 flex items-center gap-1">
                      <ThumbsUp className="h-4 w-4" />
                      Helpful
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
