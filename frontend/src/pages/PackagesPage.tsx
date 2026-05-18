import { useEffect, useState } from "react";

import { packagesApi } from "../api/packages.api";
import { purchasesApi } from "../api/purchases.api";
import type { Package } from "../types/package";

export function PackagesPage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [buyingId, setBuyingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  async function loadPackages() {
    setIsLoading(true);

    try {
      const data = await packagesApi.list();
      setPackages(data);
    } finally {
      setIsLoading(false);
    }
  }

  async function handlePurchase(packageId: string) {
    setBuyingId(packageId);
    setMessage("");

    try {
      const result = await purchasesApi.purchase(packageId);
      setMessage(
        `Purchased ${result.package_name}. Balance: ${result.balance_after} credits.`
      );
    } catch {
      setMessage("Purchase failed.");
    } finally {
      setBuyingId(null);
    }
  }

  useEffect(() => {
    loadPackages();
  }, []);

  return (
    <section>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Credit Packages</h1>
          <p style={styles.subtitle}>
            Choose a package to add credits and unlock features.
          </p>
        </div>
      </div>

      {message && <div style={styles.message}>{message}</div>}

      {isLoading ? (
        <p>Loading packages...</p>
      ) : (
        <div style={styles.grid}>
          {packages.map((item) => (
            <article key={item.id} style={styles.card}>
              <div>
                <h2 style={styles.packageName}>{item.name}</h2>
                <p style={styles.description}>{item.description}</p>
              </div>

              <div style={styles.priceRow}>
                <span style={styles.price}>${item.price}</span>
                <span style={styles.credits}>{item.credits} credits</span>
              </div>

              <div style={styles.features}>
                {item.features.map((feature) => (
                  <span key={feature.id} style={styles.featureBadge}>
                    {feature.name}
                  </span>
                ))}
              </div>

              <button
                style={styles.buyButton}
                onClick={() => handlePurchase(item.id)}
                disabled={buyingId === item.id}
              >
                {buyingId === item.id ? "Processing..." : "Buy package"}
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

const styles: Record<string, React.CSSProperties> = {
  header: {
    display: "flex",
    justifyContent: "space-between",
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
  message: {
    background: "#ecfdf5",
    color: "#047857",
    border: "1px solid #a7f3d0",
    padding: 14,
    borderRadius: 12,
    marginBottom: 20,
    fontWeight: 600,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: 20,
  },
  card: {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: 20,
    padding: 24,
    display: "flex",
    flexDirection: "column",
    gap: 20,
    boxShadow: "0 10px 25px rgba(15, 23, 42, 0.06)",
  },
  packageName: {
    fontSize: 24,
    margin: 0,
  },
  description: {
    color: "#6b7280",
    minHeight: 44,
  },
  priceRow: {
    display: "flex",
    alignItems: "baseline",
    justifyContent: "space-between",
  },
  price: {
    fontSize: 32,
    fontWeight: 800,
  },
  credits: {
    color: "#4f46e5",
    fontWeight: 700,
  },
  features: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
  },
  featureBadge: {
    background: "#eef2ff",
    color: "#3730a3",
    padding: "6px 10px",
    borderRadius: 999,
    fontSize: 13,
    fontWeight: 600,
  },
  buyButton: {
    marginTop: "auto",
    padding: "12px 14px",
    borderRadius: 12,
    border: "none",
    background: "#111827",
    color: "#ffffff",
    fontWeight: 800,
    cursor: "pointer",
  },
};