"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/layout/sidebar";
import TopBar from "@/components/layout/TopBar";
import Link from "next/link";
import { ClipboardList, Plus, Search, Eye } from "lucide-react";
import { inspectionsAPI } from "@/lib/api";

export default function InspectionsPage() {
  const router = useRouter();
  const [inspections, setInspections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("kefs_user");
    if (!stored) { router.push("/login"); return; }
    loadInspections();
  }, []);

  async function loadInspections() {
    try {
      const res = await inspectionsAPI.getAll();
      setInspections(res.inspections || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const filtered = inspections.filter((i) =>
    i.reason_for_inspection?.toLowerCase().includes(search.toLowerCase()) ||
    String(i.id).includes(search) ||
    String(i.landing_station_id).includes(search)
  );

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div className="main-layout">
        <TopBar
          title="Inspections"
          subtitle="Manage and track all fisheries inspections"
          action={
            <Link href="/inspections/new" className="btn btn-primary btn-sm">
              <Plus size={14} /> New Inspection
            </Link>
          }
        />
        <div className="page-content fade-in">

          {/* Stats row */}
          <div className="grid-3" style={{ marginBottom: "24px" }}>
            {[
              {
                label: "Total Inspections",
                value: inspections.length,
                color: "#0e7490",
                bg: "#e8f4fd",
              },
              {
                label: "Ice Ratio OK",
                value: inspections.filter((i) => i.ice_ratio_ok).length,
                color: "#16a34a",
                bg: "#dcfce7",
              },
              {
                label: "Ice Ratio Failed",
                value: inspections.filter((i) => !i.ice_ratio_ok).length,
                color: "#dc2626",
                bg: "#fef2f2",
              },
            ].map((s) => (
              <div className="stat-card" key={s.label}>
                <div
                  className="stat-icon"
                  style={{ background: s.bg }}
                >
                  <ClipboardList size={20} color={s.color} />
                </div>
                <div className="stat-value" style={{ color: s.color }}>
                  {loading ? "—" : s.value}
                </div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Table card */}
          <div className="card">
            <div className="card-header" style={{ paddingBottom: "16px" }}>
              <div>
                <div className="card-title">All Inspections</div>
                <div className="card-subtitle">
                  {filtered.length} records found
                </div>
              </div>
              {/* Search */}
              <div style={{ position: "relative" }}>
                <Search
                  size={15}
                  style={{
                    position: "absolute",
                    left: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#94a3b8",
                  }}
                />
                <input
                  className="form-input"
                  placeholder="Search inspections..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{
                    paddingLeft: "36px",
                    width: "240px",
                    height: "38px",
                    fontSize: "13px",
                  }}
                />
              </div>
            </div>

            <div className="table-wrap">
              {loading ? (
                <div style={{ padding: "60px", textAlign: "center", color: "#94a3b8" }}>
                  Loading inspections...
                </div>
              ) : filtered.length === 0 ? (
                <div className="empty-state">
                  <ClipboardList size={40} />
                  <h3>No inspections found</h3>
                  <p style={{ fontSize: "13px", marginBottom: "16px" }}>
                    {search ? "Try a different search" : "Create your first inspection"}
                  </p>
                  {!search && (
                    <Link href="/inspections/new" className="btn btn-primary btn-sm">
                      <Plus size={14} /> New Inspection
                    </Link>
                  )}
                </div>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Inspection ID</th>
                      <th>Date</th>
                      <th>Station</th>
                      <th>Inspector</th>
                      <th>Temp (°C)</th>
                      <th>Ice Ratio</th>
                      <th>Temp Records</th>
                      <th>Boats</th>
                      <th>Violations</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((ins) => (
                      <tr key={ins.id}>
                        <td>
                          <span style={{ fontWeight: 700, color: "#0e7490" }}>
                            INS-{String(ins.id).padStart(4, "0")}
                          </span>
                        </td>
                        <td style={{ color: "#64748b" }}>
                          {ins.inspection_date}
                        </td>
                        <td>
                          <span style={{ fontWeight: 600 }}>
                            Station #{ins.landing_station_id}
                          </span>
                        </td>
                        <td style={{ color: "#64748b" }}>
                          Inspector #{ins.inspector_id}
                        </td>
                        <td>
                          <span
                            style={{
                              fontWeight: 600,
                              color: ins.avg_temp_c > 10 ? "#dc2626" : "#16a34a",
                            }}
                          >
                            {ins.avg_temp_c}°C
                          </span>
                        </td>
                        <td>
                          <span
                            className={
                              ins.ice_ratio_ok
                                ? "badge badge-low"
                                : "badge badge-high"
                            }
                          >
                            {ins.ice_ratio_ok ? "✓ OK" : "✗ Fail"}
                          </span>
                        </td>
                        <td>
                          <span
                            className={
                              ins.temp_monitoring_records
                                ? "badge badge-low"
                                : "badge badge-medium"
                            }
                          >
                            {ins.temp_monitoring_records ? "Available" : "Missing"}
                          </span>
                        </td>
                        <td style={{ fontWeight: 600 }}>
                          {ins.boats_operating}
                        </td>
                        <td>
                          <span
                            style={{
                              fontWeight: 700,
                              color:
                                ins.historical_noncompliance_6m > 3
                                  ? "#dc2626"
                                  : ins.historical_noncompliance_6m > 1
                                  ? "#ea580c"
                                  : "#16a34a",
                            }}
                          >
                            {ins.historical_noncompliance_6m}
                          </span>
                        </td>
                        <td>
                          <Link
                            href={`/inspections/${ins.id}`}
                            className="btn btn-secondary btn-sm"
                            style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}
                          >
                            <Eye size={13} /> View
                          </Link>
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