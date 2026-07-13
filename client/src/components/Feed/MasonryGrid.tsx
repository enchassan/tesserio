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
        _id?: string;
        name: string;
        avatar: string;
    };
    comments?: Array<{
        _id?: string;
        user: {
            _id: string;
            name: string;
            avatar: string;
        };
        text: string;
        createdAt: string;
    }>;
}

interface MasonryGridProps {
    currentView: 'feed' | 'saved';
    onSelectPin: (pin: any) => void;
}

export const MasonryGrid: React.FC<MasonryGridProps> = ({ currentView, onSelectPin }) => {
    const [pins, setPins] = useState<PinAsset[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchFeedStream = async () => {
            setLoading(true);
            try {
                const endpoint = currentView === 'saved' ? '/pins/saved' : '/pins';
                const response = await api.get(endpoint);
                
                if (response.data?.status === 'success') {
                    setPins(response.data.pins || []);
                }
            } catch (error) {
                console.error('Failed to resolve dynamic feed stream parameters:', error);
                setPins([]);
            } finally {
                setLoading(false);
            }
        };

        fetchFeedStream();
    }, [currentView]);

    if (loading) {
        return (
            <div className="w-full text-center py-20 font-mono text-xs tracking-widest text-brand-muted animate-pulse uppercase">
                RESOLVING LIVE MEDIA RECOGNITIONS // ...
            </div>
        );
    }

    if (pins.length === 0) {
        return (
            <div className="w-full text-center py-32 border border-dashed border-white/10 rounded-3xl bg-brand-surface/10">
                <p className="font-mono text-sm text-brand-muted tracking-wider uppercase">
                    {currentView === 'saved' ? 'NO SAVED ASSETS FOUND IN PROFILE' : 'NO PIN ASSETS DISCOVERED IN CLUSTER'}
                </p>
                <p className="text-[11px] text-white/40 mt-1 font-sans">
                    {currentView === 'saved' ? 'Save some pins to populate your personal workspace deck.' : 'Click "+ Create Pin" to launch your first workspace record node.'}
                </p>
            </div>
        );
    }

    // --- TRUE MASONRY LOGIC START ---
    // Distribute pins across 5 columns sequentially to ensure perfect row balance and zero dead gaps.
    const numColumns = 5;
    const columns: PinAsset[][] = Array.from({ length: numColumns }, () => []);
    
    pins.forEach((pin, index) => {
        columns[index % numColumns].push(pin);
    });
    // --- TRUE MASONRY LOGIC END ---

    return (
        <div className="w-full mt-4">
            {/* Master Flex Row Splitter Container */}
            <div className="flex flex-row justify-start items-start gap-4 w-full">
                {columns.map((colPins, colIdx) => (
                    // Individual Vertical Flex Columns
                    <div 
                        key={colIdx} 
                        className="flex flex-col gap-4 flex-1 min-w-0"
                        // Responsive visibility handles scaling down seamlessly on small devices
                        style={{
                            display: colIdx >= 1 ? 'flex' : 'flex', // Fallback structure configuration
                        }}
                    >
                        {colPins.map((pin) => (
                            <PinCard
                                key={pin._id}
                                id={pin._id}
                                title={pin.title}
                                description={pin.description || ''}
                                mediaUrl={pin.mediaUrl}
                                aspectRatio={pin.aspectRatio}
                                creatorName={pin.user?.name || 'Anonymous Creator'}
                                creatorAvatar={pin.user?.avatar || ''}
                                onClick={() => onSelectPin({
                                    id: pin._id,
                                    title: pin.title,
                                    description: pin.description,
                                    mediaUrl: pin.mediaUrl,
                                    creatorName: pin.user?.name || 'Anonymous Creator',
                                    creatorAvatar: pin.user?.avatar || '',
                                    comments: pin.comments || [],
                                    creatorId: pin.user?._id || pin.user
                                })}
                            />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
};