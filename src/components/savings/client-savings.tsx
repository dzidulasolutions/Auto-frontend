"use client";

import { useState } from "react";
import Alert from "@/components/ui/alert";
import Amount from "@/components/ui/amount";
import Button from "@/components/ui/button";
import Modal from "@/components/ui/modal";
import Skeleton from "@/components/ui/skeleton";
import { useCreateSavingsAccount } from "@/hooks/use-create-savings-account";
import { useSavingsAccount } from "@/hooks/use-savings-account";
import { getErrorMessage } from "@/lib/api/errors";
import SavingsOperationForm from "./savings-operation-form";
import SectionTitle from "../ui/section-title";
import { IconlyDiscount } from "../ui/icons";

export default function ClientSavings({ clientId }: { clientId: string }) {
  const { data: account, isPending, isError, error, refetch } = useSavingsAccount(clientId);
  const { mutate: create, isPending: creating } = useCreateSavingsAccount();

  const [operation, setOperation] = useState<"deposit" | "withdraw" | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);

  if (isPending) {
    return (
      <div className="bg-white p-5 flex flex-col gap-3">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-8 w-40" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-white p-5 flex flex-col items-start gap-3">
        <p className="text-small">{getErrorMessage(error)}</p>
        <Button size="sm" onClick={() => refetch()}>
          Réessayer
        </Button>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="bg-white p-5 flex flex-col items-start gap-3">
        {createError && <Alert type="error" message={createError} onClose={() => setCreateError(null)} />}
        <div>
          <SectionTitle icon={IconlyDiscount} color="#d97706">Épargne</SectionTitle>
          <p className="text-small text-muted mt-1">Ce client n&apos;a pas encore de compte épargne.</p>
        </div>
        <Button
          size="sm"
          loading={creating}
          onClick={() => create(clientId, { onError: (e) => setCreateError(getErrorMessage(e)) })}
        >
          Ouvrir un compte épargne
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {notice && <Alert type="success" message={notice} onClose={() => setNotice(null)} />}

      <div className="bg-white p-5 flex flex-col gap-4">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-h2">Épargne</h2>
            <p className="text-caption text-muted mt-1">{account.accountNumber}</p>
          </div>
          <Amount value={Number(account.balance)} className="text-display" />
        </div>

        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => setOperation("deposit")}>
            Dépôt
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setOperation("withdraw")}>
            Retrait
          </Button>
        </div>
      </div>

      <Modal
        open={operation !== null}
        onClose={() => setOperation(null)}
        title={operation === "deposit" ? "Dépôt épargne" : "Retrait épargne"}
        variant="drawer"
      >
        {operation && (
          <SavingsOperationForm
            clientId={clientId}
            accountId={account.id}
            kind={operation}
            onSuccess={() => {
              setOperation(null);
              setNotice(operation === "deposit" ? "Dépôt effectué." : "Retrait effectué.");
            }}
          />
        )}
      </Modal>
    </div>
  );
}