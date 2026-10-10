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


          <div className="w-full space-y-3">
            {/* En-tête : visible sur tablette et ordinateur */}
            <div className="hidden sm:grid sm:grid-cols-[1.5fr_1.5fr_1.5fr_1fr] items-center gap-4 px-4 text-xs font-medium uppercase tracking-wide text-muted">
              <span>Client</span>
              <span>Cycle</span>
              <span>Montant</span>
              <span className="text-right">Statut</span>
            </div>

            {/* Liste des cycles */}
            <div className="flex flex-col gap-2">
              {data.items.map((cycle) => (
                <button
                  key={cycle.id}
                  type="button"
                  onClick={() => router.push(`${area}/clients/${cycle.clientId}`)}
                  className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2 bg-white px-4 py-3 text-left transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:grid-cols-[1.5fr_1.5fr_1.5fr_1fr] sm:gap-4"
                >
                  {/* Client */}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-body">
                      {cycle.client.firstName} {cycle.client.lastName}
                    </p>
                  </div>

                  {/* Cycle */}
                  <div className="col-start-1 row-start-2 sm:col-auto sm:row-auto">
                    <p className="text-xs text-muted sm:text-sm sm:text-body">
                      <span className="sm:hidden">Cycle : </span>
                      {cycle.cycleNumber}
                    </p>
                  </div>

                  {/* Montant */}
                  <div className="col-start-1 row-start-3 min-w-0 sm:col-auto sm:row-auto">
                    <p className="text-sm font-medium text-body">
                      <span className="mr-1 text-xs font-normal text-muted sm:hidden">
                        Montant :
                      </span>
                      {Number(cycle.amountPerCollection).toLocaleString("fr-FR")} FCFA
                    </p>
                  </div>

                  {/* Statut */}
                  <div className="col-start-2 row-start-1 flex justify-end sm:col-auto sm:row-auto">
                    <Badge
                      tone={cycle.status === "ACTIVE" ? "neutral" : "success"}
                    >
                      {CYCLE_STATUS_LABELS[cycle.status] ?? cycle.status}
                    </Badge>
                  </div>
                </button>
              ))}
            </div>
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