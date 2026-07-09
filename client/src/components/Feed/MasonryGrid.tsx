// client/src/components/Feed/MasonryGrid.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { PinCard } from './PinCard';

interface PinAsset {
    _id: string;
    title: string;
    description?: string;
    mediaUrl: string;
    aspectRatio: number;
    user: {
        name: string;
        avatar: string;
    };
}

// 1. Update the component interface props to accept an onSelect handler from page.tsx
interface MasonryGridProps {
    onSelectPin: (pin: any) => void;
}

export const MasonryGrid: React.FC<MasonryGridProps> = ({ onSelectPin }) => {
    const [pins, setPins] = useState<PinAsset[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchFeedStream = async () => {
            try {
                const response = await api.get('/pins');
                if (response.data?.status === 'success') {
                    setPins(response.data.pins);
                }
            } catch (error) {
                console.error('Failed to resolve dynamic feed stream parameters:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchFeedStream();
    }, []);

    if (loading) {
        return (
            <div className="w-full text-center py-20 font-mono text-xs tracking-widest text-brand-muted animate-pulse">
                RESOLVING LIVE MEDIA RECOGNITIONS...
            </div>
        );
    }

    if (pins.length === 0) {
        return (
            <div className="w-full text-center py-32 border border-dashed border-white/10 rounded-3xl bg-brand-surface/10">
                <p className="font-mono text-sm text-brand-muted tracking-wider">NO PIN ASSETS DISCOVERED IN CLUSTER</p>
                <p className="text-[11px] text-white/40 mt-1">Click "+ Create Pin" to launch your first workspace record node.</p>
            </div>
        );
    }

    return (
        <div className="w-full flex justify-start items-start text-left">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 w-full auto-rows-max justify-start items-start">
                {pins.map((pin) => (
                    <div key={pin._id} className="w-full h-full block">
                        <PinCard
                            title={pin.title}
                            description={pin.description || ''}
                            mediaUrl={pin.mediaUrl}
                            aspectRatio={pin.aspectRatio}
                            creatorName={pin.user?.name || 'Anonymous Creator'}
                            creatorAvatar={pin.user?.avatar || ''}
                            // 2. Pass down a combined proxy object when the user clicks the card shell
                            onClick={() => onSelectPin({
                                title: pin.title,
                                description: pin.description,
                                mediaUrl: pin.mediaUrl,
                                creatorName: pin.user?.name || 'Anonymous Creator',
                                creatorAvatar: pin.user?.avatar || ''
                            })}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};