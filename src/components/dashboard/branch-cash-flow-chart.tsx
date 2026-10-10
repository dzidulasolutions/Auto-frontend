"use client";

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import type { BranchSummaryDay } from "@/types/dashboard";

export default function BranchCashFlowChart({ data }: { data: BranchSummaryDay[] }) {
      const sorted = [...data].sort((a, b) => a.summary_date.localeCompare(b.summary_date));
      const chartData = sorted.map((d) => ({
            date: new Date(d.summary_date).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" }),
            Entrées: d.total_deposits + d.total_disbursements,
            Sorties: d.total_withdrawals + d.total_repayments,
      }));

      return (
            <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                              <defs>
                                    <linearGradient id="entrees" x1="0" y1="0" x2="0" y2="1">
                                          <stop offset="5%" stopColor="#000000" stopOpacity={0.15} />
                                          <stop offset="95%" stopColor="#000000" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="sorties" x1="0" y1="0" x2="0" y2="1">
                                          <stop offset="5%" stopColor="#9ca3af" stopOpacity={0.3} />
                                          <stop offset="95%" stopColor="#9ca3af" stopOpacity={0} />
                                    </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />
                              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#737373" }} axisLine={false} tickLine={false} />
                              <YAxis tick={{ fontSize: 11, fill: "#737373" }} axisLine={false} tickLine={false} width={50} />
                              <Tooltip
                                    contentStyle={{ borderRadius: 8, border: "1px solid #e5e5e5", fontSize: 12 }}
                                    formatter={(value) => `${Number(value).toLocaleString("fr-FR")} FCFA`}
                              />
                              <Area type="monotone" dataKey="Entrées" stroke="#000000" fill="url(#entrees)" strokeWidth={2} />
                              <Area type="monotone" dataKey="Sorties" stroke="#9ca3af" fill="url(#sorties)" strokeWidth={2} />
                        </AreaChart>
                  </ResponsiveContainer>
            </div>
      );
}