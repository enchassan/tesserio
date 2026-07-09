// client/src/components/Feed/InspectPinModal.tsx
'use client';

import React from 'react';

interface InspectPinModalProps {
    isOpen: boolean;
    onClose: () => void;
    pin: {
        title: string;
        description?: string;
        mediaUrl: string;
        creatorName: string;
        creatorAvatar: string;
    } | null;
}

export const InspectPinModal: React.FC<InspectPinModalProps> = ({ isOpen, onClose, pin }) => {
    if (!isOpen || !pin) return null;

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
                        src={pin.mediaUrl}
                        alt={pin.title}
                        className="w-full h-full object-contain max-h-[40vh] md:max-h-[80vh]"
                    />
                </div>

                {/* Right Panel: Content Meta & Interactions Terminal */}
                <div className="w-full md:w-2/5 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto bg-[#151B22]">

                    {/* Top Section: Header & Metadata Context */}
                    <div className="space-y-6">
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
                        </div>

                        {/* Core Typography Asset Details */}
                        <div className="space-y-2 pt-2">
                            <h2 className="text-xl font-bold tracking-wider text-white uppercase font-mono border-b border-white/5 pb-3">
                                {pin.title}
                            </h2>
                            <p className="text-xs text-brand-muted leading-relaxed font-sans pt-1">
                                {pin.description || 'No descriptive structural metadata provided for this cluster asset nodes.'}
                            </p>
                        </div>

                        {/* Placeholder Segment for Comments Module Stream */}
                        <div className="pt-4 space-y-3">
                            <h3 className="text-[11px] font-bold tracking-widest text-brand-accent font-mono uppercase">
                                Activity Stream //
                            </h3>
                            <div className="text-[11px] font-mono p-4 rounded-xl border border-dashed border-white/10 bg-brand-bg/50 text-white/40 text-center py-8">
                                COMMENTS HUB UNDER CONSTRUCT // PHASE 4
                            </div>
                        </div>
                    </div>

                    {/* Bottom Call to Action Section */}
                    <div className="pt-6 border-t border-white/5 mt-8 flex gap-3">
                        <button className="flex-1 bg-brand-accent hover:bg-cyan-400 text-brand-bg font-bold font-mono text-xs uppercase tracking-wider py-3 rounded-xl transition-all shadow-lg shadow-cyan-500/5 cursor-pointer">
                            Execute Interaction
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};