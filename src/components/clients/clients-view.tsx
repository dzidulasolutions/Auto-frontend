"use client";

import { useState } from "react";
import SearchInput from "@/components/ui/search-input";
import { SEARCH_MIN_CHARS, useClients, useClientSearch } from "@/hooks/use-clients";
import { useDebounce } from "@/hooks/use-debounce";
import { getErrorMessage } from "@/lib/api/errors";
import ClientRows from "./client-rows";
import ClientsListSkeleton from "./clients-list-skeleton";
import { useQueryClient } from "@tanstack/react-query";
import Button from "@/components/ui/button";
import Modal from "@/components/ui/modal";
import { IconlyPlus } from "@/components/ui/icons";
import CreateClientForm from "./create-client-form";
import { clientKeys } from "@/hooks/use-clients";
import Alert from "@/components/ui/alert";


const LIMIT = 20;

export default function ClientsView() {
  const [page, setPage] = useState(1);
  const [showInactive, setShowInactive] = useState(false);

  const list = useClients(page, LIMIT, showInactive);
  const [query, setQuery] = useState("");

  const [createOpen, setCreateOpen] = useState(false);
  const queryClient = useQueryClient();

  const trimmed = query.trim();
  const debounced = useDebounce(trimmed, 500);
  const searching = debounced.length >= SEARCH_MIN_CHARS;
  const tooShort = trimmed.length > 0 && trimmed.length < SEARCH_MIN_CHARS;

  const search = useClientSearch(searching ? debounced : "");

  const current = searching ? search : list;
  const items = searching ? search.data : list.data?.items;
  const meta = list.data?.meta;
  const dimmed = current.isPlaceholderData || trimmed !== debounced;

  const subtitle = searching
    ? items && `${items.length} ${items.length > 1 ? "résultats" : "résultat"}`
    : meta && `${meta.total} ${meta.total > 1 ? "clients" : "client"}`;

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  return (
    <div className="flex flex-col gap-8">
      
      <header className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-h1">Clients</h1>
          {subtitle && <p className="text-small text-muted">{subtitle}</p>}
        </div>
        <Button size="sm" onClick={() => setCreateOpen(true)} className="shrink-0">
          <IconlyPlus size={16} color="currentColor" />
          <span className="hidden sm:inline">Nouveau client</span>
        </Button>
      </header>

      {successMessage && (
        <Alert type="success" message={successMessage} onClose={() => setSuccessMessage(null)} />
      )}



      <div className="flex flex-col gap-2">
        <SearchInput
          value={query}
          onChange={(v) => {
            setQuery(v);
            setPage(1);
          }}
          placeholder="Nom, téléphone ou numéro client"
        />
        {tooShort && (
          <p className="text-xs text-black/50">
            Saisissez au moins {SEARCH_MIN_CHARS} caractères.
          </p>
        )}
      </div>

            <label className="flex items-center gap-2 text-small text-muted">
        <input
          type="checkbox"
          checked={showInactive}
          onChange={(e) => {
            setShowInactive(e.target.checked);
            setPage(1);
          }}
        />
        Afficher les clients désactivés
      </label>

      {current.isPending && <ClientsListSkeleton showBranch={!searching} />}

      {current.isError && (
        <div className="bg-white p-6 flex flex-col items-start gap-4">
          <p className="text-sm">{getErrorMessage(current.error)}</p>
          <Button onClick={() => current.refetch()}>Réessayer</Button>
        </div>
      )}

      {items && items.length === 0 && (
        <div className="bg-white p-8 flex flex-col gap-1">
          {searching ? (
            <>
              <p className="text-sm font-medium">Aucun résultat pour « {debounced} »</p>
              <p className="text-sm text-black/50">
                Vérifiez l&apos;orthographe ou essayez un numéro de téléphone.
              </p>
            </>
          ) : (
            <>
              <p className="text-sm font-medium">Aucun client pour le moment</p>
              <p className="text-sm text-black/50">Les clients ajoutés apparaîtront ici.</p>
            </>
          )}
        </div>
      )}

      {items && items.length > 0 && (
        <div className={`transition-opacity ${dimmed ? "opacity-60" : ""}`}>
          <ClientRows items={items} />

          {!searching && meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-between mt-8 text-sm">
              <Button variant="secondary" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
                Précédent
              </Button>
              <span className="text-black/50">
                Page {meta.page} sur {meta.totalPages}
              </span>
              <Button variant="secondary" size="sm" onClick={() => setPage((p) => p + 1)} disabled={page >= meta.totalPages}>
                Suivant
              </Button>
            </div>
          )}
        </div>
      )}

      {/* <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Nouveau client" variant="drawer">
        <CreateClientForm
          onSuccess={() => {
            setCreateOpen(false);
            queryClient.invalidateQueries({ queryKey: clientKeys.all });
          }}
        />
      </Modal> */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Nouveau client" variant="drawer">
        <CreateClientForm
          onSuccess={() => {
            setCreateOpen(false);
            setSuccessMessage("Client créé avec succès.");
            queryClient.invalidateQueries({ queryKey: clientKeys.all });
          }}
        />
      </Modal>

    </div>
  );
}