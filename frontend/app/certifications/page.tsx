"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/layout/sidebar";
import TopBar from "@/components/layout/TopBar";
import { Award, Plus, Download, CheckCircle, Clock, AlertTriangle, Search } from "lucide-react";
import { certificationsAPI, inspectionsAPI } from "@/lib/api";

export default function CertificationsPage() {
  const router = useRouter();
  const [certs, setCerts] = useState<any[]>([]);
  const [inspections, setInspections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [user, setUser] = useState<any>(null);

  const [form, setForm] = useState({
    inspection_id: "",
    certificate_decision: "Approve",
    remarks: "",
    issued_by: "",
    issued_date: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    const stored = localStorage.getItem("kefs_user");
    if (!stored) { router.push("/login"); return; }
    const u = JSON.parse(stored);
    setUser(u);
    setForm((f) => ({ ...f, issued_by: String(u.id || "1") }));
    loadData();
  }, []);

  async function loadData() {
    try {
      const [certsRes, insRes] = await Promise.all([
        certificationsAPI.getAll(),
        inspectionsAPI.getAll(),
      ]);
      setCerts(certsRes.certifications || []);
      setInspections(insRes.inspections || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  async function handleSubmit() {
    if (!form.inspection_id) { setError("Please select an inspection"); return; }
    if (!form.remarks) { setError("Remarks are required"); return; }
    setSubmitting(true);
    setError("");
    try {
      await certificationsAPI.create({
        inspection_id: Number(form.inspection_id),
        certificate_decision: form.certificate_decision,
        remarks: form.remarks,
        issued_by: Number(form.issued_by),
        issued_date: form.issued_date,
      });
      setSuccess("Certification created successfully!");
      setShowForm(false);
      setForm((f) => ({ ...f, inspection_id: "", remarks: "" }));
      loadData();
      setTimeout(() => setSuccess(""), 4000);
    } catch (e: any) {
      setError(e.message || "Failed to create certification");
    } finally { setSubmitting(false); }
  }

  const filtered = certs.filter((c) =>
    String(c.inspection_id).includes(search) ||
    c.certificate_decision?.toLowerCase().includes(search.toLowerCase())
  );

  function getDecisionIcon(d: string) {
    if (d === "Approve") return <CheckCircle size={15} color="#16a34a" />;
    if (d === "Conditional") return <Clock size={15} color="#ea580c" />;
    return <AlertTriangle size={15} color="#dc2626" />;
  }

  function getDecisionBadge(d: string) {
    if (d === "Approve") return "badge badge-approved";
    if (d === "Conditional") return "badge badge-conditional";
    return "badge badge-rejected";
  }

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div className="main-layout">
        <TopBar
          title="Certifications"
          subtitle="Issue and manage inspection certifications"
          action={
            <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>
              <Plus size={14} /> New Certification
            </button>
          }
        />
        <div className="page-content fade-in">

          {/* Stats */}
          <div className="grid-3" style={{ marginBottom: "24px" }}>
            {[
              { label: "Total Certifications", value: certs.length, color: "#0e7490", bg: "#e8f4fd", icon: Award },
              { label: "Approved", value: certs.filter((c) => c.certificate_decision === "Approve").length, color: "#16a34a", bg: "#dcfce7", icon: CheckCircle },
              { label: "Conditional / Rejected", value: certs.filter((c) => c.certificate_decision !== "Approve").length, color: "#ea580c", bg: "#fff7ed", icon: Clock },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <div className="stat-card" key={s.label}>
                  <div className="stat-icon" style={{ background: s.bg }}>
                    <Icon size={20} color={s.color} />
                  </div>
                  <div className="stat-value" style={{ color: s.color }}>{loading ? "—" : s.value}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              );
            })}
          </div>

          {/* Alerts */}
          {success && <div className="alert alert-success" style={{ marginBottom: "20px" }}><CheckCircle size={15} />{success}</div>}
          {error && <div className="alert alert-error" style={{ marginBottom: "20px" }}><AlertTriangle size={15} />{error}</div>}

          {/* New Certification Form */}
          {showForm && (
            <div className="card fade-in" style={{ marginBottom: "24px" }}>
              <div className="card-header">
                <div className="card-title">Issue New Certification</div>
                <div className="card-subtitle">Review inspection and issue a regulatory decision</div>
              </div>
              <div className="card-body">
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Inspection *</label>
                    <select
                      className="form-select"
                      value={form.inspection_id}
                      onChange={(e) => setForm((f) => ({ ...f, inspection_id: e.target.value }))}
                    >
                      <option value="">Select inspection...</option>
                      {inspections.map((i) => (
                        <option key={i.id} value={i.id}>
                          INS-{String(i.id).padStart(4, "0")} — Station #{i.landing_station_id} ({i.inspection_date})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Decision *</label>
                    <select
                      className="form-select"
                      value={form.certificate_decision}
                      onChange={(e) => setForm((f) => ({ ...f, certificate_decision: e.target.value }))}
                    >
                      <option value="Approve">✓ Approve</option>
                      <option value="Conditional">⚠ Conditional</option>
                      <option value="Reject">✗ Reject</option>
                    </select>
                  </div>
                </div>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Issued Date *</label>
                    <input
                      className="form-input"
                      type="date"
                      value={form.issued_date}
                      onChange={(e) => setForm((f) => ({ ...f, issued_date: e.target.value }))}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Issued By (User ID)</label>
                    <input
                      className="form-input"
                      type="number"
                      value={form.issued_by}
                      onChange={(e) => setForm((f) => ({ ...f, issued_by: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Remarks *</label>
                  <textarea
                    className="form-input"
                    rows={3}
                    placeholder="Enter detailed remarks about this certification decision..."
                    value={form.remarks}
                    onChange={(e) => setForm((f) => ({ ...f, remarks: e.target.value }))}
                    style={{ resize: "vertical" }}
                  />
                </div>

                {/* Decision preview */}
                <div style={{
                  padding: "14px 16px", borderRadius: "10px", marginBottom: "20px",
                  background: form.certificate_decision === "Approve" ? "#dcfce7" : form.certificate_decision === "Conditional" ? "#fff7ed" : "#fef2f2",
                  border: `1px solid ${form.certificate_decision === "Approve" ? "#bbf7d0" : form.certificate_decision === "Conditional" ? "#fed7aa" : "#fecaca"}`,
                  display: "flex", alignItems: "center", gap: "10px",
                }}>
                  {getDecisionIcon(form.certificate_decision)}
                  <span style={{
                    fontSize: "13.5px", fontWeight: 600,
                    color: form.certificate_decision === "Approve" ? "#16a34a" : form.certificate_decision === "Conditional" ? "#ea580c" : "#dc2626",
                  }}>
                    This inspection will be marked as: <strong>{form.certificate_decision}d</strong>
                  </span>
                </div>

                <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                  <button className="btn btn-secondary" onClick={() => { setShowForm(false); setError(""); }}>Cancel</button>
                  <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
                    {submitting ? <><div className="loading-spinner" />Issuing...</> : <><Award size={15} />Issue Certificate</>}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Table */}
          <div className="card">
            <div className="card-header" style={{ paddingBottom: "16px" }}>
              <div>
                <div className="card-title">All Certifications</div>
                <div className="card-subtitle">{filtered.length} records</div>
              </div>
              <div style={{ position: "relative" }}>
                <Search size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                <input
                  className="form-input"
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ paddingLeft: "36px", width: "220px", height: "38px", fontSize: "13px" }}
                />
              </div>
            </div>
            <div className="table-wrap">
              {loading ? (
                <div style={{ padding: "60px", textAlign: "center", color: "#94a3b8" }}>Loading...</div>
              ) : filtered.length === 0 ? (
                <div className="empty-state">
                  <Award size={40} />
                  <h3>No certifications yet</h3>
                  <p style={{ fontSize: "13px", marginBottom: "16px" }}>Issue your first certification above</p>
                </div>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Cert ID</th>
                      <th>Inspection</th>
                      <th>Decision</th>
                      <th>Issued Date</th>
                      <th>Issued By</th>
                      <th>Remarks</th>
                      <th>Download</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((c) => (
                      <tr key={c.id}>
                        <td><span style={{ fontWeight: 700, color: "#0e7490" }}>CERT-{String(c.id).padStart(4, "0")}</span></td>
                        <td>INS-{String(c.inspection_id).padStart(4, "0")}</td>
                        <td>
                          <span className={getDecisionBadge(c.certificate_decision)} style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
                            {getDecisionIcon(c.certificate_decision)}
                            {c.certificate_decision}
                          </span>
                        </td>
                        <td style={{ color: "#64748b" }}>{c.issued_date}</td>
                        <td>User #{c.issued_by}</td>
                        <td style={{ maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "#64748b" }}>
                          {c.remarks}
                        </td>
                        <td>
                          <a
                            href={certificationsAPI.downloadUrl(c.id)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-secondary btn-sm"
                            style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}
                          >
                            <Download size={13} /> PDF
                          </a>
                        </td>
                      </tr>
                    ))}
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