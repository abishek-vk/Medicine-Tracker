import React from "react";
import { Link, useLocation } from "wouter";
import { Pill, LayoutDashboard, FileText, ScanBarcode, LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
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
        <div className="border-t p-4 space-y-2">
          <p className="text-sm font-medium truncate">{user?.name}</p>
          <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
            onClick={() => { logout(); }}
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
