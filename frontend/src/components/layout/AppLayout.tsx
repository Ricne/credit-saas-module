import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";

import { useAuthStore } from "../../stores/auth.store";

export function AppLayout() {
  const navigate = useNavigate();

  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div style={styles.page}>
      <aside style={styles.sidebar}>
        <Link to="/" style={styles.logo}>
          Credit SaaS
        </Link>

        <nav style={styles.nav}>
          <NavLink to="/" style={navStyle}>
            Dashboard
          </NavLink>

          <NavLink to="/packages" style={navStyle}>
            Packages
          </NavLink>

          <NavLink to="/wallet" style={navStyle}>
            Wallet
          </NavLink>

          <NavLink to="/transactions" style={navStyle}>
            Transactions
          </NavLink>

          {user?.role === "ADMIN" && (
            <>
              <NavLink to="/admin/packages" style={navStyle}>
                Admin Packages
              </NavLink>

              <NavLink to="/admin/features" style={navStyle}>
                Admin Features
              </NavLink>
            </>
          )}
        </nav>

        <div style={styles.userBox}>
          <div style={styles.userEmail}>{user?.email}</div>
          <div style={styles.userRole}>{user?.role}</div>

          <button style={styles.logoutButton} onClick={handleLogout}>
            Logout
          </button>
        </div>
      </aside>

      <main style={styles.content}>
        <Outlet />
      </main>
    </div>
  );
}

function navStyle({ isActive }: { isActive: boolean }) {
  return {
    ...styles.navLink,
    background: isActive ? "#111827" : "transparent",
    color: isActive ? "#ffffff" : "#374151",
  };
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    display: "flex",
    background: "#f3f4f6",
    color: "#111827",
    fontFamily:
      "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
  },
  sidebar: {
    width: 260,
    background: "#ffffff",
    borderRight: "1px solid #e5e7eb",
    padding: 24,
    display: "flex",
    flexDirection: "column",
  },
  logo: {
    fontSize: 24,
    fontWeight: 800,
    color: "#111827",
    textDecoration: "none",
    marginBottom: 32,
  },
  nav: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  navLink: {
    padding: "12px 14px",
    borderRadius: 12,
    textDecoration: "none",
    fontWeight: 600,
  },
  userBox: {
    marginTop: "auto",
    paddingTop: 24,
    borderTop: "1px solid #e5e7eb",
  },
  userEmail: {
    fontWeight: 700,
    marginBottom: 4,
  },
  userRole: {
    fontSize: 13,
    color: "#6b7280",
    marginBottom: 12,
  },
  logoutButton: {
    width: "100%",
    padding: "10px 12px",
    border: "none",
    borderRadius: 10,
    background: "#ef4444",
    color: "#ffffff",
    fontWeight: 700,
    cursor: "pointer",
  },
  content: {
    flex: 1,
    padding: 32,
  },
};