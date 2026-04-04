"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { stationsAPI } from "@/lib/api";

interface Station {
  id: number;
  landing_station_name: string;
  county: string;
  location_description: string;
  active_status: boolean;
}

export default function StationsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const [stations, setStations] = useState<Station[]>([]);
  const [fetching, setFetching] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    landing_station_name: "",
    county: "",
    location_description: "",
    active_status: true,
  });

  useEffect(() => {
    if (!isLoading && !user) router.push("/login");
  }, [user, isLoading]);

  useEffect(() => {
    fetchStations();
  }, []);

  const fetchStations = async () => {
    try {
      const data = await stationsAPI.getAll();
      setStations(data.landing_stations || []);
    } catch {
      setError("Failed to load stations");
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async () => {
    setError("");
    setSuccess("");
    if (!form.landing_station_name || !form.county || !form.location_description) {
      setError("All fields are required");
      return;
    }
    setSubmitting(true);
    try {
      await stationsAPI.create(form);
      setSuccess("Landing station created successfully!");
      setForm({ landing_station_name: "", county: "", location_description: "", active_status: true });
      setShowForm(false);
      fetchStations();
    } catch (err: any) {
      setError(err.message || "Failed to create station");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleStatus = async (id: number, current: boolean) => {
    try {
      await stationsAPI.updateStatus(id, !current);
      fetchStations();
    } catch {
      setError("Failed to update status");
    }
  };

  const active = stations.filter(s => s.active_status).length;
  const inactive = stations.filter(s => !s.active_status).length;

  if (isLoading || fetching) {
    return (
      <div style={styles.loadingScreen}>
        <div style={styles.spinner} />
        <p style={styles.loadingText}>Loading stations...</p>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      {/* Sidebar accent */}
      <div style={styles.sideAccent} />

      <div style={styles.container}>

        {/* Header */}
        <div style={styles.header}>
          <div>
            <div style={styles.breadcrumb}>
              <span style={styles.breadcrumbLink} onClick={() => router.push("/dashboard")}>Dashboard</span>
              <span style={styles.breadcrumbSep}>/</span>
              <span style={styles.breadcrumbCurrent}>Landing Stations</span>
            </div>
            <h1 style={styles.title}>Landing Stations</h1>
            <p style={styles.subtitle}>Manage fish landing stations across Kenya</p>
          </div>
          <button
            onClick={() => { setShowForm(!showForm); setError(""); setSuccess(""); }}
            style={showForm ? styles.cancelBtn : styles.addBtn}
          >
            {showForm ? "✕ Cancel" : "+ Add Station"}
          </button>
        </div>

        {/* Feedback */}
        {error && <div style={styles.errorBox}>{error}</div>}
        {success && <div style={styles.successBox}>{success}</div>}

        {/* Stats */}
        <div style={styles.statsRow}>
          {[
            { label: "Total Stations", value: stations.length, color: "#1e40af" },
            { label: "Active", value: active, color: "#15803d" },
            { label: "Inactive", value: inactive, color: "#b91c1c" },
          ].map(stat => (
            <div key={stat.label} style={styles.statCard}>
              <div style={{ ...styles.statValue, color: stat.color }}>{stat.value}</div>
              <div style={styles.statLabel}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Add Form */}
        {showForm && (
          <div style={styles.formCard}>
            <h2 style={styles.formTitle}>New Landing Station</h2>
            <div style={styles.formGrid}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Station Name <span style={styles.required}>*</span></label>
                <input
                  style={styles.input}
                  type="text"
                  value={form.landing_station_name}
                  onChange={e => setForm({ ...form, landing_station_name: e.target.value })}
                  placeholder="e.g. Kisumu Central Landing"
                  onFocus={e => (e.target.style.borderColor = "#2563eb")}
                  onBlur={e => (e.target.style.borderColor = "#d1d5db")}
                />
              </div>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>County <span style={styles.required}>*</span></label>
                <input
                  style={styles.input}
                  type="text"
                  value={form.county}
                  onChange={e => setForm({ ...form, county: e.target.value })}
                  placeholder="e.g. Kisumu"
                  onFocus={e => (e.target.style.borderColor = "#2563eb")}
                  onBlur={e => (e.target.style.borderColor = "#d1d5db")}
                />
              </div>
              <div style={{ ...styles.fieldGroup, gridColumn: "1 / -1" }}>
                <label style={styles.label}>Location Description <span style={styles.required}>*</span></label>
                <textarea
                  style={{ ...styles.input, height: "80px", resize: "vertical" }}
                  value={form.location_description}
                  onChange={e => setForm({ ...form, location_description: e.target.value })}
                  placeholder="Describe the location..."
                  onFocus={e => (e.target.style.borderColor = "#2563eb")}
                  onBlur={e => (e.target.style.borderColor = "#d1d5db")}
                />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <input
                  type="checkbox"
                  id="active_status"
                  checked={form.active_status}
                  onChange={e => setForm({ ...form, active_status: e.target.checked })}
                  style={{ width: "16px", height: "16px", accentColor: "#2563eb" }}
                />
                <label htmlFor="active_status" style={styles.label}>Active Station</label>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px" }}>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                style={submitting ? { ...styles.submitBtn, opacity: 0.6 } : styles.submitBtn}
              >
                {submitting ? "Creating..." : "Create Station"}
              </button>
            </div>
          </div>
        )}

        {/* Table */}
        <div style={styles.tableCard}>
          <div style={styles.tableHeader}>
            <span style={styles.tableTitle}>
              All Stations <span style={styles.tableBadge}>{stations.length}</span>
            </span>
          </div>
          <table style={styles.table}>
            <thead>
              <tr style={styles.theadRow}>
                <th style={styles.th}>Station Name</th>
                <th style={styles.th}>County</th>
                <th style={styles.th}>Location</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Action</th>
              </tr>
            </thead>
            <tbody>
              {stations.length === 0 ? (
                <tr>
                  <td colSpan={5} style={styles.emptyCell}>
                    <div style={styles.emptyState}>
                      <div style={styles.emptyIcon}>🏖️</div>
                      <div style={styles.emptyText}>No landing stations yet</div>
                      <div style={styles.emptySubtext}>Click "+ Add Station" to create one</div>
                    </div>
                  </td>
                </tr>
              ) : (
                stations.map((station, i) => (
                  <tr
                    key={station.id}
                    style={{ ...styles.tr, backgroundColor: i % 2 === 0 ? "#fff" : "#f9fafb" }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#eff6ff")}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = i % 2 === 0 ? "#fff" : "#f9fafb")}
                  >
                    <td style={styles.tdBold}>{station.landing_station_name}</td>
                    <td style={styles.td}>
                      <span style={styles.countyBadge}>{station.county}</span>
                    </td>
                    <td style={{ ...styles.td, maxWidth: "260px" }}>
                      <span style={styles.locationText}>{station.location_description}</span>
                    </td>
                    <td style={styles.td}>
                      <span style={station.active_status ? styles.activeBadge : styles.inactiveBadge}>
                        {station.active_status ? "● Active" : "○ Inactive"}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <button
                        onClick={() => toggleStatus(station.id, station.active_status)}
                        style={station.active_status ? styles.deactivateBtn : styles.activateBtn}
                        onMouseEnter={e => (e.currentTarget.style.opacity = "0.8")}
                        onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
                      >
                        {station.active_status ? "Deactivate" : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#f1f5f9",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    position: "relative",
  },
  sideAccent: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "4px",
    height: "100vh",
    background: "linear-gradient(180deg, #1d4ed8, #0ea5e9, #10b981)",
    zIndex: 100,
  },
  container: {
    maxWidth: "1100px",
    margin: "0 auto",
    padding: "40px 32px",
  },
  loadingScreen: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f1f5f9",
    gap: "16px",
  },
  spinner: {
    width: "40px",
    height: "40px",
    border: "3px solid #e2e8f0",
    borderTop: "3px solid #2563eb",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  loadingText: { color: "#64748b", fontSize: "14px" },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "32px",
  },
  breadcrumb: { display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" },
  breadcrumbLink: { fontSize: "13px", color: "#2563eb", cursor: "pointer" },
  breadcrumbSep: { fontSize: "13px", color: "#94a3b8" },
  breadcrumbCurrent: { fontSize: "13px", color: "#64748b" },
  title: { fontSize: "28px", fontWeight: "700", color: "#0f172a", margin: "0 0 4px 0" },
  subtitle: { fontSize: "14px", color: "#64748b", margin: 0 },
  addBtn: {
    padding: "10px 20px",
    backgroundColor: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    boxShadow: "0 2px 8px rgba(37,99,235,0.3)",
  },
  cancelBtn: {
    padding: "10px 20px",
    backgroundColor: "#fff",
    color: "#64748b",
    border: "1px solid #e2e8f0",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
  },
  errorBox: {
    marginBottom: "16px",
    padding: "12px 16px",
    backgroundColor: "#fef2f2",
    border: "1px solid #fecaca",
    color: "#dc2626",
    borderRadius: "10px",
    fontSize: "14px",
  },
  successBox: {
    marginBottom: "16px",
    padding: "12px 16px",
    backgroundColor: "#f0fdf4",
    border: "1px solid #bbf7d0",
    color: "#16a34a",
    borderRadius: "10px",
    fontSize: "14px",
  },
  statsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "16px",
    marginBottom: "28px",
  },
  statCard: {
    backgroundColor: "#fff",
    borderRadius: "14px",
    padding: "20px 24px",
    textAlign: "center",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
    border: "1px solid #e2e8f0",
  },
  statValue: { fontSize: "32px", fontWeight: "800", lineHeight: 1 },
  statLabel: { fontSize: "13px", color: "#64748b", marginTop: "6px" },
  formCard: {
    backgroundColor: "#fff",
    borderRadius: "16px",
    padding: "28px",
    marginBottom: "24px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
    border: "1px solid #e2e8f0",
  },
  formTitle: { fontSize: "17px", fontWeight: "700", color: "#0f172a", marginBottom: "20px" },
  formGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" },
  fieldGroup: { display: "flex", flexDirection: "column", gap: "6px" },
  label: { fontSize: "13px", fontWeight: "600", color: "#374151" },
  required: { color: "#ef4444" },
  input: {
    padding: "10px 12px",
    border: "1.5px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "14px",
    outline: "none",
    transition: "border-color 0.15s",
    fontFamily: "inherit",
  },
  submitBtn: {
    padding: "10px 28px",
    backgroundColor: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
  },
  tableCard: {
    backgroundColor: "#fff",
    borderRadius: "16px",
    overflow: "hidden",
    boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
    border: "1px solid #e2e8f0",
  },
  tableHeader: {
    padding: "18px 24px",
    borderBottom: "1px solid #e2e8f0",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  tableTitle: { fontSize: "15px", fontWeight: "700", color: "#0f172a" },
  tableBadge: {
    marginLeft: "8px",
    backgroundColor: "#eff6ff",
    color: "#2563eb",
    padding: "2px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
  },
  table: { width: "100%", borderCollapse: "collapse" },
  theadRow: { backgroundColor: "#f8fafc" },
  th: {
    padding: "12px 20px",
    textAlign: "left",
    fontSize: "12px",
    fontWeight: "700",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    borderBottom: "1px solid #e2e8f0",
  },
  tr: { transition: "background-color 0.15s" },
  td: { padding: "14px 20px", fontSize: "14px", color: "#374151" },
  tdBold: { padding: "14px 20px", fontSize: "14px", color: "#0f172a", fontWeight: "600" },
  countyBadge: {
    backgroundColor: "#f1f5f9",
    color: "#475569",
    padding: "3px 10px",
    borderRadius: "6px",
    fontSize: "13px",
    fontWeight: "500",
  },
  locationText: {
    display: "block",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    color: "#64748b",
    fontSize: "13px",
  },
  activeBadge: {
    backgroundColor: "#dcfce7",
    color: "#15803d",
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
  },
  inactiveBadge: {
    backgroundColor: "#fee2e2",
    color: "#b91c1c",
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
  },
  deactivateBtn: {
    padding: "6px 14px",
    backgroundColor: "#fff",
    color: "#dc2626",
    border: "1px solid #fca5a5",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "opacity 0.15s",
  },
  activateBtn: {
    padding: "6px 14px",
    backgroundColor: "#fff",
    color: "#16a34a",
    border: "1px solid #86efac",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "opacity 0.15s",
  },
  emptyCell: { padding: "60px 20px" },
  emptyState: { textAlign: "center" },
  emptyIcon: { fontSize: "40px", marginBottom: "12px" },
  emptyText: { fontSize: "16px", fontWeight: "600", color: "#374151", marginBottom: "4px" },
  emptySubtext: { fontSize: "13px", color: "#94a3b8" },
};