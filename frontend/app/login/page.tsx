"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Fish, Eye, EyeOff, Shield } from "lucide-react";
import { authAPI } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await authAPI.login(email, password);
      localStorage.setItem("kefs_user", JSON.stringify(res.user));
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      {/* Background pattern */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundImage: `radial-gradient(circle at 20% 50%, rgba(14,116,144,0.15) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(56,189,248,0.1) 0%, transparent 50%)`,
          pointerEvents: "none",
        }}
      />

      <div className="login-card fade-in">
        {/* Logo */}
        <div className="login-logo">
          <div className="login-logo-icon">
            <Fish size={28} color="white" />
          </div>
          <h1>Kenya Fisheries Service</h1>
          <p>Risk-Based Inspection Platform</p>
        </div>

        {/* Welcome */}
        <div
          style={{
            background: "linear-gradient(135deg, #e8f4fd, #f0fdf4)",
            borderRadius: "12px",
            padding: "14px 16px",
            marginBottom: "24px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            border: "1px solid #bae6fd",
          }}
        >
          <Shield size={18} color="#0e7490" />
          <div>
            <p
              style={{
                fontSize: "12.5px",
                fontWeight: 700,
                color: "#0e7490",
              }}
            >
              Secure Access Portal
            </p>
            <p style={{ fontSize: "11.5px", color: "#64748b" }}>
              Authorized personnel only
            </p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="alert alert-error" style={{ marginBottom: "20px" }}>
            <Shield size={15} />
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              className="form-input"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: "relative" }}>
              <input
                className="form-input"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ paddingRight: "44px" }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#94a3b8",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
              <p className="text-center text-sm text-gray-500 mt-4">
                Don't have an account?{" "}
                <a href="/register" className="text-blue-600 hover:underline font-medium">
                  Register here  
                </a>   
              </p>   
            
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: "100%", justifyContent: "center", marginTop: "8px", height: "46px" }}
          >
            {loading ? (
              <>
                <div className="loading-spinner" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        {/* Demo credentials */}
        <div className="divider" />
        <div
          style={{
            background: "#f8fafc",
            borderRadius: "10px",
            padding: "14px 16px",
            border: "1px solid #e2e8f0",
          }}
        >
          <p
            style={{
              fontSize: "11.5px",
              fontWeight: 700,
              color: "#64748b",
              marginBottom: "8px",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            Test Credentials
          </p>
          {[
            { role: "Admin", email: "admin@kefs.go.ke", pass: "Admin@1234" },
            {
              role: "Inspector",
              email: "inspector@kefs.go.ke",
              pass: "Inspector@1234",
            },
          ].map((c) => (
            <div
              key={c.role}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "6px 0",
                borderBottom: "1px solid #f1f5f9",
              }}
            >
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "#0e7490",
                  minWidth: "70px",
                }}
              >
                {c.role}
              </span>
              <button
                type="button"
                onClick={() => {
                  setEmail(c.email);
                  setPassword(c.pass);
                }}
                style={{
                  fontSize: "11.5px",
                  color: "#64748b",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "right",
                }}
              >
                {c.email}
              </button>
            </div>
          ))}
        </div>

        <p
          style={{
            textAlign: "center",
            fontSize: "11.5px",
            color: "#94a3b8",
            marginTop: "20px",
          }}
        >
          Kenya Fisheries Service © 2026 · v1.0.0
        </p>
      </div>
    </div>
  );
}