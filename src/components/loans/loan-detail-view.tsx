"use client";

import { useState } from "react";
import Alert from "@/components/ui/alert";
import Amount from "@/components/ui/amount";
import Badge from "@/components/ui/badge";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import Modal from "@/components/ui/modal";
import Skeleton from "@/components/ui/skeleton";
import { useCurrentRole } from "@/hooks/use-current-role";
import { availableActionsForRole } from "@/types/loan";

import {
    useApproveLoan,
    useDisburseLoan,
    useLoan,
    useRejectLoan,
    useSubmitLoan,
} from "@/hooks/use-loans";
import { getErrorMessage } from "@/lib/api/errors";
import { formatDate } from "@/lib/format";
import {
    LOAN_FREQUENCY_LABELS,
    LOAN_STATUS_LABELS,
    loanStatusTone,
} from "@/types/loan";
import LoanSchedule from "./loan-schedule";
// import { useRescheduleLoan } from "@/hooks/use-loans";
import RescheduleLoanForm from "./reschedule-loan-form";
import { PRIVILEGED_ROLES } from "@/types/auth";
// import { getLoanPassbookUrl } from "@/services/loans.service";
import { IconlyPaper } from "../ui/icons";
import BackButton from "../ui/back-button";


export default function LoanDetailView({ loanId }: { loanId: string }) {
    const { data: loan, isPending, isError, error, refetch } = useLoan(loanId);
    const { role } = useCurrentRole();

    const clientId = loan?.clientId ?? "";
    const submit = useSubmitLoan(clientId, loanId);
    const approve = useApproveLoan(clientId, loanId);
    const reject = useRejectLoan(clientId, loanId);
    const disburse = useDisburseLoan(clientId, loanId);

    const [notice, setNotice] = useState<string | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);
    const [rejectOpen, setRejectOpen] = useState(false);
    const [reason, setReason] = useState("");
    const [disbursed, setDisbursed] = useState(false);

    const [rescheduleOpen, setRescheduleOpen] = useState(false);
    const canReschedule = !!role && (PRIVILEGED_ROLES.includes(role) || role === "Manager");

    if (isPending) {
        return (
            <div className="flex flex-col gap-4">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-24 w-full" />
            </div>
        );
    }

    if (isError || !loan) {
        return (
            <div className="flex flex-col items-start gap-3">
                <p className="text-small">{getErrorMessage(error)}</p>
                <Button onClick={() => refetch()}>Réessayer</Button>
            </div>
        );
    }

    const actions = role ? availableActionsForRole(loan.status, role) : [];

    const run = (mutation: { mutate: (arg: never, opts: never) => void }, arg: unknown, message: string) => {
        setActionError(null);
        // @ts-expect-error — signature partagée entre les 4 hooks, dont un attend une string
        mutation.mutate({ id: loanId, arg }, {
            onSuccess: () => setNotice(message),
            onError: (e: unknown) => setActionError(getErrorMessage(e)),
        });
    };

    const handleReject = () => {
        if (!reason.trim()) return;
        run(reject, reason.trim(), "Prêt rejeté.");
        setRejectOpen(false);
        setReason("");
    };



    return (
        <div className="flex flex-col gap-6">
            {notice && <Alert type="success" message={notice} onClose={() => setNotice(null)} />}
            {actionError && <Alert type="error" message={actionError} onClose={() => setActionError(null)} />}
<BackButton />
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-h1">{loan.loanNumber}</h1>
                    <p className="text-small text-muted mt-1">Créé le {formatDate(loan.createdAt)}</p>
                </div>
                <Badge tone={loanStatusTone(loan.status)}>{LOAN_STATUS_LABELS[loan.status]}</Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="bg-white p-4 flex flex-col gap-1">
                    <span className="text-caption uppercase tracking-wide text-muted">Montant emprunté</span>
                    <Amount value={Number(loan.principal)} className="text-h2" />
                </div>
                <div className="bg-white p-4 flex flex-col gap-1">
                    <span className="text-caption uppercase tracking-wide text-muted">Taux d&apos;intérêt</span>
                    <span className="text-body">{(Number(loan.interestRate) * 100).toFixed(1)} %</span>
                </div>
                <div className="bg-white p-4 flex flex-col gap-1">
                    <span className="text-caption uppercase tracking-wide text-muted">Durée</span>
                    <span className="text-body">{loan.durationMonths} mois</span>
                </div>
                <div className="bg-white p-4 flex flex-col gap-1">
                    <span className="text-caption uppercase tracking-wide text-muted">Fréquence</span>
                    <span className="text-body">{LOAN_FREQUENCY_LABELS[loan.frequency]}</span>
                </div>
            </div>

            {loan.status === "REJECTED" && loan.rejectionReason && (
                <div className="bg-error-bg text-error px-4 py-3 rounded-control">
                    <p className="text-small">Motif du rejet : {loan.rejectionReason}</p>
                </div>
            )}

            {actions.length > 0 && (
                <div className="flex gap-2">
                    {actions.includes("submit") && (
                        <Button
                            loading={submit.isPending}
                            disabled={submit.isPending || approve.isPending || reject.isPending || disburse.isPending}
                            onClick={() => run(submit, undefined, "Prêt soumis pour approbation.")}
                        >
                            Soumettre pour approbation
                        </Button>
                    )}
                    {actions.includes("approve") && (
                        <Button
                            loading={approve.isPending}
                            disabled={submit.isPending || approve.isPending || reject.isPending || disburse.isPending}
                            onClick={() => run(approve, undefined, "Prêt approuvé.")}
                        >
                            Approuver
                        </Button>
                    )}
                    {actions.includes("reject") && (
                        <Button
                            variant="danger"
                            disabled={submit.isPending || approve.isPending || reject.isPending || disburse.isPending}
                            onClick={() => setRejectOpen(true)}
                        >
                            Rejeter
                        </Button>
                    )}
                    {actions.includes("disburse") && !disbursed && (
                        <Button
                            loading={disburse.isPending}
                            disabled={submit.isPending || approve.isPending || reject.isPending || disburse.isPending}
                            onClick={() => {
                                setDisbursed(true);
                                run(disburse, undefined, "Prêt décaissé.");
                            }}
                        >
                            Décaisser
                        </Button>
                    )}
                </div>
            )}

            {loan.status === "DISBURSED" && canReschedule && (
                <Button variant="secondary" size="sm" onClick={() => setRescheduleOpen(true)}>
                    Réétaler les échéances
                </Button>
            )}

            {(loan.status === "DISBURSED" || loan.status === "CLOSED") && (
                <a href={`/api/backend/loans/${loanId}/passbook-pdf`}>
                    <Button variant="secondary" size="sm">
                        Télécharger l&apos;échéancier (PDF) <IconlyPaper color="CurrentColor" size={24}/>
                    </Button>
                </a>
            )}

            {(loan.status === "DISBURSED" || loan.status === "CLOSED") && (
                <LoanSchedule loan={loan} clientId={clientId} />
            )}

            <Modal open={rescheduleOpen} onClose={() => setRescheduleOpen(false)} title="Réétaler le prêt" variant="drawer">
                <RescheduleLoanForm
                    clientId={clientId}
                    loanId={loanId}
                    currentDurationMonths={loan.durationMonths}
                    onSuccess={() => {
                        setRescheduleOpen(false);
                        setNotice("Prêt réétalé.");
                    }}
                />
            </Modal>

            <Modal open={rejectOpen} onClose={() => setRejectOpen(false)} title="Motif du rejet">
                <div className="flex flex-col gap-4">
                    <Input
                        placeholder="Expliquez le motif du rejet"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        required
                    />
                    <div className="flex gap-2 justify-end">
                        <Button variant="secondary" onClick={() => setRejectOpen(false)}>
                            Annuler
                        </Button>
                        <Button variant="danger" loading={reject.isPending} onClick={handleReject}>
                            Confirmer le rejet
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

