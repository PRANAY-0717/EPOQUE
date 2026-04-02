"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Shield, Loader2, Lock, User, CreditCard } from "lucide-react";
import { verifyTrustee, type TrusteeSession } from "@/lib/trustee-utils";

interface TrusteeAccessModalProps {
  onClose: () => void;
  onVerified: (session: TrusteeSession) => void;
}

export function TrusteeAccessModal({ onClose, onVerified }: TrusteeAccessModalProps) {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [libraryId, setLibraryId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = "auto"; };
  }, []);

  const handleVerify = async () => {
    setError("");
    if (!code.trim() || !name.trim() || !libraryId.trim()) {
      setError("All fields are required.");
      return;
    }
    setLoading(true);
    try {
      const result = await verifyTrustee(code, name, libraryId);
      if (result.success) {
        const session: TrusteeSession = {
          name: name.trim(),
          code: code.trim(),
          library_id: libraryId.trim(),
        };
        sessionStorage.setItem("trustee-session", JSON.stringify(session));
        onVerified(session);
      } else {
        setError(result.error || "Verification failed.");
      }
    } catch {
      setError("Network error. Please try again.");
    }
    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !loading) handleVerify();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="relative w-full md:max-w-md bg-[#0a0a19] border border-white/10 rounded-t-3xl md:rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)]"
      >
        {/* Top accent */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neon-purple via-neon-cyan to-neon-purple" />
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-neon-purple/15 rounded-full blur-[60px] pointer-events-none" />

        {/* Drag handle — mobile */}
        <div className="flex justify-center pt-3 pb-1 md:hidden">
          <div className="w-10 h-1 bg-white/20 rounded-full" />
        </div>

        <div className="p-5 md:p-8">
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 md:top-4 md:right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors z-20"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-neon-purple/20 to-neon-cyan/20 border border-white/10 flex items-center justify-center shadow-[0_0_15px_rgba(138,43,226,0.2)]">
              <Shield className="w-5 h-5 text-neon-cyan" />
            </div>
            <div>
              <h2 className="text-lg font-display font-bold text-white">Trustee Access</h2>
              <p className="text-[11px] text-gray-500 font-display">Verify your identity to manage events</p>
            </div>
          </div>

          {/* Inputs */}
          <div className="flex flex-col gap-3 mb-5" onKeyDown={handleKeyDown}>
            <div>
              <label className="text-[11px] text-gray-400 font-display mb-1.5 block tracking-wide">TRUSTEE CODE</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Enter your code"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white outline-none focus:border-neon-cyan/50 focus:bg-white/[0.07] transition-all font-display placeholder:text-gray-600"
                />
              </div>
            </div>
            <div>
              <label className="text-[11px] text-gray-400 font-display mb-1.5 block tracking-wide">FULL NAME <span className="text-red-400">(CAPS ONLY)</span></label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value.toUpperCase())}
                  placeholder="e.g. PRANAY JAISWAL"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white outline-none focus:border-neon-cyan/50 focus:bg-white/[0.07] transition-all font-display placeholder:text-gray-600 uppercase"
                />
              </div>
            </div>
            <div>
              <label className="text-[11px] text-gray-400 font-display mb-1.5 block tracking-wide">LIBRARY ID</label>
              <div className="relative">
                <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  value={libraryId}
                  onChange={(e) => setLibraryId(e.target.value)}
                  placeholder="Enter your library ID"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white outline-none focus:border-neon-cyan/50 focus:bg-white/[0.07] transition-all font-display placeholder:text-gray-600"
                />
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 px-3.5 py-2.5 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-400 font-display"
            >
              {error}
            </motion.div>
          )}

          {/* Submit */}
          <button
            onClick={handleVerify}
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-neon-purple to-neon-cyan text-black font-display font-bold text-sm tracking-wide active:scale-[0.97] transition-transform disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,240,255,0.2)]"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verifying...</span>
              </>
            ) : (
              <>
                <Shield className="w-4 h-4" />
                <span>Verify &amp; Access</span>
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
