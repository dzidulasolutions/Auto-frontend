"use client";

import { useState } from "react";
import Alert from "@/components/ui/alert";
import Badge from "@/components/ui/badge";
import Button from "@/components/ui/button";
import Modal from "@/components/ui/modal";
import Skeleton from "@/components/ui/skeleton";
import { useDeactivateUser, useUsers } from "@/hooks/use-users";
import { getErrorMessage } from "@/lib/api/errors";
import { IconlyTrash } from "@/components/ui/icons";
import type { StaffMember } from "@/types/user";
import CreateUserForm from "./create-user-form";
import { useReactivateUser } from "@/hooks/use-users";


export default function UsersView() {
  const { data: users, isPending, isError, error, refetch } = useUsers();
  const { mutate: deactivate, isPending: deactivating } = useDeactivateUser();

  const [createOpen, setCreateOpen] = useState(false);
  const [confirmUser, setConfirmUser] = useState<StaffMember | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const { mutate: reactivate } = useReactivateUser();
  const [reactivatingId, setReactivatingId] = useState<string | null>(null);

  const handleDeactivate = () => {
    if (!confirmUser) return;
    deactivate(confirmUser.id, {
      onSuccess: () => {
        setConfirmUser(null);
        setNotice("Utilisateur désactivé.");
      },
      onError: (e) => setActionError(getErrorMessage(e)),
    });
  };

  return (
    <div className="flex flex-col gap-6">
      {notice && <Alert type="success" message={notice} onClose={() => setNotice(null)} />}
      {actionError && <Alert type="error" message={actionError} onClose={() => setActionError(null)} />}

      <div className="flex items-center justify-between">
        <h1 className="text-h1">Utilisateurs</h1>
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          Nouvel utilisateur
        </Button>
      </div>

      {isPending && (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
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

      {users && users.length > 0 && (

        <>
          {/* En-tête : visible sur tablette et ordinateur */}
          <div className="hidden sm:grid sm:grid-cols-[1.4fr_1.8fr_1fr_1fr_auto] items-center gap-4 px-4 text-xs font-medium uppercase tracking-wide text-muted">
            <span>Utilisateur</span>
            <span>Rôle</span>
            <span>Statut</span>
            <span className="text-right">Actions</span>
          </div>

          {/* Liste des utilisateurs */}
          <div className="flex flex-col gap-2">
            {users.map((u) => (
              <div
                key={u.id}
                className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-3 rounded-lg border border-border bg-white px-4 py-3 sm:grid-cols-[1.4fr_1.8fr_1fr_1fr_auto] sm:gap-4"
              >
                {/* Utilisateur */}
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-body">
                    {u.firstName} {u.lastName}
                  </p>
                  <p className="text-xs text-muted sm:hidden">
                    Utilisateur
                  </p>
                </div>

                {/* Statut : en haut à droite sur mobile */}
                <div className="col-start-2 row-start-1 flex justify-end sm:col-auto sm:row-auto sm:justify-start">
                  <Badge tone={u.status === "ACTIVE" ? "success" : "neutral"}>
                    {u.status === "ACTIVE" ? "Actif" : "Désactivé"}
                  </Badge>
                </div>

                {/* Email */}
                <div className="col-start-1 row-start-2 min-w-0 sm:col-auto sm:row-auto">
                  <p className="truncate text-sm text-body">
                    {u.email}
                  </p>
                  <p className="text-xs text-muted sm:hidden">Email</p>
                </div>

                {/* Rôle */}
                <div className="col-start-1 row-start-3 sm:col-auto sm:row-auto">
                  <p className="text-sm text-body">
                    <span className="mr-1 text-xs text-muted sm:hidden">Rôle :</span>
                    {u.role.name}
                  </p>
                </div>

                {/* Actions */}
                <div className="col-start-2 row-start-3 flex items-center justify-end gap-2 sm:col-auto sm:row-auto">
                  {u.status === "ACTIVE" ? (
                    <button
                      type="button"
                      onClick={() => setConfirmUser(u)}
                      aria-label={`Désactiver ${u.firstName} ${u.lastName}`}
                      title="Désactiver l'utilisateur"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface hover:text-error focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                      <IconlyTrash size={16} color="currentColor" />
                    </button>
                  ) : (
                    <Button
                      size="sm"
                      loading={reactivatingId === u.id}
                      onClick={() => {
                        setReactivatingId(u.id);
                        reactivate(u.id, {
                          onSuccess: () => setNotice("Utilisateur réactivé."),
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

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Nouvel utilisateur" variant="drawer">
        <CreateUserForm
          onSuccess={() => {
            setCreateOpen(false);
            setNotice("Utilisateur créé.");
          }}
        />
      </Modal>

      <Modal open={!!confirmUser} onClose={() => setConfirmUser(null)} title="Désactiver cet utilisateur ?">
        <div className="flex flex-col gap-4">
          <p className="text-small text-muted">
            {confirmUser?.firstName} {confirmUser?.lastName} ne pourra plus se connecter.
          </p>
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" onClick={() => setConfirmUser(null)}>
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