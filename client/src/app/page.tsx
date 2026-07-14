// client/src/app/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { MasonryGrid } from "@/components/Feed/MasonryGrid";
import { CreatePinModal } from "@/components/Feed/CreatePinModal";
import { InspectPinModal } from "@/components/Feed/InspectPinModal";

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  avatar: string;
  savedPins?: string[];
}

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [refreshKey, setRefreshKey] = useState<number>(0);
  const [selectedPin, setSelectedPin] = useState<any>(null);
  const [isInspectOpen, setIsInspectOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Track which tab workspace frame is currently active
  const [activeTab, setActiveTab] = useState<"feed" | "saved">("feed");

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await api.get("/auth/me");
        if (response.data?.status === "success") {
          setUser(response.data.user);
        } else {
          router.push("/login"); // Force exit redirect
        }
      } catch (error) {
        console.error(
          "Unauthenticated entry frame detected. Routing to gate...",
        );
        router.push("/login"); // Force exit redirect on server throw
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [router]);

  const handleRefreshFeed = () => {
    setRefreshKey((prev) => prev + 1); // Triggers re-fetch cascade across states
  };

  const handleToggleSaveState = (pinId: string, isSavedNow: boolean) => {
    setUser((prevUser) => {
      if (!prevUser) return prevUser;
      const currentSaved = prevUser.savedPins || [];
      return {
        ...prevUser,
        savedPins: isSavedNow
          ? [...currentSaved, pinId]
          : currentSaved.filter((id) => id !== pinId),
      };
    });
    // Triggers a background grid re-sync so the 'Saved Deck' updates if you remove one!
    handleRefreshFeed();
  };

  const handleLogout = async () => {
    if (!window.confirm("Terminate secure platform session?")) return;
    try {
      const response = await api.get("/auth/logout");
      if (response.data?.status === "success") {
        setUser(null);
        router.push("/login");
      }
    } catch (err) {
      console.error("Failed to clean session cookie stream:", err);
      // Fallback: Force route to login anyway
      router.push("/login");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F12] flex items-center justify-center font-mono text-xs text-brand-accent tracking-widest uppercase">
        SYNCHRONIZING SECURE KEYCHAIN // ...
      </div>
    );
  }

  return (
    <main className="w-full min-h-screen p-4 sm:p-8 bg-brand-bg text-foreground flex flex-col justify-start items-stretch">
      <header className="w-full mb-8 border-b border-brand-surface pb-6 flex items-center justify-between gap-4 flex-wrap sm:flex-nowrap">
        <div>
          <h1 className="text-2xl font-bold tracking-wider font-mono text-white">
            TESSER<span className="text-brand-accent">IO</span>
          </h1>
          <p className="text-brand-muted text-xs mt-1">
            Visual Discovery & Media Graph Platform
          </p>
        </div>

        {/* Premium Tab Filter Layout Switch for Authenticated Sessions */}
        {user && (
          <div className="flex bg-white/5 p-1 rounded-full border border-white/5 font-mono text-xs order-last sm:order-none">
            <button
              onClick={() => setActiveTab("feed")}
              className={`px-5 py-2 rounded-full font-bold transition-all uppercase cursor-pointer ${
                activeTab === "feed"
                  ? "bg-brand-accent text-brand-bg shadow-md shadow-cyan-500/10"
                  : "text-brand-muted hover:text-white"
              }`}
            >
              Global Feed
            </button>
            <button
              onClick={() => setActiveTab("saved")}
              className={`px-5 py-2 rounded-full font-bold transition-all uppercase cursor-pointer ${
                activeTab === "saved"
                  ? "bg-brand-accent text-brand-bg shadow-md shadow-cyan-500/10"
                  : "text-brand-muted hover:text-white"
              }`}
            >
              Saved Deck
            </button>
          </div>
        )}

        <div className="flex items-center gap-4">
          {user && (
            <>
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-white/5 hover:bg-white/10 text-white font-medium text-xs px-4 py-2 rounded-full border border-white/10 transition-colors cursor-pointer"
              >
                + Create Pin
              </button>

              {/* User Identity Info Panel */}
              <div className="flex items-center gap-3 bg-brand-surface/40 px-4 py-2 rounded-full border border-brand-surface">
                {user.avatar && (
                  <img
                    src={
                      user.avatar ||
                      `https://ui-avatars.com/api/?name=${user.name}&background=151B22&color=06b6d4`
                    }
                    alt={user.name}
                    className="w-8 h-8 rounded-full border border-brand-accent/40 object-cover bg-neutral-900"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        `https://ui-avatars.com/api/?name=${user.name}&background=151B22&color=06b6d4`;
                    }}
                  />
                )}
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-semibold text-white tracking-wide">
                    {user.name}
                  </p>
                  <p className="text-[10px] text-brand-muted">{user.email}</p>
                </div>
              </div>

              {/* Premium Integrated Logout Action Button */}
              <button
                onClick={handleLogout}
                className="text-[10px] font-mono text-red-400 hover:text-red-500 bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 hover:border-red-500/20 px-3 py-2 rounded-full uppercase transition-all duration-150 cursor-pointer"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </header>

      {/* Main Grid Sector */}
      <section className="w-full text-left block clear-both grow">
        <MasonryGrid
          key={`${refreshKey}-${activeTab}`}
          currentView={activeTab}
          savedPinIds={user?.savedPins || []}
          onSaveToggled={handleToggleSaveState}
          onSelectPin={(pin) => {
            setSelectedPin(pin);
            setIsInspectOpen(true);
          }}
        />
      </section>

      <CreatePinModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onPinCreated={handleRefreshFeed}
      />

      <InspectPinModal
        isOpen={isInspectOpen}
        onClose={() => {
          setIsInspectOpen(false);
          setSelectedPin(null);
        }}
        pin={selectedPin}
        activeUserId={user?._id}
        savedPinIds={user?.savedPins || []}
        onPinDeleted={handleRefreshFeed}
        onSaveToggled={handleToggleSaveState}
        onCommentAdded={(pinId, updatedComments) => {
          handleRefreshFeed();
        }}
      />
    </main>
  );
}
