"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Badge from "@/components/ui/badge";
import Button from "@/components/ui/button";
import Select from "@/components/ui/select";
import Skeleton from "@/components/ui/skeleton";
import { useAllTontines } from "@/hooks/use-tontines";
import { getErrorMessage } from "@/lib/api/errors";
import { CYCLE_STATUS_LABELS } from "@/types/tontine";
import SegmentedControl from "@/components/ui/segmented-control";


interface Props {
  area: string;
}

export default function TontinesView({ area }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const { data, isPending, isError, error, refetch } = useAllTontines(status || undefined, page);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center justify-between gap-4">
        <h1 className="text-h1">Tontines</h1>
        {data && <p className="text-small text-muted">{data.meta.total} cycles</p>}
      </header>

<SegmentedControl
  value={status || "ALL"}
  onChange={(v) => {
    setStatus(v === "ALL" ? "" : v);
    setPage(1);
  }}
  options={[
    { value: "ALL", label: "Tous" },
    ...Object.entries(CYCLE_STATUS_LABELS).map(([value, label]) => ({ value, label })),
  ]}
/>

      {isPending && (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      )}

      {isError && (
        <div className="bg-white p-4 flex flex-col items-start gap-3">
          <p className="text-small">{getErrorMessage(error)}</p>
          <Button size="sm" onClick={() => refetch()}>
            Réessayer
          </Button>
        </div>
      )}

      {data && data.items.length === 0 && (
        <div className="bg-white p-6">
          <p className="text-small text-muted">Aucun cycle de tontine.</p>
        </div>
      )}

      {data && data.items.length > 0 && (
        <>
          <div className="flex flex-col gap-2">
            {data.items.map((cycle) => (
              <button
                key={cycle.id}
                onClick={() => router.push(`${area}/clients/${cycle.clientId}`)}
                className="w-full bg-white px-4 py-3 flex items-center justify-between gap-3 text-left hover:bg-surface transition-colors"
              >
                <div>
                  <p className="text-body font-medium">
                    {cycle.client.firstName} {cycle.client.lastName}
                  </p>
                  <p className="text-caption text-muted">
                    {cycle.cycleNumber} · {Number(cycle.amountPerCollection).toLocaleString("fr-FR")} FCFA
                  </p>
                </div>
                <Badge tone={cycle.status === "ACTIVE" ? "neutral" : "success"}>
                  {CYCLE_STATUS_LABELS[cycle.status] ?? cycle.status}
                </Badge>
              </button>
            ))}
          </div>

          {data.meta.totalPages > 1 && (
            <div className="flex items-center justify-between text-small">
              <Button
                variant="secondary"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Précédent
              </Button>
              <span className="text-muted">
                Page {data.meta.page} sur {data.meta.totalPages}
              </span>
              <Button
                variant="secondary"
                size="sm"
                disabled={page >= data.meta.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Suivant
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}