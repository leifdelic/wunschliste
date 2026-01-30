"use client";

import { WishImage } from "@/types/wish";
import Image from "next/image";

interface ImageGalleryProps {
  images: WishImage[];
}

export default function ImageGallery({ images }: ImageGalleryProps) {
  if (images.length === 0) return null;

  return (
    <div className="space-y-3">
      {images.map((image, index) => {
        const imageUrl = image.thumbnails?.large?.url || image.url;
        return (
          <div
            key={image.id || index}
            className="relative bg-background-gray rounded-card overflow-hidden"
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
  );
}
