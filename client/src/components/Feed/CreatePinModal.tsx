// client/src/components/Feed/CreatePinModal.tsx
'use client';

import React, { useState } from 'react';
import { api } from '@/lib/api';

interface CreatePinModalProps {
    isOpen: boolean;
    onClose: () => void;
    onPinCreated: () => void;
}

export const CreatePinModal: React.FC<CreatePinModalProps> = ({ isOpen, onClose, onPinCreated }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [mediaUrl, setMediaUrl] = useState('');
    const [aspectRatio, setAspectRatio] = useState<number>(1); // Default to square layout aspect 1:1
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !mediaUrl) {
            setError('Title and Media URL are required fields.');
            return;
        }

        setSubmitting(true);
        setError('');

        try {
            // Direct POST to our clean Express router endpoint
            const response = await api.post('/pins', {
                title,
                description,
                mediaUrl,
                aspectRatio, // This sends the selected layout ratio metric (1.33, 1, or 0.66)
                mediaType: 'image'
            });

            if (response.data.status === 'success') {
                // Clear all local field states on success
                setTitle('');
                setDescription('');
                setMediaUrl('');
                setAspectRatio(1);

                onPinCreated(); // Signals parent dashboard view to trigger update
                onClose();      // Closes the modal smoothly
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to publish new pin asset.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-brand-surface w-full max-w-lg rounded-2xl border border-white/10 p-6 shadow-2xl relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-brand-muted hover:text-white font-bold text-sm"
                >
                    ✕
                </button>

                <h2 className="text-xl font-bold text-white mb-6 tracking-wide font-mono">CREATE NEW PIN ASSET</h2>

                {error && <p className="text-red-500 text-xs mb-4 p-2.5 rounded bg-red-500/10 border border-red-500/20">{error}</p>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs uppercase tracking-wider text-brand-muted mb-1.5 font-semibold">Pin Title *</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full bg-brand-bg/80 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-accent transition-colors"
                            placeholder="e.g., Anamorphic Cinematography Frame"
                        />
                    </div>

                    <div>
                        <label className="block text-xs uppercase tracking-wider text-brand-muted mb-1.5 font-semibold">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full bg-brand-bg/80 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-accent transition-colors h-20 resize-none"
                            placeholder="Provide context or production asset source metadata..."
                        />
                    </div>

                    <div>
                        <label className="block text-xs uppercase tracking-wider text-brand-muted mb-1.5 font-semibold">Media File URL *</label>
                        <input
                            type="url"
                            value={mediaUrl}
                            onChange={(e) => setMediaUrl(e.target.value)}
                            className="w-full bg-brand-bg/80 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-accent transition-colors"
                            placeholder="https://images.unsplash.com/..."
                        />
                    </div>

                    <div>
                        <label className="block text-xs uppercase tracking-wider text-brand-muted mb-1.5 font-semibold">Masonry Aspect Framework Ratio</label>
                        <div className="grid grid-cols-3 gap-2">
                            {[
                                { label: 'Short (4:3)', val: 1.33 },
                                { label: 'Square (1:1)', val: 1 },
                                { label: 'Tall (2:3)', val: 0.66 }
                            ].map((opt) => (
                                <button
                                    key={opt.val}
                                    type="button"
                                    onClick={() => setAspectRatio(opt.val)}
                                    className={`py-2 text-xs rounded-xl font-medium border transition-all ${
                                        aspectRatio === opt.val
                                            ? 'bg-brand-accent/10 border-brand-accent text-brand-accent'
                                            : 'bg-brand-bg/40 border-white/5 text-brand-muted hover:border-white/20'
                                    }`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full mt-2 bg-brand-accent hover:bg-cyan-400 disabled:bg-cyan-800 disabled:cursor-not-allowed text-brand-bg font-bold text-xs uppercase py-3 rounded-xl transition-all tracking-widest shadow-lg shadow-cyan-500/5"
                    >
                        {submitting ? 'COMMITTING ASSET...' : 'PUBLISH PIN'}
                    </button>
                </form>
            </div>
        </div>
    );
};