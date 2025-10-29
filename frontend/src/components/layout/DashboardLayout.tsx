import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { BottomNav } from "./BottomNav";

interface DashboardLayoutProps {
  children: ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <div className="min-h-screen flex w-full bg-background/95">
      <Sidebar />
      <main className="flex-1 md:ml-64 pb-20 md:pb-0 w-full">
        <div className="h-full px-4 py-6 md:px-6 lg:px-8 xl:px-10 overflow-y-auto">
          {children}
        </div>
      </main>
      <BottomNav />
    </div>
  );
};
