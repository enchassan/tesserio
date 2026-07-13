// client/src/components/Feed/InspectPinModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';

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
    onPinDeleted?: () => void;
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

export const InspectPinModal: React.FC<InspectPinModalProps> = ({ isOpen, onClose, activeUserId, onPinDeleted, pin, onCommentAdded }) => {
    const [commentStream, setCommentStream] = useState<CommentNode[]>([]);
    const [commentInput, setCommentInput] = useState<string>('');
    const [submitting, setSubmitting] = useState<boolean>(false);

    // Sync state cleanly whenever a brand-new pin selection frame maps into view
    useEffect(() => {
        if (pin) {
            setCommentStream(pin.comments || []);
        }
    }, [pin]);

    if (!isOpen || !pin) return null;
    
    const handleCommentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!commentInput.trim() || submitting) return;

        setSubmitting(true);
        try {
            const response = await api.post(`/pins/${pin.id}/comments`, {
                text: commentInput.trim()
            });

            if (response.data?.status === 'success') {
                setCommentStream(response.data.comments); // Load populated array straight out of response data
                setCommentInput(''); // Clear terminal input block
            }
            if (onCommentAdded) {
                onCommentAdded(pin.id, response.data.comments);
            }
        } catch (error) {
            console.error('Failed to register terminal comment node connection:', error);
        } finally {
            setSubmitting(false);
        }
    };
    const handlePinDelete = async () => {
        if (!pin || !window.confirm('Are you absolutely sure you want to permanently delete this pin asset?')) return;

        try {
            const response = await api.delete(`/pins/${pin.id}`);
            if (response.data?.status === 'success') {
            if (onPinDeleted) onPinDeleted(); // Notify main screen feed to wipe it from view array
            onClose(); // Exit modal workspace frame
            }
        } catch (error) {
            console.error('Failed to execute destruction pipeline:', error);
            alert('Failed to delete pin asset node.');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10">
            {/* Backdrop Blur Layer */}
            <div
                className="absolute inset-0 bg-black/75 backdrop-blur-md transition-opacity"
                onClick={onClose}
            />

            {/* Main Inspect Container Deck */}
            <div className="bg-brand-surface w-full max-w-5xl rounded-3xl overflow-hidden border border-white/10 shadow-2xl relative z-10 flex flex-col md:flex-row max-h-[90vh] md:max-h-[85vh]">

                {/* Left Panel: High-Fidelity Asset Viewport */}
                <div className="w-full md:w-3/5 bg-neutral-950 flex items-center justify-center p-2 overflow-hidden max-h-[40vh] md:max-h-full">
                    <img
                        src={pin.mediaUrl.startsWith('http') ? pin.mediaUrl : `https://${pin.mediaUrl}`}
                        alt={pin.title}
                        className="w-full h-full object-contain max-h-[40vh] md:max-h-[80vh]"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800';
                        }}
                    />
                </div>

                {/* Right Panel: Content Meta & Interactions Terminal */}
                <div className="w-full md:w-2/5 p-6 sm:p-8 flex flex-col justify-between overflow-hidden bg-[#151B22]">

                    {/* Scrollable Upper Metadata Sector */}
                    <div className="overflow-y-auto space-y-6 flex-1 pr-1">
                        <div className="flex items-center justify-between">
                            {/* Creator Context Badge */}
                            <div className="flex items-center gap-3">
                                {pin.creatorAvatar && (
                                    <img
                                        src={pin.creatorAvatar}
                                        alt={pin.creatorName}
                                        className="w-8 h-8 rounded-full border border-brand-accent/30"
                                    />
                                )}
                                <div>
                                    <p className="text-xs font-semibold text-white tracking-wide">{pin.creatorName}</p>
                                    <p className="text-[10px] text-brand-muted font-mono">ASSET CONTRIBUTOR</p>
                                </div>
                            </div>

                            {/* Close Button UI Component */}
                            <button
                                onClick={onClose}
                                className="text-brand-muted hover:text-white transition-colors p-2 bg-white/5 rounded-full hover:bg-white/10 cursor-pointer text-xs font-mono"
                            >
                                ESC
                            </button>
                            {pin.creatorId === activeUserId && (
                            <button
                                onClick={handlePinDelete}
                                className="text-red-400 hover:text-red-500 font-mono text-[11px] font-bold px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 rounded-full border border-red-500/20 transition-all cursor-pointer uppercase mr-2"
                            >
                                Delete Pin
                            </button>
                            )}
                        </div>

                        {/* Core Typography Asset Details */}
                        <div className="space-y-2 pt-2">
                            <h2 className="text-xl font-bold tracking-wider text-white uppercase font-mono border-b border-white/5 pb-3">
                                {pin.title}
                            </h2>
                            <p className="text-xs text-brand-muted leading-relaxed font-sans pt-1">
                                {pin.description || 'No descriptive structural metadata provided for this cluster asset node.'}
                            </p>
                        </div>

                        {/* Live Interactive Comment Terminal Stream Feed */}
                        <div className="pt-4 space-y-3">
                            <h3 className="text-[11px] font-bold tracking-widest text-brand-accent font-mono uppercase">
                                Activity Stream // {commentStream.length} Nodes
                            </h3>

                            <div className="space-y-3 max-h-[240px] overflow-y-auto pr-1">
                                {commentStream.length === 0 ? (
                                    <div className="text-[11px] font-mono p-4 rounded-xl border border-dashed border-white/10 bg-brand-bg/50 text-white/40 text-center py-6">
                                        NO LOG ENTRY STREAM ENCOUNTERED // WRITE FIRST ENTRY
                                    </div>
                                ) : (
                                    commentStream.map((cmt, idx) => (
                                        <div key={cmt._id || idx} className="flex gap-3 bg-white/5 p-3 rounded-xl border border-white/5 items-start">
                                            {cmt.user?.avatar && (
                                                <img
                                                    src={cmt.user.avatar}
                                                    alt={cmt.user.name}
                                                    className="w-6 h-6 rounded-full border border-white/10 mt-0.5"
                                                />
                                            )}
                                            <div className="space-y-0.5 flex-1 min-w-0">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-[11px] font-bold text-white truncate">{cmt.user?.name || 'Contributor'}</span>
                                                    <span className="text-[9px] font-mono text-white/40">
                            {cmt.createdAt ? new Date(cmt.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'NOW'}
                          </span>
                                                </div>
                                                <p className="text-xs text-white/80 break-words font-sans">{cmt.text}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Bottom Execution Component: Input Message Box Form */}
                    <form onSubmit={handleCommentSubmit} className="pt-4 border-t border-white/5 mt-4 flex items-center gap-2">
                        <input
                            type="text"
                            value={commentInput}
                            onChange={(e) => setCommentInput(e.target.value)}
                            placeholder="Inject statement node data..."
                            className="flex-1 bg-brand-bg border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-brand-accent font-mono"
                        />
                        <button
                            type="submit"
                            disabled={submitting || !commentInput.trim()}
                            className="bg-white/5 hover:bg-brand-accent hover:text-brand-bg text-white font-mono text-[11px] font-bold px-4 py-2.5 rounded-xl border border-white/10 hover:border-brand-accent transition-all uppercase cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            {submitting ? '...' : 'Post'}
                        </button>
                    </form>

                </div>
            </div>
        </div>
    );
};