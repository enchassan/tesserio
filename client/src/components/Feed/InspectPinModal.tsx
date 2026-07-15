// client/src/components/Feed/InspectPinModal.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import { api } from "@/lib/api";

interface CommentNode {
  _id?: string;
  user: {
    _id: string;
    name: string;
    avatar: string;
  };
  text: string;
  createdAt: string;
}

interface InspectPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeUserId?: string;
  savedPinIds?: string[]; // <-- ADDED: Needed for page.tsx compatibility
  onPinDeleted?: () => void;
  onSaveToggled?: (pinId: string, isSavedNow: boolean) => void;
  pin: {
    id: string;
    title: string;
    description?: string;
    mediaUrl: string;
    creatorName: string;
    creatorAvatar: string;
    creatorId?: string;
    comments?: CommentNode[];
  } | null;
  onCommentAdded?: (pinId: string, updatedComments: CommentNode[]) => void;
}

export const InspectPinModal: React.FC<InspectPinModalProps> = ({
  isOpen,
  onClose,
  pin,
  activeUserId,
  savedPinIds = [], // <-- ADDED
  onPinDeleted,
  onSaveToggled, // <-- ADDED
  onCommentAdded,
}) => {
  const [commentStream, setCommentStream] = useState<CommentNode[]>([]);
  const [commentInput, setCommentInput] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);

  // <-- ADDED: Save functionality states
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [savingLoader, setSavingLoader] = useState<boolean>(false);

  // States for the 3-dots options menu
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const [activeCommentMenuId, setActiveCommentMenuId] = useState<string | null>(
    null,
  );
  const commentMenuRef = useRef<HTMLDivElement>(null);

  // Sync state cleanly whenever a brand new pin selection frame maps into view
  useEffect(() => {
    if (pin) {
      setCommentStream(pin.comments || []);
      // <-- ADDED: Check if pin is already saved when modal opens
      setIsSaved(savedPinIds.includes(pin.id));
    }
    setIsMenuOpen(false); // Reset menu state on pin change
    setActiveCommentMenuId(null);
  }, [pin, savedPinIds]);

  // Close dropdown menu if clicking outside of it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
      // Close active comment option panels on loose window clicks
      if (
        commentMenuRef.current &&
        !commentMenuRef.current.contains(event.target as Node)
      ) {
        setActiveCommentMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!isOpen || !pin) return null;

  // <-- ADDED: Function to handle saving/unsaving the pin
  const handleSaveToggle = async () => {
    if (!activeUserId) return;
    setSavingLoader(true);
    try {
      const response = await api.post(`/pins/${pin.id}/save`);
      if (response.data?.status === "success") {
        const nextSavedState = !isSaved; // Calculate the new true/false state
        setIsSaved(nextSavedState); // Update the modal's local button UI

        // Push the new state up to the master page!
        if (onSaveToggled) onSaveToggled(pin.id, nextSavedState);
      }
    } catch (error) {
      console.error("Failed to toggle bookmark stream status:", error);
    } finally {
      setSavingLoader(false);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim() || submitting) return;

    setSubmitting(true);
    try {
      const response = await api.post(`/pins/${pin.id}/comments`, {
        text: commentInput.trim(),
      });

      if (response.data?.status === "success") {
        setCommentStream(response.data.comments);
        setCommentInput("");
      }
    } catch (error) {
      console.error(
        "Failed to register terminal comment node connection:",
        error,
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleCommentDelete = async (commentId: string) => {
    if (!window.confirm("Remove this statement log from the stream?")) return;

    try {
      const response = await api.delete(
        `/pins/${pin.id}/comments/${commentId}`,
      );
      if (response.data?.status === "success") {
        setCommentStream(response.data.comments);
        if (onCommentAdded) {
          onCommentAdded(pin.id, response.data.comments);
        }
      }
    } catch (error) {
      console.error("Failed to dispatch comment erasure instruction:", error);
    }
  };

  const handlePinDelete = async () => {
    setIsMenuOpen(false);
    if (
      !window.confirm(
        "Are you absolutely sure you want to permanently delete this pin asset?",
      )
    )
      return;

    try {
      const response = await api.delete(`/pins/${pin.id}`);
      if (response.data?.status === "success") {
        if (onPinDeleted) onPinDeleted();
        onClose();
      }
    } catch (error) {
      console.error("Failed to execute destruction pipeline:", error);
      alert("Failed to delete pin asset node.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-stretch justify-center p-0 md:items-center md:p-6 lg:p-10">
      {/* Backdrop — desktop only */}
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-md transition-opacity hidden md:block"
        onClick={onClose}
      />

      {/* Main Inspect Container */}
      <div className="flex flex-col md:flex-row w-full h-full md:h-[80vh] md:max-w-5xl bg-brand-surface md:rounded-[32px] overflow-hidden border-0 md:border border-white/10 shadow-2xl relative z-10">
        {/* Image Panel — pinned top on mobile */}
        <div className="w-full md:w-1/2 h-[50vh] md:h-full bg-neutral-950 flex-shrink-0 flex items-center justify-center overflow-hidden">
          <img
            src={
              pin.mediaUrl.startsWith("http")
                ? pin.mediaUrl
                : `https://${pin.mediaUrl}`
            }
            alt={pin.title}
            className="w-full h-full object-contain bg-black/5"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800";
            }}
          />
        </div>

        {/* Details / Comments Panel — scrollable below image on mobile */}
        <div className="w-full md:w-1/2 flex flex-col p-4 md:p-8 overflow-hidden bg-[#151B22] min-h-0 flex-1">
          {/* Mobile close bar */}
          <div className="flex md:hidden items-center justify-between mb-3 pb-3 border-b border-white/10 shrink-0">
            <span className="text-[10px] font-mono text-brand-muted uppercase tracking-widest">
              Pin Details
            </span>
            <button
              onClick={onClose}
              className="text-white hover:text-brand-accent font-mono text-xs font-bold px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 transition-all cursor-pointer uppercase"
            >
              Close
            </button>
          </div>

          <div className="flex-1 overflow-y-auto pb-20 md:pb-0 space-y-4 md:space-y-6 pr-1 min-h-0">
            <div className="flex items-center justify-between gap-2">
              {/* Creator Context Badge */}
              <div className="flex items-center gap-3">
                {pin.creatorAvatar && (
                  <img
                    src={pin.creatorAvatar}
                    alt={pin.creatorName}
                    className="w-8 h-8 rounded-full border border-brand-accent/30 object-cover"
                  />
                )}
                <div>
                  <p className="text-xs font-semibold text-white tracking-wide">
                    {pin.creatorName}
                  </p>
                  <p className="text-[10px] text-brand-muted font-mono">
                    ASSET CONTRIBUTOR
                  </p>
                </div>
              </div>

              {/* Top Right Action Control Station */}
              <div className="flex items-center gap-2 relative" ref={menuRef}>
                {/* <-- ADDED: DEDICATED SAVE BUTTON --> */}
                {activeUserId && (
                  <button
                    onClick={handleSaveToggle}
                    disabled={savingLoader}
                    className={`font-mono text-xs font-bold px-4 py-2 rounded-full transition-all cursor-pointer uppercase ${
                      isSaved
                        ? "bg-transparent text-brand-muted border border-white/10 hover:border-white/20"
                        : "bg-brand-accent text-brand-bg hover:bg-cyan-400 font-extrabold shadow-md shadow-cyan-500/10"
                    }`}
                  >
                    {savingLoader ? "..." : isSaved ? "Saved" : "Save"}
                  </button>
                )}

                {/* 3-Dots Interactive Context Menu Trigger */}
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="text-brand-muted hover:text-white transition-colors p-2 bg-white/5 hover:bg-white/10 rounded-full cursor-pointer flex items-center justify-center"
                  aria-label="More options"
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                  </svg>
                </button>

                {/* Dropdown Options Frame Component */}
                {isMenuOpen && (
                  <div className="absolute right-14 top-full mt-2 bg-brand-surface border border-white/10 rounded-xl shadow-xl py-1.5 w-40 z-30 font-mono text-xs animate-in fade-in slide-in-from-top-2 duration-150">
                    {pin.creatorId === activeUserId ? (
                      <button
                        onClick={handlePinDelete}
                        className="w-full text-left px-4 py-2 text-red-400 hover:bg-red-500/10 hover:text-red-500 transition-colors flex items-center gap-2 cursor-pointer"
                      >
                        Delete Post
                      </button>
                    ) : (
                      <div className="px-4 py-2 text-[10px] text-brand-muted uppercase">
                        No Actions Available
                      </div>
                    )}
                  </div>
                )}

                {/* Close Button — desktop only */}
                <button
                  onClick={onClose}
                  className="hidden md:inline-flex text-white hover:text-brand-accent font-mono text-xs font-bold px-4 py-2 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 transition-all cursor-pointer uppercase"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Core Typography Asset Details */}
            <div className="space-y-2 pt-2">
              <h2 className="text-xl font-bold tracking-wider text-white uppercase font-mono border-b border-white/5 pb-3">
                {pin.title}
              </h2>
              <p className="text-xs text-brand-muted leading-relaxed font-sans pt-1">
                {pin.description ||
                  "No descriptive structural metadata provided for this cluster asset node."}
              </p>
            </div>

            {/* Live Interactive Comment Terminal Stream Feed */}
            <div className="pt-4 space-y-3">
              <h3 className="text-[11px] font-bold tracking-widest text-brand-accent font-mono uppercase">
                Comments: {commentStream.length}
              </h3>

              <div className="space-y-3 md:max-h-none overflow-visible pr-1 pb-4 md:pb-12">
                {commentStream.length === 0 ? (
                  <div className="text-[11px] font-mono p-4 rounded-xl border border-dashed border-white/10 bg-brand-bg/50 text-white/40 text-center py-6">
                    No Comments Yet. Be the first one to comment.
                  </div>
                ) : (
                  commentStream.map((cmt, idx) => {
                    const commentId = cmt._id || `temp-${idx}`;
                    const isMenuOpenForThisComment =
                      activeCommentMenuId === commentId;

                    return (
                      <div
                        key={commentId}
                        className="flex gap-3 bg-white/5 p-3 rounded-xl border border-white/5 items-start"
                      >
                        {cmt.user?.avatar && (
                          <img
                            src={cmt.user.avatar}
                            alt={cmt.user.name}
                            className="w-6 h-6 rounded-full border border-white/10 mt-0.5 object-cover"
                          />
                        )}
                        <div className="flex justify-between items-start w-full gap-2">
                          <div className="space-y-0.5 flex-1 min-w-0">
                            <span className="text-[11px] font-bold text-white truncate block">
                              {cmt.user?.name || "Contributor"}
                            </span>
                            <p className="text-xs text-white/80 wrap-break-word font-sans mt-0.5">
                              {cmt.text}
                            </p>
                          </div>

                          {/* Action Controls & Dropdown Workspace Sector */}
                          <div
                            className="flex items-center gap-2 shrink-0 relative"
                            ref={
                              isMenuOpenForThisComment ? commentMenuRef : null
                            }
                          >
                            <span className="text-[9px] font-mono text-white/40">
                              {cmt.createdAt
                                ? new Date(cmt.createdAt).toLocaleTimeString(
                                    [],
                                    { hour: "2-digit", minute: "2-digit" },
                                  )
                                : "NOW"}
                            </span>

                            {/* Conditional 3-dots icon button for Authorized comment nodes */}
                            {(cmt.user?._id === activeUserId ||
                              pin.creatorId === activeUserId) && (
                              <div className="relative">
                                <button
                                  onClick={() =>
                                    setActiveCommentMenuId(
                                      isMenuOpenForThisComment
                                        ? null
                                        : commentId,
                                    )
                                  }
                                  className="text-brand-muted hover:text-white transition-colors p-1 bg-white/5 hover:bg-white/10 rounded-full cursor-pointer flex items-center justify-center border border-white/5"
                                  aria-label="Comment options"
                                >
                                  <svg
                                    className="w-3 h-3"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                                  </svg>
                                </button>

                                {/* Comment Actions Mini Floating Panel */}
                                {isMenuOpenForThisComment && (
                                  <div className="absolute right-0 top-full mt-1 bg-brand-surface border border-white/10 rounded-lg shadow-xl py-1 w-28 z-50 font-mono text-[10px] animate-in fade-in slide-in-from-top-1 duration-100">
                                    <button
                                      onClick={() => {
                                        handleCommentDelete(cmt._id!);
                                        setActiveCommentMenuId(null);
                                      }}
                                      className="w-full text-left px-3 py-1.5 text-red-400 hover:bg-red-500/10 hover:text-red-500 transition-colors flex items-center gap-1 cursor-pointer font-bold"
                                    >
                                      Delete Log
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Comment input — sticky at bottom on mobile */}
          <form
            onSubmit={handleCommentSubmit}
            className="pt-3 md:pt-4 border-t border-white/5 mt-auto flex items-center gap-2 shrink-0 bg-[#151B22]"
          >
            <input
              type="text"
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 bg-brand-bg border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-brand-accent font-mono"
            />
            <button
              type="submit"
              disabled={submitting || !commentInput.trim()}
              className="bg-white/5 hover:bg-brand-accent hover:text-brand-bg text-white font-mono text-[11px] font-bold px-4 py-2.5 rounded-xl border border-white/10 hover:border-brand-accent transition-all uppercase cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {submitting ? "..." : "Post"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
