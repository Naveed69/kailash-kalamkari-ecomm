import React, { useState, useEffect, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import {
  MessageSquare,
  CheckCircle2,
  Trash2,
  Star,
  Loader2,
  Filter,
  ThumbsUp,
  Sparkles,
  Award,
  Clock,
} from "lucide-react";
import {
  getAllReviews,
  approveReview,
  toggleReviewFeatured,
  deleteReview,
  type Review,
} from "@/lib/reviewsApi";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { AlertCircle } from "lucide-react";

type FilterType = "all" | "pending" | "approved";

const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((s) => (
      <Star
        key={s}
        className={`h-3.5 w-3.5 ${s <= rating ? "fill-amber-400 text-amber-400" : "text-slate-200"}`}
      />
    ))}
  </div>
);

const Reviews = () => {
  const { toast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllReviews();
      setReviews(data);
    } catch {
      toast({ title: "Error", description: "Failed to load reviews", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  const filteredReviews = reviews.filter((r) => {
    if (filter === "pending") return !r.is_approved;
    if (filter === "approved") return r.is_approved;
    return true;
  });

  const pendingCount = reviews.filter((r) => !r.is_approved).length;
  const approvedCount = reviews.filter((r) => r.is_approved).length;

  const handleApprove = async (id: string) => {
    setProcessingId(id);
    try {
      await approveReview(id);
      toast({ title: "Review Approved", className: "bg-green-50 border-green-200" });
      fetchReviews();
    } catch {
      toast({ title: "Error", description: "Failed to approve review", variant: "destructive" });
    } finally {
      setProcessingId(null);
    }
  };

  const handleToggleFeatured = async (id: string, current: boolean) => {
    setProcessingId(id);
    try {
      await toggleReviewFeatured(id, current);
      toast({
        title: current ? "Removed from Featured" : "Added to Featured",
        className: "bg-purple-50 border-purple-200",
      });
      fetchReviews();
    } catch {
      toast({ title: "Error", description: "Failed to update review", variant: "destructive" });
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    setProcessingId(id);
    try {
      await deleteReview(id);
      toast({ title: "Review Deleted", className: "bg-red-50 border-red-200" });
      fetchReviews();
    } catch {
      toast({ title: "Error", description: "Failed to delete review", variant: "destructive" });
    } finally {
      setProcessingId(null);
      setConfirmDeleteId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 p-6 md:p-8 space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
            <Star className="h-8 w-8 text-amber-400 fill-amber-400" />
            Reviews
          </h1>
          <p className="text-slate-500 mt-1">
            Moderate customer product reviews
            {pendingCount > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                {pendingCount} pending
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm text-center">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Total</p>
          <p className="text-2xl font-bold text-slate-900">{reviews.length}</p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 shadow-sm text-center">
          <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider mb-1">Pending</p>
          <p className="text-2xl font-bold text-amber-700">{pendingCount}</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 shadow-sm text-center">
          <p className="text-xs font-semibold text-green-600 uppercase tracking-wider mb-1">Approved</p>
          <p className="text-2xl font-bold text-green-700">{approvedCount}</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 p-1 bg-slate-100 rounded-xl w-fit">
        {(["all", "pending", "approved"] as FilterType[]).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all capitalize flex items-center gap-2 ${
              filter === status
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {status}
            {status === "pending" && pendingCount > 0 && (
              <span className="px-1.5 py-0.5 bg-amber-500 text-white text-xs rounded-full min-w-[20px] text-center">
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Reviews List */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-10 h-10 animate-spin text-slate-300" />
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="h-8 w-8 text-slate-300" />
          </div>
          <h3 className="text-xl font-bold text-slate-700">
            {filter === "pending" ? "No pending reviews" : "No reviews yet"}
          </h3>
          <p className="text-slate-500 text-sm mt-2">
            {filter === "pending"
              ? "All reviews have been moderated."
              : "Reviews will appear here when customers submit them."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredReviews.map((review) => (
            <div
              key={review.id}
              className={`bg-white rounded-2xl border p-5 transition-all hover:shadow-md ${
                !review.is_approved
                  ? "border-amber-200 bg-amber-50/30"
                  : "border-slate-100"
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white font-bold text-sm shrink-0">
                  {review.customer_name.charAt(0).toUpperCase()}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center flex-wrap gap-2 mb-2">
                    <span className="font-semibold text-slate-900">{review.customer_name}</span>
                    <StarRating rating={review.rating} />
                    <span className="text-xs text-slate-400">
                      {new Date(review.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </span>

                    {/* Status badges */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {!review.is_approved && (
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full flex items-center gap-1">
                          <Clock className="h-3 w-3" /> Pending
                        </span>
                      )}
                      {review.is_featured && (
                        <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded-full flex items-center gap-1">
                          <Award className="h-3 w-3" /> Featured
                        </span>
                      )}
                      {review.is_verified_purchase && (
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" /> Verified
                        </span>
                      )}
                    </div>
                  </div>

                  {review.product_name && (
                    <p className="text-xs text-slate-400 mb-2">Product: <span className="text-slate-600 font-medium">{review.product_name}</span></p>
                  )}

                  {review.title && (
                    <h4 className="font-semibold text-slate-800 mb-1">{review.title}</h4>
                  )}
                  {review.content && (
                    <p className="text-sm text-slate-600 leading-relaxed">{review.content}</p>
                  )}

                  <div className="flex items-center gap-3 mt-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <ThumbsUp className="h-3 w-3" /> {review.helpful_count} helpful
                    </span>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {!review.is_approved && (
                    <button
                      onClick={() => handleApprove(review.id)}
                      disabled={processingId === review.id}
                      className="p-2 rounded-xl hover:bg-emerald-50 text-slate-300 hover:text-emerald-600 transition-colors"
                      title="Approve"
                    >
                      {processingId === review.id ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <CheckCircle2 className="h-5 w-5" />
                      )}
                    </button>
                  )}
                  <button
                    onClick={() => handleToggleFeatured(review.id, review.is_featured)}
                    disabled={processingId === review.id}
                    className={`p-2 rounded-xl transition-colors ${
                      review.is_featured
                        ? "bg-purple-50 text-purple-600"
                        : "text-slate-300 hover:bg-slate-50 hover:text-slate-500"
                    }`}
                    title={review.is_featured ? "Remove from featured" : "Mark as featured"}
                  >
                    <Star className={`h-5 w-5 ${review.is_featured ? "fill-current" : ""}`} />
                  </button>
                  <button
                    onClick={() => setConfirmDeleteId(review.id)}
                    disabled={processingId === review.id}
                    className="p-2 rounded-xl text-slate-300 hover:bg-red-50 hover:text-red-500 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirm Delete Dialog */}
      <Dialog open={!!confirmDeleteId} onOpenChange={(open) => { if (!open) setConfirmDeleteId(null); }}>
        <DialogContent className="sm:max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Delete Review?
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-600">This action cannot be undone. The review will be permanently removed.</p>
          <DialogFooter className="gap-3 mt-4">
            <Button variant="outline" onClick={() => setConfirmDeleteId(null)} className="rounded-xl h-10 flex-1">
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => confirmDeleteId && handleDelete(confirmDeleteId)}
              className="rounded-xl h-10 flex-1"
              disabled={!!processingId}
            >
              {processingId ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Reviews;
