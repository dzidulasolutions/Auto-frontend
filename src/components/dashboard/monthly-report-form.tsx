"use client";

import { useState } from "react";
import Alert from "@/components/ui/alert";
import Button from "@/components/ui/button";
import Select from "@/components/ui/select";
import { useBranches } from "@/hooks/use-branches";
import { useCurrentRole } from "@/hooks/use-current-role";
import { useRequestReport, useReportStatus } from "@/hooks/use-reports";
import { getErrorMessage } from "@/lib/api/errors";
import SectionTitle from "@/components/ui/section-title";
import {  IconlyDocument } from "@/components/ui/icons";

const MONTHS = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

export default function MonthlyReportForm() {
  const { role } = useCurrentRole();
  const { data: branches } = useBranches(role);

  const now = new Date();
  const [branchId, setBranchId] = useState("");
  const [month, setMonth] = useState(String(now.getMonth() + 1));
  const [year, setYear] = useState(String(now.getFullYear()));
  const [reportId, setReportId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const { mutate, isPending, error, reset } = useRequestReport();
  const { data: report } = useReportStatus(reportId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    reset();
    setFormError(null);

    if (!branchId) {
      setFormError("Choisissez une agence.");
      return;
    }

    mutate(
      { branchId, month: Number(month), year: Number(year) },
      { onSuccess: (result) => setReportId(result.id) },
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <SectionTitle icon={IconlyDocument} color="#9333ea">Rapport mensuel</SectionTitle>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <Select placeholder="Choisir une agence" value={branchId} onChange={(e) => setBranchId(e.target.value)}>
          {branches?.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name} — {b.city}
            </option>
          ))}
        </Select>

        <div className="flex gap-2">
          <Select placeholder="Mois" value={month} onChange={(e) => setMonth(e.target.value)} className="flex-1">
            {MONTHS.map((label, i) => (
              <option key={i} value={i + 1}>
                {label}
              </option>
            ))}
          </Select>
          <Select placeholder="Année" value={year} onChange={(e) => setYear(e.target.value)} className="w-32">
            {[now.getFullYear(), now.getFullYear() - 1].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </Select>
        </div>

        {formError && <p className="text-small text-error">{formError}</p>}
        {error && <Alert type="error" message={getErrorMessage(error)} onClose={reset} />}

        <Button type="submit" loading={isPending}>
          Générer le rapport
        </Button>
      </form>

      {report && (
        <div className="bg-white p-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-body font-medium">
              {MONTHS[report.month - 1]} {report.year}
            </p>
            <p className="text-caption text-muted">
              {report.status === "PENDING" && "Génération en cours..."}
              {report.status === "READY" && "Rapport prêt"}
              {report.status === "FAILED" && "Échec de la génération"}
            </p>
          </div>
          {report.status === "READY" && report.fileUrl && (

            <a href={`/api/download?url=${encodeURIComponent(report.fileUrl)}&filename=${encodeURIComponent(
              `rapport-${MONTHS[report.month - 1]}-${report.year}.pdf`,
            )}`}
            >
              <Button size="sm" variant="secondary">
                Télécharger
              </Button>
            </a>
          )}
        </div>
      )}
    </div>
  );
}