"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, X } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

interface RatingModalProps {
  showSplash: boolean;
}

export function RatingModal({ showSplash }: RatingModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    // If the splash is visible, do nothing just yet.
    if (showSplash) return;

    // Check if user has already submitted a rating.
    const hasSubmitted = localStorage.getItem("epoque_rating_submitted");
    if (hasSubmitted === "true") return;

    // Delay showing the popup to make it natural and not block UI
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, [showSplash]);

  const handleSubmit = async () => {
    if (rating === 0) return;
    
    setIsSubmitting(true);
    
    try {
      // Basic device ID generation for simple tracking
      let deviceId = localStorage.getItem("epoque_device_id");
      if (!deviceId) {
        // crypto.randomUUID is not available in non-secure contexts sometimes, fallback to Math.random
        deviceId = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2);
        localStorage.setItem("epoque_device_id", deviceId);
      }

      await supabase.from("ratings").insert([
        {
          rating,
          device_id: deviceId,
        }
      ]);
    } catch {
      // Ignore network errors, fail gracefully
    } finally {
      localStorage.setItem("epoque_rating_submitted", "true");
      setIsSubmitting(false);
      setIsSuccess(true);
      
      // Close smoothly after success message
      setTimeout(() => {
        setIsVisible(false);
      }, 2000);
    }
  };

  const handleSkip = () => {
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: -20, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="w-full max-w-sm relative bg-[#030308]/90 border border-white/10 p-6 rounded-3xl shadow-[0_40px_80px_rgba(0,0,0,0.6)] overflow-hidden"
          >
            {/* Subtle glow layers */}
            <div className="absolute top-[-20%] left-[-20%] w-[50%] h-[50%] bg-neon-cyan/20 blur-[70px] pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-20%] w-[50%] h-[50%] bg-neon-purple/20 blur-[70px] pointer-events-none" />



            <div className="relative z-10 flex flex-col items-center text-center">
              {isSuccess ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center py-6"
                >
                  <div className="w-14 h-14 rounded-full bg-neon-cyan/20 flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(0,240,255,0.3)]">
                    <Star className="w-7 h-7 text-neon-cyan fill-neon-cyan" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-display font-bold text-white mb-2">
                    Thanks for your feedback 🙌
                  </h3>
                  <p className="text-sm text-gray-400 font-display">
                    Your rating helps us improve.
                  </p>
                </motion.div>
              ) : (
                <>
                  <h3 className="text-xl md:text-2xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300 mb-3 mt-2">
                    Hope you are enjoying Epoque ✨
                  </h3>
                  <p className="text-sm text-gray-400 font-display mb-8 leading-relaxed">
                    This website was built to make your experience smoother over these days. 
                    <br/><br/>
                    If it helped you even a little, please rate it 🙌
                  </p>

                  <div className="flex gap-2 mb-8" onMouseLeave={() => setHoveredRating(0)}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onMouseEnter={() => setHoveredRating(star)}
                        onClick={() => setRating(star)}
                        className={`relative p-2.5 transition-transform active:scale-90 ${rating === star ? "scale-110" : ""}`}
                      >
                        <Star 
                          className={`w-8 h-8 md:w-9 md:h-9 transition-colors ${
                            (hoveredRating || rating) >= star 
                              ? "text-neon-cyan fill-neon-cyan drop-shadow-[0_0_12px_rgba(0,240,255,0.7)]" 
                              : "text-gray-700/80 fill-transparent"
                          }`} 
                        />
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={handleSubmit}
                    disabled={rating === 0 || isSubmitting}
                    className={`w-full py-3.5 rounded-xl font-display font-bold tracking-widest text-sm transition-all duration-300 ${
                      rating > 0 
                        ? "bg-gradient-to-r from-neon-cyan to-neon-purple text-white shadow-[0_0_20px_rgba(0,240,255,0.4)] hover:shadow-[0_0_30px_rgba(0,240,255,0.6)] active:scale-95" 
                        : "bg-white/5 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    {isSubmitting ? "SUBMITTING..." : rating === 0 ? "RATE TO CONTINUE" : "SUBMIT RATING"}
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
