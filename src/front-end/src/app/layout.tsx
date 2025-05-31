import "./css/globals.css";
import { ReactNode } from "react";
import LayoutClient from "@/app/layoutClient"; // lo defines en el paso 2

export const metadata = {
  title: {
    default: "Park Xpress System",
    template: "%s | Park Xpress",
  },
  description:
    "Plataforma inteligente para gestión de parqueos, vencimientos y notificaciones.",
  icons: {
    icon: "/media/favicon.ico", // puede ser .ico, .png o .svg
    shortcut: "/media/favicon.ico",
    apple: "/media/favicon.ico", // si agregas este archivo
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-gray-300">
        <LayoutClient>{children}</LayoutClient>
      </body>
    </html>
  );
}
