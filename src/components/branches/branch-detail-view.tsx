"use client";

import Badge from "@/components/ui/badge";
import Button from "@/components/ui/button";
import Skeleton from "@/components/ui/skeleton";
import { useBranch, useBranchStats } from "@/hooks/use-branches";
import { getErrorMessage } from "@/lib/api/errors";
import BackButton from "@/components/ui/back-button";


export default function BranchDetailView({ id }: { id: string }) {
  const { data: branch, isPending, isError, error, refetch } = useBranch(id);
  const { data: stats, isPending: statsPending } = useBranchStats(id);

  if (isPending) return <Skeleton className="h-40 w-full" />;

  if (isError || !branch) {
    return (
      <div className="bg-white p-4 flex flex-col items-start gap-3">
        <p className="text-small">{getErrorMessage(error)}</p>
        <Button onClick={() => refetch()}>Réessayer</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <BackButton />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h1">
            {branch.name} — {branch.code}
          </h1>
          <p className="text-small text-muted">{branch.city}</p>
        </div>
        <Badge tone={branch.status === "ACTIVE" ? "success" : "neutral"}>
          {branch.status === "ACTIVE" ? "Active" : "Désactivée"}
        </Badge>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        <div className="bg-white p-4">
          <p className="text-caption text-muted uppercase">Clients</p>
          {statsPending ? <Skeleton className="h-6 w-10" /> : <p className="text-h2">{stats?.clientCount}</p>}
        </div>
        {stats &&
          Object.entries(stats.staffByRole).map(([role, count]) => (
            <div key={role} className="bg-white p-4">
              <p className="text-caption text-muted uppercase">{role}</p>
              <p className="text-h2">{count}</p>
            </div>
          ))}
      </div>
    </div>
  );
}