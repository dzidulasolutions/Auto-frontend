"use client";

import { useState } from "react";
import { useInstallPrompt } from "@/hooks/use-install-prompt";
import Modal from "@/components/ui/modal";
import { IconlyDownload } from "@/components/ui/icons"; // remplace par une icône de téléchargement/wallet si tu en ajoutes une dédiée

const INSTALL_COLOR = "#16A34A";

export default function InstallButton({ className = "" }: { className?: string }) {
  const { canShow, ios, promptInstall } = useInstallPrompt();
  const [iosModalOpen, setIosModalOpen] = useState(false);

  if (!canShow) return null;

  const handleClick = () => {
    if (ios) {
      setIosModalOpen(true);
    } else {
      promptInstall();
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        aria-label="Installer l'application"
        style={{ backgroundColor: INSTALL_COLOR }}
        className={`inline-flex items-center justify-center gap-2 h-9 px-3 sm:px-4 text-white text-small font-medium rounded-control transition-opacity hover:opacity-90 ${className}`}
      >
        <IconlyDownload size={16} color="currentColor" />
        <span className="hidden sm:inline">Installer l&apos;application</span>
      </button>

      <Modal open={iosModalOpen} onClose={() => setIosModalOpen(false)} title="Installer AuTogo">
        <div className="flex flex-col gap-3 text-small text-muted">
          <p>Pour installer AuTogo sur votre iPhone :</p>
          <ol className="list-decimal list-inside flex flex-col gap-2">
            <li>
              Appuyez sur l&apos;icône <strong className="text-foreground">Partager</strong> en bas de l&apos;écran
              Safari.
            </li>
            <li>
              Faites défiler et appuyez sur{" "}
              <strong className="text-foreground">Sur l&apos;écran d&apos;accueil</strong>.
            </li>
            <li>
              Appuyez sur <strong className="text-foreground">Ajouter</strong>.
            </li>
          </ol>
        </div>
      </Modal>
    </>
  );
}