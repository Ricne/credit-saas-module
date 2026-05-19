import { type FormEvent, useEffect, useState } from "react";

import { featuresApi } from "../api/features.api";
import { packagesApi } from "../api/packages.api";
import type { AdminFeature, Package } from "../types/package";

export function AdminPackagesPage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [availableFeatures, setAvailableFeatures] = useState<AdminFeature[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(9.99);
  const [credits, setCredits] = useState(100);
  const [featureCodes, setFeatureCodes] = useState<string[]>([]);

  async function loadPackages() {
    const data = await packagesApi.list();
    setPackages(data);
  }

  async function loadAvailableFeatures() {
    const data = await featuresApi.adminList();
    const activeFeatures = data.filter((feature) => feature.is_active);

    setAvailableFeatures(activeFeatures);

    if (featureCodes.length === 0 && activeFeatures.length > 0) {
      setFeatureCodes([activeFeatures[0].code]);
    }
  }

  async function loadData() {
    setIsLoading(true);

    try {
      await Promise.all([loadPackages(), loadAvailableFeatures()]);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreate(event: FormEvent) {
    event.preventDefault();
    setMessage("");

    if (featureCodes.length === 0) {
      setMessage("Please select at least one active feature.");
      return;
    }

    try {
      await packagesApi.create({
        name,
        description,
        price,
        credits,
        feature_codes: featureCodes,
      });

      setMessage("Package created successfully.");
      setName("");
      setDescription("");
      setPrice(9.99);
      setCredits(100);
      setFeatureCodes(
        availableFeatures.length > 0 ? [availableFeatures[0].code] : []
      );

      await loadData();
    } catch {
      setMessage("Create package failed.");
    }
  }

  async function handleQuickUpdate(item: Package) {
    setMessage("");

    try {
      await packagesApi.update(item.id, {
        name: `${item.name}_UPDATED`,
        price: Number(item.price) + 10,
        credits: item.credits + 100,
        feature_codes: item.features.map((feature) => feature.code),
      });

      setMessage("Package updated successfully.");
      await loadData();
    } catch {
      setMessage("Update package failed.");
    }
  }

  async function handleDelete(packageId: string) {
    const confirmed = window.confirm("Archive this package?");

    if (!confirmed) return;

    setMessage("");

    try {
      await packagesApi.delete(packageId);
      setMessage("Package archived successfully.");
      await loadData();
    } catch {
      setMessage("Delete package failed.");
    }
  }

  function toggleFeature(code: string) {
    setFeatureCodes((current) =>
      current.includes(code)
        ? current.filter((item) => item !== code)
        : [...current, code]
    );
  }

  useEffect(() => {
    loadData();
  }, []);

  return (
    <section>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Admin Packages</h1>
          <p style={styles.subtitle}>
            Create, update, and archive credit packages.
          </p>
        </div>

        <button style={styles.refreshButton} onClick={loadData}>
          Refresh
        </button>
      </div>

      {message && <div style={styles.message}>{message}</div>}

      <section style={styles.card}>
        <h2 style={styles.cardTitle}>Create package</h2>

        <form onSubmit={handleCreate} style={styles.form}>
          <div style={styles.grid}>
            <label style={styles.field}>
              <span>Name</span>
              <input
                style={styles.input}
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="STARTER_PLUS"
                required
              />
            </label>

            <label style={styles.field}>
              <span>Price</span>
              <input
                style={styles.input}
                type="number"
                step="0.01"
                value={price}
                onChange={(event) => setPrice(Number(event.target.value))}
                required
              />
            </label>

            <label style={styles.field}>
              <span>Credits</span>
              <input
                style={styles.input}
                type="number"
                value={credits}
                onChange={(event) => setCredits(Number(event.target.value))}
                required
              />
            </label>
          </div>

          <label style={styles.field}>
            <span>Description</span>
            <textarea
              style={{ ...styles.input, minHeight: 80 }}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Package description"
            />
          </label>

          <div>
            <div style={styles.label}>Features</div>

            {availableFeatures.length === 0 ? (
              <p style={styles.empty}>
                No active features found. Create or enable a feature first.
              </p>
            ) : (
              <div style={styles.featureOptions}>
                {availableFeatures.map((feature) => (
                  <button
                    key={feature.id}
                    type="button"
                    style={{
                      ...styles.featureOption,
                      ...(featureCodes.includes(feature.code)
                        ? styles.featureOptionActive
                        : {}),
                    }}
                    onClick={() => toggleFeature(feature.code)}
                  >
                    {feature.code}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button style={styles.primaryButton}>Create package</button>
        </form>
      </section>

      <section style={styles.card}>
        <h2 style={styles.cardTitle}>Active packages</h2>

        {isLoading ? (
          <p>Loading packages...</p>
        ) : (
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Name</th>
                  <th style={styles.th}>Price</th>
                  <th style={styles.th}>Credits</th>
                  <th style={styles.th}>Features</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>

              <tbody>
                {packages.map((item) => (
                  <tr key={item.id}>
                    <td style={styles.td}>
                      <strong>{item.name}</strong>
                    </td>

                    <td style={styles.td}>${item.price}</td>

                    <td style={styles.td}>{item.credits}</td>

                    <td style={styles.td}>
                      <div style={styles.badges}>
                        {item.features.map((feature) => (
                          <span key={feature.id} style={styles.badge}>
                            {feature.code}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td style={styles.td}>
                      <div style={styles.actions}>
                        <button
                          style={styles.secondaryButton}
                          onClick={() => handleQuickUpdate(item)}
                        >
                          Quick update
                        </button>

                        <button
                          style={styles.dangerButton}
                          onClick={() => handleDelete(item.id)}
                        >
                          Archive
                        </button>
                      </div>
                    </td>
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
  message: {
    background: "#eff6ff",
    color: "#1d4ed8",
    border: "1px solid #bfdbfe",
    padding: 14,
    borderRadius: 12,
    marginBottom: 20,
    fontWeight: 700,
  },
  card: {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    boxShadow: "0 10px 25px rgba(15, 23, 42, 0.06)",
  },
  cardTitle: {
    marginTop: 0,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 16,
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    fontWeight: 700,
  },
  label: {
    fontWeight: 700,
    marginBottom: 8,
  },
  input: {
    padding: "12px 14px",
    borderRadius: 12,
    border: "1px solid #d1d5db",
    fontSize: 14,
  },
  empty: {
    color: "#6b7280",
  },
  featureOptions: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
  },
  featureOption: {
    border: "1px solid #d1d5db",
    background: "#ffffff",
    padding: "8px 12px",
    borderRadius: 999,
    cursor: "pointer",
    fontWeight: 700,
  },
  featureOptionActive: {
    background: "#111827",
    color: "#ffffff",
    borderColor: "#111827",
  },
  primaryButton: {
    padding: "12px 14px",
    borderRadius: 12,
    border: "none",
    background: "#111827",
    color: "#ffffff",
    fontWeight: 800,
    cursor: "pointer",
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
    padding: "14px 8px",
    verticalAlign: "top",
  },
  badges: {
    display: "flex",
    flexWrap: "wrap",
    gap: 6,
  },
  badge: {
    background: "#eef2ff",
    color: "#3730a3",
    padding: "4px 8px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 800,
  },
  actions: {
    display: "flex",
    gap: 8,
  },
  secondaryButton: {
    padding: "8px 10px",
    borderRadius: 10,
    border: "1px solid #d1d5db",
    background: "#ffffff",
    cursor: "pointer",
    fontWeight: 700,
  },
  dangerButton: {
    padding: "8px 10px",
    borderRadius: 10,
    border: "none",
    background: "#ef4444",
    color: "#ffffff",
    cursor: "pointer",
    fontWeight: 700,
  },
};