import { createBrowserRouter } from "react-router-dom";

import { AppLayout } from "../components/layout/AppLayout";
import { ProtectedRoute } from "../components/layout/ProtectedRoute";
import { DashboardPage } from "../pages/DashboardPage";
import { LoginPage } from "../pages/LoginPage";
import { PackagesPage } from "../pages/PackagesPage";
import { RegisterPage } from "../pages/RegisterPage";
import { WalletPage } from "../pages/WalletPage";
import { AdminPackagesPage } from "../pages/AdminPackagesPage";
import { TransactionsPage } from "../pages/TransactionsPage";
import { AdminFeaturesPage } from "../pages/AdminFeaturesPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: "packages",
        element: <PackagesPage />,
      },
      {
        path: "wallet",
        element: <WalletPage />,
      },
      {
        path: "transactions",
        element: <TransactionsPage />,
      },
      {
        path: "admin/packages",
        element: <AdminPackagesPage />,
      },
      {
        path: "admin/features",
        element: <AdminFeaturesPage />,
      },
    ],
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
]);