import { useState } from "react";
import { motion } from "framer-motion";
import { Star, Send, MessageSquareHeart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getDeviceId, getUserName } from "@/lib/device";
import { toast } from "sonner";

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.35, ease: [0, 0, 0.2, 1] as const },
  }),
};

export function FeedbackSection({ customIndex = 4 }: { customIndex?: number }) {
  const [feedback, setFeedback] = useState("");
  const [sending, setSending] = useState(false);

  const handleSendFeedback = async () => {
    const trimmed = feedback.trim();
    if (!trimmed || sending) return;
    setSending(true);
    try {
      await supabase.from("feedback").insert({
        device_id: getDeviceId(),
        user_name: getUserName(),
        message: trimmed,
      });
      setFeedback("");
      toast.success("Thank you for your feedback! 🙏");
    } catch {
      toast.error("Failed to send feedback");
    } finally {
      setSending(false);
    }
  };

  return (
    <motion.div custom={customIndex} initial="hidden" animate="visible" variants={cardVariants} className="rounded-xl border bg-card p-4 sm:p-5">
      <div className="flex items-center gap-2 mb-3">
        <MessageSquareHeart className="h-4 w-4 text-primary" />
        <h3 className="font-semibold text-foreground">Send Feedback</h3>
      </div>
      <p className="text-sm text-muted-foreground mb-3">Help us improve మంత్రాలు</p>
      <textarea
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        placeholder="Share your thoughts, suggestions, or report issues..."
        rows={3}
        maxLength={1000}
        className="w-full resize-none rounded-xl border bg-background px-3.5 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all mb-2"
      />
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={handleSendFeedback}
        disabled={!feedback.trim() || sending}
        className="w-full rounded-xl bg-primary text-primary-foreground py-2.5 text-sm font-medium disabled:opacity-50 transition-opacity flex items-center justify-center gap-2"
      >
        <Send className="h-3.5 w-3.5" />
        {sending ? "Sending..." : "Send Feedback"}
      </motion.button>
    </motion.div>
  );
}

export function ReviewSection({ customIndex = 5 }: { customIndex?: number }) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [sending, setSending] = useState(false);

  const handleSubmitReview = async () => {
    if (rating === 0 || sending) return;
    const userName = getUserName();
    if (!userName) {
      toast.error("Please set your name first");
      return;
    }
    setSending(true);
    try {
      await supabase.from("reviews").insert({
        device_id: getDeviceId(),
        user_name: userName,
        rating,
        comment: comment.trim() || null,
      });
      setRating(0);
      setComment("");
      toast.success("Thank you for your review! ⭐");
    } catch {
      toast.error("Failed to submit review");
    } finally {
      setSending(false);
    }
  };

  return (
    <motion.div custom={customIndex} initial="hidden" animate="visible" variants={cardVariants} className="rounded-xl border bg-card p-4 sm:p-5">
      <div className="flex items-center gap-2 mb-3">
        <Star className="h-4 w-4 text-primary fill-primary" />
        <h3 className="font-semibold text-foreground">Rate & Review</h3>
      </div>
      <p className="text-sm text-muted-foreground mb-3">How's your experience with మంత్రాలు?</p>

      {/* Star rating */}
      <div className="flex items-center justify-center gap-1 mb-3">
        {[1, 2, 3, 4, 5].map((star) => (
          <motion.button
            key={star}
            whileTap={{ scale: 0.85 }}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => setRating(star)}
            className="p-1"
          >
            <Star
              className={`h-8 w-8 transition-colors ${
                star <= (hovered || rating)
                  ? "text-primary fill-primary"
                  : "text-muted-foreground/30"
              }`}
            />
          </motion.button>
        ))}
      </div>
      {rating > 0 && (
        <p className="text-center text-xs text-muted-foreground mb-3">
          {rating === 5 ? "Excellent! 🌟" : rating === 4 ? "Great! 😊" : rating === 3 ? "Good 👍" : rating === 2 ? "Could be better" : "We'll improve 🙏"}
        </p>
      )}

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Add a comment (optional)..."
        rows={2}
        maxLength={500}
        className="w-full resize-none rounded-xl border bg-background px-3.5 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all mb-2"
      />
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={handleSubmitReview}
        disabled={rating === 0 || sending}
        className="w-full rounded-xl bg-primary text-primary-foreground py-2.5 text-sm font-medium disabled:opacity-50 transition-opacity flex items-center justify-center gap-2"
      >
        <Star className="h-3.5 w-3.5" />
        {sending ? "Submitting..." : "Submit Review"}
      </motion.button>
    </motion.div>
  );
}
