import { useEffect, useState } from "react";

import { purchasesApi } from "../api/purchases.api";
import type { PurchaseHistoryItem } from "../types/wallet";

export function TransactionsPage() {
  const [history, setHistory] = useState<PurchaseHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  async function loadHistory() {
    setIsLoading(true);

    try {
      const data = await purchasesApi.history();
      setHistory(data);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadHistory();
  }, []);

  return (
    <section>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Transactions</h1>
          <p style={styles.subtitle}>
            Review all package purchases and fake payment records.
          </p>
        </div>

        <button style={styles.refreshButton} onClick={loadHistory}>
          Refresh
        </button>
      </div>

      <section style={styles.card}>
        {isLoading ? (
          <p>Loading transactions...</p>
        ) : history.length === 0 ? (
          <div style={styles.emptyBox}>
            <h2>No transactions yet</h2>
            <p>Buy a package to see your purchase history here.</p>
          </div>
        ) : (
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Package</th>
                  <th style={styles.th}>Amount</th>
                  <th style={styles.th}>Credits</th>
                  <th style={styles.th}>Payment</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Date</th>
                </tr>
              </thead>

              <tbody>
                {history.map((item) => (
                  <tr key={item.id}>
                    <td style={styles.td}>
                      <strong>{item.package_name}</strong>
                    </td>

                    <td style={styles.td}>${item.amount}</td>

                    <td style={styles.td}>
                      <span style={styles.creditBadge}>
                        +{item.credits_added}
                      </span>
                    </td>

                    <td style={styles.td}>{item.payment_method}</td>

                    <td style={styles.td}>
                      <span style={styles.statusBadge}>{item.status}</span>
                    </td>

                    <td style={styles.td}>{formatDate(item.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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
  card: {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: 20,
    padding: 24,
    boxShadow: "0 10px 25px rgba(15, 23, 42, 0.06)",
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
    padding: "12px 10px",
    fontSize: 13,
  },
  td: {
    borderBottom: "1px solid #f3f4f6",
    padding: "14px 10px",
  },
  creditBadge: {
    background: "#ecfdf5",
    color: "#047857",
    padding: "5px 9px",
    borderRadius: 999,
    fontWeight: 800,
    fontSize: 13,
  },
  statusBadge: {
    background: "#eef2ff",
    color: "#3730a3",
    padding: "5px 9px",
    borderRadius: 999,
    fontWeight: 800,
    fontSize: 13,
  },
  emptyBox: {
    textAlign: "center",
    padding: 48,
    color: "#6b7280",
  },
};