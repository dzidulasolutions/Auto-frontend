"use client";

import { useRouter } from "next/navigation";
import { IconlyArrowRight } from "@/components/ui/icons"; // vérifie si tu as une flèche gauche dédiée, sinon je la retourne en CSS

export default function BackButton({ fallback, label }: { fallback?: string; label?: string }) {
  const router = useRouter();

  const handleClick = () => {
    if (fallback) {
      router.push(fallback);
    } else {
      router.back();
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="inline-flex items-center gap-1.5 text-small text-muted hover:text-foreground transition-colors -ml-1 mb-2"
    >
      <span className="rotate-180">
            <IconlyArrowRight size={16} color="currentColor"  />
      </span>
      {label ?? "Retour"}
    </button>
  );
}