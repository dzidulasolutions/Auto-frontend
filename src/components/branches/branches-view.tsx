"use client";

import { useState } from "react";
import Link from "next/link";
import Alert from "@/components/ui/alert";
import Badge from "@/components/ui/badge";
import Button from "@/components/ui/button";
import Modal from "@/components/ui/modal";
import Skeleton from "@/components/ui/skeleton";
import { useAllBranches, useDeactivateBranch, useReactivateBranch } from "@/hooks/use-branches";
import { getErrorMessage } from "@/lib/api/errors";
import { IconlyEdit, IconlyTrash } from "@/components/ui/icons";
import type { Branch } from "@/types/branch";
import CreateBranchForm from "./create-branch-form";
import EditBranchForm from "./edit-branch-form";

export default function BranchesView() {
  const { data: branches, isPending, isError, error, refetch } = useAllBranches();
  const { mutate: reactivate } = useReactivateBranch();
  const [reactivatingId, setReactivatingId] = useState<string | null>(null);
  const { mutate: deactivate, isPending: deactivating } = useDeactivateBranch();

  const [createOpen, setCreateOpen] = useState(false);
  const [editBranch, setEditBranch] = useState<Branch | null>(null);
  const [confirmBranch, setConfirmBranch] = useState<Branch | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleDeactivate = () => {
    if (!confirmBranch) return;
    deactivate(confirmBranch.id, {
      onSuccess: () => {
        setConfirmBranch(null);
        setNotice("Agence désactivée.");
      },
      onError: (e) => setActionError(getErrorMessage(e)),
    });
  };

  return (
    <div className="flex flex-col gap-6">
      {notice && <Alert type="success" message={notice} onClose={() => setNotice(null)} />}
      {actionError && <Alert type="error" message={actionError} onClose={() => setActionError(null)} />}

      <div className="flex items-center justify-between">
        <h1 className="text-h1">Agences</h1>
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          Nouvelle agence
        </Button>
      </div>

      {isPending && (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
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

      {branches && branches.length > 0 && (
        <>

          <div className="px-4 grid grid-cols-[2fr_1fr_1fr] gap-4 text-xs uppercase tracking-wide text-muted">
            <span>Agence</span>
            <span></span>
            <div className="flex items-center gap-12 justify-end">
              <span>Statut</span>
              <span className="text-right">Actions</span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {branches.map((b) => (
              <div key={b.id} className="relative bg-white px-4 py-3 flex items-center justify-between gap-3">
                <Link href={`/admin/branches/${b.id}`} className="absolute inset-0" aria-label={b.name} />

                <div className="relative pointer-events-none">
                  <p className="text-body font-medium">
                    {b.name} — {b.code}
                  </p>
                  <p className="text-caption text-muted">{b.city}</p>
                </div>

                <div className="relative z-10 flex items-center gap-2 shrink-0">
                  <Badge tone={b.status === "ACTIVE" ? "success" : "neutral"}>
                    {b.status === "ACTIVE" ? "Active" : "Désactivée"}
                  </Badge>
                  {b.status === "ACTIVE" ? (
                    <>
                      <Button variant="secondary" size="sm" onClick={() => setEditBranch(b)}>
                        <IconlyEdit size={16} color="currentColor" />
                        <span className="hidden sm:inline">Modifier</span>
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => setConfirmBranch(b)}>
                        <IconlyTrash size={16} color="currentColor" />
                        <span className="hidden sm:inline">Désactiver</span>
                      </Button>
                    </>
                  ) : (
                    <Button
                      size="sm"
                      loading={reactivatingId === b.id}
                      onClick={() => {
                        setReactivatingId(b.id);
                        reactivate(b.id, {
                          onSuccess: () => setNotice("Agence réactivée."),
                          onSettled: () => setReactivatingId(null),
                        });
                      }}
                    >
                      Réactiver
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

        </>
      )}

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Nouvelle agence" variant="drawer">
        <CreateBranchForm
          onSuccess={() => {
            setCreateOpen(false);
            setNotice("Agence créée.");
          }}
        />
      </Modal>

      <Modal open={!!editBranch} onClose={() => setEditBranch(null)} title="Modifier l'agence" variant="drawer">
        {editBranch && (
          <EditBranchForm
            branch={editBranch}
            onSuccess={() => {
              setEditBranch(null);
              setNotice("Agence mise à jour.");
            }}
          />
        )}
      </Modal>

      <Modal open={!!confirmBranch} onClose={() => setConfirmBranch(null)} title="Désactiver cette agence ?">
        <div className="flex flex-col gap-4">
          <p className="text-small text-muted">
            {confirmBranch?.name} sera désactivée et n&apos;apparaîtra plus dans les sélecteurs. Elle
            reste visible ici et peut être réactivée.
          </p>

          <div className="flex gap-2 justify-end">
            <Button variant="secondary" onClick={() => setConfirmBranch(null)}>
              Annuler
            </Button>
            <Button variant="danger" loading={deactivating} onClick={handleDeactivate}>
              Désactiver
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}