"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/layout/sidebar";
import TopBar from "@/components/layout/TopBar";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { BarChart3, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";
import { inspectionsAPI, dashboardAPI } from "@/lib/api";

export default function AnalyticsPage() {
  const router = useRouter();
  const [inspections, setInspections] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("kefs_user");
    if (!stored) { router.push("/login"); return; }
    loadData();
  }, []);

  async function loadData() {
    try {
      const [insRes, statsRes] = await Promise.all([
        inspectionsAPI.getAll(),
        dashboardAPI.getStats(),
      ]);
      setInspections(insRes.inspections || []);
      setStats(statsRes);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  // Score chart data
  const scoreData = [
    { name: "Hygiene", score: inspections.length ? Number((inspections.reduce((s, i) => s + i.hygiene_score, 0) / inspections.length).toFixed(1)) : 0 },
    { name: "Handling", score: inspections.length ? Number((inspections.reduce((s, i) => s + i.handling_score, 0) / inspections.length).toFixed(1)) : 0 },
    { name: "Infra", score: inspections.length ? Number((inspections.reduce((s, i) => s + i.infra_score, 0) / inspections.length).toFixed(1)) : 0 },
    { name: "Transport", score: inspections.length ? Number((inspections.reduce((s, i) => s + i.transport_score, 0) / inspections.length).toFixed(1)) : 0 },
    { name: "Personnel", score: inspections.length ? Number((inspections.reduce((s, i) => s + i.personnel_score, 0) / inspections.length).toFixed(1)) : 0 },
    { name: "Records", score: inspections.length ? Number((inspections.reduce((s, i) => s + i.records_score, 0) / inspections.length).toFixed(1)) : 0 },
  ];

  // Risk pie data
  const riskData = [
    { name: "Low Risk", value: stats?.risk_breakdown?.low || 0, color: "#16a34a" },
    { name: "Medium Risk", value: stats?.risk_breakdown?.medium || 0, color: "#ea580c" },
    { name: "High Risk", value: stats?.risk_breakdown?.high || 0, color: "#dc2626" },
  ];

  // Cert pie data
  const certData = [
    { name: "Approved", value: stats?.certifications_breakdown?.approved || 0, color: "#16a34a" },
    { name: "Conditional", value: stats?.certifications_breakdown?.conditional || 0, color: "#ea580c" },
    { name: "Rejected", value: stats?.certifications_breakdown?.rejected || 0, color: "#dc2626" },
  ];

  const totalRisk = riskData.reduce((s, r) => s + r.value, 0);

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div className="main-layout">
        <TopBar title="Risk Analytics Dashboard" subtitle="Comprehensive risk analysis and inspection trends" />
        <div className="page-content fade-in">

          {/* Summary cards */}
          <div className="grid-4" style={{ marginBottom: "24px" }}>
            {[
              { label: "Low Risk Sites", value: stats?.risk_breakdown?.low ?? "—", icon: CheckCircle, color: "#16a34a", bg: "#dcfce7", sub: "Stations" },
              { label: "Medium Risk Sites", value: stats?.risk_breakdown?.medium ?? "—", icon: AlertTriangle, color: "#ea580c", bg: "#fff7ed", sub: "Stations" },
              { label: "High Risk Sites", value: stats?.risk_breakdown?.high ?? "—", icon: AlertTriangle, color: "#dc2626", bg: "#fef2f2", sub: "Stations" },
              { label: "Total Inspections", value: stats?.total_inspections ?? "—", icon: TrendingUp, color: "#0e7490", bg: "#e8f4fd", sub: "All time" },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <div className="stat-card" key={s.label}>
                  <div className="stat-icon" style={{ background: s.bg }}><Icon size={20} color={s.color} /></div>
                  <div className="stat-value" style={{ color: s.color }}>{loading ? "—" : s.value}</div>
                  <div className="stat-label">{s.label}</div>
                  <div style={{ fontSize: "12px", color: s.color, marginTop: "4px" }}>{s.sub}</div>
                </div>
              );
            })}
          </div>

          <div className="grid-2" style={{ marginBottom: "24px" }}>

            {/* Bar chart */}
            <div className="card">
              <div className="card-header">
                <div>
                  <div className="card-title">Average Compliance Scores</div>
                  <div className="card-subtitle">Per inspection category (out of 10)</div>
                </div>
                <BarChart3 size={18} color="#0e7490" />
              </div>
              <div className="card-body">
                {loading ? (
                  <div style={{ color: "#94a3b8", textAlign: "center", padding: "60px" }}>Loading chart...</div>
                ) : (
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={scoreData} margin={{ top: 4, right: 4, left: -20, bottom: 4 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#64748b" }} />
                      <YAxis domain={[0, 10]} tick={{ fontSize: 12, fill: "#64748b" }} />
                      <Tooltip
                        contentStyle={{ borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: "13px" }}
                        formatter={(v) => [`${v}/10`, "Avg Score"]}
                      />
                      <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                        {scoreData.map((_, i) => (
                          <Cell key={i} fill={["#0e7490", "#16a34a", "#7c3aed", "#ea580c", "#0891b2", "#dc2626"][i]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Risk pie */}
            <div className="card">
              <div className="card-header">
                <div>
                  <div className="card-title">Overall Risk Distribution</div>
                  <div className="card-subtitle">Based on {totalRisk} risk assessments</div>
                </div>
              </div>
              <div className="card-body">
                {loading ? (
                  <div style={{ color: "#94a3b8", textAlign: "center", padding: "60px" }}>Loading chart...</div>
                ) : totalRisk === 0 ? (
                  <div className="empty-state" style={{ padding: "40px" }}>
                    <BarChart3 size={32} />
                    <h3>No risk data yet</h3>
                    <p style={{ fontSize: "13px" }}>Create inspections to see risk distribution</p>
                  </div>
                ) : (
                  <>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={riskData}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={85}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {riskData.map((entry, i) => (
                            <Cell key={i} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{ borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: "13px" }}
                          formatter={(v, n) => [v, n]}
                        />
                        <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: "13px" }} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div style={{ display: "flex", justifyContent: "center", gap: "16px", marginTop: "8px" }}>
                      {riskData.map((r) => (
                        <div key={r.name} style={{ textAlign: "center" }}>
                          <div style={{ fontSize: "20px", fontWeight: 800, color: r.color }}>{r.value}</div>
                          <div style={{ fontSize: "11.5px", color: "#64748b" }}>{r.name}</div>
                          <div style={{ fontSize: "12px", fontWeight: 600, color: r.color }}>
                            {totalRisk > 0 ? Math.round((r.value / totalRisk) * 100) : 0}%
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Cert pie + temp analysis */}
          <div className="grid-2">
            <div className="card">
              <div className="card-header">
                <div className="card-title">Certification Outcomes</div>
                <div className="card-subtitle">Distribution of regulatory decisions</div>
              </div>
              <div className="card-body">
                {loading ? (
                  <div style={{ color: "#94a3b8", textAlign: "center", padding: "40px" }}>Loading...</div>
                ) : certData.reduce((s, c) => s + c.value, 0) === 0 ? (
                  <div className="empty-state" style={{ padding: "30px" }}>
                    <h3>No certifications yet</h3>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={certData} cx="50%" cy="50%" outerRadius={80} paddingAngle={3} dataKey="value">
                        {certData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: "13px" }} />
                      <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: "13px" }} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Key metrics */}
            <div className="card">
              <div className="card-header">
                <div className="card-title">Key Performance Indicators</div>
                <div className="card-subtitle">System-wide regulatory metrics</div>
              </div>
              <div className="card-body">
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  {[
                    {
                      label: "Ice Ratio Compliance Rate",
                      value: inspections.length ? `${Math.round((inspections.filter((i) => i.ice_ratio_ok).length / inspections.length) * 100)}%` : "—",
                      color: "#16a34a",
                      bg: "#dcfce7",
                    },
                    {
                      label: "Temp Records Availability",
                      value: inspections.length ? `${Math.round((inspections.filter((i) => i.temp_monitoring_records).length / inspections.length) * 100)}%` : "—",
                      color: "#0e7490",
                      bg: "#e8f4fd",
                    },
                    {
                      label: "Avg Boats Per Inspection",
                      value: inspections.length ? (inspections.reduce((s, i) => s + i.boats_operating, 0) / inspections.length).toFixed(1) : "—",
                      color: "#7c3aed",
                      bg: "#f5f3ff",
                    },
                    {
                      label: "Avg Past Violations (6m)",
                      value: inspections.length ? (inspections.reduce((s, i) => s + i.historical_noncompliance_6m, 0) / inspections.length).toFixed(1) : "—",
                      color: "#dc2626",
                      bg: "#fef2f2",
                    },
                    {
                      label: "Avg Days Between Inspections",
                      value: inspections.length ? Math.round(inspections.reduce((s, i) => s + i.days_since_last_inspection, 0) / inspections.length) : "—",
                      color: "#ea580c",
                      bg: "#fff7ed",
                    },
                  ].map((kpi) => (
                    <div key={kpi.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px", borderRadius: "10px", background: kpi.bg }}>
                      <span style={{ fontSize: "13px", fontWeight: 500, color: "#475569" }}>{kpi.label}</span>
                      <span style={{ fontSize: "18px", fontWeight: 800, color: kpi.color }}>{loading ? "—" : kpi.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}