import { useEffect, useState } from "react";

import { creditsApi } from "../api/credits.api";
import { featuresApi } from "../api/features.api";
import type {
  CreditLedgerItem,
  MyFeature,
  Wallet,
} from "../types/wallet";

export function WalletPage() {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [ledger, setLedger] = useState<CreditLedgerItem[]>([]);
  const [features, setFeatures] = useState<MyFeature[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  async function loadData() {
    setIsLoading(true);

    try {
      const [walletData, ledgerData, featuresData] = await Promise.all([
        creditsApi.wallet(),
        creditsApi.ledger(),
        featuresApi.myFeatures(),
      ]);

      setWallet(walletData);
      setLedger(ledgerData);
      setFeatures(featuresData);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  if (isLoading) {
    return <p>Loading wallet...</p>;
  }

  return (
    <section>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Wallet</h1>
          <p style={styles.subtitle}>
            Track your credits, purchases, and unlocked features.
          </p>
        </div>

        <button style={styles.refreshButton} onClick={loadData}>
          Refresh
        </button>
      </div>

      <div style={styles.summaryGrid}>
        <div style={styles.summaryCard}>
          <div style={styles.summaryLabel}>Current balance</div>
          <div style={styles.balance}>{wallet?.balance ?? 0}</div>
          <div style={styles.summaryHint}>available credits</div>
        </div>

        <div style={styles.summaryCard}>
          <div style={styles.summaryLabel}>Unlocked features</div>
          <div style={styles.balance}>{features.length}</div>
          <div style={styles.summaryHint}>active permissions</div>
        </div>
      </div>

      <div style={styles.twoColumn}>
        <section style={styles.card}>
          <h2 style={styles.cardTitle}>Unlocked Features</h2>

          {features.length === 0 ? (
            <p style={styles.empty}>No features unlocked yet.</p>
          ) : (
            <div style={styles.featureList}>
              {features.map((feature) => (
                <div key={feature.id} style={styles.featureItem}>
                  <span style={styles.featureCode}>{feature.feature_code}</span>
                  <span style={styles.featureDate}>
                    {formatDate(feature.granted_at)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <section style={styles.card}>
        <h2 style={styles.cardTitle}>Credit Ledger</h2>

        {ledger.length === 0 ? (
          <p style={styles.empty}>No credit ledger entries.</p>
        ) : (
          <div style={styles.ledgerList}>
            {ledger.map((item) => (
              <div key={item.id} style={styles.ledgerItem}>
                <div>
                  <div style={styles.ledgerTitle}>
                    {item.type}{" "}
                    <span style={item.amount > 0 ? styles.plus : styles.minus}>
                      {item.amount > 0 ? "+" : ""}
                      {item.amount}
                    </span>
                  </div>

                  <div style={styles.ledgerDescription}>
                    {item.description || "No description"}
                  </div>
                </div>

                <div style={styles.ledgerMeta}>
                  <div>
                    {item.balance_before} → {item.balance_after}
                  </div>
                  <div>{formatDate(item.created_at)}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </section>
  );
}

function formatDate(value: string) {
  return new Date(value).toLocaleString();
}

const styles: Record<string, React.CSSProperties> = {
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    margin: 0,
  },
  subtitle: {
    color: "#6b7280",
    marginTop: 8,
  },
  refreshButton: {
    padding: "10px 14px",
    border: "1px solid #d1d5db",
    borderRadius: 12,
    background: "#ffffff",
    fontWeight: 700,
    cursor: "pointer",
  },
  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 18,
    marginBottom: 24,
  },
  summaryCard: {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: 20,
    padding: 24,
    boxShadow: "0 10px 25px rgba(15, 23, 42, 0.06)",
  },
  summaryLabel: {
    color: "#6b7280",
    fontWeight: 700,
    marginBottom: 8,
  },
  balance: {
    fontSize: 38,
    fontWeight: 900,
  },
  summaryHint: {
    color: "#6b7280",
    marginTop: 4,
  },
  twoColumn: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: 20,
    marginBottom: 20,
  },
  card: {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: 20,
    padding: 24,
    boxShadow: "0 10px 25px rgba(15, 23, 42, 0.06)",
  },
  cardTitle: {
    marginTop: 0,
    marginBottom: 18,
  },
  empty: {
    color: "#6b7280",
  },
  featureList: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  featureItem: {
    display: "flex",
    justifyContent: "space-between",
    padding: 12,
    background: "#f9fafb",
    borderRadius: 12,
  },
  featureCode: {
    fontWeight: 800,
    color: "#3730a3",
  },
  featureDate: {
    color: "#6b7280",
    fontSize: 13,
  },
  tableWrap: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    textAlign: "left",
    color: "#6b7280",
    borderBottom: "1px solid #e5e7eb",
    padding: "10px 8px",
    fontSize: 13,
  },
  td: {
    borderBottom: "1px solid #f3f4f6",
    padding: "12px 8px",
  },
  statusBadge: {
    background: "#ecfdf5",
    color: "#047857",
    padding: "4px 8px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 800,
  },
  ledgerList: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  ledgerItem: {
    display: "flex",
    justifyContent: "space-between",
    gap: 16,
    padding: 14,
    background: "#f9fafb",
    borderRadius: 14,
  },
  ledgerTitle: {
    fontWeight: 900,
  },
  ledgerDescription: {
    color: "#6b7280",
    marginTop: 4,
  },
  plus: {
    color: "#047857",
  },
  minus: {
    color: "#dc2626",
  },
  ledgerMeta: {
    textAlign: "right",
    color: "#6b7280",
    fontSize: 13,
    minWidth: 150,
  },
};