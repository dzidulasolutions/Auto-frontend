"use client";

import { useState } from "react";
import Alert from "@/components/ui/alert";
import Badge from "@/components/ui/badge";
import Button from "@/components/ui/button";
import ExpandableList from "@/components/ui/expandable-list";
import Modal from "@/components/ui/modal";
import Skeleton from "@/components/ui/skeleton";
import { useLoansByClient } from "@/hooks/use-loans";
import { getErrorMessage } from "@/lib/api/errors";
import { LOAN_STATUS_LABELS, loanStatusTone } from "@/types/loan";
import CreateLoanForm from "./create-loan-form";
import SectionTitle from "../ui/section-title";
import { IconlyWallet } from "../ui/icons";

interface Props {
  clientId: string;
  onOpenLoan: (loanId: string) => void;
}

export default function ClientLoans({ clientId, onOpenLoan }: Props) {
  const { data, isPending, isError, error, refetch } = useLoansByClient(clientId);
  const [createOpen, setCreateOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-4">
      {notice && <Alert type="success" message={notice} onClose={() => setNotice(null)} />}

      <div className="flex items-center justify-between">
        <SectionTitle icon={IconlyWallet} color="#2563eb">Prêts</SectionTitle>
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          Nouvelle demande
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

      {data && data.items.length === 0 && (
        <div className="bg-white p-6">
          <p className="text-small text-muted">Aucun prêt pour ce client.</p>
        </div>
      )}

      {data && data.items.length > 0 && (
        <ExpandableList
          items={data.items}
          className="flex flex-col gap-2"
          renderItem={(loan) => (
            <button
              onClick={() => onOpenLoan(loan.id)}
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
          )}
        />
      )}

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Nouvelle demande de prêt" variant="drawer">
        <CreateLoanForm
          clientId={clientId}
          onSuccess={() => {
            setCreateOpen(false);
            setNotice("Demande de prêt créée en brouillon.");
          }}
        />
      </Modal>
    </div>
  );
}