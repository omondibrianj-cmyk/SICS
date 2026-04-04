const BASE_URL = "http://localhost:8000";

async function request(path: string, options: RequestInit = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Unknown error" }));
    throw new Error(error.detail || "Request failed");
  }

  return res.json();
}

// ── Auth ──────────────────────────────────────────
export const authAPI = {
  login: (email: string, password: string) =>
    request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  register: (data: {
    full_name: string;
    email: string;
    password: string;
    role: string;
    phone?: string;
  }) =>
    request("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

// ── Dashboard ─────────────────────────────────────
export const dashboardAPI = {
  getStats: () => request("/api/dashboard/stats"),
  getRecentInspections: () => request("/api/dashboard/recent-inspections"),
  getRecentCertifications: () => request("/api/dashboard/recent-certifications"),
};

// ── Landing Stations ──────────────────────────────
export const stationsAPI = {
  getAll: () => request("/api/landing-stations/all"),
  getOne: (id: number) => request(`/api/landing-stations/${id}`),
  create: (data: {
    landing_station_name: string;
    county: string;
    location_description: string;
    active_status?: boolean;
  }) =>
    request("/api/landing-stations/create", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateStatus: (id: number, active_status: boolean) =>
    request(`/api/landing-stations/${id}/status?active_status=${active_status}`, {
      method: "PUT",
    }),
};

// ── Inspections ───────────────────────────────────
export const inspectionsAPI = {
  getAll: () => request("/api/inspections/all"),
  getOne: (id: number) => request(`/api/inspections/${id}`),
  create: (data: {
    landing_station_id: number;
    inspector_id: number;
    inspection_date: string;
    reason_for_inspection: string;
    avg_temp_c: number;
    ice_ratio_ok: boolean;
    temp_monitoring_records: boolean;
    infra_score: number;
    handling_score: number;
    transport_score: number;
    hygiene_score: number;
    personnel_score: number;
    records_score: number;
    boats_operating: number;
    historical_noncompliance_6m: number;
    days_since_last_inspection: number;
  }) =>
    request("/api/inspections/create", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

// ── Certifications ────────────────────────────────
export const certificationsAPI = {
  getAll: () => request("/api/certifications/all"),
  getOne: (id: number) => request(`/api/certifications/${id}`),
  create: (data: {
    inspection_id: number;
    certificate_decision: string;
    remarks: string;
    issued_by: number;
    issued_date: string;
  }) =>
    request("/api/certifications/create", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  downloadUrl: (id: number) =>
    `${BASE_URL}/api/certifications/${id}/download`,
};