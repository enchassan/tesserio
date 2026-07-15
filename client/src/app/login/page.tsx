// client/src/app/login/page.tsx
"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();

  // If user is already authenticated, bypass login and redirect straight home
  useEffect(() => {
    const checkActiveSession = async () => {
      try {
        const response = await api.get("/auth/me");
        if (response.data?.status === "success") {
          router.push("/");
        }
      } catch (err) {
        // Safe to ignore: User is not authenticated, keep them on the login page
      }
    };
    checkActiveSession();
  }, [router]);

  const handleGoogleLogin = () => {
    const apiBaseUrl =
      process.env.NEXT_PUBLIC_API_URL ||
      (process.env.NODE_ENV === "production"
        ? "/api"
        : "http://localhost:5000/api");
    const oauthUrl = `${apiBaseUrl}/auth/google`;
    window.location.href = oauthUrl;
  };

  return (
    <div className="min-h-screen bg-[#0B0F12] flex flex-col items-center justify-center relative overflow-hidden px-4 select-none">
      {/* Background Cyber-Grid Aura */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-125 h-125 bg-brand-accent/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-size-[32px_32px] pointer-events-none" />

      {/* Main Glass Gate Container */}
      <div className="w-full max-w-md bg-[#151B22]/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 sm:p-10 shadow-2xl relative z-10 text-center space-y-8 animate-in fade-in zoom-in-95 duration-300">
        {/* Brand Identity Header */}
        <div className="space-y-3">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/3 border border-white/10 mb-2 shadow-inner">
            <span className="text-2xl font-bold font-mono tracking-widest text-brand-accent animate-pulse">
              T
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-widest text-white font-mono uppercase">
            Tesserio
          </h1>
          <p className="text-[11px] font-mono text-brand-muted tracking-widest uppercase">
            High-Fidelity Asset Registry
          </p>
        </div>

        {/* Feature Highlights */}
        <div className="py-4 border-y border-white/5 space-y-2.5 text-left text-xs font-mono text-white/60">
          <div className="flex items-center gap-3">
            <span className="text-brand-accent font-bold">▶</span>
            <span>Dynamic Masonry Stream Engine</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-brand-accent font-bold">▶</span>
            <span>Real-time Secure Interaction Node</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-brand-accent font-bold">▶</span>
            <span>Bidirectional Comment Tracing</span>
          </div>
        </div>

        {/* Interactive Google OAuth Button */}
        <div className="space-y-4">
          <button
            onClick={handleGoogleLogin}
            className="w-full bg-white text-black hover:bg-neutral-200 font-sans text-xs font-bold py-3.5 px-6 rounded-xl flex items-center justify-center gap-3 transition-all duration-200 cursor-pointer shadow-lg shadow-white/5 hover:scale-[1.01]"
          >
            {/* Minimalist Google Icon SVG */}
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.38-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>
        </div>

        {/* Footer Meta */}
        <p className="text-[9px] font-mono text-white/30 tracking-wider">
          SECURE ENCRYPTION SHA-256 SESSION LAYER ACTIVE
        </p>
      </div>
    </div>
  );
}
