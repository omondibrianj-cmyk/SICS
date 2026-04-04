"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/layout/sidebar";
import TopBar from "@/components/layout/TopBar";
import Link from "next/link";
import {
  ArrowLeft, CheckCircle, AlertTriangle,
  Thermometer, Droplets, FileText,
  ClipboardList, Award
} from "lucide-react";
import { inspectionsAPI, stationsAPI } from "@/lib/api";

export default function NewInspectionPage() {
  const router = useRouter();
  const [stations, setStations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<any>(null);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1);
  const [user, setUser] = useState<any>(null);

  const [form, setForm] = useState({
    landing_station_id: "",
    inspector_id: "",
    inspection_date: new Date().toISOString().split("T")[0],
    reason_for_inspection: "Routine inspection",
    avg_temp_c: 5,
    ice_ratio_ok: true,
    temp_monitoring_records: true,
    infra_score: 5,
    handling_score: 5,
    transport_score: 5,
    hygiene_score: 5,
    personnel_score: 5,
    records_score: 5,
    boats_operating: 1,
    historical_noncompliance_6m: 0,
    days_since_last_inspection: 30,
  });

  useEffect(() => {
    const stored = localStorage.getItem("kefs_user");
    if (!stored) { router.push("/login"); return; }
    const u = JSON.parse(stored);
    setUser(u);
    setForm((f) => ({ ...f, inspector_id: String(u.id || "") }));
    loadStations();
  }, []);

  async function loadStations() {
    try {
      const res = await stationsAPI.getAll();
      setStations(res.landing_stations || []);
    } catch (e) {
      console.error(e);
    }
  }

  function update(key: string, value: any) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit() {
    setLoading(true);
    setError("");
    try {
      const payload = {
        ...form,
        landing_station_id: Number(form.landing_station_id),
        inspector_id: Number(form.inspector_id),
        avg_temp_c: Number(form.avg_temp_c),
        infra_score: Number(form.infra_score),
        handling_score: Number(form.handling_score),
        transport_score: Number(form.transport_score),
        hygiene_score: Number(form.hygiene_score),
        personnel_score: Number(form.personnel_score),
        records_score: Number(form.records_score),
        boats_operating: Number(form.boats_operating),
        historical_noncompliance_6m: Number(form.historical_noncompliance_6m),
        days_since_last_inspection: Number(form.days_since_last_inspection),
      };
      const res = await inspectionsAPI.create(payload);
      setSuccess(res);
    } catch (e: any) {
      setError(e.message || "Failed to create inspection");
    } finally {
      setLoading(false);
    }
  }

  function getRiskColor(level: string) {
    if (level === "High") return "#dc2626";
    if (level === "Medium") return "#ea580c";
    return "#16a34a";
  }

  function getRiskBg(level: string) {
    if (level === "High") return "#fef2f2";
    if (level === "Medium") return "#fff7ed";
    return "#dcfce7";
  }

  // Score slider component
  function ScoreSlider({ label, field, color }: { label: string; field: string; color: string }) {
    const val = Number((form as any)[field]);
    return (
      <div style={{ marginBottom: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
          <label className="form-label" style={{ margin: 0 }}>{label}</label>
          <span style={{ fontSize: "15px", fontWeight: 800, color }}>{val}/10</span>
        </div>
        <input
          type="range"
          min={0} max={10} step={0.5}
          value={val}
          onChange={(e) => update(field, e.target.value)}
          className="score-slider"
          style={{ accentColor: color }}
        />
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#94a3b8", marginTop: "4px" }}>
          <span>0 — Poor</span>
          <span>10 — Excellent</span>
        </div>
      </div>
    );
  }

  // Success screen
  if (success) {
    const risk = success.risk_assessment;
    const level = risk.risk_level;
    return (
      <div style={{ display: "flex" }}>
        <Sidebar />
        <div className="main-layout">
          <TopBar title="Inspection Created" subtitle="Risk assessment complete" />
          <div className="page-content fade-in">
            <div style={{ maxWidth: "600px", margin: "0 auto" }}>
              <div className="card">
                <div className="card-body" style={{ textAlign: "center", padding: "40px" }}>
                  <div style={{ width: "72px", height: "72px", borderRadius: "50%", background: getRiskBg(level), display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", border: `3px solid ${getRiskColor(level)}` }}>
                    {level === "High" ? <AlertTriangle size={32} color={getRiskColor(level)} /> : <CheckCircle size={32} color={getRiskColor(level)} />}
                  </div>
                  <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#1e293b", marginBottom: "8px" }}>
                    Inspection Recorded Successfully
                  </h2>
                  <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "28px" }}>
                    Inspection ID: <strong style={{ color: "#0e7490" }}>INS-{String(success.inspection_id).padStart(4, "0")}</strong>
                  </p>

                  {/* Risk result */}
                  <div style={{ background: getRiskBg(level), borderRadius: "16px", padding: "24px", border: `1px solid ${getRiskColor(level)}30`, marginBottom: "24px" }}>
                    <div style={{ fontSize: "13px", color: "#64748b", marginBottom: "8px" }}>Final Risk Score</div>
                    <div style={{ fontSize: "48px", fontWeight: 900, color: getRiskColor(level), lineHeight: 1 }}>
                      {risk.final_risk_score?.toFixed(1)}
                    </div>
                    <div style={{ fontSize: "13px", color: "#64748b", margin: "8px 0 12px" }}>out of 100</div>
                    <span style={{ display: "inline-block", padding: "6px 18px", borderRadius: "20px", background: getRiskColor(level), color: "white", fontSize: "14px", fontWeight: 700 }}>
                      {level} Risk
                    </span>
                  </div>

                  {/* Breakdown */}
                  <div style={{ display: "flex", gap: "12px", marginBottom: "28px" }}>
                    {[
                      { label: "Rule-Based Score", value: risk.rule_based_score?.toFixed(1), color: "#0e7490" },
                      { label: "ML Probability", value: `${(risk.ml_probability * 100).toFixed(0)}%`, color: "#7c3aed" },
                    ].map((r) => (
                      <div key={r.label} style={{ flex: 1, padding: "14px", background: "#f8fafc", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                        <div style={{ fontSize: "11.5px", color: "#64748b", marginBottom: "4px" }}>{r.label}</div>
                        <div style={{ fontSize: "20px", fontWeight: 800, color: r.color }}>{r.value}</div>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: "flex", gap: "12px" }}>
                    <Link href="/inspections" className="btn btn-secondary" style={{ flex: 1, justifyContent: "center" }}>
                      <ClipboardList size={15} /> View All
                    </Link>
                    <Link href="/certifications" className="btn btn-primary" style={{ flex: 1, justifyContent: "center" }}>
                      <Award size={15} /> Issue Certificate
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div className="main-layout">
        <TopBar
          title="New Inspection"
          subtitle="Record a new fish landing site inspection"
          action={
            <Link href="/inspections" className="btn btn-secondary btn-sm">
              <ArrowLeft size={14} /> Cancel
            </Link>
          }
        />
        <div className="page-content fade-in">

          {/* Step indicator */}
          <div style={{ display: "flex", gap: "8px", marginBottom: "28px" }}>
            {[
              { n: 1, label: "Station Details" },
              { n: 2, label: "Operational Data" },
              { n: 3, label: "Compliance Scores" },
            ].map((s) => (
              <div
                key={s.n}
                onClick={() => setStep(s.n)}
                style={{
                  display: "flex", alignItems: "center", gap: "8px",
                  padding: "10px 18px", borderRadius: "10px", cursor: "pointer",
                  background: step === s.n ? "#0e7490" : step > s.n ? "#dcfce7" : "white",
                  border: `1px solid ${step === s.n ? "#0e7490" : step > s.n ? "#16a34a" : "#e2e8f0"}`,
                  transition: "all 0.2s",
                }}
              >
                <div style={{
                  width: "22px", height: "22px", borderRadius: "50%",
                  background: step === s.n ? "rgba(255,255,255,0.2)" : step > s.n ? "#16a34a" : "#f1f5f9",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "11px", fontWeight: 700,
                  color: step === s.n ? "white" : step > s.n ? "white" : "#94a3b8",
                }}>
                  {step > s.n ? "✓" : s.n}
                </div>
                <span style={{
                  fontSize: "13px", fontWeight: 600,
                  color: step === s.n ? "white" : step > s.n ? "#16a34a" : "#64748b",
                }}>
                  {s.label}
                </span>
              </div>
            ))}
          </div>

          {error && (
            <div className="alert alert-error" style={{ marginBottom: "20px" }}>
              <AlertTriangle size={15} /> {error}
            </div>
          )}

          <div style={{ maxWidth: "760px" }}>

            {/* Step 1 — Station Details */}
            {step === 1 && (
              <div className="card fade-in">
                <div className="card-header">
                  <div className="card-title">Landing Station Information</div>
                  <div className="card-subtitle">Select the station and inspection details</div>
                </div>
                <div className="card-body">
                  <div className="grid-2">
                    <div className="form-group">
                      <label className="form-label">Landing Station *</label>
                      <select
                        className="form-select"
                        value={form.landing_station_id}
                        onChange={(e) => update("landing_station_id", e.target.value)}
                      >
                        <option value="">Select station...</option>
                        {stations.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.landing_station_name} — {s.county}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Inspector ID *</label>
                      <input
                        className="form-input"
                        type="number"
                        value={form.inspector_id}
                        onChange={(e) => update("inspector_id", e.target.value)}
                        placeholder="Inspector ID"
                      />
                      <p className="form-hint">Auto-filled from your account</p>
                    </div>
                  </div>
                  <div className="grid-2">
                    <div className="form-group">
                      <label className="form-label">Inspection Date *</label>
                      <input
                        className="form-input"
                        type="date"
                        value={form.inspection_date}
                        onChange={(e) => update("inspection_date", e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Reason for Inspection *</label>
                      <select
                        className="form-select"
                        value={form.reason_for_inspection}
                        onChange={(e) => update("reason_for_inspection", e.target.value)}
                      >
                        <option value="Routine inspection">Routine inspection</option>
                        <option value="Spot check">Spot check</option>
                        <option value="Follow-up inspection">Follow-up inspection</option>
                        <option value="Complaint-based inspection">Complaint-based</option>
                        <option value="Pre-export inspection">Pre-export inspection</option>
                        <option value="Verification inspection">Verification inspection</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid-2">
                    <div className="form-group">
                      <label className="form-label">Days Since Last Inspection</label>
                      <input
                        className="form-input"
                        type="number"
                        min={0}
                        value={form.days_since_last_inspection}
                        onChange={(e) => update("days_since_last_inspection", e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Past Violations (last 6 months)</label>
                      <input
                        className="form-input"
                        type="number"
                        min={0}
                        value={form.historical_noncompliance_6m}
                        onChange={(e) => update("historical_noncompliance_6m", e.target.value)}
                      />
                    </div>
                  </div>
                  <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "8px" }}>
                    <button
                      className="btn btn-primary"
                      onClick={() => {
                        if (!form.landing_station_id) { setError("Please select a landing station"); return; }
                        if (!form.inspector_id) { setError("Inspector ID is required"); return; }
                        setError(""); setStep(2);
                      }}
                    >
                      Next: Operational Data →
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2 — Operational Data */}
            {step === 2 && (
              <div className="card fade-in">
                <div className="card-header">
                  <div className="card-title">Operational Data</div>
                  <div className="card-subtitle">Temperature, ice ratio and operational details</div>
                </div>
                <div className="card-body">
                  <div className="grid-2">
                    <div className="form-group">
                      <label className="form-label">
                        <Thermometer size={14} style={{ display: "inline", marginRight: "6px" }} />
                        Average Fish Temperature (°C)
                      </label>
                      <input
                        className="form-input"
                        type="number"
                        step="0.1"
                        value={form.avg_temp_c}
                        onChange={(e) => update("avg_temp_c", e.target.value)}
                      />
                      <p className="form-hint">Safe range: 0–10°C</p>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Number of Boats Operating</label>
                      <input
                        className="form-input"
                        type="number"
                        min={0}
                        value={form.boats_operating}
                        onChange={(e) => update("boats_operating", e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Toggles */}
                  {[
                    {
                      label: "Ice to Fish Ratio Adequate",
                      field: "ice_ratio_ok",
                      icon: Droplets,
                      hint: "Is the ice-to-fish ratio sufficient for safe storage?",
                    },
                    {
                      label: "Temperature Monitoring Records Available",
                      field: "temp_monitoring_records",
                      icon: FileText,
                      hint: "Are temperature monitoring records present and up to date?",
                    },
                  ].map((t) => {
                    const Icon = t.icon;
                    const val = (form as any)[t.field];
                    return (
                      <div
                        key={t.field}
                        style={{
                          display: "flex", alignItems: "center", justifyContent: "space-between",
                          padding: "16px 18px", borderRadius: "12px",
                          background: val ? "#f0fdf4" : "#fef2f2",
                          border: `1px solid ${val ? "#bbf7d0" : "#fecaca"}`,
                          marginBottom: "14px",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <Icon size={18} color={val ? "#16a34a" : "#dc2626"} />
                          <div>
                            <div style={{ fontSize: "13.5px", fontWeight: 600, color: "#1e293b" }}>{t.label}</div>
                            <div style={{ fontSize: "12px", color: "#64748b" }}>{t.hint}</div>
                          </div>
                        </div>
                        <label className="toggle">
                          <input
                            type="checkbox"
                            checked={val}
                            onChange={(e) => update(t.field, e.target.checked)}
                          />
                          <span className="toggle-slider" />
                        </label>
                      </div>
                    );
                  })}

                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px" }}>
                    <button className="btn btn-secondary" onClick={() => setStep(1)}>← Back</button>
                    <button className="btn btn-primary" onClick={() => setStep(3)}>Next: Compliance Scores →</button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3 — Compliance Scores */}
            {step === 3 && (
              <div className="card fade-in">
                <div className="card-header">
                  <div className="card-title">Compliance Scores</div>
                  <div className="card-subtitle">Rate each category from 0 (poor) to 10 (excellent)</div>
                </div>
                <div className="card-body">
                  <ScoreSlider label="Hygiene Compliance (Weight: 25%)" field="hygiene_score" color="#0e7490" />
                  <ScoreSlider label="Fish Handling Practices (Weight: 20%)" field="handling_score" color="#16a34a" />
                  <ScoreSlider label="Infrastructure Condition (Weight: 15%)" field="infra_score" color="#7c3aed" />
                  <ScoreSlider label="Transport Conditions (Weight: 10%)" field="transport_score" color="#ea580c" />
                  <ScoreSlider label="Personnel Hygiene (Weight: 10%)" field="personnel_score" color="#0891b2" />
                  <ScoreSlider label="Documentation & Records (Weight: 10%)" field="records_score" color="#dc2626" />

                  {/* Preview */}
                  <div style={{ background: "#f8fafc", borderRadius: "12px", padding: "16px", border: "1px solid #e2e8f0", marginTop: "8px", marginBottom: "20px" }}>
                    <div style={{ fontSize: "12px", fontWeight: 700, color: "#64748b", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Score Preview</div>
                    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                      {[
                        { label: "Hygiene", val: form.hygiene_score, w: 0.25 },
                        { label: "Handling", val: form.handling_score, w: 0.20 },
                        { label: "Infra", val: form.infra_score, w: 0.15 },
                        { label: "Transport", val: form.transport_score, w: 0.10 },
                        { label: "Personnel", val: form.personnel_score, w: 0.10 },
                        { label: "Records", val: form.records_score, w: 0.10 },
                      ].map((s) => (
                        <div key={s.label} style={{ flex: 1, minWidth: "80px", textAlign: "center", padding: "8px", background: "white", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                          <div style={{ fontSize: "11px", color: "#94a3b8" }}>{s.label}</div>
                          <div style={{ fontSize: "16px", fontWeight: 800, color: "#1e293b" }}>{Number(s.val).toFixed(1)}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <button className="btn btn-secondary" onClick={() => setStep(2)}>← Back</button>
                    <button
                      className="btn btn-primary"
                      onClick={handleSubmit}
                      disabled={loading}
                      style={{ minWidth: "180px", justifyContent: "center" }}
                    >
                      {loading ? (
                        <><div className="loading-spinner" /> Calculating Risk...</>
                      ) : (
                        "Submit & Calculate Risk →"
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}