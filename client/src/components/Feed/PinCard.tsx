// client/src/components/Feed/PinCard.tsx
import React from 'react';
import { MockPin } from './mockData';

export const PinCard: React.FC<{ pin: MockPin }> = ({ pin }) => {
    // Map our text aspects to custom height frames
    const heightClass = {
        short: 'h-48',
        square: 'h-72',
        tall: 'h-[420px]'
    }[pin.aspectRatio];

    return (
        <div className="break-inside-avoid mb-4 group relative overflow-hidden rounded-2xl bg-brand-surface cursor-zoom-in transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/5">
            {/* Media Element Container */}
            <div className={`w-full ${heightClass} relative bg-neutral-900 overflow-hidden`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={pin.imageUrl}
                    alt={pin.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                />

                {/* Hover Interaction Layer */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 flex flex-col justify-between z-10">
                    <div className="flex justify-end">
                        <button className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-full text-sm shadow transition-colors">
                            Save
                        </button>
                    </div>
                    <div className="text-white">
                        <h3 className="font-medium text-sm truncate tracking-wide">{pin.title}</h3>
                    </div>
                </div>
            </div>
        </div>
    );
};