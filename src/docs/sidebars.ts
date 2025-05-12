import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

const sidebars: SidebarsConfig = {
  tutorialSidebar: [
    {
      type: "doc",
      id: "intro", // Página de bienvenida
    },
    {
      type: "category",
      label: "Auth",
      items: ["auth/auth-index", "auth/auth-nextauth", "auth/auth-signout"],
    },
    {
      type: "category",
      label: "Cashier",
      items: [
        "cashier/cashier-index",
        "cashier/cashier-close",
        "cashier/cashier-history",
        "cashier/cashier-open",
        "cashier/cashier-open-sessions",
        "cashier/cashier-status",
        "cashier/cashier-transaction",
      ],
    },
    {
      type: "category",
      label: "Dashboard",
      items: ["dashboard/dashboard-index"],
    },
    {
      type: "category",
      label: "Information",
      items: ["information/information-index"],
    },
    {
      type: "category",
      label: "Login",
      items: ["login/login-index"],
    },
    {
      type: "category",
      label: "Notes",
      items: ["notes/notes-index"],
    },
    {
      type: "category",
      label: "Packages",
      items: ["packages/packages-index", "packages/packages-id"],
    },
    {
      type: "category",
      label: "Plate Recognition",
      items: ["recognize-plates/recognize-plates-index"],
    },
    {
      type: "category",
      label: "Reports",
      items: ["reports/reports-index"],
    },
    {
      type: "category",
      label: "Roles",
      items: ["roles/roles-index"],
    },
    {
      type: "category",
      label: "Assigned Roles",
      items: ["roles-assigned/roles-assigned-index"],
    },
    {
      type: "category",
      label: "Session",
      items: [
        "session/session-index",
        "session/session-status",
        "session/session-validate",
      ],
    },
    {
      type: "category",
      label: "Tax",
      items: ["tax/tax-index"],
    },
    {
      type: "category",
      label: "Telegram",
      items: ["telegram/telegram-index"],
    },
    {
      type: "category",
      label: "Users",
      items: ["users/users-index", "users/users-id", "users/users-assign-role"],
    },
    {
      type: "category",
      label: "Vehicles",
      items: [
        "vehicles/vehicles-index",
        "vehicles/vehicles-id",
        "vehicles/vehicles-exits",
      ],
    },
    {
      type: "doc",
      id: "outro", // Página de despedida
    },
  ],
};

export default sidebars;
