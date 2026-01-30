"use client";

import { Wish, getRemainingWaitDays, getRemainingBuyDays } from "@/types/wish";
import { useState } from "react";

interface WishCardProps {
  wish: Wish;
  onObjection?: (wish: Wish) => void;
  onApprove?: (wish: Wish) => void;
  onDiscard?: (wish: Wish) => void;
  onPurchased?: (wish: Wish) => void;
  onKiCheck?: (wish: Wish) => void;
  onClick?: (wish: Wish) => void;
}

export default function WishCard({
  wish,
  onObjection,
  onApprove,
  onDiscard,
  onPurchased,
  onKiCheck,
  onClick,
}: WishCardProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleAction = async (
    e: React.MouseEvent,
    action: ((wish: Wish) => void) | undefined
  ) => {
    e.stopPropagation();
    if (action && !isLoading) {
      setIsLoading(true);
      try {
        await action(wish);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("de-CH", {
      style: "currency",
      currency: "CHF",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getStatusInfo = () => {
    switch (wish.status) {
      case "waiting": {
        const days = getRemainingWaitDays(wish.createdAt);
        return {
          label: `noch ${days} ${days === 1 ? "Tag" : "Tage"}`,
          color: "text-text-secondary",
        };
      }
      case "objected":
        return {
          label: `Einspruch von ${wish.objectedBy}`,
          color: "text-accent",
        };
      case "approved": {
        const days = getRemainingBuyDays(wish.approvedAt || wish.createdAt);
        return {
          label: `Noch ${days} ${days === 1 ? "Tag" : "Tage"} zum Kaufen`,
          color: "text-success",
        };
      }
      default:
        return { label: "", color: "" };
    }
  };

  const statusInfo = getStatusInfo();
  const hasImages = wish.images && wish.images.length > 0;

  return (
    <div
      className={`wish-card cursor-pointer transition-transform active:scale-[0.98] ${
        isLoading ? "opacity-70" : ""
      }`}
      onClick={() => onClick?.(wish)}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <h3 className="text-title font-semibold text-foreground">
            {wish.title}
          </h3>
          <p className="text-caption text-text-secondary mt-0.5">
            von {wish.createdBy}{" "}
            {statusInfo.label && (
              <>
                <span className="mx-1">•</span>
                <span className={statusInfo.color}>{statusInfo.label}</span>
              </>
            )}
            {hasImages && (
              <>
                <span className="mx-1">•</span>
                <span className="text-text-secondary">
                  {wish.images!.length} Bild{wish.images!.length > 1 ? "er" : ""}
                </span>
              </>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-title font-semibold">
            {formatPrice(wish.price)}
          </span>
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
        </div>
      </div>

      {wish.status === "objected" && wish.objectionComment && (
        <p className="text-caption text-text-secondary mt-2 bg-background-gray rounded-lg p-2">
          &quot;{wish.objectionComment}&quot;
        </p>
      )}

      <div className="flex gap-2 mt-3">
        {wish.status === "waiting" && (
          <>
            <button
              onClick={(e) => handleAction(e, onObjection)}
              className="btn-secondary flex-1 text-caption"
              disabled={isLoading}
            >
              Einspruch
            </button>
            <button
              onClick={(e) => handleAction(e, onKiCheck)}
              className="btn-secondary flex-1 text-caption"
              disabled={isLoading}
            >
              KI-Check
            </button>
          </>
        )}

        {wish.status === "objected" && (
          <>
            <button
              onClick={(e) => handleAction(e, onApprove)}
              className="btn-secondary flex-1 text-caption"
              disabled={isLoading}
            >
              Freigeben
            </button>
            <button
              onClick={(e) => handleAction(e, onDiscard)}
              className="btn-secondary flex-1 text-caption text-accent"
              disabled={isLoading}
            >
              Verwerfen
            </button>
          </>
        )}

        {wish.status === "approved" && (
          <>
            <button
              onClick={(e) => handleAction(e, onPurchased)}
              className="btn-secondary flex-1 text-caption"
              disabled={isLoading}
            >
              Gekauft
            </button>
            <button
              onClick={(e) => handleAction(e, onDiscard)}
              className="btn-secondary flex-1 text-caption text-accent"
              disabled={isLoading}
            >
              Doch nicht
            </button>
          </>
        )}
      </div>
    </div>
  );
}
