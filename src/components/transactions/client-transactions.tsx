"use client";

import Button from "@/components/ui/button";
import { useTransactions } from "@/hooks/use-transactions";
import { getErrorMessage } from "@/lib/api/errors";
import TransactionRow from "./transaction-row";
import TransactionsListSkeleton from "./transactions-list-skeleton";
import ExpandableList from "@/components/ui/expandable-list";
import SectionTitle from "../ui/section-title";
import { IconlyActivity } from "../ui/icons";


export default function ClientTransactions({ clientId }: { clientId: string }) {
  const { data, isPending, isError, error, refetch } = useTransactions({ clientId, limit: 10 });

  return (
    <div className="flex flex-col gap-4">
<SectionTitle icon={IconlyActivity} color="#16a34a">Transactions</SectionTitle>
      {isPending && <TransactionsListSkeleton />} 
      
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
          <p className="text-small text-muted">Aucune transaction pour ce client.</p>
        </div>
      )}


      {data && data.items.length > 0 && (
        <ExpandableList
          items={data.items}
          className="flex flex-col gap-2"
          renderItem={(tx) => <TransactionRow tx={tx} />}
        />
      )}
    </div>
  );
}