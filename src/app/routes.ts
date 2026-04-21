import { createBrowserRouter } from "react-router";
import Root from "./Root";
import Home from "./pages/Home";
import FeaturesPage from "./pages/FeaturesPage";
import MarketRatesPage from "./pages/MarketRatesPage";
import GovernmentSchemesPage from "./pages/GovernmentSchemesPage";
import { BidModalExample } from "./components/dashboard/BidModalExample";
import EscrowDemoPage from "./pages/EscrowDemoPage";
import AdminDashboard from "./pages/AdminDashboard";
import AdminLogin from "./pages/AdminLogin";
import { ResetPasswordPage } from "./pages/ResetPasswordPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Home },
      { path: "features", Component: FeaturesPage },
      { path: "market-rates", Component: MarketRatesPage },
      { path: "government-schemes", Component: GovernmentSchemesPage },
      { path: "bid-demo", Component: BidModalExample },
      { path: "escrow-demo", Component: EscrowDemoPage },
    ],
  },
  // Password reset page (separate from main layout - no header/footer)
  {
    path: "/reset-password",
    Component: ResetPasswordPage,
  },
  // Admin routes (separate from main layout - no header/footer)
  {
    path: "/admin",
    Component: AdminLogin,
  },
  {
    path: "/admin/dashboard",
    Component: AdminDashboard,
  },
]);