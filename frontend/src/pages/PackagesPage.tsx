import { type FormEvent, useEffect, useState } from "react";

import { packagesApi } from "../api/packages.api";
import { purchasesApi } from "../api/purchases.api";
import type { Package } from "../types/package";
import { useAuthStore } from "../stores/auth.store";

type CheckoutForm = {
  cardholder_name: string;
  card_number: string;
  expiry_month: string;
  expiry_year: string;
  cvv: string;
  billing_email: string;
};

export function PackagesPage() {
  const user = useAuthStore((state) => state.user);

  const [packages, setPackages] = useState<Package[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [buyingId, setBuyingId] = useState<string | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [message, setMessage] = useState("");

  const [checkoutForm, setCheckoutForm] = useState<CheckoutForm>({
    cardholder_name: "",
    card_number: "",
    expiry_month: "",
    expiry_year: "",
    cvv: "",
    billing_email: "",
  });

  async function loadPackages() {
    setIsLoading(true);

    try {
      const data = await packagesApi.list();
      setPackages(data);
    } finally {
      setIsLoading(false);
    }
  }

  function openCheckout(item: Package) {
    setSelectedPackage(item);
    setMessage("");

    setCheckoutForm({
      cardholder_name: "",
      card_number: "",
      expiry_month: "",
      expiry_year: "",
      cvv: "",
      billing_email: user?.email || "",
    });
  }

  function closeCheckout() {
    setSelectedPackage(null);
  }

  async function handleConfirmPurchase(event: FormEvent) {
    event.preventDefault();

    if (!selectedPackage) return;

    setBuyingId(selectedPackage.id);
    setMessage("");

    try {
      const result = await purchasesApi.purchase(selectedPackage.id, checkoutForm);

      setMessage(
        `Purchased ${result.package_name}. Balance: ${result.balance_after} credits.`
      );

      setSelectedPackage(null);
    } catch {
      setMessage("Payment failed. Please check your fake card information.");
    } finally {
      setBuyingId(null);
    }
  }

  function updateCheckoutField(field: keyof CheckoutForm, value: string) {
    setCheckoutForm((current) => ({
      ...current,
      [field]: value,
    }));
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
            Choose a package, enter fake payment details, and unlock features.
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

              <button style={styles.buyButton} onClick={() => openCheckout(item)}>
                Checkout
              </button>
            </article>
          ))}
        </div>
      )}

      {selectedPackage && (
        <div style={styles.modalBackdrop}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <div>
                <h2 style={styles.modalTitle}>Checkout</h2>
                <p style={styles.modalSubtitle}>
                  Buying <strong>{selectedPackage.name}</strong> for $
                  {selectedPackage.price}
                </p>
              </div>

              <button style={styles.closeButton} onClick={closeCheckout}>
                ×
              </button>
            </div>

            <form onSubmit={handleConfirmPurchase} style={styles.form}>
              <label style={styles.field}>
                <span>Cardholder name</span>
                <input
                  style={styles.input}
                  value={checkoutForm.cardholder_name}
                  onChange={(event) =>
                    updateCheckoutField("cardholder_name", event.target.value)
                  }
                  placeholder="Your name as it appears on the card"
                  required
                />
              </label>

              <label style={styles.field}>
                <span>Card number</span>
                <input
                  style={styles.input}
                  value={checkoutForm.card_number}
                  onChange={(event) =>
                    updateCheckoutField("card_number", event.target.value)
                  }
                  placeholder="1234 1234 1234 1234"
                  required
                />
              </label>

              <div style={styles.formGrid}>
                <label style={styles.field}>
                  <span>Expiry month</span>
                  <input
                    style={styles.input}
                    value={checkoutForm.expiry_month}
                    onChange={(event) =>
                      updateCheckoutField("expiry_month", event.target.value)
                    }
                    placeholder="12"
                    required
                  />
                </label>

                <label style={styles.field}>
                  <span>Expiry year</span>
                  <input
                    style={styles.input}
                    value={checkoutForm.expiry_year}
                    onChange={(event) =>
                      updateCheckoutField("expiry_year", event.target.value)
                    }
                    placeholder="2030"
                    required
                  />
                </label>

                <label style={{ ...styles.field, maxWidth: 120 }}>
                  <span>CVV</span>
                  <input
                    style={styles.input}
                    value={checkoutForm.cvv}
                    onChange={(event) =>
                      updateCheckoutField("cvv", event.target.value)
                    }
                    placeholder="123"
                    required
                  />
                </label>
              </div>

              <label style={styles.field}>
                <span>Billing email</span>
                <input
                  style={styles.input}
                  value={checkoutForm.billing_email}
                  onChange={(event) =>
                    updateCheckoutField("billing_email", event.target.value)
                  }
                  placeholder="buyer@example.com"
                  required
                />
              </label>

              <button
                style={styles.payButton}
                disabled={buyingId === selectedPackage.id}
              >
                {buyingId === selectedPackage.id
                  ? "Processing payment..."
                  : `Pay $${selectedPackage.price}`}
              </button>
            </form>
          </div>
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
  modalBackdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(15, 23, 42, 0.55)",
    display: "grid",
    placeItems: "center",
    padding: 24,
    zIndex: 50,
  },
  modal: {
    width: "min(560px, 100%)",
    background: "#ffffff",
    borderRadius: 24,
    padding: 28,
    boxShadow: "0 30px 80px rgba(0,0,0,0.25)",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: 16,
    marginBottom: 20,
  },
  modalTitle: {
    margin: 0,
    fontSize: 28,
  },
  modalSubtitle: {
    color: "#6b7280",
    marginBottom: 0,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 999,
    border: "1px solid #e5e7eb",
    background: "#ffffff",
    fontSize: 24,
    cursor: "pointer",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 14,
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: 12,
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: 7,
    fontWeight: 700,
  },
  input: {
    padding: "12px 14px",
    borderRadius: 12,
    border: "1px solid #d1d5db",
    fontSize: 14,
  },
  fakeNotice: {
    background: "#fffbeb",
    color: "#92400e",
    border: "1px solid #fde68a",
    padding: 12,
    borderRadius: 12,
    fontWeight: 700,
    fontSize: 13,
  },
  payButton: {
    padding: "13px 16px",
    borderRadius: 14,
    border: "none",
    background: "#4f46e5",
    color: "#ffffff",
    fontWeight: 900,
    cursor: "pointer",
  },
};