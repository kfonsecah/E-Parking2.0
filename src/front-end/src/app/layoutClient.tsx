"use client";

import React, { useState } from "react";
import "@/app/css/globals.css";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { UserProvider } from "@/context/UserContext";
import { SessionProvider } from "next-auth/react";
import GlobalLoader from "@/components/GlobalLoader";
import { LoaderProvider } from "@/context/LoaderContext";
import ClientOnly from "@/components/ClientOnly";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Modal from "@/components/ui/Modal";
import { useSessionMonitor } from "@/app/hooks/useSessionMonitor";
import { NotificationProvider } from "@/components/NotificationProvider";
import { NotificationPopup } from "@/components/NotificationPopup";
import Head from "next/head";

const queryClient = new QueryClient();

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const toggleSidebar = () => setIsSidebarCollapsed((prev) => !prev);

  // ⏱️ Hook para sesión inactiva
  const { sessionExpired, handleCloseModal } = useSessionMonitor();

  // Rutas sin barra lateral ni notificaciones
  const isAuthRoute =
    pathname === "/auth" ||
    pathname === "/" ||
    pathname === "/password/sending" ||
    pathname === "/password/recovery" ||
    pathname === "/api/docs";

  return (
    <>
      
        <SessionProvider>
          <UserProvider>
            <LoaderProvider>
              <QueryClientProvider client={queryClient}>
                <NotificationProvider>
                  <ClientOnly>
                    <GlobalLoader />

                    {/* Modal de sesión expirada */}
                    <Modal
                      isOpen={sessionExpired}
                      onClose={handleCloseModal}
                      message="Tu sesión ha expirado por inactividad. Serás redirigido al inicio de sesión."
                    />

                    {/* Notificaciones globales */}
                    {!isAuthRoute && <NotificationPopup />}

                    {isAuthRoute ? (
                      children
                    ) : (
                      <div className="flex flex-col h-screen">
                        <div className="flex flex-grow overflow-hidden">
                          <Sidebar
                            isCollapsed={isSidebarCollapsed}
                            toggleSidebar={toggleSidebar}
                          />
                          <main
                            className={`flex-grow p-4 overflow-auto transition-all duration-300 
                            ${isSidebarCollapsed ? "md:ml-20" : "md:ml-80"} ml-0
                            pt-16 md:pt-4
                          `}
                          >
                            {children}
                          </main>
                        </div>
                      </div>
                    )}
                  </ClientOnly>
                </NotificationProvider>
              </QueryClientProvider>
            </LoaderProvider>
          </UserProvider>
        </SessionProvider>
    </>
  );
};

export default Layout;
