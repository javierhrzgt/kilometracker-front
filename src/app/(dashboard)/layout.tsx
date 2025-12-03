"use client";

import { useState } from "react";
import { UserProvider } from "@/contexts/UserContext";
import { SidebarProvider } from "@/contexts/SidebarContext";
import { VehicleProvider } from "@/contexts/VehicleContext";
import { Sidebar } from "@/components/navigation/Sidebar";
import { SidebarDrawer } from "@/components/navigation/SidebarDrawer";
import { BottomNav } from "@/components/navigation/BottomNav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <UserProvider>
      <SidebarProvider>
        <VehicleProvider>
          <div className="flex h-screen overflow-hidden bg-background">
            {/* Desktop Sidebar */}
            <Sidebar className="hidden md:flex" />

            {/* Mobile Drawer */}
            <SidebarDrawer
              isOpen={drawerOpen}
              onClose={() => setDrawerOpen(false)}
            />

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
              {children}
            </main>

            {/* Mobile Bottom Navigation */}
            <BottomNav onMenuClick={() => setDrawerOpen(true)} />
          </div>
        </VehicleProvider>
      </SidebarProvider>
    </UserProvider>
  );
}
