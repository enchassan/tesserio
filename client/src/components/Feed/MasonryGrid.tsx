// client/src/components/Feed/MasonryGrid.tsx
import React from 'react';
import { PinCard } from './PinCard';
import { mockPins } from './mockData';

export const MasonryGrid: React.FC = () => {
    return (
        <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4 w-full mx-auto p-2">
            {mockPins.map((pin) => (
                <PinCard key={pin.id} pin={pin} />
            ))}
        </div>
    );
};