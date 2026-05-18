import { Link } from "react-router-dom";

import { useAuthStore } from "../stores/auth.store";

export function DashboardPage() {
  const user = useAuthStore((state) => state.user);

  return (
    <section>
      <div
        style={{
          background: "linear-gradient(135deg, #111827, #4f46e5)",
          color: "#ffffff",
          borderRadius: 28,
          padding: 36,
          marginBottom: 28,
          boxShadow: "0 20px 45px rgba(79, 70, 229, 0.25)",
        }}
      >
        <p style={{ opacity: 0.8, fontWeight: 700, margin: 0 }}>
          Welcome back
        </p>

        <h1 style={{ fontSize: 42, margin: "10px 0" }}>
          {user?.email}
        </h1>

        <p style={{ maxWidth: 620, lineHeight: 1.7, opacity: 0.9 }}>
          Buy credit packages, unlock SaaS features, and track every credit
          movement from your wallet dashboard.
        </p>

        <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
          <Link to="/packages" style={primaryButton}>
            Browse Packages
          </Link>

          <Link to="/wallet" style={secondaryButton}>
            View Wallet
          </Link>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 20,
          marginBottom: 28,
        }}
      >
        <InfoCard
          title="Credit Packages"
          value="Flexible"
          description="Choose BASIC, PRO, ENTERPRISE or custom admin-created packages."
        />

        <InfoCard
          title="Feature Unlock"
          value="Automatic"
          description="Features are unlocked immediately after a successful purchase."
        />

        <InfoCard
          title="Secure Access"
          value={user?.role || "USER"}
          description="JWT authentication with role-based and feature-based protection."
        />
      </div>

      <div
        style={{
          background: "#ffffff",
          border: "1px solid #e5e7eb",
          borderRadius: 24,
          padding: 28,
          boxShadow: "0 10px 25px rgba(15, 23, 42, 0.06)",
        }}
      >
      </div>
    </section>
  );
}

function InfoCard({
  title,
  value,
  description,
}: {
  title: string;
  value: string;
  description: string;
}) {
  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: 22,
        padding: 24,
        boxShadow: "0 10px 25px rgba(15, 23, 42, 0.06)",
      }}
    >
      <p style={{ color: "#6b7280", fontWeight: 800, margin: 0 }}>{title}</p>
      <h3 style={{ fontSize: 30, margin: "10px 0" }}>{value}</h3>
      <p style={{ color: "#6b7280", lineHeight: 1.6 }}>{description}</p>
    </div>
  );
}

const primaryButton: React.CSSProperties = {
  background: "#ffffff",
  color: "#111827",
  padding: "12px 16px",
  borderRadius: 14,
  textDecoration: "none",
  fontWeight: 900,
};

const secondaryButton: React.CSSProperties = {
  background: "rgba(255,255,255,0.12)",
  color: "#ffffff",
  padding: "12px 16px",
  borderRadius: 14,
  textDecoration: "none",
  fontWeight: 900,
  border: "1px solid rgba(255,255,255,0.3)",
};