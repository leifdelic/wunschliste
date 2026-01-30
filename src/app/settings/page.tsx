"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/Header";

export default function SettingsPage() {
  const [archivedCount, setArchivedCount] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/wishes/archived")
      .then((res) => res.json())
      .then((data) => setArchivedCount(data.length))
      .catch(() => setArchivedCount(0));
  }, []);

  return (
    <div className="min-h-screen bg-background-gray">
      <Header title="Einstellungen" showBack backHref="/wishlist" />

      <div className="p-4 animate-slide-in">
        <div className="mt-8">
          <Link href="/settings/archive" className="wish-card flex items-center justify-between">
            <div>
              <h3 className="text-title font-semibold">Archiv anzeigen</h3>
              {archivedCount !== null && (
                <p className="text-caption text-text-secondary">
                  ({archivedCount} ausgeblendete Wünsche)
                </p>
              )}
            </div>
            <svg
              className="w-5 h-5 text-text-secondary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
