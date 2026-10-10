"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Badge from "@/components/ui/badge";
import Button from "@/components/ui/button";
import Select from "@/components/ui/select";
import { useAllLoans } from "@/hooks/use-loans";
import { getErrorMessage } from "@/lib/api/errors";
import { LOAN_STATUS_LABELS, loanStatusTone } from "@/types/loan";
import type { LoanStatus } from "@/types/loan";
import LoansListSkeleton from "./loans-list-skeleton";
import SegmentedControl from "@/components/ui/segmented-control";


interface Props {
  area: string; // "/admin", "/manager", etc.
}

export default function LoansView({ area }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState<LoanStatus | "">("");
  const [page, setPage] = useState(1);

  const { data, isPending, isError, error, refetch } = useAllLoans(status || undefined, page);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center justify-between gap-4">
        <h1 className="text-h1">Prêts</h1>
        {data && <p className="text-small text-muted">{data.meta.total} au total</p>}
      </header>

      <SegmentedControl
        value={status || "ALL"}
        onChange={(v) => {
          setStatus(v === "ALL" ? "" : (v as LoanStatus));
          setPage(1);
        }}
        options={[
          { value: "ALL", label: "Tous" },
          ...Object.entries(LOAN_STATUS_LABELS).map(([value, label]) => ({ value, label })),
        ]}
      />

      {isPending && <LoansListSkeleton />}

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
          <p className="text-small text-muted">Aucun prêt {status ? `avec ce statut` : ""}.</p>
        </div>
      )}

      {data && data.items.length > 0 && (

        <>

          <div className="w-full space-y-3">
            {/* En-tête : visible sur tablette et ordinateur */}
            <div className="hidden sm:grid grid-cols-[1.2fr_1.5fr_0.8fr_1fr] gap-4 px-4 text-xs font-medium uppercase tracking-wide text-muted">
              <span>Client / N° prêt</span>
              <span>Montant</span>
              <span>Durée</span>
              <span className="text-right">Statut</span>
            </div>

            {/* Liste des prêts */}
            <div className="flex flex-col gap-2">
              {data.items.map((loan) => (
                <button
                  key={loan.id}
                  type="button"
                  onClick={() => router.push(`${area}/loans/${loan.id}`)}
                  className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2 bg-white px-3 py-3 text-left transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:grid-cols-[1.2fr_1.5fr_0.8fr_1fr] sm:gap-4 sm:px-4"
                >
                  {/* Numéro du prêt */}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-body">
                      {loan.loanNumber}
                    </p>

                    <p className="mt-1 text-xs text-muted sm:hidden">
                      N° de prêt
                    </p>
                  </div>

                  {/* Montant */}
                  <div className="min-w-0 sm:min-w-0">
                    <p className="text-sm font-medium text-body sm:font-normal">
                      {Number(loan.principal).toLocaleString("fr-FR")} FCFA
                    </p>

                    <p className="mt-1 text-xs text-muted sm:hidden">
                      Montant
                    </p>
                  </div>

                  {/* Durée : affichée dans la partie basse sur mobile */}
                  <div className="col-start-1 row-start-2 sm:col-auto sm:row-auto">
                    <p className="text-xs text-muted sm:text-sm sm:text-body">
                      {loan.durationMonths} mois
                    </p>
                  </div>

                  {/* Statut */}
                  <div className="col-start-2 row-start-2 flex justify-end sm:col-auto sm:row-auto">
                    <Badge tone={loanStatusTone(loan.status)}>
                      {LOAN_STATUS_LABELS[loan.status]}
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