"use client";

import Amount from "@/components/ui/amount";
import Badge from "@/components/ui/badge";
import Button from "@/components/ui/button";
import Skeleton from "@/components/ui/skeleton";
import { useMyDailyCollections } from "@/hooks/use-dashboard";
import { getErrorMessage } from "@/lib/api/errors";
import SectionTitle from "@/components/ui/section-title";
import { IconlyActivity } from "@/components/ui/icons";


const TYPE_LABELS: Record<string, string> = {
  TONTINE: "Tontine",
  LOAN: "Échéance de prêt",
};

export default function DailyCollectionsView() {
  const { data, isPending, isError, error, refetch } = useMyDailyCollections();

  return (
    <div className="flex flex-col gap-4">
      <SectionTitle as="h1" icon={IconlyActivity} color="#16a34a">Collectes du jour</SectionTitle>

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
        <div className="bg-white p-6">
          <p className="text-small text-muted">Aucune collecte prévue aujourd&apos;hui.</p>
        </div>
      )}

      {data && data.length > 0 && (
        <ul className="flex flex-col gap-2">
          {data.map((c) => (
            <li key={c.collection_id} className="bg-white px-4 py-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-body font-medium">{TYPE_LABELS[c.collection_type] ?? c.collection_type}</p>
                <p className="text-caption text-muted">Client #{c.client_id.slice(0, 8)}</p>
              </div>
              <Amount value={Number(c.amount_due)} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}