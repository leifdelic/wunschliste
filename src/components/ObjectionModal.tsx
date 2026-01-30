"use client";

import { useState } from "react";
import { Wish, Person } from "@/types/wish";

interface ObjectionModalProps {
  wish: Wish;
  onSubmit: (comment: string, objectedBy: Person) => void;
  onClose: () => void;
}

export default function ObjectionModal({
  wish,
  onSubmit,
  onClose,
}: ObjectionModalProps) {
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // The objector is the other person
  const objectedBy: Person = wish.createdBy === "Patrik" ? "Julia" : "Patrik";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(comment.trim(), objectedBy);
    } finally {
      setIsSubmitting(false);
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

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 overflow-y-auto"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="min-h-full flex items-start justify-center p-4 pt-20">
        <div className="bg-white w-full max-w-md rounded-2xl p-6 animate-slide-in safe-area-bottom">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-headline">Einspruch</h2>
            <button
              onClick={onClose}
              className="p-2 -mr-2 hover:bg-background-gray rounded-full transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <p className="text-body text-text-secondary mb-4">
            {wish.title} • {formatPrice(wish.price)}
          </p>

          <form onSubmit={handleSubmit}>
            <label className="block text-caption text-text-secondary mb-2">
              Warum? (Pflichtfeld)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="input-field min-h-[100px] resize-none mb-4"
              placeholder="Lass uns am Sonntag darüber reden..."
              required
              autoFocus
            />

            <button
              type="submit"
              disabled={!comment.trim() || isSubmitting}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Wird gesendet..." : "Einspruch senden"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
