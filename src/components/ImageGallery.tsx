"use client";

import { useState } from "react";
import { WishImage } from "@/types/wish";
import Image from "next/image";

interface ImageGalleryProps {
  images: WishImage[];
}

export default function ImageGallery({ images }: ImageGalleryProps) {
  const [fullscreenIndex, setFullscreenIndex] = useState<number | null>(null);

  if (images.length === 0) return null;

  return (
    <>
      {/* Vertical image list with smooth motion */}
      <div className="space-y-3">
        {images.map((image, index) => {
          const imageUrl = image.thumbnails?.large?.url || image.url;
          return (
            <div
              key={image.id || index}
              className="relative bg-background-gray rounded-card overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-[1.01] active:scale-[0.99]"
              onClick={() => setFullscreenIndex(index)}
              style={{
                animation: `fadeSlideIn 0.4s ease-out ${index * 0.1}s both`,
              }}
            >
              <div className="aspect-square relative">
                <Image
                  src={imageUrl}
                  alt={`Bild ${index + 1}`}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 400px"
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Fullscreen view */}
      {fullscreenIndex !== null && (
        <div
          className="fixed inset-0 bg-black z-50 flex items-center justify-center animate-fadeIn"
          onClick={() => setFullscreenIndex(null)}
        >
          <button
            className="absolute top-4 right-4 text-white p-2 z-10"
            onClick={() => setFullscreenIndex(null)}
          >
            <svg
              className="w-8 h-8"
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
          <Image
            src={images[fullscreenIndex].url}
            alt={`Bild ${fullscreenIndex + 1}`}
            fill
            className="object-contain"
            sizes="100vw"
          />
        </div>
      )}
    </>
  );
}
