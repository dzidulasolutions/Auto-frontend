"use client";

import { useRouter } from "next/navigation";
import Amount from "@/components/ui/amount";
import Badge from "@/components/ui/badge";
import Button from "@/components/ui/button";
import ExpandableList from "@/components/ui/expandable-list";
import Skeleton from "@/components/ui/skeleton";
import { usePortfolioAtRisk } from "@/hooks/use-dashboard";
import { getErrorMessage } from "@/lib/api/errors";
import SectionTitle from "@/components/ui/section-title";
import { IconlyWallet } from "@/components/ui/icons";


export default function PortfolioAtRiskView({ area }: { area: string }) {
  const router = useRouter();
  const { data, isPending, isError, error, refetch } = usePortfolioAtRisk();

  return (
    <div className="flex flex-col gap-4">
      <SectionTitle icon={IconlyWallet} color="#dc2626">Portefeuille à risque</SectionTitle>

      {isPending && <Skeleton className="h-32 w-full" />}

      {isError && (
        <div className="bg-white p-4 flex flex-col items-start gap-3">
          <p className="text-small">{getErrorMessage(error)}</p>
          <Button size="sm" onClick={() => refetch()}>
            Réessayer
          </Button>
        </div>
      )}

      {data && data.length === 0 && (
        <div className="bg-success-bg p-6">
          <p className="text-small text-success">Aucun prêt en retard.</p>
        </div>
      )}

      {data && data.length > 0 && (
        <ExpandableList
          items={data}
          className="flex flex-col gap-2"
          renderItem={(loan) => (
            <button
              onClick={() => router.push(`${area}/loans/${loan.loan_id}`)}
              className="w-full bg-white px-4 py-3 flex items-center justify-between gap-3 text-left hover:bg-surface transition-colors"
            >
              <div>
                <p className="text-body font-medium">{loan.loan_number}</p>
                <p className="text-caption text-muted">
                  {loan.overdue_installments_count} échéance
                  {loan.overdue_installments_count > 1 ? "s" : ""} en retard
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Amount value={loan.overdue_amount} className="text-error" />
                <Badge tone="error">Risque</Badge>
              </div>
            </button>
          )}
        />
      )}
    </div>
  );
}