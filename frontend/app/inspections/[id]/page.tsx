"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Sidebar from "@/components/layout/sidebar";
import TopBar from "@/components/layout/TopBar";
import Link from "next/link";
import {
  ArrowLeft, Award, Thermometer,
  Droplets, FileText, AlertTriangle,
  CheckCircle, Clock
} from "lucide-react";
import { inspectionsAPI } from "@/lib/api";

export default function InspectionDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("kefs_user");
    if (!stored) { router.push("/login"); return; }
    loadData();
  }, []);

  async function loadData() {
    try {
      const res = await inspectionsAPI.getOne(Number(params.id));
      setData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const risk = data?.risk_assessment;
  const ins = data?.inspection;

  function getRiskClass(level: string) {
    if (level === "High") return "risk-circle risk-circle-high";
    if (level === "Medium") return "risk-circle risk-circle-medium";
    return "risk-circle risk-circle-low";
  }

  function getBadgeClass(level: string) {
    if (level === "High") return "badge badge-high";
    if (level === "Medium") return "badge badge-medium";
    return "badge badge-low";
  }

  const scores = ins ? [
    { label: "Hygiene", value: ins.hygiene_score, color: "#0e7490" },
    { label: "Handling", value: ins.handling_score, color: "#16a34a" },
    { label: "Infrastructure", value: ins.infra_score, color: "#7c3aed" },
    { label: "Transport", value: ins.transport_score, color: "#ea580c" },
    { label: "Personnel", value: ins.personnel_score, color: "#0891b2" },
    { label: "Records", value: ins.records_score, color: "#dc2626" },
  ] : [];

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div className="main-layout">
        <TopBar
          title={`Inspection INS-${String(params.id).padStart(4, "0")}`}
          subtitle="Detailed inspection record and risk assessment"
          action={
            <Link href="/inspections" className="btn btn-secondary btn-sm">
              <ArrowLeft size={14} /> Back
            </Link>
          }
        />
        <div className="page-content fade-in">
          {loading ? (
            <div style={{ textAlign: "center", padding: "80px", color: "#94a3b8" }}>
              Loading inspection...
            </div>
          ) : !ins ? (
            <div className="empty-state">
              <AlertTriangle size={40} />
              <h3>Inspection not found</h3>
            </div>
          ) : (
            <>
              {/* Top row */}
              <div className="grid-2" style={{ marginBottom: "24px" }}>

                {/* Inspection summary */}
                <div className="card">
                  <div className="card-header">
                    <div className="card-title">Inspection Summary</div>
                  </div>
                  <div className="card-body">
                    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                      {[
                        { label: "Station ID", value: `Station #${ins.landing_station_id}` },
                        { label: "Inspector ID", value: `Inspector #${ins.inspector_id}` },
                        { label: "Date", value: ins.inspection_date },
                        { label: "Reason", value: ins.reason_for_inspection },
                        { label: "Boats Operating", value: ins.boats_operating },
                        { label: "Days Since Last Inspection", value: ins.days_since_last_inspection },
                        { label: "Past Violations (6m)", value: ins.historical_noncompliance_6m },
                      ].map((item) => (
                        <div key={item.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #f1f5f9", paddingBottom: "10px" }}>
                          <span style={{ fontSize: "13px", color: "#64748b", fontWeight: 500 }}>{item.label}</span>
                          <span style={{ fontSize: "13.5px", fontWeight: 600, color: "#1e293b" }}>{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Risk Assessment */}
                <div className="card">
                  <div className="card-header">
                    <div className="card-title">Risk Assessment</div>
                  </div>
                  <div className="card-body">
                    {!risk ? (
                      <div style={{ color: "#94a3b8", fontSize: "13px" }}>No risk assessment available</div>
                    ) : (
                      <>
                        <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "24px" }}>
                          <div className={getRiskClass(risk.final_risk_level)}>
                            <span>{risk.final_risk_score?.toFixed(1)}</span>
                            <span style={{ fontSize: "10px", fontWeight: 500 }}>/ 100</span>
                          </div>
                          <div>
                            <span className={getBadgeClass(risk.final_risk_level)} style={{ fontSize: "14px", padding: "6px 14px" }}>
                              {risk.final_risk_level} Risk
                            </span>
                            <p style={{ fontSize: "12px", color: "#64748b", marginTop: "8px" }}>
                              Based on regulatory (70%) + ML (30%) scoring
                            </p>
                          </div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                          {[
                            { label: "Regulatory Risk Score", value: risk.regulatory_risk_score?.toFixed(2), color: "#0e7490" },
                            { label: "ML Risk Probability", value: `${(risk.ml_risk_probability * 100).toFixed(0)}%`, color: "#7c3aed" },
                            { label: "Final Hybrid Score", value: risk.final_risk_score?.toFixed(2), color: "#1e293b" },
                          ].map((r) => (
                            <div key={r.label} style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", background: "#f8fafc", borderRadius: "8px" }}>
                              <span style={{ fontSize: "13px", color: "#64748b" }}>{r.label}</span>
                              <span style={{ fontSize: "14px", fontWeight: 700, color: r.color }}>{r.value}</span>
                            </div>
                          ))}
                        </div>
                        <div style={{ marginTop: "20px" }}>
                          <Link href="/certifications" className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }}>
                            <Award size={15} /> Issue Certification
                          </Link>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Compliance Scores */}
              <div className="card" style={{ marginBottom: "24px" }}>
                <div className="card-header">
                  <div className="card-title">Compliance Scores</div>
                  <div className="card-subtitle">All scores out of 10</div>
                </div>
                <div className="card-body">
                  <div className="grid-3" style={{ gap: "16px" }}>
                    {scores.map((s) => (
                      <div key={s.label} style={{ padding: "16px", background: "#f8fafc", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                          <span style={{ fontSize: "13px", fontWeight: 600, color: "#475569" }}>{s.label}</span>
                          <span style={{ fontSize: "15px", fontWeight: 800, color: s.color }}>{s.value}/10</span>
                        </div>
                        <div className="progress-bar">
                          <div className="progress-fill" style={{ width: `${(s.value / 10) * 100}%`, background: s.color }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Temperature & Operational */}
              <div className="grid-3">
                {[
                  {
                    label: "Avg Temperature",
                    value: `${ins.avg_temp_c}°C`,
                    icon: Thermometer,
                    ok: ins.avg_temp_c <= 10,
                    note: ins.avg_temp_c <= 10 ? "Within safe range" : "Above safe threshold",
                    color: ins.avg_temp_c <= 10 ? "#16a34a" : "#dc2626",
                    bg: ins.avg_temp_c <= 10 ? "#dcfce7" : "#fef2f2",
                  },
                  {
                    label: "Ice Ratio",
                    value: ins.ice_ratio_ok ? "Adequate" : "Inadequate",
                    icon: Droplets,
                    ok: ins.ice_ratio_ok,
                    note: ins.ice_ratio_ok ? "Fish properly iced" : "Insufficient ice coverage",
                    color: ins.ice_ratio_ok ? "#16a34a" : "#dc2626",
                    bg: ins.ice_ratio_ok ? "#dcfce7" : "#fef2f2",
                  },
                  {
                    label: "Temp Monitoring Records",
                    value: ins.temp_monitoring_records ? "Available" : "Missing",
                    icon: FileText,
                    ok: ins.temp_monitoring_records,
                    note: ins.temp_monitoring_records ? "Records on file" : "No records found",
                    color: ins.temp_monitoring_records ? "#16a34a" : "#ea580c",
                    bg: ins.temp_monitoring_records ? "#dcfce7" : "#fff7ed",
                  },
                ].map((item) => {
                  const Icon = item.icon;
                  const StatusIcon = item.ok ? CheckCircle : AlertTriangle;
                  return (
                    <div className="card" key={item.label}>
                      <div className="card-body" style={{ textAlign: "center" }}>
                        <div style={{ width: "52px", height: "52px", borderRadius: "14px", background: item.bg, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                          <Icon size={22} color={item.color} />
                        </div>
                        <div style={{ fontSize: "13px", color: "#64748b", marginBottom: "6px" }}>{item.label}</div>
                        <div style={{ fontSize: "20px", fontWeight: 800, color: item.color, marginBottom: "6px" }}>{item.value}</div>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}>
                          <StatusIcon size={13} color={item.color} />
                          <span style={{ fontSize: "12px", color: item.color }}>{item.note}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}