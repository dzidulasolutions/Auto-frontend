"use client";

import { useState } from "react";
import Alert from "@/components/ui/alert";
import Badge from "@/components/ui/badge";
import Button from "@/components/ui/button";
import Modal from "@/components/ui/modal";
import Skeleton from "@/components/ui/skeleton";
import { useTontinesByClient } from "@/hooks/use-tontines";
import { getErrorMessage } from "@/lib/api/errors";
import { CYCLE_STATUS_LABELS } from "@/types/tontine";
import CreateTontineForm from "./create-tontine-form";
import TontinePassbook from "./tontine-passbook";
import ExpandableList from "@/components/ui/expandable-list";
import SectionTitle from "../ui/section-title";
import { IconlyGraph } from "../ui/icons";

export default function ClientTontines({ clientId }: { clientId: string }) {
  const { data, isPending, isError, error, refetch } = useTontinesByClient(clientId);
  const [createOpen, setCreateOpen] = useState(false);
  const [openCycleId, setOpenCycleId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-4">
      {notice && <Alert type="success" message={notice} onClose={() => setNotice(null)} />}
c
      <div className="flex items-center justify-between">
        <SectionTitle icon={IconlyGraph} color="#9333ea">Tontines</SectionTitle>
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          Nouveau cycle
        </Button>
      </div>

      {isPending && <Skeleton className="h-16 w-full" />}

      {isError && (
        <div className="bg-white p-4 flex flex-col items-start gap-3">
          <p className="text-small">{getErrorMessage(error)}</p>
          <Button size="sm" onClick={() => refetch()}>
            Réessayer
          </Button>
        </div>
      )}

      {data && data.length === 0 && (
        <div className="bg-white p-6">
          <p className="text-small text-muted">Aucun cycle de tontine pour ce client.</p>
        </div>
      )}

      {data && data.length > 0 && (
        <ExpandableList
          items={data}
          className="flex flex-col gap-2"
          renderItem={(cycle) => (
            <button
              onClick={() => setOpenCycleId(cycle.id)}
              className="w-full bg-white px-4 py-3 flex items-center justify-between gap-3 text-left hover:bg-surface transition-colors"
            >
              <div>
                <p className="text-body font-medium">{cycle.cycleNumber}</p>
                <p className="text-caption text-muted">
                  {cycle.amountPerCollection} FCFA · {cycle.durationMonths} mois
                </p>
              </div>
              <Badge tone={cycle.status === "ACTIVE" ? "neutral" : "success"}>
                {CYCLE_STATUS_LABELS[cycle.status] ?? cycle.status}
              </Badge>
            </button>
          )}
        />
      )}

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Nouveau cycle de tontine" variant="drawer">
        <CreateTontineForm
          clientId={clientId}
          onSuccess={() => {
            setCreateOpen(false);
            setNotice("Cycle de tontine créé.");
          }}
        />
      </Modal>

      <Modal open={openCycleId !== null} onClose={() => setOpenCycleId(null)} title="Carnet de tontine" variant="drawer">
        {openCycleId && <TontinePassbook cycleId={openCycleId} clientId={clientId} />}
      </Modal>
    </div>
  );
}