// client/src/components/Feed/PinCard.tsx
import React from 'react';

interface PinCardProps {
    title: string;
    description: string;
    mediaUrl: string;
    aspectRatio: number;
    creatorName: string;
    creatorAvatar: string;
}

export const PinCard: React.FC<PinCardProps> = ({
                                                    title,
                                                    description,
                                                    mediaUrl,
                                                    aspectRatio,
                                                    creatorName,
                                                    creatorAvatar
                                                }) => {

    // Directly provide an absolute height fallback to override style anomalies
    const getInlineHeight = () => {
        if (aspectRatio > 1.2) return '192px';      // Short (h-48 equivalent)
        if (aspectRatio > 0.9 && aspectRatio < 1.1) return '288px'; // Square (h-72 equivalent)
        return '420px';                             // Tall (h-[420px] equivalent)
    };

    return (
        <div className="break-inside-avoid mb-4 group relative overflow-hidden rounded-2xl bg-brand-surface cursor-zoom-in transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/5 w-full">
            {/* Enforce layout using a standard inline style property */}
            <div
                style={{ height: getInlineHeight() }}
                className="w-full relative bg-neutral-900 overflow-hidden"
            >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={mediaUrl}
                    alt={title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                />

                {/* Hover Interaction Layer */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 flex flex-col justify-between z-10">
                    <div className="flex justify-end">
                        <button className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-1.5 rounded-full text-xs shadow transition-colors cursor-pointer">
                            Save
                        </button>
                    </div>

                    <div className="text-white space-y-2">
                        <div>
                            <h3 className="font-bold text-sm truncate tracking-wide uppercase font-mono text-brand-accent">{title}</h3>
                            {description && <p className="text-xs text-brand-muted truncate mt-0.5">{description}</p>}
                        </div>

                        {/* Live Creator Badge Profile Context */}
                        <div className="flex items-center gap-2 pt-1 border-t border-white/10">
                            {creatorAvatar && (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={creatorAvatar}
                                    alt={creatorName}
                                    className="w-5 h-5 rounded-full border border-brand-accent/20"
                                />
                            )}
                            <span className="text-[10px] text-brand-muted truncate font-medium">{creatorName}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};