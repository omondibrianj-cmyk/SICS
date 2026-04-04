"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/layout/sidebar";
import TopBar from "@/components/layout/TopBar";
import Link from "next/link";
import {
  ClipboardList,
  Award,
  MapPin,
  Users,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Plus,
} from "lucide-react";
import { dashboardAPI } from "@/lib/api";

interface Stats {
  total_inspections: number;
  total_certifications: number;
  total_landing_stations: number;
  total_users: number;
  certifications_breakdown: {
    approved: number;
    conditional: number;
    rejected: number;
  };
  risk_breakdown: {
    high: number;
    medium: number;
    low: number;
  };
}

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentInspections, setRecentInspections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem("kefs_user");
    if (!stored) { router.push("/login"); return; }
    setUser(JSON.parse(stored));
    loadData();
  }, []);

  async function loadData() {
    try {
      const [statsRes, inspRes] = await Promise.all([
        dashboardAPI.getStats(),
        dashboardAPI.getRecentInspections(),
      ]);
      setStats(statsRes);
      setRecentInspections(inspRes.recent_inspections || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const today = new Date().toLocaleDateString("en-KE", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  const totalRisk = stats
    ? stats.risk_breakdown.high + stats.risk_breakdown.medium + stats.risk_breakdown.low
    : 0;

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div className="main-layout">
        <TopBar
          title={`Welcome back, ${user?.full_name?.split(" ")[0] || "User"} 👋`}
          subtitle={today}
          action={
            <Link href="/inspections/new" className="btn btn-primary btn-sm">
              <Plus size={14} /> New Inspection
            </Link>
          }
        />
        <div className="page-content fade-in">

          {/* Stat Cards */}
          <div className="grid-4" style={{ marginBottom: "24px" }}>
            {[
              {
                label: "Total Inspections",
                value: stats?.total_inspections ?? "—",
                icon: ClipboardList,
                color: "#0e7490",
                bg: "#e8f4fd",
                change: "All time",
              },
              {
                label: "Certifications",
                value: stats?.total_certifications ?? "—",
                icon: Award,
                color: "#16a34a",
                bg: "#dcfce7",
                change: `${stats?.certifications_breakdown.approved ?? 0} approved`,
              },
              {
                label: "Landing Stations",
                value: stats?.total_landing_stations ?? "—",
                icon: MapPin,
                color: "#ea580c",
                bg: "#fff7ed",
                change: "Active sites",
              },
              {
                label: "System Users",
                value: stats?.total_users ?? "—",
                icon: Users,
                color: "#7c3aed",
                bg: "#f5f3ff",
                change: "Registered",
              },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <div className="stat-card" key={s.label}>
                  <div
                    className="stat-icon"
                    style={{ background: s.bg }}
                  >
                    <Icon size={20} color={s.color} />
                  </div>
                  <div className="stat-value">
                    {loading ? (
                      <div
                        style={{
                          width: "60px", height: "32px",
                          background: "#f1f5f9", borderRadius: "6px",
                        }}
                      />
                    ) : s.value}
                  </div>
                  <div className="stat-label">{s.label}</div>
                  <div className="stat-change" style={{ color: s.color }}>
                    <TrendingUp size={12} />
                    {s.change}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Middle row */}
          <div className="grid-2" style={{ marginBottom: "24px" }}>

            {/* Risk Breakdown */}
            <div className="card">
              <div className="card-header">
                <div>
                  <div className="card-title">Risk Distribution</div>
                  <div className="card-subtitle">
                    Based on {totalRisk} inspections
                  </div>
                </div>
                <AlertTriangle size={18} color="#ea580c" />
              </div>
              <div className="card-body">
                {loading ? (
                  <div style={{ color: "#94a3b8", fontSize: "13px" }}>Loading...</div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {[
                      {
                        label: "High Risk",
                        value: stats?.risk_breakdown.high ?? 0,
                        color: "#dc2626",
                        bg: "#dc2626",
                      },
                      {
                        label: "Medium Risk",
                        value: stats?.risk_breakdown.medium ?? 0,
                        color: "#ea580c",
                        bg: "#ea580c",
                      },
                      {
                        label: "Low Risk",
                        value: stats?.risk_breakdown.low ?? 0,
                        color: "#16a34a",
                        bg: "#16a34a",
                      },
                    ].map((r) => {
                      const pct = totalRisk > 0
                        ? Math.round((r.value / totalRisk) * 100)
                        : 0;
                      return (
                        <div key={r.label}>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              marginBottom: "6px",
                            }}
                          >
                            <span
                              style={{
                                fontSize: "13px",
                                fontWeight: 600,
                                color: "#475569",
                              }}
                            >
                              {r.label}
                            </span>
                            <span
                              style={{
                                fontSize: "13px",
                                fontWeight: 700,
                                color: r.color,
                              }}
                            >
                              {r.value} ({pct}%)
                            </span>
                          </div>
                          <div className="progress-bar">
                            <div
                              className="progress-fill"
                              style={{
                                width: `${pct}%`,
                                background: r.bg,
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Certification Breakdown */}
            <div className="card">
              <div className="card-header">
                <div>
                  <div className="card-title">Certification Outcomes</div>
                  <div className="card-subtitle">
                    {stats?.total_certifications ?? 0} total decisions
                  </div>
                </div>
                <Award size={18} color="#16a34a" />
              </div>
              <div className="card-body">
                {loading ? (
                  <div style={{ color: "#94a3b8", fontSize: "13px" }}>Loading...</div>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "12px",
                    }}
                  >
                    {[
                      {
                        label: "Approved",
                        value: stats?.certifications_breakdown.approved ?? 0,
                        icon: CheckCircle,
                        color: "#16a34a",
                        bg: "#dcfce7",
                      },
                      {
                        label: "Conditional",
                        value: stats?.certifications_breakdown.conditional ?? 0,
                        icon: Clock,
                        color: "#ea580c",
                        bg: "#fff7ed",
                      },
                      {
                        label: "Rejected",
                        value: stats?.certifications_breakdown.rejected ?? 0,
                        icon: AlertTriangle,
                        color: "#dc2626",
                        bg: "#fef2f2",
                      },
                    ].map((c) => {
                      const Icon = c.icon;
                      return (
                        <div
                          key={c.label}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "14px 16px",
                            borderRadius: "12px",
                            background: c.bg,
                            border: `1px solid ${c.bg}`,
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "10px",
                            }}
                          >
                            <Icon size={18} color={c.color} />
                            <span
                              style={{
                                fontSize: "13.5px",
                                fontWeight: 600,
                                color: c.color,
                              }}
                            >
                              {c.label}
                            </span>
                          </div>
                          <span
                            style={{
                              fontSize: "22px",
                              fontWeight: 800,
                              color: c.color,
                            }}
                          >
                            {c.value}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recent Inspections */}
          <div className="card">
            <div className="card-header" style={{ paddingBottom: "16px" }}>
              <div>
                <div className="card-title">Recent Inspections</div>
                <div className="card-subtitle">Latest inspection records</div>
              </div>
              <Link href="/inspections" className="btn btn-secondary btn-sm">
                View All
              </Link>
            </div>
            <div className="table-wrap">
              {loading ? (
                <div
                  style={{
                    padding: "40px",
                    textAlign: "center",
                    color: "#94a3b8",
                  }}
                >
                  Loading inspections...
                </div>
              ) : recentInspections.length === 0 ? (
                <div className="empty-state">
                  <ClipboardList size={40} />
                  <h3>No inspections yet</h3>
                  <p style={{ fontSize: "13px", marginBottom: "16px" }}>
                    Start by creating your first inspection
                  </p>
                  <Link href="/inspections/new" className="btn btn-primary btn-sm">
                    <Plus size={14} /> New Inspection
                  </Link>
                </div>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Date</th>
                      <th>Station ID</th>
                      <th>Reason</th>
                      <th>Temp (°C)</th>
                      <th>Ice Ratio</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentInspections.map((ins) => (
                      <tr key={ins.id}>
                        <td>
                          <span
                            style={{
                              fontWeight: 700,
                              color: "#0e7490",
                              fontSize: "13px",
                            }}
                          >
                            INS-{String(ins.id).padStart(4, "0")}
                          </span>
                        </td>
                        <td style={{ color: "#64748b" }}>
                          {ins.inspection_date}
                        </td>
                        <td>Station #{ins.landing_station_id}</td>
                        <td
                          style={{
                            maxWidth: "180px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {ins.reason_for_inspection}
                        </td>
                        <td>{ins.avg_temp_c}°C</td>
                        <td>
                          <span
                            className={
                              ins.ice_ratio_ok ? "badge badge-low" : "badge badge-high"
                            }
                          >
                            {ins.ice_ratio_ok ? "✓ OK" : "✗ Fail"}
                          </span>
                        </td>
                        <td>
                          <Link
                            href={`/inspections/${ins.id}`}
                            className="btn btn-secondary btn-sm"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div
            style={{
              marginTop: "24px",
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "16px",
            }}
          >
            {[
              {
                label: "New Inspection",
                desc: "Record a new fish landing site inspection",
                icon: ClipboardList,
                href: "/inspections/new",
                color: "#0e7490",
                bg: "#e8f4fd",
              },
              {
                label: "View Certifications",
                desc: "Review and issue certification decisions",
                icon: Award,
                href: "/certifications",
                color: "#16a34a",
                bg: "#dcfce7",
              },
              {
                label: "Analytics",
                desc: "View risk trends and compliance analytics",
                icon: TrendingUp,
                href: "/analytics",
                color: "#7c3aed",
                bg: "#f5f3ff",
              },
            ].map((a) => {
              const Icon = a.icon;
              return (
                <Link
                  key={a.label}
                  href={a.href}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                    padding: "18px 20px",
                    background: "white",
                    borderRadius: "14px",
                    border: "1px solid #e2e8f0",
                    textDecoration: "none",
                    transition: "all 0.2s",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow =
                      "0 4px 16px rgba(0,0,0,0.08)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow =
                      "0 1px 4px rgba(0,0,0,0.04)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <div
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "12px",
                      background: a.bg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={20} color={a.color} />
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: "14px",
                        fontWeight: 700,
                        color: "#1e293b",
                        marginBottom: "3px",
                      }}
                    >
                      {a.label}
                    </div>
                    <div style={{ fontSize: "12px", color: "#94a3b8" }}>
                      {a.desc}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}