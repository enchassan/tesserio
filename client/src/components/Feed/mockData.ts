// client/src/components/Feed/mockData.ts
export interface MockPin {
    id: string;
    title: string;
    imageUrl: string;
    aspectRatio: 'tall' | 'short' | 'square';
}

export const mockPins: MockPin[] = [
    { id: '1', title: 'Cinematic Shadows', imageUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&q=80', aspectRatio: 'tall' },
    { id: '2', title: 'Minimal Architecture', imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=500&q=80', aspectRatio: 'square' },
    { id: '3', title: 'Neon Pulse', imageUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=500&q=80', aspectRatio: 'short' },
    { id: '4', title: 'Obsidian Textures', imageUrl: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=500&q=80', aspectRatio: 'tall' },
    { id: '5', title: 'Anamorphic Frame', imageUrl: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=500&q=80', aspectRatio: 'short' },
    { id: '6', title: 'Geometric Contrast', imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=500&q=80', aspectRatio: 'square' },
];