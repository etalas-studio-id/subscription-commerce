"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShoppingCart, RefreshCw, DollarSign, AlertTriangle, LogOut, Leaf } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface DashboardData {
  kpis: {
    totalOrders: number;
    activeSubscriptions: number;
    totalRevenue: number;
    failedPayments: number;
  };
  recentOrders: Array<{
    id: string;
    orderType: string;
    amount: number;
    orderStatus: string;
    createdAt: string;
    customer: { name: string };
    product: { name: string };
  }>;
  recentSubscriptions: Array<{
    id: string;
    status: string;
    frequency: string;
    amount: number;
    createdAt: string;
    customer: { name: string };
    order: { product: { name: string } };
  }>;
}

function formatPrice(amount: number): string {
  return `Rp ${amount.toLocaleString("id-ID")}`;
}

function statusColor(status: string): string {
  const map: Record<string, string> = {
    COMPLETED: "badge-success",
    PAID: "badge-success",
    ACTIVE: "badge-success",
    SUCCESS: "badge-success",
    NEW: "badge-info",
    DRAFT: "badge-info",
    PROCESSING: "badge-warning",
    REQUIRES_ACTION: "badge-warning",
    PAUSED: "badge-warning",
    PENDING: "badge-warning",
    FAILED: "badge-danger",
    CANCELLED: "badge-danger",
  };
  return map[status] || "badge-neutral";
}

export default function AdminDashboard() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Auth is handled by middleware via httpOnly cookie — no client-side check needed
    setIsAuthenticated(true);

    // Fetch dashboard data
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/admin/login";
  };

  if (!isAuthenticated) {
    return null;
  }

  if (loading || !data) {
    return (
      <div className="p-5 space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="skeleton h-24 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="bg-white border-b border-[var(--border)]">
        <div className="max-w-5xl mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Leaf className="h-6 w-6 text-[var(--primary)]" />
            <h1 className="text-xl font-bold text-[var(--foreground)]">Berkala Admin</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-xs text-[var(--muted-foreground)]">
              Logged in as <span className="font-medium text-[var(--foreground)]">{username}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="text-xs h-8"
            >
              <LogOut className="h-3.5 w-3.5 mr-1.5" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="p-5 max-w-5xl mx-auto space-y-6">
        <div>
          <h2 className="heading-display text-2xl">Dashboard</h2>
          <p className="text-xs text-[var(--muted-foreground)] mt-1">
            Overview of your store performance
          </p>
        </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          {
            label: "One-Time Orders",
            value: data.kpis.totalOrders,
            icon: ShoppingCart,
            color: "text-blue-600",
            bg: "bg-blue-50",
          },
          {
            label: "Active Subscriptions",
            value: data.kpis.activeSubscriptions,
            icon: RefreshCw,
            color: "text-[var(--primary)]",
            bg: "bg-[var(--color-emerald-50)]",
          },
          {
            label: "Total Revenue",
            value: formatPrice(data.kpis.totalRevenue),
            icon: DollarSign,
            color: "text-amber-600",
            bg: "bg-amber-50",
          },
          {
            label: "Failed Payments",
            value: data.kpis.failedPayments,
            icon: AlertTriangle,
            color: "text-red-600",
            bg: "bg-red-50",
          },
        ].map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.label}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className={`w-7 h-7 rounded-lg ${kpi.bg} flex items-center justify-center`}
                  >
                    <Icon className={`h-3.5 w-3.5 ${kpi.color}`} />
                  </div>
                  <span className="text-[10px] font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
                    {kpi.label}
                  </span>
                </div>
                <div className="text-lg font-bold">{kpi.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent One-Time Orders */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-sm">Recent One-Time Orders</h2>
          <Link
            href="/admin/orders"
            className="text-xs text-[var(--primary)] hover:underline"
          >
            View all →
          </Link>
        </div>
        <div className="space-y-2">
          {data.recentOrders.length === 0 ? (
            <div className="text-center py-8 text-sm text-[var(--muted-foreground)] border border-dashed border-[var(--border)] rounded-xl">
              <ShoppingCart className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p className="font-medium">No orders yet</p>
              <p className="text-xs mt-1">Orders will appear here once customers start buying</p>
            </div>
          ) : (
            data.recentOrders.map((order) => {
              return (
                <Card key={order.id}>
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0">
                        <div className="font-medium text-sm truncate">
                          {order.customer.name}
                        </div>
                        <div className="text-xs text-[var(--muted-foreground)]">
                          {order.product.name} • #{order.id.slice(-6).toUpperCase()}
                        </div>
                      </div>
                      <div className="text-right shrink-0 ml-3">
                        <div className="text-sm font-semibold">
                          {formatPrice(order.amount)}
                        </div>
                        <div className="flex items-center gap-1.5 justify-end mt-0.5">
                          <Badge
                            variant="secondary"
                            className={`text-[10px] px-1.5 py-0 ${statusColor(order.orderStatus)}`}
                          >
                            {order.orderStatus}
                          </Badge>
                          {order.orderType === "SUBSCRIPTION" && (
                            <RefreshCw className="h-3 w-3 text-[var(--primary)]" />
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>

      {/* Recent Subscriptions */}
      <div>
        <h2 className="font-semibold text-sm mb-3">Recent Subscriptions</h2>
        <div className="space-y-2">
          {data.recentSubscriptions.length === 0 ? (
            <div className="text-center py-8 text-sm text-[var(--muted-foreground)] border border-dashed border-[var(--border)] rounded-xl">
              <RefreshCw className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p className="font-medium">No active subscriptions</p>
              <p className="text-xs mt-1">Subscriptions will appear here once customers subscribe</p>
            </div>
          ) : (
            data.recentSubscriptions.map((sub) => {
              return (
                <Card key={sub.id}>
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0">
                        <div className="font-medium text-sm truncate">
                          {sub.customer.name}
                        </div>
                        <div className="text-xs text-[var(--muted-foreground)]">
                          {sub.order.product.name} • {sub.frequency}
                        </div>
                      </div>
                      <div className="text-right shrink-0 ml-3">
                        <div className="text-sm font-semibold">
                          {formatPrice(sub.amount)}
                        </div>
                        <Badge
                          variant="secondary"
                          className={`text-[10px] px-1.5 py-0 ${statusColor(sub.status)}`}
                        >
                          {sub.status}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {[
          { label: "Manage Pricing", href: "/admin/pricing", icon: DollarSign },
          { label: "Frequency Settings", href: "/admin/frequencies", icon: RefreshCw },
          { label: "All Orders", href: "/admin/orders", icon: ShoppingCart },
        ].map((link) => {
          const Icon = link.icon;
          return (
            <Link key={link.href} href={link.href}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4 flex items-center gap-3">
                  <Icon className="h-4 w-4 text-[var(--primary)]" />
                  <span className="text-sm font-medium">{link.label}</span>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
      </div>
    </div>
  );
}
