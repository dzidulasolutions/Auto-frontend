"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Alert from "@/components/ui/alert";
import Badge from "@/components/ui/badge";
import Button from "@/components/ui/button";
import Modal from "@/components/ui/modal";
import { IconlyDocument, IconlyEdit, IconlyTrash } from "@/components/ui/icons";
import { getErrorMessage } from "@/lib/api/errors";
import { formatDate } from "@/lib/format";
import ClientAvatar from "./client-avatar";
import ClientDetailSkeleton from "./client-detail-skeleton";
import { useClient, useProfileComplete, useReactivateClient } from "@/hooks/use-client";
import { useDeleteClient } from "@/hooks/use-delete-client";
import EditClientForm from "./edit-client-form";
import ClientTransactions from "@/components/transactions/client-transactions";
import ClientSavings from "@/components/savings/client-savings";
import ClientTontines from "@/components/tontines/client-tontines";
import ClientLoans from "@/components/loans/client-loans";
import BackButton from "@/components/ui/back-button";


export default function ClientDetailView({ id, area }: { id: string; area: string }) {
  const router = useRouter();
  const { data: client, isPending, isError, error, refetch } = useClient(id);
  const { data: complete } = useProfileComplete(id);
  const { mutate: deleteClient, isPending: deleting } = useDeleteClient();
  const { mutate: reactivate, isPending: reactivating } = useReactivateClient();
  const [editOpen, setEditOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);


  if (isPending) return <ClientDetailSkeleton />;

  if (isError) {
    return (
      <div className="bg-white p-6 flex flex-col items-start gap-4">
        <p className="text-sm">{getErrorMessage(error)}</p>
        <Button onClick={() => refetch()}>Réessayer</Button>
      </div>
    );
  }

  const handleDelete = () => {
    deleteClient(client.id, {
      onSuccess: () => router.replace(`${area}/clients`),
      onError: (e) => setDeleteError(getErrorMessage(e)),
    });
  };

  const infoItems: { label: string; value: string }[] = [
    { label: "Téléphone", value: client.phone },
    { label: "Email", value: client.email ?? "Non renseigné" },
    { label: "Agence", value: client.branch?.name ?? "—" },
    { label: "Créé le", value: formatDate(client.createdAt) },
  ];

  return (
    <div className="flex flex-col gap-8">
      {notice && <Alert type="success" message={notice} onClose={() => setNotice(null)} />}
      {deleteError && (
        <Alert type="error" message={deleteError} onClose={() => setDeleteError(null)} />
      )}

      <BackButton />

      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <ClientAvatar client={client} />
          <div className="min-w-0">
            <h1 className="text-h1 truncate">
              {client.firstName} {client.lastName}
            </h1>
            <p className="text-small text-muted">{client.clientNumber}</p>
            {client.deletedAt && (
              <Badge tone="neutral" className="mt-1">
                Désactivé
              </Badge>
            )}
          </div>
        </div>

        <div className="flex gap-2 shrink-0">
          {client.deletedAt ? (
            <Button
              size="sm"
              loading={reactivating}
              onClick={() => reactivate(client.id, { onSuccess: () => setNotice("Client réactivé.") })}
            >
              Réactiver
            </Button>
          ) : (
            <>
              <Button variant="secondary" size="sm" onClick={() => setEditOpen(true)}>
                <IconlyEdit size={16} color="currentColor" />
                <span className="hidden sm:inline">Modifier</span>
              </Button>
              <Button variant="danger" size="sm" onClick={() => setConfirmDelete(true)}>
                <IconlyTrash size={16} color="currentColor" />
                <span className="hidden sm:inline">Supprimer</span>
              </Button>
            </>
          )}
        </div>
      </div>

      {complete === false && (
        <div className="bg-warning-bg text-warning px-4 py-3 flex items-center gap-2 rounded-control">
          <IconlyDocument size={16} color="currentColor" />
          <p className="text-small">Profil incomplet : photo ou pièce d&apos;identité manquante.</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {infoItems.map((item) => (
          <div key={item.label} className="bg-white p-4 flex flex-col gap-1">
            <span className="text-caption uppercase tracking-wide text-muted">{item.label}</span>
            <span className="text-body">{item.value}</span>
          </div>
        ))}
      </div>

      {complete !== undefined && (
        <div>
          <Badge tone={complete ? "success" : "warning"}>
            {complete ? "Profil complet" : "Profil incomplet"}
          </Badge>
        </div>
      )}

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Modifier le client" variant="drawer">
        <EditClientForm
          client={client}
          onSuccess={() => {
            setEditOpen(false);
            setNotice("Client mis à jour.");
          }}
        />
      </Modal>

      <Modal open={confirmDelete} onClose={() => setConfirmDelete(false)} title="Supprimer ce client ?">
        <div className="flex flex-col gap-4">
          <p className="text-small text-muted">
            {client.firstName} {client.lastName} sera retiré de la liste. Cette action peut être
            annulée par un administrateur.
          </p>
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" onClick={() => setConfirmDelete(false)}>
              Annuler
            </Button>
            <Button variant="danger" loading={deleting} onClick={handleDelete}>
              Supprimer
            </Button>
          </div>
        </div>
      </Modal>

      <ClientTransactions clientId={client.id} />
      <ClientSavings clientId={client.id} />
      <ClientTontines clientId={client.id} />
      <ClientLoans clientId={client.id} onOpenLoan={(loanId) => router.push(`${area}/loans/${loanId}`)} />
    </div>
  );
}