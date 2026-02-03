'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { submitReviewAction } from '@/app/actions';

interface ReviewDialogProps {
    bookingId: string;
    trigger?: React.ReactNode;
    onSuccess?: () => void;
}

export function ReviewDialog({ bookingId, trigger, onSuccess }: ReviewDialogProps) {
    const [open, setOpen] = useState(false);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hoverRating, setHoverRating] = useState(0);

    const handleSubmit = async () => {
        if (rating === 0) {
            toast.error("Please select a star rating");
            return;
        }

        setIsSubmitting(true);
        try {
            const result = await submitReviewAction(bookingId, rating, comment);
            if (result.success) {
                toast.success("Review submitted! Thank you.");
                setOpen(false);
                if (onSuccess) onSuccess();
            } else {
                toast.error(result.error || "Failed to submit review");
            }
        } catch (error) {
            toast.error("Something went wrong");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button
                        variant="outline"
                        size="sm"
                        className="border-green-200 text-green-700 hover:bg-green-50 hover:text-green-800"
                    >
                        Rate Agent
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md rounded-3xl border-0 shadow-2xl overflow-hidden p-0 gap-0">

                {/* Visual Header */}
                <div className="bg-gradient-to-br from-green-50 to-white px-6 py-6 border-b border-green-100 flex flex-col items-center justify-center text-center">
                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white shadow-lg shadow-green-200 mb-4 transform rotate-3">
                        <Star className="h-6 w-6 fill-white" />
                    </div>
                    <DialogTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-700 to-green-500">
                        Rate Experience
                    </DialogTitle>
                    <DialogDescription className="text-gray-500 mt-1 max-w-[260px]">
                        How was the service provided by our agent? Your feedback helps us improve.
                    </DialogDescription>
                </div>

                <div className="p-6 space-y-6">
                    {/* Star Interaction */}
                    <div className="flex flex-col items-center gap-2">
                        <div className="flex gap-2 p-2 rounded-2xl bg-gray-50 border border-gray-100">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    onClick={() => setRating(star)}
                                    className="focus:outline-none transition-all duration-200 hover:scale-110 active:scale-95 group p-1"
                                >
                                    <Star
                                        className={`h-8 w-8 transition-colors duration-200 ${(hoverRating || rating) >= star
                                                ? 'fill-yellow-400 text-yellow-400 drop-shadow-sm'
                                                : 'text-gray-200 fill-gray-50 group-hover:text-gray-300'
                                            }`}
                                    />
                                </button>
                            ))}
                        </div>
                        <p className={`text-sm font-bold transition-all duration-300 ${rating > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                            {rating === 1 && "Poor"}
                            {rating === 2 && "Fair"}
                            {rating === 3 && "Good"}
                            {rating === 4 && "Very Good"}
                            {rating === 5 && "Excellent!"}
                            {rating === 0 && "Tap stars to rate"}
                        </p>
                    </div>

                    {/* Comment Area */}
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Comments (Optional)</label>
                        <Textarea
                            placeholder="Tell us what you liked or what we can do better..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="min-h-[100px] resize-none border-gray-200 bg-gray-50/50 focus:bg-white focus:border-green-500 focus:ring-green-500/20 rounded-xl transition-all"
                        />
                    </div>
                </div>

                <DialogFooter className="p-6 pt-0 sm:justify-between gap-3">
                    <Button
                        variant="ghost"
                        onClick={() => setOpen(false)}
                        className="flex-1 rounded-xl h-12 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting || rating === 0}
                        className="flex-[2] h-12 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white font-bold rounded-xl shadow-lg shadow-green-500/20 disabled:opacity-50 disabled:shadow-none transition-all"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                                Submitting...
                            </>
                        ) : (
                            "Submit Review"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
