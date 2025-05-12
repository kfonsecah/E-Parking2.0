"use client";

import Link from "next/link";
import { useUser } from "@/context/UserContext";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import SidebarItem from "./SidebarItem";
import { Menu, X, ChevronsLeft, ChevronsRight } from "lucide-react";
import useIsMobile from "@/app/hooks/useIsMobile";
import { useRoleAccess } from "@/app/hooks/useRoleAccess";
import Image from "next/image";

interface SidebarProps {
  isCollapsed: boolean;
  toggleSidebar: () => void;
}



const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, toggleSidebar }) => {

  const router = useRouter(); // 👈 Imp

  const { user } = useUser();
  const { data: session } = useSession();
  const isMobile = useIsMobile();

  const name = user?.name || session?.user?.name || "Invitado";
  const email = user?.email || session?.user?.email || "Sin correo";

  const { rawRole, isFullAccess, isCashierOnly, isAssistant } = useRoleAccess();

  const showAccessMenu = isFullAccess || isCashierOnly || (isAssistant && !isMobile);

  // 🔥 Esta función se llama siempre que se navega, para cerrar en móvil
  const handleNavigate = () => {
    if (isMobile) toggleSidebar();
  };

  // 🔥 Armamos menú de administración si aplica
  const adminSubmenu = [];

  if (isFullAccess) {
    adminSubmenu.push(
      { title: "Creación de Usuarios", link: "/Admin/users", icon: "" },
      { title: "Configuración de parámetros", link: "/Admin/params", icon: "" },
      { title: "Configuración de información", link: "/Admin/info", icon: "" },
      { title: "Configuración de paquetes", link: "/Admin/packages", icon: "" }
    );
  }

  return (
    <>
      {/* Header móvil */}
      {isMobile && (
        <header className="fixed top-0 left-0 z-50 bg-white shadow-md w-full h-16 px-4 flex items-center justify-between md:hidden">
          <div className="flex items-center gap-2">
            <Image src="/media/Logo.png" alt="Logo" width={32} height={32} className="h-8 w-8 object-contain" />
            <span className="text-lg font-semibold">Park Xpress</span>
          </div>
          <button onClick={toggleSidebar}>
            {isCollapsed ? <Menu className="w-6 h-6" /> : <X className="w-6 h-6" />}
          </button>
        </header>
      )}

      {/* Sidebar */}
      {(isMobile && !isCollapsed) || !isMobile ? (
        <aside className={`fixed top-0 left-0 bg-white shadow-lg z-40 transition-all duration-300 flex flex-col ${isCollapsed ? "w-20" : "w-80"} h-full overflow-y-auto`}>
          {/* Logo Header */}
          {!isMobile && (
            <div className="flex items-center justify-between h-16 px-4 border-b">
              <div className={`flex items-center ${isCollapsed ? "justify-center w-full" : "gap-2"}`}>
                <Image src="/media/Logo.png" alt="Logo" width={40} height={40} className="h-10 w-10 object-contain" />
                {!isCollapsed && <span className="text-xl font-semibold">Park Xpress</span>}
              </div>
              <button onClick={toggleSidebar} className="text-gray-500 ml-auto">
                {isCollapsed ? <ChevronsRight className="w-5 h-5" /> : <ChevronsLeft className="w-5 h-5" />}
              </button>
            </div>
          )}

          {/* Contenido */}
          <div className="flex flex-col h-full pt-16 md:pt-0">
            <div className="flex-1 overflow-auto">
              {/* Menú principal */}
              <SidebarItem title="Página Principal" icon="/media/Dashboard.png" link="/main" isCollapsed={isCollapsed} onNavigate={handleNavigate} />

              {/* Entrada solo para asistente en móvil */}
              {isAssistant && isMobile && (
                <SidebarItem title="Entrada de Vehículos" icon="/media/Parking.png" link="/parking/entry" isCollapsed={isCollapsed} onNavigate={handleNavigate} />
              )}

              {/* Control de Acceso */}
              {showAccessMenu && (
                <SidebarItem
                  title="Control de Acceso"
                  icon="/media/Parking.png"
                  submenu={[
                    { title: "Menú Principal", link: "/parking/overview", icon: "" },
                    { title: "Parking Plots", link: "/parking/plots", icon: "" },
                    { title: "Entrada de Vehículos", link: "/parking/entry", icon: "" },
                    { title: "Caja", link: "/parking/cashier-exit", icon: "" },
                  ]}
                  isCollapsed={isCollapsed}
                  onNavigate={handleNavigate}
                />
              )}


              {/* Otros Menús */}
              <SidebarItem title="Clientes" icon="/media/Clients.png" link="/clients" isCollapsed={isCollapsed} onNavigate={handleNavigate} />
              <SidebarItem title="Historial" icon="/media/History.png" link="/history" isCollapsed={isCollapsed} onNavigate={handleNavigate} />
              <SidebarItem title="Reportes" icon="/media/Reports.png" link="/reports" isCollapsed={isCollapsed} onNavigate={handleNavigate} />

              {/* Administración de Cajas */}
              <SidebarItem
                title="Administración de Cajas"
                icon="/media/Cashier.png"
                submenu={[
                  { title: "Apertura de Caja", link: "/Admin/cashier", icon: "" },
                  { title: "Cerrar Caja", link: "/Admin/cashier/close", icon: "" },
                ]}
                isCollapsed={isCollapsed}
                onNavigate={handleNavigate}
              />

              {/* Administración del sistema */}
              {adminSubmenu.length > 0 && (
                <SidebarItem
                  title="Administración del Sistema"
                  icon="/media/Config.png"
                  submenu={adminSubmenu}
                  isCollapsed={isCollapsed}
                  onNavigate={handleNavigate}
                />
              )}
            </div>

            {/* Usuario abajo */}
            {!isCollapsed && (
              <div className="p-4 border-t border-gray-300 flex items-center gap-4 shrink-0 bg-white">
                <Image src="/media/User.png" alt="Usuario" width={40} height={40} className="w-10 h-10 rounded-full" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{name}</p>
                  <p className="text-xs text-gray-500">{rawRole}</p>
                  <p className="text-xs text-gray-500 truncate">{email}</p>
                </div>
                <button
                  onClick={async () => {
                    try {
                      // 🔒 Cierra sesión en back y borra session_id de DB
                      await fetch("/api/auth/signout", { method: "POST" });

                      // 🔐 Cierra sesión de NextAuth si aplica (usará el redirect manual)
                      await signOut({ redirect: false });

                      // 🚀 Redirige al login
                      router.push("/auth");
                    } catch (error) {
                      console.error("❌ Error cerrando sesión:", error);
                    }
                  }}
                  className="ml-auto"
                >
                  <Image src="/media/LogOut.png" alt="Cerrar sesión" width={20} height={20} />
                </button>

              </div>
            )}
          </div>
        </aside>
      ) : null}
    </>
  );
};

export default Sidebar;
