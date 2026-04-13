"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingCart,
  DollarSign,
  RefreshCw,
  Mail,
  Users,
  Leaf,
  Menu,
  X,
  ChevronLeft,
  LogOut,
} from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/pricing", label: "Pricing", icon: DollarSign },
  { href: "/admin/frequencies", label: "Frequencies", icon: RefreshCw },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/emails", label: "Email Logs", icon: Mail },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  };

  return (
    <div className="min-h-screen bg-[var(--color-stone-50)]">
      {/* Mobile header */}
      <header className="sticky top-0 z-50 bg-white border-b border-[var(--border)] lg:hidden">
        <div className="px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 rounded-lg hover:bg-[var(--color-stone-100)] transition-colors"
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <div className="flex items-center gap-2">
              <Leaf className="h-5 w-5 text-[var(--primary)]" />
              <span className="font-semibold text-sm">Admin</span>
            </div>
          </div>
          <Link
            href="/"
            className="text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] flex items-center gap-1"
          >
            <ChevronLeft className="h-3 w-3" />
            Store
          </Link>
        </div>
      </header>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="absolute left-0 top-14 bottom-0 w-64 bg-white border-r border-[var(--border)] p-4 flex flex-col">
            <nav className="space-y-1 flex-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                      active
                        ? "bg-[var(--color-emerald-50)] text-[var(--primary)] font-medium"
                        : "text-[var(--color-stone-600)] hover:bg-[var(--color-stone-100)]"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="w-full text-xs mt-4"
            >
              <LogOut className="h-3 w-3 mr-1" />
              Sign Out
            </Button>
          </aside>
        </div>
      )}

      <div className="flex">
        {/* Desktop sidebar */}
        <aside className="hidden lg:flex flex-col w-60 min-h-[calc(100vh-0px)] bg-white border-r border-[var(--border)] p-4 sticky top-0">
          <div className="flex items-center gap-2 px-3 py-3 mb-4">
            <Leaf className="h-5 w-5 text-[var(--primary)]" />
            <span className="font-semibold text-sm">Berkala</span>
          </div>
          <nav className="space-y-1 flex-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    active
                      ? "bg-[var(--color-emerald-50)] text-[var(--primary)] font-medium"
                      : "text-[var(--color-stone-600)] hover:bg-[var(--color-stone-100)]"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="space-y-2">
            <Link href="/">
              <Button variant="outline" className="w-full text-xs" size="sm">
                <ChevronLeft className="h-3 w-3 mr-1" />
                Back to Store
              </Button>
            </Link>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full text-xs"
              size="sm"
            >
              <LogOut className="h-3 w-3 mr-1" />
              Sign Out
            </Button>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-h-screen">{children}</main>
      </div>
    </div>
  );
}
