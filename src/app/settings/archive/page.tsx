"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import { Wish } from "@/types/wish";

export default function ArchivePage() {
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/wishes/archived")
      .then((res) => res.json())
      .then((data) => setWishes(data))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("de-CH", {
      style: "currency",
      currency: "CHF",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("de-CH", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getStatusLabel = (wish: Wish) => {
    switch (wish.status) {
      case "purchased":
        return `gekauft am ${formatDate(wish.approvedAt)}`;
      case "discarded":
        return "verworfen";
      case "archived":
        return `archiviert am ${formatDate(wish.archivedAt)}`;
      default:
        return "";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background-gray">
        <Header title="Archiv" showBack backHref="/settings" />
        <div className="flex items-center justify-center p-8">
          <div className="animate-pulse text-text-secondary">Lädt...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-gray">
      <Header title="Archiv" showBack backHref="/settings" />

      <div className="p-4 animate-slide-in">
        <p className="text-caption text-text-secondary mb-4">
          Diese Wünsche wurden automatisch archiviert, weil sie nicht innerhalb
          von 14 Tagen gekauft wurden.
        </p>

        {wishes.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-text-secondary">Noch keine archivierten Wünsche.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {wishes.map((wish) => (
              <div key={wish.id} className="wish-card">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-title font-semibold">{wish.title}</h3>
                    <p className="text-caption text-text-secondary mt-0.5">
                      von {wish.createdBy} • {getStatusLabel(wish)}
                    </p>
                  </div>
                  <span className="text-title font-semibold">
                    {formatPrice(wish.price)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
