import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen relative hero-fullscreen">
      {/* Fullscreen Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/family-illustration.png"
          alt="Familie Illustration"
          fill
          className="object-cover"
          style={{ objectPosition: "center -80px" }}
          priority
          sizes="100vw"
        />
      </div>

      {/* White Gradient Overlay - natural fade from transparent to white */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(to bottom, transparent 40%, rgba(255,255,255,0.8) 58%, rgba(255,255,255,0.95) 70%, white 80%)"
        }}
      />

      {/* Content */}
      <div className="relative min-h-screen flex flex-col justify-end">
        {/* Text and Buttons */}
        <div className="px-6 pb-4 safe-area-bottom space-y-4">
          <div className="text-left">
            <p className="text-foreground font-black" style={{ fontSize: "34px", lineHeight: 1.1, textShadow: "0 1px 2px rgba(255,255,255,0.8)" }}>Sachen vergehen.</p>
            <p className="text-foreground font-black" style={{ fontSize: "34px", lineHeight: 1.1, textShadow: "0 1px 2px rgba(255,255,255,0.8)" }}>Erlebnisse bleiben.</p>
          </div>

          <div className="space-y-2">
            <Link href="/new" className="btn-primary block py-3" style={{ fontSize: "17px" }}>
              Neuer materieller Wunsch
            </Link>
            <Link href="/wishlist" className="btn-accent block py-3" style={{ fontSize: "17px" }}>
              Wunschliste ansehen
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
