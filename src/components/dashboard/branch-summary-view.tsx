"use client";

import { useState } from "react";
import Button from "@/components/ui/button";
import SegmentedControl from "@/components/ui/segmented-control";
import Skeleton from "@/components/ui/skeleton";
import { useBranches } from "@/hooks/use-branches";
import { useCurrentRole } from "@/hooks/use-current-role";
import { useBranchSummary } from "@/hooks/use-dashboard";
import { getErrorMessage } from "@/lib/api/errors";
import { formatDate } from "@/lib/format";
import { PRIVILEGED_ROLES } from "@/types/auth";
import BranchCashFlowChart from "./branch-cash-flow-chart";
import SectionTitle from "@/components/ui/section-title";
import { IconlyGraph } from "@/components/ui/icons";


export default function BranchSummaryView() {
  const { role } = useCurrentRole();
  const isPrivileged = !!role && PRIVILEGED_ROLES.includes(role);
  const { data: branches } = useBranches(role);
  const [branchId, setBranchId] = useState<string>("");
  const effectiveBranchId = branchId || branches?.[0]?.id || "";

  const { data, isPending, isError, error, refetch } = useBranchSummary(
    isPrivileged ? effectiveBranchId || undefined : undefined,
  );

  const totalTransactions = data?.reduce((sum, d) => sum + d.transaction_count, 0) ?? 0;
  const totalDeposits = data?.reduce((sum, d) => sum + d.total_deposits, 0) ?? 0;
  const totalDisbursements = data?.reduce((sum, d) => sum + d.total_disbursements, 0) ?? 0;
  const netFlow = totalDeposits + totalDisbursements - (data?.reduce((s, d) => s + d.total_withdrawals + d.total_repayments, 0) ?? 0);

  return (
    <div className="flex flex-col gap-4">
      <SectionTitle icon={IconlyGraph} color="#2563eb">Résumé d&apos;agence</SectionTitle>

      {isPrivileged && branches && branches.length > 0 && (
        <SegmentedControl
          value={effectiveBranchId}
          onChange={setBranchId}
          options={branches.map((b) => ({ value: b.id, label: b.name }))}
        />
      )}

      {(!isPrivileged || branchId) && isPending && <Skeleton className="h-64 w-full" />}

      {isError && (
        <div className="bg-white p-4 flex flex-col items-start gap-3 rounded-surface">
          <p className="text-small">{getErrorMessage(error)}</p>
          <Button size="sm" onClick={() => refetch()}>
            Réessayer
          </Button>
        </div>
      )}

      {data && data.length === 0 && (
        <div className="bg-white p-6 rounded-surface">
          <p className="text-small text-muted">Aucune activité sur les 30 derniers jours.</p>
        </div>
      )}

      {data && data.length > 0 && (
        <div className="flex flex-col gap-4">
          <div className="bg-black text-white p-6 rounded-surface flex flex-col gap-1">
            <span className="text-caption uppercase text-white/50">Flux net (30 jours)</span>
            <span className="text-display">{netFlow.toLocaleString("fr-FR")} FCFA</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="bg-white p-4 rounded-surface">
              <p className="text-caption text-muted uppercase">Transactions</p>
              <p className="text-h2">{totalTransactions}</p>
            </div>
            <div className="bg-white p-4 rounded-surface">
              <p className="text-caption text-muted uppercase">Dépôts</p>
              <p className="text-h2">{totalDeposits.toLocaleString("fr-FR")}</p>
            </div>
            <div className="bg-white p-4 rounded-surface">
              <p className="text-caption text-muted uppercase">Décaissements</p>
              <p className="text-h2">{totalDisbursements.toLocaleString("fr-FR")}</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-surface">
            <p className="text-small text-muted mb-2">Flux de trésorerie</p>
            <BranchCashFlowChart data={data} />
          </div>

          <div className="bg-white rounded-surface overflow-hidden">
            <div className="px-5 py-3 grid grid-cols-[1.5fr_1fr_1fr_1fr_1fr] gap-4 text-xs uppercase tracking-wide text-muted border-b border-border">
              <span>Date</span>
              <span>Transactions</span>
              <span>Dépôts</span>
              <span>Retraits</span>
              <span>Décaissements</span>
            </div>
            {[...data]
              .sort((a, b) => b.summary_date.localeCompare(a.summary_date))
              .map((day) => (
                <div
                  key={day.summary_date}
                  className="px-5 py-3 grid grid-cols-[1.5fr_1fr_1fr_1fr_1fr] gap-4 text-small border-b border-border last:border-0"
                >
                  <span className="text-muted">{formatDate(day.summary_date)}</span>
                  <span>{day.transaction_count}</span>
                  <span className="text-success">{day.total_deposits.toLocaleString("fr-FR")}</span>
                  <span className="text-error">{day.total_withdrawals.toLocaleString("fr-FR")}</span>
                  <span>{day.total_disbursements.toLocaleString("fr-FR")}</span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}