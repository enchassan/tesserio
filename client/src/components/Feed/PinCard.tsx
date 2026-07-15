// client/src/components/Feed/PinCard.tsx
"use client";

import React, { useState } from "react";
import { api } from "@/lib/api";

interface PinCardProps {
  id: string;
  title: string;
  description: string;
  mediaUrl: string;
  aspectRatio: number;
  creatorName: string;
  creatorAvatar: string;
  onClick: () => void;
  isSaved?: boolean;
  onSaveToggle?: (isSavedNow: boolean) => void;
}

export const PinCard: React.FC<PinCardProps> = ({
  id,
  title,
  description,
  mediaUrl,
  aspectRatio,
  creatorName,
  creatorAvatar,
  onClick,
  isSaved = false, // Strictly controlled by master state now
  onSaveToggle,
}) => {
  // We only track the loading spinner locally, NOT the save state!
  const [savingLoader, setSavingLoader] = useState<boolean>(false);

  const handleSaveClick = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevents the click from triggering the Inspect View modal!

    if (savingLoader) return;
    setSavingLoader(true);

    try {
      const response = await api.post(`/pins/${id}/save`);
      if (response.data?.status === "success") {
        // Fire the new state up to the Grid -> Page Master State
        if (onSaveToggle) onSaveToggle(!isSaved);
      }
    } catch (error) {
      console.error(
        "Failed to dispatch save interaction pipeline signal:",
        error,
      );
    } finally {
      setSavingLoader(false);
    }
  };

  return (
    <div
      onClick={onClick}
      className="break-inside-avoid mb-3 group relative overflow-hidden rounded-2xl bg-brand-surface cursor-zoom-in transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/5 w-full"
    >
      <div
        style={{ aspectRatio: aspectRatio || 1 }}
        className="w-full relative bg-neutral-900 overflow-hidden rounded-2xl"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={mediaUrl.startsWith("http") ? mediaUrl : `https://${mediaUrl}`}
          alt={title}
          className="w-full h-full object-cover rounded-2xl transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800";
          }}
        />

        {/* Save button — always visible on mobile, hover-reveal on desktop */}
        <button
          onClick={handleSaveClick}
          disabled={savingLoader}
          className={`absolute top-2 right-2 md:top-3 md:right-3 px-3 py-1 md:px-4 md:py-1.5 rounded-full text-[10px] md:text-[11px] font-bold tracking-wider font-mono uppercase transition-all duration-200 z-20 md:opacity-0 md:group-hover:opacity-100 ${
            isSaved
              ? "bg-black/60 text-white/50 border border-white/10 hover:bg-black/80 backdrop-blur-md"
              : "bg-brand-accent text-brand-bg hover:bg-cyan-400 font-extrabold shadow-lg shadow-cyan-500/20"
          }`}
        >
          {savingLoader ? "..." : isSaved ? "Saved" : "Save"}
        </button>

        {/* Hover Interaction Layer — desktop only */}
        <div className="absolute inset-0 bg-black/50 opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 p-3 md:p-4 hidden md:flex flex-col justify-between z-10">
          <div className="flex justify-end" />

          <div className="text-white space-y-2">
            <div>
              <h3 className="font-bold text-sm truncate tracking-wide uppercase font-mono text-brand-accent">
                {title}
              </h3>
              {description && (
                <p className="text-xs text-brand-muted truncate mt-0.5">
                  {description}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 pt-1 border-t border-white/10">
              {creatorAvatar && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={creatorAvatar}
                  alt={creatorName}
                  className="w-5 h-5 rounded-full border border-brand-accent/20 object-cover"
                />
              )}
              <span className="text-[10px] text-brand-muted truncate font-medium">
                {creatorName}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
