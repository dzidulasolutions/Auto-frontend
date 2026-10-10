"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Amount from "@/components/ui/amount";
import Button from "@/components/ui/button";
import Skeleton from "@/components/ui/skeleton";
import { useAllSavingsAccounts } from "@/hooks/use-savings-account";
import { getErrorMessage } from "@/lib/api/errors";

interface Props {
  area: string;
}

export default function SavingsView({ area }: Props) {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const { data, isPending, isError, error, refetch } = useAllSavingsAccounts(page);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center justify-between gap-4">
        <h1 className="text-h1">Épargne</h1>
        {data && <p className="text-small text-muted">{data.meta.total} comptes</p>}
      </header>

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
          <p className="text-small text-muted">Aucun compte épargne pour le moment.</p>
        </div>
      )}


      {data && data.items.length > 0 && (
        <>
          <div className="px-4 grid grid-cols-[2fr_1fr] gap-4 text-xs uppercase tracking-wide text-muted">
            <span>Client</span>
            <span className="text-right">Solde</span>
          </div>
          <div className="flex flex-col gap-2">
            {data.items.map((account) => (
              <button
                key={account.id}
                onClick={() => router.push(`${area}/clients/${account.clientId}`)}
                className="w-full bg-white px-4 py-3 flex items-center justify-between gap-3 text-left hover:bg-surface transition-colors"
              >
                <div>
                  <p className="text-body font-medium">
                    {account.client.firstName} {account.client.lastName}
                  </p>
                  <p className="text-caption text-muted">{account.accountNumber}</p>
                </div>
                <Amount value={Number(account.balance)} />
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}