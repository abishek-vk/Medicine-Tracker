import React from "react";
import { Link, useLocation } from "wouter";
import { Pill, LayoutDashboard, Search, FileText, ScanBarcode } from "lucide-react";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/medicines", label: "Medicines", icon: Pill },
    { href: "/scanner", label: "Scanner", icon: ScanBarcode },
    { href: "/reports", label: "Reports", icon: FileText },
  ];

  return (
    <div className="flex min-h-screen w-full bg-background">
      <aside className="w-64 flex-col border-r bg-card flex">
        <div className="p-6">
          <div className="flex items-center gap-2 font-bold text-xl text-primary">
            <Pill className="h-6 w-6" />
            <span>MedTracker</span>
          </div>
        </div>
        <nav className="flex-1 px-4 flex flex-col gap-2">
          {navItems.map((item) => {
            const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors cursor-pointer ${
                    isActive
                      ? "bg-primary text-primary-foreground font-medium"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                  data-testid={`nav-${item.label.toLowerCase()}`}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </div>
              </Link>
            );
          })}
        </nav>
      </aside>
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
