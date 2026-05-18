import { Link, useNavigate } from "react-router-dom";

import { useAuthStore } from "../stores/auth.store";

function App() {
  const navigate = useNavigate();

  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>Credit SaaS</h1>

      <nav style={{ display: "flex", gap: 12, marginBottom: 24 }}>
        <Link to="/">Home</Link>
        <Link to="/packages">Packages</Link>
        <Link to="/wallet">Wallet</Link>
      </nav>

      <p>Frontend is running.</p>

      {user && (
        <div>
          <p>
            Logged in as <strong>{user.email}</strong> ({user.role})
          </p>

          <button onClick={handleLogout}>Logout</button>
        </div>
      )}
    </main>
  );
}

export default App;