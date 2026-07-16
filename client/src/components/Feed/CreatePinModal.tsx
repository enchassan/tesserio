// client/src/components/Feed/CreatePinModal.tsx
"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";

interface CreatePinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPinCreated: () => void;
}

export const CreatePinModal: React.FC<CreatePinModalProps> = ({
  isOpen,
  onClose,
  onPinCreated,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [aspectRatio, setAspectRatio] = useState<number>(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // AUTOMATIC ASPECT RATIO DETECTION
  // Runs whenever mediaUrl changes. Calculates the native ratio in the background.
  useEffect(() => {
    if (!mediaUrl) {
      setAspectRatio(1);
      return;
    }

    const img = new Image();
    img.src = mediaUrl;
    img.onload = () => {
      const ratio = img.naturalWidth / img.naturalHeight;
      setAspectRatio(ratio);
    };
    // Fallback if image fails to load
    img.onerror = () => setAspectRatio(1);
  }, [mediaUrl]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !mediaUrl) {
      setError("Title and Media URL are required fields.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const response = await api.post("/pins", {
        title,
        description,
        mediaUrl,
        aspectRatio, // Now calculated automatically!
        mediaType: "image",
      });

      if (response.data.status === "success") {
        setTitle("");
        setDescription("");
        setMediaUrl("");
        setAspectRatio(1);

        onPinCreated();
        onClose();
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Failed to publish new pin asset.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-stretch md:items-center justify-center p-0 md:p-4">
      <div className="bg-brand-surface w-full h-full md:h-auto md:max-w-2xl rounded-none md:rounded-2xl border-0 md:border border-white/10 p-4 md:p-6 shadow-2xl relative flex flex-col overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 md:top-4 md:right-4 text-brand-muted hover:text-white font-bold text-sm z-10"
        >
          ✕
        </button>

        <h2 className="text-lg md:text-xl font-bold text-white mb-4 md:mb-6 tracking-wide font-mono pr-8">
          CREATE NEW PIN ASSET
        </h2>

        {error && (
          <p className="text-red-500 text-xs mb-4 p-2.5 rounded bg-red-500/10 border border-red-500/20">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 flex-1">
          {/* Upload preview zone — stacked on top for mobile */}
          <div className="order-first w-full min-h-[140px] md:min-h-[180px] border-2 border-dashed border-white/10 rounded-xl flex items-center justify-center bg-brand-bg/40 overflow-hidden shrink-0">
            {mediaUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={mediaUrl}
                alt="Preview"
                className="w-full h-auto max-h-[180px] md:max-h-[220px] object-contain rounded-lg"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            ) : (
              <div className="text-center px-4 py-6">
                <p className="text-xs font-mono text-brand-muted uppercase tracking-widest">
                  Image Preview
                </p>
                <p className="text-[11px] text-white/40 mt-1">
                  Paste a media URL below to preview
                </p>
              </div>
            )}
          </div>

          <div className="order-last flex flex-col gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-brand-muted mb-1.5 font-semibold">
                Pin Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-brand-bg/80 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-accent transition-colors"
                placeholder="e.g., Anamorphic Cinematography Frame"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-brand-muted mb-1.5 font-semibold">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-brand-bg/80 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-accent transition-colors h-20 resize-none"
                placeholder="Provide context or production asset source metadata..."
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-brand-muted mb-1.5 font-semibold">
                Media File URL *
              </label>
              <input
                type="url"
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
                className="w-full bg-brand-bg/80 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-accent transition-colors"
                placeholder="https://images.unsplash.com/..."
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-brand-bg/40 rounded-xl border border-white/5">
              <span className="text-[10px] text-brand-muted uppercase tracking-widest font-mono">
                Detected Aspect Ratio
              </span>
              <span className="text-[11px] text-brand-accent font-bold font-mono">
                {aspectRatio.toFixed(2)}
              </span>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-1 md:mt-2 bg-brand-accent hover:bg-cyan-400 disabled:bg-cyan-800 disabled:cursor-not-allowed text-brand-bg font-bold text-xs uppercase py-3 rounded-xl transition-all tracking-widest shadow-lg shadow-cyan-500/5"
            >
              {submitting ? "COMMITTING ASSET..." : "PUBLISH PIN"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
