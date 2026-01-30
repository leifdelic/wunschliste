"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import WishCard from "@/components/WishCard";
import ObjectionModal from "@/components/ObjectionModal";
import { Wish, Person } from "@/types/wish";

export default function WishlistPage() {
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedWish, setSelectedWish] = useState<Wish | null>(null);
  const router = useRouter();

  const fetchWishes = useCallback(async () => {
    try {
      const response = await fetch("/api/wishes");
      if (!response.ok) throw new Error("Failed to fetch wishes");
      const data = await response.json();
      setWishes(data);
    } catch (err) {
      setError("Konnte Wünsche nicht laden");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWishes();
  }, [fetchWishes]);

  const handleObjection = (wish: Wish) => {
    setSelectedWish(wish);
  };

  const submitObjection = async (comment: string, objectedBy: Person) => {
    if (!selectedWish) return;

    try {
      const response = await fetch(`/api/wishes/${selectedWish.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "objected",
          objectionComment: comment,
          objectedBy,
        }),
      });

      if (!response.ok) throw new Error("Failed to submit objection");

      setSelectedWish(null);
      fetchWishes();
    } catch (err) {
      console.error(err);
      alert("Einspruch konnte nicht gesendet werden");
    }
  };

  const handleStatusUpdate = async (
    wish: Wish,
    newStatus: "approved" | "discarded" | "purchased"
  ) => {
    try {
      const response = await fetch(`/api/wishes/${wish.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error("Failed to update status");

      fetchWishes();
    } catch (err) {
      console.error(err);
      alert("Status konnte nicht aktualisiert werden");
    }
  };

  const handleKiCheck = (wish: Wish) => {
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

  const handleCardClick = (wish: Wish) => {
    router.push(`/wish/${wish.id}`);
  };

  // Group wishes by status
  const waitingWishes = wishes.filter((w) => w.status === "waiting");
  const objectedWishes = wishes.filter((w) => w.status === "objected");
  const approvedWishes = wishes.filter((w) => w.status === "approved");

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background-gray">
        <Header title="Wunschliste" showBack showSettings />
        <div className="flex items-center justify-center p-8">
          <div className="animate-pulse text-text-secondary">Lädt...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background-gray">
        <Header title="Wunschliste" showBack showSettings />
        <div className="p-4">
          <div className="bg-red-50 text-red-600 p-4 rounded-card">
            {error}
          </div>
        </div>
      </div>
    );
  }

  const isEmpty =
    waitingWishes.length === 0 &&
    objectedWishes.length === 0 &&
    approvedWishes.length === 0;

  return (
    <div className="min-h-screen bg-background-gray">
      <Header title="Wunschliste" showBack showSettings />

      <div className="p-4 space-y-6 animate-slide-in">
        {isEmpty && (
          <div className="text-center py-12">
            <p className="text-text-secondary text-body">
              Noch keine Wünsche vorhanden.
            </p>
            <p className="text-text-secondary text-caption mt-1">
              Trage deinen ersten Wunsch ein!
            </p>
          </div>
        )}

        {waitingWishes.length > 0 && (
          <section>
            <h2 className="section-header">Wartend</h2>
            <div className="space-y-3">
              {waitingWishes.map((wish) => (
                <WishCard
                  key={wish.id}
                  wish={wish}
                  onObjection={handleObjection}
                  onApprove={(w) => handleStatusUpdate(w, "approved")}
                  onKiCheck={handleKiCheck}
                  onClick={handleCardClick}
                />
              ))}
            </div>
          </section>
        )}

        {objectedWishes.length > 0 && (
          <section>
            <h2 className="section-header">Einspruch</h2>
            <div className="space-y-3">
              {objectedWishes.map((wish) => (
                <WishCard
                  key={wish.id}
                  wish={wish}
                  onApprove={(w) => handleStatusUpdate(w, "approved")}
                  onDiscard={(w) => handleStatusUpdate(w, "discarded")}
                  onClick={handleCardClick}
                />
              ))}
            </div>
          </section>
        )}

        {approvedWishes.length > 0 && (
          <section>
            <h2 className="section-header">Freigegeben</h2>
            <div className="space-y-3">
              {approvedWishes.map((wish) => (
                <WishCard
                  key={wish.id}
                  wish={wish}
                  onPurchased={(w) => handleStatusUpdate(w, "purchased")}
                  onDiscard={(w) => handleStatusUpdate(w, "discarded")}
                  onClick={handleCardClick}
                />
              ))}
            </div>
          </section>
        )}
      </div>

      {selectedWish && (
        <ObjectionModal
          wish={selectedWish}
          onSubmit={submitObjection}
          onClose={() => setSelectedWish(null)}
        />
      )}
    </div>
  );
}
