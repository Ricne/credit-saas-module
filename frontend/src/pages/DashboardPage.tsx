import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { packagesApi } from "../api/packages.api";
import { creditsApi } from "../api/credits.api";
import { featuresApi } from "../api/features.api";
import { purchasesApi } from "../api/purchases.api";
import { useAuthStore } from "../stores/auth.store";
import type { Package } from "../types/package";
import type {
  CreditLedgerItem,
  MyFeature,
  PurchaseHistoryItem,
  Wallet,
} from "../types/wallet";

export function DashboardPage() {
  const user = useAuthStore((state) => state.user);

  const [packages, setPackages] = useState<Package[]>([]);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [features, setFeatures] = useState<MyFeature[]>([]);
  const [ledger, setLedger] = useState<CreditLedgerItem[]>([]);
  const [transactions, setTransactions] = useState<PurchaseHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const isAdmin = user?.role === "ADMIN";

  async function loadDashboard() {
    setIsLoading(true);

    try {
      const packageData = await packagesApi.list();
      setPackages(packageData);

      if (!isAdmin) {
        const [walletData, featuresData, ledgerData, transactionData] =
          await Promise.all([
            creditsApi.wallet(),
            featuresApi.myFeatures(),
            creditsApi.ledger(),
            purchasesApi.history(),
          ]);

        setWallet(walletData);
        setFeatures(featuresData);
        setLedger(ledgerData);
        setTransactions(transactionData);
      }
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, [isAdmin]);

  const totalPackageCredits = useMemo(() => {
    return packages.reduce((total, item) => total + item.credits, 0);
  }, [packages]);

  const totalSpent = useMemo(() => {
    return transactions.reduce((total, item) => total + Number(item.amount), 0);
  }, [transactions]);

  const maxPackageCredits = Math.max(...packages.map((item) => item.credits), 1);

  return (
    <section>
      <div style={styles.hero}>
        <div>
          <p style={styles.heroEyebrow}>Welcome back</p>

          <h1 style={styles.heroTitle}>{user?.email}</h1>

          <p style={styles.heroText}>
            {isAdmin
              ? "Manage SaaS credit packages, features, and system access from one dashboard."
              : "Buy credit packages, unlock SaaS features, and track every credit movement from your wallet."}
          </p>

          <div style={styles.heroActions}>
            {isAdmin ? (
              <>
                <Link to="/admin/packages" style={primaryButton}>
                  Manage Packages
                </Link>

                <Link to="/admin/features" style={secondaryButton}>
                  Manage Features
                </Link>
              </>
            ) : (
              <>
                <Link to="/packages" style={primaryButton}>
                  Browse Packages
                </Link>

                <Link to="/wallet" style={secondaryButton}>
                  View Wallet
                </Link>
              </>
            )}
          </div>
        </div>

        <div style={styles.heroBadge}>
          <span>{user?.role}</span>
          <strong>{isAdmin ? "Admin Console" : "User Workspace"}</strong>
        </div>
      </div>

      {isLoading ? (
        <p>Loading dashboard...</p>
      ) : (
        <>
          {isAdmin ? (
            <div style={styles.summaryGrid}>
              <InfoCard
                title="Active packages"
                value={String(packages.length)}
                description="Packages available for users to purchase."
              />

              <InfoCard
                title="Total package credits"
                value={String(totalPackageCredits)}
                description="Total credits across active packages."
              />

              <InfoCard
                title="System role"
                value="ADMIN"
                description="Can manage packages and feature catalog."
              />
            </div>
          ) : (
            <div style={styles.summaryGrid}>
              <InfoCard
                title="Current balance"
                value={String(wallet?.balance ?? 0)}
                description="Available credits in your wallet."
              />

              <InfoCard
                title="Unlocked features"
                value={String(features.length)}
                description="Features unlocked from purchased packages."
              />

              <InfoCard
                title="Total spent"
                value={`$${totalSpent.toFixed(2)}`}
                description="Total fake payment amount recorded."
              />
            </div>
          )}

          <div style={styles.contentGrid}>
            <section style={styles.card}>
              <div style={styles.cardHeader}>
                <div>
                  <h2 style={styles.cardTitle}>Package credit overview</h2>
                  <p style={styles.cardSubtitle}>
                    Compare credit volume by package.
                  </p>
                </div>
              </div>

              <div style={styles.chartList}>
                {packages.map((item) => (
                  <div key={item.id} style={styles.chartRow}>
                    <div style={styles.chartLabel}>
                      <strong>{item.name}</strong>
                      <span>{item.credits} credits</span>
                    </div>

                    <div style={styles.barTrack}>
                      <div
                        style={{
                          ...styles.barFill,
                          width: `${Math.max(
                            (item.credits / maxPackageCredits) * 100,
                            8
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section style={styles.card}>
              <h2 style={styles.cardTitle}>
                {isAdmin ? "Admin quick actions" : "Recent activity"}
              </h2>

              {isAdmin ? (
                <div style={styles.actionList}>
                  <Link to="/admin/packages" style={actionItem}>
                    Create or archive credit packages
                  </Link>

                  <Link to="/admin/features" style={actionItem}>
                    Manage feature catalog
                  </Link>

                  <Link to="/packages" style={actionItem}>
                    Preview user package page
                  </Link>
                </div>
              ) : ledger.length === 0 ? (
                <p style={styles.empty}>No credit activity yet.</p>
              ) : (
                <div style={styles.activityList}>
                  {ledger.slice(0, 5).map((item) => (
                    <div key={item.id} style={styles.activityItem}>
                      <div>
                        <strong>{item.type}</strong>
                        <p style={styles.activityText}>
                          {item.description || "No description"}
                        </p>
                      </div>

                      <span style={styles.creditPill}>
                        {item.amount > 0 ? "+" : ""}
                        {item.amount}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </>
      )}
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
    <div style={styles.infoCard}>
      <p style={styles.infoTitle}>{title}</p>
      <h3 style={styles.infoValue}>{value}</h3>
      <p style={styles.infoDescription}>{description}</p>
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

const actionItem: React.CSSProperties = {
  display: "block",
  padding: 14,
  background: "#f9fafb",
  border: "1px solid #e5e7eb",
  borderRadius: 14,
  color: "#111827",
  textDecoration: "none",
  fontWeight: 800,
};

const styles: Record<string, React.CSSProperties> = {
  hero: {
    background: "linear-gradient(135deg, #111827, #4f46e5)",
    color: "#ffffff",
    borderRadius: 28,
    padding: 36,
    marginBottom: 28,
    boxShadow: "0 20px 45px rgba(79, 70, 229, 0.25)",
    display: "flex",
    justifyContent: "space-between",
    gap: 24,
    alignItems: "center",
  },
  heroEyebrow: {
    opacity: 0.8,
    fontWeight: 700,
    margin: 0,
  },
  heroTitle: {
    fontSize: 42,
    margin: "10px 0",
  },
  heroText: {
    maxWidth: 680,
    lineHeight: 1.7,
    opacity: 0.9,
  },
  heroActions: {
    display: "flex",
    gap: 12,
    marginTop: 24,
    flexWrap: "wrap",
  },
  heroBadge: {
    minWidth: 180,
    background: "rgba(255,255,255,0.12)",
    border: "1px solid rgba(255,255,255,0.25)",
    borderRadius: 22,
    padding: 20,
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: 20,
    marginBottom: 28,
  },
  infoCard: {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: 22,
    padding: 24,
    boxShadow: "0 10px 25px rgba(15, 23, 42, 0.06)",
  },
  infoTitle: {
    color: "#6b7280",
    fontWeight: 800,
    margin: 0,
  },
  infoValue: {
    fontSize: 34,
    margin: "10px 0",
  },
  infoDescription: {
    color: "#6b7280",
    lineHeight: 1.6,
  },
  contentGrid: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1.2fr) minmax(320px, 0.8fr)",
    gap: 20,
  },
  card: {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: 24,
    padding: 28,
    boxShadow: "0 10px 25px rgba(15, 23, 42, 0.06)",
  },
  cardHeader: {
    marginBottom: 20,
  },
  cardTitle: {
    margin: 0,
    fontSize: 22,
  },
  cardSubtitle: {
    color: "#6b7280",
    marginBottom: 0,
  },
  chartList: {
    display: "flex",
    flexDirection: "column",
    gap: 18,
  },
  chartRow: {
    display: "grid",
    gridTemplateColumns: "160px 1fr",
    gap: 16,
    alignItems: "center",
  },
  chartLabel: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    color: "#6b7280",
  },
  barTrack: {
    height: 14,
    background: "#eef2ff",
    borderRadius: 999,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    background: "linear-gradient(90deg, #4f46e5, #111827)",
    borderRadius: 999,
  },
  actionList: {
    display: "grid",
    gap: 12,
    marginTop: 18,
  },
  activityList: {
    display: "grid",
    gap: 12,
    marginTop: 18,
  },
  activityItem: {
    display: "flex",
    justifyContent: "space-between",
    gap: 16,
    background: "#f9fafb",
    borderRadius: 14,
    padding: 14,
  },
  activityText: {
    color: "#6b7280",
    margin: "4px 0 0",
  },
  creditPill: {
    alignSelf: "center",
    background: "#ecfdf5",
    color: "#047857",
    borderRadius: 999,
    padding: "6px 10px",
    fontWeight: 900,
  },
  empty: {
    color: "#6b7280",
  },
};