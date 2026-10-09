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
          <div className="flex flex-col gap-2">
            {data.items.map((loan) => (
              <button
                key={loan.id}
                onClick={() => router.push(`${area}/loans/${loan.id}`)}
                className="w-full bg-white px-4 py-3 flex items-center justify-between gap-3 text-left hover:bg-surface transition-colors"
              >
                <div>
                  <p className="text-body font-medium">{loan.loanNumber}</p>
                  <p className="text-caption text-muted">
                    {Number(loan.principal).toLocaleString("fr-FR")} FCFA · {loan.durationMonths} mois
                  </p>
                </div>
                <Badge tone={loanStatusTone(loan.status)}>{LOAN_STATUS_LABELS[loan.status]}</Badge>
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