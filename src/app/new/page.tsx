"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Header from "@/components/Header";
import { Person } from "@/types/wish";

export default function NewWishPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [createdBy, setCreatedBy] = useState<Person | null>(null);
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [link, setLink] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files).slice(0, 5 - images.length);
    const newImages = [...images, ...newFiles].slice(0, 5);
    setImages(newImages);

    // Create preview URLs
    const newUrls = newImages.map((file) => URL.createObjectURL(file));
    setImageUrls(newUrls);
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);

    // Clean up old URL
    URL.revokeObjectURL(imageUrls[index]);
    const newUrls = imageUrls.filter((_, i) => i !== index);
    setImageUrls(newUrls);
  };

  const uploadImages = async (): Promise<Array<{ url: string }>> => {
    if (images.length === 0) return [];

    try {
      const formData = new FormData();
      images.forEach((file) => {
        formData.append("files", file);
      });

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        console.error("Image upload failed, continuing without images");
        return [];
      }

      const data = await response.json();
      return data.urls;
    } catch (error) {
      console.error("Image upload error:", error);
      return []; // Continue without images if upload fails
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!createdBy || !title || !price) {
      alert("Bitte fülle alle Pflichtfelder aus");
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload images first if any
      const uploadedImageUrls = images.length > 0 ? await uploadImages() : [];

      const response = await fetch("/api/wishes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          price: parseFloat(price),
          link: link || undefined,
          createdBy,
          imageUrls: uploadedImageUrls.length > 0 ? uploadedImageUrls : undefined,
        }),
      });

      if (!response.ok) throw new Error("Failed to create wish");

      // Delete images from Vercel Blob after 15 seconds (give Airtable time to download)
      if (uploadedImageUrls.length > 0) {
        setTimeout(async () => {
          try {
            await fetch("/api/upload", {
              method: "DELETE",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ urls: uploadedImageUrls.map(u => u.url) }),
            });
          } catch (e) {
            console.error("Failed to delete temporary images:", e);
          }
        }, 15000);
      }

      router.push("/wishlist");
    } catch (err) {
      console.error(err);
      alert("Wunsch konnte nicht gespeichert werden");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header title="Neuer Wunsch" showBack backHref="/" />

      <form onSubmit={handleSubmit} className="p-6 space-y-6 animate-slide-in">
        {/* Person Selection */}
        <div>
          <label className="block text-caption text-text-secondary mb-2">
            Wer trägt ein?
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setCreatedBy("Patrik")}
              className={`py-4 rounded-card text-title font-medium transition-all ${
                createdBy === "Patrik"
                  ? "bg-primary text-white"
                  : "bg-input-bg text-foreground hover:bg-gray-200"
              }`}
            >
              Patrik
            </button>
            <button
              type="button"
              onClick={() => setCreatedBy("Julia")}
              className={`py-4 rounded-card text-title font-medium transition-all ${
                createdBy === "Julia"
                  ? "bg-primary text-white"
                  : "bg-input-bg text-foreground hover:bg-gray-200"
              }`}
            >
              Julia
            </button>
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-caption text-text-secondary mb-2">
            Was?
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input-field"
            placeholder="Olivenbaum"
            required
          />
        </div>

        {/* Price */}
        <div>
          <label className="block text-caption text-text-secondary mb-2">
            Preis (CHF)
          </label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="input-field"
            placeholder="110"
            min="0"
            step="1"
            required
          />
        </div>

        {/* Link */}
        <div>
          <label className="block text-caption text-text-secondary mb-2">
            Link (optional)
          </label>
          <input
            type="text"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            onBlur={(e) => {
              const value = e.target.value.trim();
              if (value && !value.startsWith("http://") && !value.startsWith("https://")) {
                setLink("https://" + value);
              }
            }}
            className="input-field"
            placeholder="google.com oder https://..."
          />
        </div>

        {/* Images */}
        <div>
          <label className="block text-caption text-text-secondary mb-2">
            Bilder (optional, max. 5)
          </label>
          <div className="bg-input-bg rounded-card p-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageSelect}
              className="hidden"
            />

            {images.length < 5 && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-text-secondary hover:border-primary hover:text-primary transition-colors"
              >
                + Bilder hinzufügen
              </button>
            )}

            {imageUrls.length > 0 && (
              <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
                {imageUrls.map((url, index) => (
                  <div key={index} className="relative flex-shrink-0">
                    <div className="w-20 h-20 relative rounded-lg overflow-hidden">
                      <Image
                        src={url}
                        alt={`Bild ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-accent text-white rounded-full flex items-center justify-center text-sm"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={!createdBy || !title || !price || isSubmitting}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Wird gespeichert..." : "Eintragen"}
        </button>
      </form>
    </div>
  );
}
