import { type FormEvent, useEffect, useState } from "react";

import { featuresApi } from "../api/features.api";
import type { AdminFeature } from "../types/package";

export function AdminFeaturesPage() {
  const [features, setFeatures] = useState<AdminFeature[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  async function loadFeatures() {
    setIsLoading(true);

    try {
      const data = await featuresApi.adminList();
      setFeatures(data);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreate(event: FormEvent) {
    event.preventDefault();
    setMessage("");

    try {
      await featuresApi.create({
        code,
        name,
        description,
      });

      setMessage("Feature created successfully.");
      setCode("");
      setName("");
      setDescription("");

      await loadFeatures();
    } catch {
      setMessage("Create feature failed.");
    }
  }

  async function handleToggleActive(feature: AdminFeature) {
    setMessage("");

    try {
      await featuresApi.update(feature.id, {
        is_active: !feature.is_active,
      });

      setMessage("Feature status updated.");
      await loadFeatures();
    } catch {
      setMessage("Update feature failed.");
    }
  }

  async function handleQuickRename(feature: AdminFeature) {
    setMessage("");

    try {
      await featuresApi.update(feature.id, {
        name: `${feature.name} Updated`,
      });

      setMessage("Feature updated successfully.");
      await loadFeatures();
    } catch {
      setMessage("Update feature failed.");
    }
  }

  async function handleDelete(featureId: string) {
    const confirmed = window.confirm(
      "Disable this feature? Existing packages may still reference it."
    );

    if (!confirmed) return;

    setMessage("");

    try {
      await featuresApi.delete(featureId);
      setMessage("Feature disabled successfully.");
      await loadFeatures();
    } catch {
      setMessage("Disable feature failed.");
    }
  }

  useEffect(() => {
    loadFeatures();
  }, []);

  return (
    <section>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Admin Features</h1>
          <p style={styles.subtitle}>
            Create and manage SaaS features that can be attached to packages.
          </p>
        </div>

        <button style={styles.refreshButton} onClick={loadFeatures}>
          Refresh
        </button>
      </div>

      {message && <div style={styles.message}>{message}</div>}

      <section style={styles.card}>
        <h2 style={styles.cardTitle}>Create feature</h2>

        <form onSubmit={handleCreate} style={styles.form}>
          <div style={styles.grid}>
            <label style={styles.field}>
              <span>Code</span>
              <input
                style={styles.input}
                value={code}
                onChange={(event) => setCode(event.target.value)}
                placeholder="VIDEO_EXPORT"
                required
              />
            </label>

            <label style={styles.field}>
              <span>Name</span>
              <input
                style={styles.input}
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Video Export"
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
              placeholder="Describe what this feature unlocks"
            />
          </label>

          <button style={styles.primaryButton}>Create feature</button>
        </form>
      </section>

      <section style={styles.card}>
        <h2 style={styles.cardTitle}>Features</h2>

        {isLoading ? (
          <p>Loading features...</p>
        ) : features.length === 0 ? (
          <p style={styles.empty}>No features found.</p>
        ) : (
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Code</th>
                  <th style={styles.th}>Name</th>
                  <th style={styles.th}>Description</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>

              <tbody>
                {features.map((feature) => (
                  <tr key={feature.id}>
                    <td style={styles.td}>
                      <span style={styles.codeBadge}>{feature.code}</span>
                    </td>

                    <td style={styles.td}>
                      <strong>{feature.name}</strong>
                    </td>

                    <td style={styles.td}>
                      {feature.description || "No description"}
                    </td>

                    <td style={styles.td}>
                      <span
                        style={
                          feature.is_active
                            ? styles.activeBadge
                            : styles.inactiveBadge
                        }
                      >
                        {feature.is_active ? "ACTIVE" : "INACTIVE"}
                      </span>
                    </td>

                    <td style={styles.td}>
                      <div style={styles.actions}>
                        <button
                          style={styles.secondaryButton}
                          onClick={() => handleQuickRename(feature)}
                        >
                          Quick rename
                        </button>

                        <button
                          style={styles.secondaryButton}
                          onClick={() => handleToggleActive(feature)}
                        >
                          {feature.is_active ? "Disable" : "Enable"}
                        </button>

                        <button
                          style={styles.dangerButton}
                          onClick={() => handleDelete(feature.id)}
                        >
                          Delete
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
  input: {
    padding: "12px 14px",
    borderRadius: 12,
    border: "1px solid #d1d5db",
    fontSize: 14,
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
  codeBadge: {
    background: "#eef2ff",
    color: "#3730a3",
    padding: "5px 9px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 800,
  },
  activeBadge: {
    background: "#ecfdf5",
    color: "#047857",
    padding: "5px 9px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 800,
  },
  inactiveBadge: {
    background: "#f3f4f6",
    color: "#6b7280",
    padding: "5px 9px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 800,
  },
  actions: {
    display: "flex",
    flexWrap: "wrap",
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
  empty: {
    color: "#6b7280",
  },
};