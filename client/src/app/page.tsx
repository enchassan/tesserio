// client/src/app/page.tsx
import { MasonryGrid } from "@/components/Feed/MasonryGrid";

export default function HomePage() {
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
            </header>

            {/* Render the core masonry interface layout canvas */}
            <section className="w-full">
                <MasonryGrid />
            </section>
        </main>
    );
}