"use client";

import { useState, useRef } from "react";
import { WishImage } from "@/types/wish";
import Image from "next/image";

interface ImageGalleryProps {
  images: WishImage[];
}

export default function ImageGallery({ images }: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    const threshold = 50;

    if (diff > threshold && currentIndex < images.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else if (diff < -threshold && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  if (images.length === 0) return null;

  const currentImage = images[currentIndex];
  const imageUrl =
    currentImage.thumbnails?.large?.url || currentImage.url;

  return (
    <>
      <div
        className="relative bg-background-gray rounded-card overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="aspect-square relative cursor-pointer"
          onClick={() => setIsFullscreen(true)}
        >
          <Image
            src={imageUrl}
            alt={`Bild ${currentIndex + 1}`}
            fill
            className="object-contain"
            sizes="(max-width: 768px) 100vw, 400px"
          />
        </div>

        {images.length > 1 && (
          <>
            <p className="text-center text-caption text-text-secondary py-2">
              Swipe für mehr Bilder
            </p>
            <div className="flex justify-center gap-1.5 pb-3">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentIndex
                      ? "bg-primary"
                      : "bg-gray-300"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Fullscreen view */}
      {isFullscreen && (
        <div
          className="fixed inset-0 bg-black z-50 flex items-center justify-center"
          onClick={() => setIsFullscreen(false)}
        >
          <button
            className="absolute top-4 right-4 text-white p-2 z-10"
            onClick={() => setIsFullscreen(false)}
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
            src={currentImage.url}
            alt={`Bild ${currentIndex + 1}`}
            fill
            className="object-contain"
            sizes="100vw"
          />
        </div>
      )}
    </>
  );
}
