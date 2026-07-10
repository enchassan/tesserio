// client/src/components/Feed/PinCard.tsx
'use client';

import React, { useState } from 'react';
import { api } from '@/lib/api'; // Import your Axios configuration instance

interface PinCardProps {
    id: string;
    title: string;
    description: string;
    mediaUrl: string;
    aspectRatio: number;
    creatorName: string;
    creatorAvatar: string;
    onClick: () => void;
}

export const PinCard: React.FC<PinCardProps> = ({
                                                    id,
                                                    title,
                                                    description,
                                                    mediaUrl,
                                                    aspectRatio,
                                                    creatorName,
                                                    creatorAvatar,
                                                    onClick
                                                }) => {
    const [isSaved, setIsSaved] = useState<boolean>(false);
    const [saving, setSaving] = useState<boolean>(false);

    const getInlineHeight = () => {
        if (aspectRatio > 1.2) return '192px';
        if (aspectRatio > 0.9 && aspectRatio < 1.1) return '288px';
        return '420px';
    };

    // Asynchronous interaction handler to hit our brand new Express controller route
    const handleSaveToggle = async (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevents the click from triggering the Inspect View modal open event!

        if (saving) return;
        setSaving(true);

        try {
            const response = await api.post(`/pins/${id}/save`);
            if (response.data?.status === 'success') {
                // Toggle state based on what the backend cluster updated
                setIsSaved(response.data.isSaved);
            }
        } catch (error) {
            console.error('Failed to dispatch save interaction pipeline signal:', error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div
            onClick={onClick}
            className="break-inside-avoid mb-4 group relative overflow-hidden rounded-2xl bg-brand-surface cursor-zoom-in transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/5 w-full"
        >
            <div
                style={{ height: getInlineHeight() }}
                className="w-full relative bg-neutral-900 overflow-hidden"
            >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={mediaUrl.startsWith('http') ? mediaUrl : `https://${mediaUrl}`}
                    alt={title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800';
                    }}
                />

                {/* Hover Interaction Layer */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 flex flex-col justify-between z-10">
                    <div className="flex justify-end">
                        <button
                            onClick={handleSaveToggle}
                            disabled={saving}
                            className={`font-semibold px-4 py-1.5 rounded-full text-xs shadow transition-all duration-200 cursor-pointer ${
                                isSaved
                                    ? 'bg-neutral-800 hover:bg-neutral-700 text-brand-accent border border-brand-accent/40'
                                    : 'bg-red-600 hover:bg-red-700 text-white'
                            }`}
                        >
                            {saving ? '...' : isSaved ? 'Saved' : 'Save'}
                        </button>
                    </div>

                    <div className="text-white space-y-2">
                        <div>
                            <h3 className="font-bold text-sm truncate tracking-wide uppercase font-mono text-brand-accent">{title}</h3>
                            {description && <p className="text-xs text-brand-muted truncate mt-0.5">{description}</p>}
                        </div>

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