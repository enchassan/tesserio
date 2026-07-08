// client/src/app/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { MasonryGrid } from "@/components/Feed/MasonryGrid";

interface UserProfile {
    _id: string;
    name: string;
    email: string;
    avatar: string;
}

export default function HomePage() {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchUserSession = async () => {
            try {
                const response = await api.get('/auth/me');
                if (response.data?.status === 'success') {
                    setUser(response.data.user);
                }
            } catch (error) {
                console.log('No active session found.');
            } finally {
                setLoading(false);
            }
        };

        fetchUserSession();
    }, []);

    return (
        <main className="min-h-screen p-4 sm:p-8 max-w-[1800px] mx-auto bg-brand-bg text-foreground">
            <header className="mb-8 border-b border-brand-surface pb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-wider font-mono text-white">
                        TESSER<span className="text-brand-accent">IO</span>
                    </h1>
                    <p className="text-brand-muted text-xs mt-1">
                        Visual Discovery & Media Graph Platform
                    </p>
                </div>

                {/* Dynamic User Profile Status Bar */}
                <div className="flex items-center gap-4">
                    {loading ? (
                        <div className="w-8 h-8 rounded-full bg-brand-surface animate-pulse" />
                    ) : user ? (
                        <div className="flex items-center gap-3 bg-brand-surface/40 px-4 py-2 rounded-full border border-brand-surface">
                            {user.avatar && (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={user.avatar}
                                    alt={user.name}
                                    className="w-8 h-8 rounded-full border border-brand-accent/40"
                                />
                            )}
                            <div className="text-right hidden sm:block">
                                <p className="text-xs font-semibold text-white tracking-wide">{user.name}</p>
                                <p className="text-[10px] text-brand-muted">{user.email}</p>
                            </div>
                        </div>
                    ) : (
                        <a
                            href="http://localhost:5000/api/auth/google"
                            className="bg-brand-accent hover:bg-cyan-400 text-brand-bg font-bold text-xs uppercase px-5 py-2.5 rounded-full transition-all duration-200 tracking-wider shadow-lg shadow-cyan-500/10"
                        >
                            Connect Session
                        </a>
                    )}
                </div>
            </header>

            {/* Render the core masonry interface layout canvas */}
            <section className="w-full">
                <MasonryGrid />
            </section>
        </main>
    );
}