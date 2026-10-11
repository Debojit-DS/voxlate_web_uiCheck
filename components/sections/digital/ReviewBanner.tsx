"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Star, SquareCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/components/auth/AuthProvider";

type Review = {
  id: string;
  authorName: string;
  authorPhotoUrl: string | null;
  userEmail: string | null;
  text: string;
  rating: number;
  createdAt: string;
};

const INITIAL_VISIBLE = 6;

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5" aria-label={`${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} size={14} aria-hidden className={n <= rating ? "fill-primary text-primary" : "text-line-strong"} />
      ))}
    </span>
  );
}

function timeAgo(timestamp: string): string {
  const seconds = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function ReviewBanner() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [reviewText, setReviewText] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [rating, setRating] = useState(0);
  const [showAll, setShowAll] = useState(false);
  const { user, isLoading: isAuthLoading } = useAuth();
  const formHeading = useRef<HTMLHeadingElement>(null);

  const sortReviews = useCallback((items: Review[]) => {
    return [...items].sort((a, b) => {
      if (b.rating !== a.rating) return b.rating - a.rating;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, []);

  const fetchReviews = useCallback(async () => {
    try {
      const res = await fetch("/api/reviews");
      if (!res.ok) throw new Error("Failed to fetch reviews");
      const data = await res.json();
      if (data.status === "success") setReviews(sortReviews(data.reviews));
      else throw new Error("Unexpected response");
    } catch (err) {
      console.error("fetch reviews error", err);
      setLoadError("Reviews couldn't be loaded right now.");
    } finally {
      setIsLoading(false);
    }
  }, [sortReviews]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  useEffect(() => {
    const handler = () => {
      setIsFormOpen(true);
      setSubmitted(false);
      requestAnimationFrame(() => formHeading.current?.focus());
    };
    window.addEventListener("review:open-form", handler);
    return () => window.removeEventListener("review:open-form", handler);
  }, []);

  const isVerifiedUser = !!user;
  const nameValue = isVerifiedUser ? user.name : authorName;
  const canSubmit = !!reviewText.trim() && rating > 0 && !!nameValue.trim() && !isSubmitting && !isAuthLoading;

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const payload: {
        text: string;
        rating: number;
        authorName?: string;
        authorPhotoUrl?: string | null;
        userEmail?: string;
      } = { text: reviewText.trim(), rating };

      if (user) {
        payload.authorName = user.name;
        payload.authorPhotoUrl = user.photoUrl ?? null;
        payload.userEmail = user.email;
      } else {
        payload.authorName = authorName.trim();
      }

      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Failed to submit review");
      }

      const data = await res.json();
      if (data.status === "success" && data.review) {
        setReviews((prev) => sortReviews([data.review, ...prev]));
        setReviewText("");
        setRating(0);
        setIsFormOpen(false);
        setSubmitted(true);
      }
    } catch (err) {
      console.error("submit review error", err);
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const visible = showAll ? reviews : reviews.slice(0, INITIAL_VISIBLE);

  return (
    <section id="reviews" aria-labelledby="reviews-title" className="page-container mt-20 md:mt-24">
      <div className="flex flex-col gap-4 border-t border-line pt-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 id="reviews-title" className="display-section">Reviews from demo users</h2>
          <p className="mt-2 text-[15px] text-slate">
            {isLoading ? "Loading reviews…" : loadError ? "" : `${reviews.length} review${reviews.length === 1 ? "" : "s"}`}
          </p>
        </div>
        {!isFormOpen && (
          <Button variant="secondary" onClick={() => { setIsFormOpen(true); setSubmitted(false); }}>
            Leave a review
          </Button>
        )}
      </div>

      {submitted && (
        <p role="status" className="mt-6 rounded-[12px] bg-success-tint px-4 py-3 text-[15px] text-success">
          Thanks — your review has been posted.
        </p>
      )}

      {isFormOpen && (
        <form onSubmit={handleSubmitReview} className="mt-8 max-w-[640px] space-y-5 rounded-[18px] border border-line bg-surface p-6 sm:p-8">
          <h3 ref={formHeading} tabIndex={-1} className="text-[19px] font-semibold text-ink">
            Leave a review
          </h3>

          <div>
            <label htmlFor="review-name" className="field-label">
              Your name
              {isVerifiedUser && (
                <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-mist px-2 py-0.5 text-[12px] font-medium text-primary">
                  <SquareCheck size={12} aria-hidden />
                  Signed in
                </span>
              )}
            </label>
            <input
              id="review-name"
              type="text"
              autoComplete="name"
              value={nameValue}
              onChange={(e) => !isVerifiedUser && setAuthorName(e.target.value)}
              readOnly={isVerifiedUser}
              className="field read-only:bg-mist"
            />
          </div>

          <fieldset>
            <legend className="field-label">Rating</legend>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <label key={n} className="cursor-pointer rounded-[6px] p-1 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-primary">
                  <input type="radio" name="rating" value={n} checked={rating === n} onChange={() => setRating(n)} className="sr-only" />
                  <Star size={24} aria-hidden className={n <= rating ? "fill-primary text-primary" : "text-line-strong"} />
                  <span className="sr-only">{n} star{n > 1 ? "s" : ""}</span>
                </label>
              ))}
              <span className="ml-2 text-[14px] text-slate">{rating > 0 ? `${rating} of 5` : "Choose a rating"}</span>
            </div>
          </fieldset>

          <div>
            <label htmlFor="review-text" className="field-label">Your review</label>
            <textarea
              id="review-text"
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              rows={4}
              className="field resize-y"
            />
          </div>

          {error && <p role="alert" className="field-error">{error}</p>}

          <div className="flex flex-wrap items-center gap-3">
            <Button type="submit" disabled={!canSubmit} loading={isSubmitting}>
              {isSubmitting ? "Posting…" : "Post review"}
            </Button>
            <Button variant="quiet" onClick={() => setIsFormOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      <div className="mt-8">
        {isLoading ? (
          <p className="py-6 text-[15px] text-slate">Loading reviews…</p>
        ) : loadError ? (
          <p className="py-6 text-[15px] text-slate">
            {loadError}{" "}
            <button
              type="button"
              className="text-link"
              onClick={() => {
                setIsLoading(true);
                setLoadError(null);
                fetchReviews();
              }}
            >
              Try again
            </button>
          </p>
        ) : reviews.length === 0 ? (
          <p className="py-6 text-[15px] text-slate">No reviews yet. If you try the demo, you can be the first.</p>
        ) : (
          <>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {visible.map((review) => (
                <li key={review.id} className="rounded-[14px] border border-line bg-surface p-5">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-mist text-[13px] font-semibold text-primary">
                      {review.authorPhotoUrl ? (
                        <img src={review.authorPhotoUrl} alt="" className="h-full w-full object-cover" />
                      ) : (
                        review.authorName.charAt(0).toUpperCase()
                      )}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-[15px] font-medium text-ink">{review.authorName}</p>
                      <p className="flex items-center gap-2 text-[12px] text-slate">
                        <Stars rating={review.rating} />
                        <time dateTime={review.createdAt}>{timeAgo(review.createdAt)}</time>
                      </p>
                    </div>
                  </div>
                  <p className="mt-3 text-[15px] leading-relaxed text-ink">{review.text}</p>
                </li>
              ))}
            </ul>
            {reviews.length > INITIAL_VISIBLE && (
              <div className="mt-6">
                <Button variant="secondary" size="sm" onClick={() => setShowAll((s) => !s)}>
                  {showAll ? "Show fewer" : `Show all ${reviews.length} reviews`}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
