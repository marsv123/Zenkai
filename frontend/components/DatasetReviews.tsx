'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Star, MessageCircle, User, Calendar, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Review {
  id: string;
  datasetId: string;
  reviewerId: string;
  rating: number;
  comment?: string;
  isVerifiedPurchase: boolean;
  createdAt: Date;
}

interface Dataset {
  id: string;
  title: string;
  rating?: string;
  reviewCount: number;
}

interface DatasetReviewsProps {
  datasetId: string;
  datasetTitle: string;
  allowReview?: boolean;
}

export default function DatasetReviews({ datasetId, datasetTitle, allowReview = true }: DatasetReviewsProps) {
  const { address } = useAccount();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 0,
    comment: ''
  });
  const [hoveredStar, setHoveredStar] = useState(0);

  // Fetch reviews for this dataset
  const { data: reviews = [], isLoading: reviewsLoading } = useQuery({
    queryKey: ['/api/reviews/dataset', datasetId],
    refetchInterval: 60000,
  });

  // Fetch dataset stats
  const { data: datasetStats } = useQuery({
    queryKey: ['/api/datasets', datasetId, 'stats'],
    refetchInterval: 60000,
  });

  // Check if user has already reviewed this dataset
  const userReview = reviews.find((review: Review) => 
    review.reviewerId === address
  );

  // Submit review mutation
  const submitReviewMutation = useMutation({
    mutationFn: async (reviewData: { rating: number; comment: string }) => {
      if (!address) throw new Error('Wallet not connected');
      
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          datasetId,
          reviewerId: address,
          rating: reviewData.rating,
          comment: reviewData.comment,
          isVerifiedPurchase: false, // TODO: Check if user actually purchased dataset
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to submit review');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/reviews/dataset', datasetId] });
      queryClient.invalidateQueries({ queryKey: ['/api/datasets', datasetId, 'stats'] });
      setShowReviewForm(false);
      setNewReview({ rating: 0, comment: '' });
      toast({
        title: "Review Submitted",
        description: "Thank you for your feedback!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit review",
        variant: "destructive",
      });
    },
  });

  // Update review mutation
  const updateReviewMutation = useMutation({
    mutationFn: async (reviewData: { rating: number; comment: string }) => {
      if (!userReview) throw new Error('No existing review to update');
      
      const response = await fetch(`/api/reviews/${userReview.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating: reviewData.rating,
          comment: reviewData.comment,
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update review');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/reviews/dataset', datasetId] });
      queryClient.invalidateQueries({ queryKey: ['/api/datasets', datasetId, 'stats'] });
      setShowReviewForm(false);
      toast({
        title: "Review Updated",
        description: "Your review has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update review",
        variant: "destructive",
      });
    },
  });

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newReview.rating === 0) {
      toast({
        title: "Rating Required",
        description: "Please select a rating before submitting.",
        variant: "destructive",
      });
      return;
    }

    if (userReview) {
      updateReviewMutation.mutate(newReview);
    } else {
      submitReviewMutation.mutate(newReview);
    }
  };

  // Initialize form with existing review if user has one
  useEffect(() => {
    if (userReview && showReviewForm) {
      setNewReview({
        rating: userReview.rating,
        comment: userReview.comment || ''
      });
    }
  }, [userReview, showReviewForm]);

  const renderStars = (rating: number, interactive = false, size = 'w-5 h-5') => {
    return Array.from({ length: 5 }, (_, i) => {
      const starRating = i + 1;
      const isFilled = starRating <= (interactive ? (hoveredStar || newReview.rating) : rating);
      
      return (
        <Star
          key={i}
          className={`${size} ${
            isFilled 
              ? 'text-yellow-400 fill-yellow-400' 
              : 'text-gray-300'
          } ${interactive ? 'cursor-pointer hover:text-yellow-400' : ''}`}
          onClick={interactive ? () => setNewReview(prev => ({ ...prev, rating: starRating })) : undefined}
          onMouseEnter={interactive ? () => setHoveredStar(starRating) : undefined}
          onMouseLeave={interactive ? () => setHoveredStar(0) : undefined}
        />
      );
    });
  };

  const averageRating = datasetStats?.rating || 0;
  const totalReviews = datasetStats?.reviewCount || reviews.length;

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4 flex items-center">
          <Star className="text-yellow-400 mr-2" />
          Reviews & Ratings
        </h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-yellow-400 mb-2">
              {averageRating.toFixed(1)}
            </div>
            <div className="flex justify-center mb-2">
              {renderStars(Math.round(averageRating))}
            </div>
            <div className="text-sm text-muted-foreground">
              Based on {totalReviews} review{totalReviews !== 1 ? 's' : ''}
            </div>
          </div>
          
          {/* Rating Distribution (placeholder) */}
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map(stars => {
              const count = reviews.filter((r: Review) => r.rating === stars).length;
              const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
              
              return (
                <div key={stars} className="flex items-center space-x-3 text-sm">
                  <span className="w-8">{stars}★</span>
                  <div className="flex-1 bg-muted rounded-full h-2">
                    <div 
                      className="bg-yellow-400 h-2 rounded-full" 
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="w-8 text-muted-foreground">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Add/Edit Review */}
      {allowReview && address && (
        <div className="bg-card border border-border rounded-lg p-6">
          {!showReviewForm ? (
            <div className="text-center">
              <button
                onClick={() => setShowReviewForm(true)}
                className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center mx-auto space-x-2"
                data-testid="button-add-review"
              >
                <MessageCircle className="w-4 h-4" />
                <span>{userReview ? 'Edit Your Review' : 'Write a Review'}</span>
              </button>
              
              {userReview && (
                <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {renderStars(userReview.rating)}
                      <span className="text-sm text-muted-foreground">Your review</span>
                    </div>
                    <button
                      onClick={() => setShowReviewForm(true)}
                      className="text-xs text-primary hover:underline"
                      data-testid="button-edit-review"
                    >
                      Edit
                    </button>
                  </div>
                  {userReview.comment && (
                    <p className="text-sm text-muted-foreground">{userReview.comment}</p>
                  )}
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Rating *</label>
                <div className="flex items-center space-x-2">
                  {renderStars(newReview.rating, true, 'w-8 h-8')}
                  <span className="text-sm text-muted-foreground ml-4">
                    {newReview.rating > 0 ? `${newReview.rating} out of 5 stars` : 'Select a rating'}
                  </span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Comment (optional)</label>
                <textarea
                  value={newReview.comment}
                  onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                  className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent resize-none"
                  rows={4}
                  placeholder="Share your experience with this dataset..."
                  data-testid="input-review-comment"
                />
              </div>
              
              <div className="flex items-center space-x-3">
                <button
                  type="submit"
                  disabled={submitReviewMutation.isPending || updateReviewMutation.isPending}
                  className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  data-testid="button-submit-review"
                >
                  {(submitReviewMutation.isPending || updateReviewMutation.isPending) && (
                    <div className="animate-spin w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full" />
                  )}
                  <span>{userReview ? 'Update Review' : 'Submit Review'}</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    setShowReviewForm(false);
                    setNewReview({ rating: 0, comment: '' });
                    setHoveredStar(0);
                  }}
                  className="px-6 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors"
                  data-testid="button-cancel-review"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        <h4 className="font-semibold text-lg">Reviews ({totalReviews})</h4>
        
        {reviewsLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-card border border-border rounded-lg p-4 animate-pulse">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-muted rounded-full" />
                  <div className="flex-1">
                    <div className="h-4 bg-muted rounded mb-2 w-1/4" />
                    <div className="h-3 bg-muted rounded mb-2 w-1/3" />
                    <div className="h-3 bg-muted rounded w-3/4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((review: Review) => (
              <div key={review.id} className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-primary-foreground" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <span className="font-medium text-sm">
                          {review.reviewerId.slice(0, 6)}...{review.reviewerId.slice(-4)}
                        </span>
                        {review.isVerifiedPurchase && (
                          <div className="flex items-center space-x-1 text-xs text-green-600">
                            <CheckCircle className="w-3 h-3" />
                            <span>Verified Purchase</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 mb-3">
                      {renderStars(review.rating, false, 'w-4 h-4')}
                      <span className="text-sm font-medium">{review.rating}/5</span>
                    </div>
                    
                    {review.comment && (
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {review.comment}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground bg-card border border-border rounded-lg">
            <MessageCircle className="mx-auto mb-2 w-8 h-8 opacity-50" />
            <p>No reviews yet</p>
            <p className="text-xs">Be the first to review this dataset!</p>
          </div>
        )}
      </div>
    </div>
  );
}