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
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] =
    useState<boolean>(false);

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
    <main className="w-full min-h-screen px-2 py-2 md:p-4 lg:p-8 bg-brand-bg text-foreground flex flex-col justify-start items-stretch">
      <header className="w-full mb-3 md:mb-8 border-b border-brand-surface px-3 py-2 md:px-6 md:py-4 pb-3 md:pb-6">
        {/* Mobile nav — logo, search, avatar only */}
        <div className="flex md:hidden items-center justify-between w-full gap-3">
          <h1 className="text-lg font-bold tracking-wider font-mono text-white shrink-0">
            TESSER<span className="text-brand-accent">IO</span>
          </h1>

          {user && (
            <div
              className="relative cursor-pointer outline-none"
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              onBlur={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                  setIsProfileDropdownOpen(false);
                }
              }}
              tabIndex={0}
            >
              <img
                src={
                  user.avatar ||
                  `https://ui-avatars.com/api/?name=${user.name}&background=151B22&color=06b6d4`
                }
                alt={user.name}
                className="w-8 h-8 rounded-full border border-brand-accent/40 object-cover bg-neutral-900 shrink-0"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    `https://ui-avatars.com/api/?name=${user.name}&background=151B22&color=06b6d4`;
                }}
              />
              {isProfileDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 md:w-48 bg-[#18181c] border border-gray-800 rounded-2xl shadow-2xl py-2 z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-5 py-3 md:px-4 md:py-2.5 text-base md:text-sm text-red-500 hover:bg-red-500/10 active:bg-red-500/20 flex items-center gap-2 transition-colors duration-150 font-medium cursor-pointer"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile feed tabs — below header row */}
        {user && (
          <div className="flex md:hidden bg-white/5 p-1 rounded-full border border-white/5 font-mono text-[10px] mt-3 w-full">
            <button
              onClick={() => setActiveTab("feed")}
              className={`flex-1 px-3 py-2 rounded-full font-bold transition-all uppercase cursor-pointer ${
                activeTab === "feed"
                  ? "bg-brand-accent text-brand-bg shadow-md shadow-cyan-500/10"
                  : "text-brand-muted hover:text-white"
              }`}
            >
              Feed
            </button>
            <button
              onClick={() => setActiveTab("saved")}
              className={`flex-1 px-3 py-2 rounded-full font-bold transition-all uppercase cursor-pointer ${
                activeTab === "saved"
                  ? "bg-brand-accent text-brand-bg shadow-md shadow-cyan-500/10"
                  : "text-brand-muted hover:text-white"
              }`}
            >
              Saved
            </button>
          </div>
        )}

        {/* Desktop nav */}
        <div className="hidden md:flex items-center justify-between gap-4 w-full">
          <div>
            <h1 className="text-2xl font-bold tracking-wider font-mono text-white">
              TESSER<span className="text-brand-accent">IO</span>
            </h1>
            <p className="text-brand-muted text-xs mt-1">
              Visual Discovery & Media Graph Platform
            </p>
          </div>

          {user && (
            <div className="flex bg-white/5 p-1 rounded-full border border-white/5 font-mono text-xs">
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
              <div
                className="relative flex items-center gap-3 bg-[#18181c] border border-gray-800 p-2 rounded-full cursor-pointer select-none hover:bg-gray-800/50 transition-colors"
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                onBlur={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                    setIsProfileDropdownOpen(false);
                  }
                }}
                tabIndex={0}
              >
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
                <div className="text-right">
                  <p className="text-xs font-semibold text-white tracking-wide">
                    {user.name}
                  </p>
                  <p className="text-[10px] text-brand-muted">{user.email}</p>
                </div>
                <span className="text-gray-400 text-xs mr-2">▼</span>

                {isProfileDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 md:w-48 bg-[#18181c] border border-gray-800 rounded-2xl shadow-2xl py-2 z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-5 py-3 md:px-4 md:py-2.5 text-base md:text-sm text-red-500 hover:bg-red-500/10 active:bg-red-500/20 flex items-center gap-2 transition-colors duration-150 font-medium cursor-pointer"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
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

      {user && (
        <button
          onClick={() => setIsModalOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-[#57ebd9] text-black rounded-full shadow-xl hover:scale-110 active:scale-95 transition-transform duration-200"
          aria-label="Create Pin"
        >
          <span className="text-3xl font-light -mt-1">+</span>
        </button>
      )}
    </main>
  );
}
