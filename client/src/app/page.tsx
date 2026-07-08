// client/src/app/page.tsx
export default function HomePage() {
  return (
      <main className="min-h-screen p-8 max-w-[1800px] mx-auto">
        <header className="mb-12 border-b border-brand-surface pb-6">
          <h1 className="text-3xl font-bold tracking-wider font-mono text-white">
            TESSERIO
          </h1>
          <p className="text-brand-muted text-sm mt-2">
            Visual Discovery & Media Graph Platform
          </p>
        </header>

        <section className="flex flex-col items-center justify-center border-2 border-dashed border-brand-surface rounded-2xl h-[60vh]">
          <div className="text-center space-y-2">
            <p className="text-xl font-medium text-white">Masonry Canvas Base</p>
            <p className="text-brand-muted text-sm max-w-md">
              Next.js core environment loaded successfully. Standing by for dynamic pipeline integration.
            </p>
          </div>
        </section>
      </main>
  );
}