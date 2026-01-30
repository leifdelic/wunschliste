"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Header from "@/components/Header";
import ImageGallery from "@/components/ImageGallery";
import ObjectionModal from "@/components/ObjectionModal";
import { Wish, Person, getRemainingWaitDays, getRemainingBuyDays } from "@/types/wish";

export default function WishDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const [wish, setWish] = useState<Wish | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showObjectionModal, setShowObjectionModal] = useState(false);

  useEffect(() => {
    fetch(`/api/wishes/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then(setWish)
      .catch(() => router.push("/wishlist"))
      .finally(() => setIsLoading(false));
  }, [id, router]);

  const handleStatusUpdate = async (newStatus: string) => {
    if (!wish) return;

    try {
      const response = await fetch(`/api/wishes/${wish.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error("Failed to update");

      if (newStatus === "purchased" || newStatus === "discarded") {
        router.push("/wishlist");
      } else {
        const updated = await response.json();
        setWish(updated);
      }
    } catch (err) {
      console.error(err);
      alert("Konnte nicht aktualisiert werden");
    }
  };

  const handleObjectionSubmit = async (comment: string, objectedBy: Person) => {
    if (!wish) return;

    try {
      const response = await fetch(`/api/wishes/${wish.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "objected",
          objectionComment: comment,
          objectedBy,
        }),
      });

      if (!response.ok) throw new Error("Failed to submit");

      setShowObjectionModal(false);
      const updated = await response.json();
      setWish(updated);
    } catch (err) {
      console.error(err);
      alert("Einspruch konnte nicht gesendet werden");
    }
  };

  const handleKiCheck = () => {
    if (!wish) return;

    const prompt = `Ich überlege mir folgendes Produkt zu kaufen und brauche deine ehrliche,
kritische Einschätzung. Sei nicht höflich - sei direkt und challenge mich.

=== MEIN GEFÜHL (hier zuerst ausfüllen!) ===
[HIER SCHREIBE ICH 2-3 SÄTZE WARUM ICH ES WILL, WIE ICH MICH FÜHLE,
WIE ICH DAVON ERFAHREN HABE]

=== PRODUKT ===
Was: ${wish.title}
Preis: ${wish.price} CHF
Link: ${wish.link || "kein Link"}

=== KONTEXT ===
- Wir sind ein Paar das bis 2032 finanziell frei sein will (3.3 Mio CHF Ziel)
- Unsere Werte: "Erlebnisse vor Besitz", Minimalismus, bewusster Konsum
- Wir haben ein KI-generiertes Raumkonzept an das wir uns halten
- Regel: Max 3 Dinge pro Fläche, One In One Out

=== BITTE BEWERTE ===

1. NUTZUNG: Wie oft werde ich das realistisch nutzen? Berechne Preis pro Nutzung.

2. PROBLEM: Welches echte Problem löst das? Oder ist das Problem erfunden?

3. ALTERNATIVEN: Was könnte das gleiche günstiger/besser lösen?
   Haben wir vielleicht schon was?

4. TRIGGER-CHECK: Klingt das nach einem echten Bedürfnis oder nach
   Social-Media-Impuls? Sei ehrlich.

5. ZUKUNFTS-TEST: Werde ich in 12 Monaten froh sein das gekauft zu haben?

6. RAUM-FIT: Basierend auf "Max 3 pro Fläche" - macht das Sinn?

7. OPPORTUNITÄTSKOSTEN: Was könnten wir stattdessen als ERLEBNIS machen
   für das gleiche Geld?

8. DEIN URTEIL:
   - KAUFEN (macht absolut Sinn)
   - WARTEN (nochmal 2 Wochen drüber nachdenken)
   - LASSEN (du brauchst das nicht)

Begründe dein Urteil in 2-3 Sätzen.`;

    navigator.clipboard.writeText(prompt).then(() => {
      alert("Prompt kopiert! Füge dein Gefühl ein und frag eine KI.");
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("de-CH", {
      style: "currency",
      currency: "CHF",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getStatusText = () => {
    if (!wish) return "";

    switch (wish.status) {
      case "waiting": {
        const days = getRemainingWaitDays(wish.createdAt);
        return `noch ${days} ${days === 1 ? "Tag" : "Tage"}`;
      }
      case "objected":
        return `Einspruch von ${wish.objectedBy}`;
      case "approved": {
        const days = getRemainingBuyDays(wish.approvedAt || wish.createdAt);
        return `Noch ${days} ${days === 1 ? "Tag" : "Tage"} zum Kaufen`;
      }
      default:
        return "";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Header title="Wunsch" showBack backHref="/wishlist" />
        <div className="flex items-center justify-center p-8">
          <div className="animate-pulse text-text-secondary">Lädt...</div>
        </div>
      </div>
    );
  }

  if (!wish) return null;

  return (
    <div className="min-h-screen bg-white">
      <Header title="Wunsch" showBack backHref="/wishlist" />

      <div className="p-6 animate-slide-in">
        {/* Title and Info */}
        <div className="mb-4">
          <h1 className="text-headline">{wish.title}</h1>
          <p className="text-body text-text-secondary mt-1">
            {formatPrice(wish.price)} • von {wish.createdBy}
          </p>
          <p className="text-body text-text-secondary">{getStatusText()}</p>
        </div>

        {/* Action Buttons */}
        <div className="mb-4">
          {wish.status === "waiting" && (
            <div className="flex gap-2">
              <button
                onClick={() => setShowObjectionModal(true)}
                className="btn-secondary-small flex-1"
              >
                Einspruch
              </button>
              <button onClick={handleKiCheck} className="btn-secondary-small flex-1">
                KI-Check
              </button>
            </div>
          )}

          {wish.status === "objected" && (
            <div className="flex gap-2">
              <button
                onClick={() => handleStatusUpdate("approved")}
                className="btn-primary-small flex-1"
              >
                Freigeben
              </button>
              <button
                onClick={() => handleStatusUpdate("discarded")}
                className="btn-secondary-small text-accent flex-1"
              >
                Verwerfen
              </button>
            </div>
          )}

          {wish.status === "approved" && (
            <div className="flex gap-2">
              <button
                onClick={() => handleStatusUpdate("purchased")}
                className="btn-primary-small flex-1"
              >
                Gekauft
              </button>
              <button
                onClick={() => handleStatusUpdate("discarded")}
                className="btn-secondary-small text-accent flex-1"
              >
                Doch nicht
              </button>
            </div>
          )}
        </div>

        {/* Link */}
        {wish.link && (
          <div className="mb-4">
            <a
              href={wish.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-link text-body break-all"
            >
              {wish.link}
            </a>
          </div>
        )}

        {/* Objection Comment */}
        {wish.status === "objected" && wish.objectionComment && (
          <div className="mb-4 bg-background-gray rounded-card p-4">
            <h3 className="text-caption text-text-secondary mb-1">
              Einspruch von {wish.objectedBy}
            </h3>
            <p className="text-body">&quot;{wish.objectionComment}&quot;</p>
          </div>
        )}

        {/* Images */}
        {wish.images && wish.images.length > 0 && (
          <div className="mb-6">
            <ImageGallery images={wish.images} />
          </div>
        )}
      </div>

      {showObjectionModal && (
        <ObjectionModal
          wish={wish}
          onSubmit={handleObjectionSubmit}
          onClose={() => setShowObjectionModal(false)}
        />
      )}
    </div>
  );
}
