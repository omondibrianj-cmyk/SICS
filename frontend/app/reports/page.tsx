"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/layout/sidebar";
import TopBar from "@/components/layout/TopBar";
import { FileText, BarChart2, TrendingUp, AlertTriangle } from "lucide-react";
import { inspectionsAPI } from "@/lib/api";

export default function ReportsPage() {
  const router = useRouter();
  const [inspections, setInspections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("kefs_user");
    if (!stored) { router.push("/login"); return; }
    loadData();
  }, []);

  async function loadData() {
    try {
      const res = await inspectionsAPI.getAll();
      setInspections(res.inspections || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  const total = inspections.length;
  const avgHygiene = total ? (inspections.reduce((s, i) => s + i.hygiene_score, 0) / total).toFixed(1) : "—";
  const avgHandling = total ? (inspections.reduce((s, i) => s + i.handling_score, 0) / total).toFixed(1) : "—";
  const avgInfra = total ? (inspections.reduce((s, i) => s + i.infra_score, 0) / total).toFixed(1) : "—";
  const avgTransport = total ? (inspections.reduce((s, i) => s + i.transport_score, 0) / total).toFixed(1) : "—";
  const avgPersonnel = total ? (inspections.reduce((s, i) => s + i.personnel_score, 0) / total).toFixed(1) : "—";
  const avgRecords = total ? (inspections.reduce((s, i) => s + i.records_score, 0) / total).toFixed(1) : "—";
  const avgTemp = total ? (inspections.reduce((s, i) => s + i.avg_temp_c, 0) / total).toFixed(1) : "—";
  const iceOkPct = total ? Math.round((inspections.filter((i) => i.ice_ratio_ok).length / total) * 100) : 0;
  const tempRecordsPct = total ? Math.round((inspections.filter((i) => i.temp_monitoring_records).length / total) * 100) : 0;

  const scores = [
    { label: "Hygiene Compliance", value: Number(avgHygiene), color: "#0e7490", weight: "25%" },
    { label: "Fish Handling Practices", value: Number(avgHandling), color: "#16a34a", weight: "20%" },
    { label: "Infrastructure Condition", value: Number(avgInfra), color: "#7c3aed", weight: "15%" },
    { label: "Transport Conditions", value: Number(avgTransport), color: "#ea580c", weight: "10%" },
    { label: "Personnel Hygiene", value: Number(avgPersonnel), color: "#0891b2", weight: "10%" },
    { label: "Documentation & Records", value: Number(avgRecords), color: "#dc2626", weight: "10%" },
  ];

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div className="main-layout">
        <TopBar title="Inspection Reports" subtitle="Comprehensive analytics and insights from all inspections" />
        <div className="page-content fade-in">

          {/* Top stats */}
          <div className="grid-3" style={{ marginBottom: "24px" }}>
            {[
              { label: "Total Inspections", value: total, icon: FileText, color: "#0e7490", bg: "#e8f4fd", sub: "All time records" },
              { label: "Avg Temperature", value: `${avgTemp}°C`, icon: TrendingUp, color: "#ea580c", bg: "#fff7ed", sub: "Average across sites" },
              { label: "Ice Ratio Compliance", value: `${iceOkPct}%`, icon: BarChart2, color: "#16a34a", bg: "#dcfce7", sub: "Sites with adequate ice" },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <div className="stat-card" key={s.label}>
                  <div className="stat-icon" style={{ background: s.bg }}><Icon size={20} color={s.color} /></div>
                  <div className="stat-value" style={{ color: s.color }}>{loading ? "—" : s.value}</div>
                  <div className="stat-label">{s.label}</div>
                  <div className="stat-change" style={{ color: s.color }}>{s.sub}</div>
                </div>
              );
            })}
          </div>

          <div className="grid-2" style={{ marginBottom: "24px" }}>
            {/* Average Compliance Scores */}
            <div className="card">
              <div className="card-header">
                <div>
                  <div className="card-title">Average Compliance Findings</div>
                  <div className="card-subtitle">Average scores across all inspections (out of 10)</div>
                </div>
              </div>
              <div className="card-body">
                {loading ? (
                  <div style={{ color: "#94a3b8" }}>Loading...</div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                    {scores.map((s) => (
                      <div key={s.label}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                          <div>
                            <span style={{ fontSize: "13px", fontWeight: 600, color: "#475569" }}>{s.label}</span>
                            <span style={{ fontSize: "11px", color: "#94a3b8", marginLeft: "8px" }}>Weight: {s.weight}</span>
                          </div>
                          <span style={{ fontSize: "14px", fontWeight: 800, color: s.color }}>{isNaN(s.value) ? "—" : s.value}/10</span>
                        </div>
                        <div className="progress-bar">
                          <div
                            className="progress-fill"
                            style={{
                              width: `${isNaN(s.value) ? 0 : (s.value / 10) * 100}%`,
                              background: s.color,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Operational Summary */}
            <div className="card">
              <div className="card-header">
                <div className="card-title">Operational Summary</div>
                <div className="card-subtitle">Key compliance indicators</div>
              </div>
              <div className="card-body">
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  {[
                    {
                      label: "Ice Ratio Adequate",
                      value: iceOkPct,
                      color: iceOkPct >= 70 ? "#16a34a" : "#dc2626",
                      bg: iceOkPct >= 70 ? "#dcfce7" : "#fef2f2",
                    },
                    {
                      label: "Temp Records Available",
                      value: tempRecordsPct,
                      color: tempRecordsPct >= 70 ? "#16a34a" : "#ea580c",
                      bg: tempRecordsPct >= 70 ? "#dcfce7" : "#fff7ed",
                    },
                    {
                      label: "Safe Temperature Range",
                      value: total ? Math.round((inspections.filter((i) => i.avg_temp_c <= 10).length / total) * 100) : 0,
                      color: "#0e7490",
                      bg: "#e8f4fd",
                    },
                  ].map((r) => (
                    <div key={r.label} style={{ padding: "14px 16px", borderRadius: "10px", background: r.bg }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                        <span style={{ fontSize: "13px", fontWeight: 600, color: "#475569" }}>{r.label}</span>
                        <span style={{ fontSize: "16px", fontWeight: 800, color: r.color }}>{loading ? "—" : `${r.value}%`}</span>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${r.value}%`, background: r.color }} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Temperature alert */}
                {!loading && Number(avgTemp) > 10 && (
                  <div className="alert alert-error" style={{ marginTop: "16px" }}>
                    <AlertTriangle size={15} />
                    Average temperature exceeds safe threshold of 10°C
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Inspection table summary */}
          <div className="card">
            <div className="card-header" style={{ paddingBottom: "16px" }}>
              <div>
                <div className="card-title">Inspection Records Summary</div>
                <div className="card-subtitle">All inspection data with compliance breakdown</div>
              </div>
            </div>
            <div className="table-wrap">
              {loading ? (
                <div style={{ padding: "40px", textAlign: "center", color: "#94a3b8" }}>Loading...</div>
              ) : inspections.length === 0 ? (
                <div className="empty-state">
                  <FileText size={40} />
                  <h3>No inspection data</h3>
                </div>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Date</th>
                      <th>Hygiene</th>
                      <th>Handling</th>
                      <th>Infra</th>
                      <th>Transport</th>
                      <th>Personnel</th>
                      <th>Records</th>
                      <th>Avg Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inspections.map((ins) => {
                      const avg = ((ins.hygiene_score + ins.handling_score + ins.infra_score + ins.transport_score + ins.personnel_score + ins.records_score) / 6).toFixed(1);
                      const avgNum = Number(avg);
                      return (
                        <tr key={ins.id}>
                          <td><span style={{ fontWeight: 700, color: "#0e7490" }}>INS-{String(ins.id).padStart(4, "0")}</span></td>
                          <td style={{ color: "#64748b" }}>{ins.inspection_date}</td>
                          {[ins.hygiene_score, ins.handling_score, ins.infra_score, ins.transport_score, ins.personnel_score, ins.records_score].map((s, idx) => (
                            <td key={idx} style={{ fontWeight: 600, color: s >= 7 ? "#16a34a" : s >= 4 ? "#ea580c" : "#dc2626" }}>{s}</td>
                          ))}
                          <td>
                            <span style={{ fontWeight: 800, fontSize: "14px", color: avgNum >= 7 ? "#16a34a" : avgNum >= 4 ? "#ea580c" : "#dc2626" }}>
                              {avg}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}