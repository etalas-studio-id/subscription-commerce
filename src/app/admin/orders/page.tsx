"use client";

import { useState, useEffect } from "react";
import { RefreshCw, Search, Filter, ShoppingBag } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Order {
  id: string;
  orderType: string;
  frequency: string | null;
  amount: number;
  orderStatus: string;
  createdAt: string;
  customer: { name: string; email: string };
  product: { name: string };
  payments: Array<{ status: string; paymentMethod: string | null }>;
  subscription: { status: string; frequency: string } | null;
}

function formatPrice(amount: number): string {
  return `Rp ${amount.toLocaleString("id-ID")}`;
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function statusColor(status: string): string {
  const map: Record<string, string> = {
    COMPLETED: "badge-success",
    PAID: "badge-success",
    ACTIVE: "badge-success",
    SUCCESS: "badge-success",
    NEW: "badge-info",
    PROCESSING: "badge-warning",
    REQUIRES_ACTION: "badge-warning",
    PENDING: "badge-warning",
    FAILED: "badge-danger",
    CANCELLED: "badge-danger",
  };
  return map[status] || "badge-neutral";
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("ALL");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");

  useEffect(() => {
    fetch("/api/orders")
      .then((r) => r.json())
      .then((data) => {
        setOrders(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = orders.filter((order) => {
    const matchesSearch =
      !search ||
      order.customer.name.toLowerCase().includes(search.toLowerCase()) ||
      order.id.toLowerCase().includes(search.toLowerCase()) ||
      order.product.name.toLowerCase().includes(search.toLowerCase());

    const matchesType =
      filterType === "ALL" || order.orderType === filterType;

    const matchesStatus =
      filterStatus === "ALL" || order.orderStatus === filterStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="p-5 max-w-5xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="heading-display text-2xl">Orders</h1>
          <p className="text-xs text-[var(--muted-foreground)] mt-1">
            {orders.length} total orders
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
          <Input
            placeholder="Search by name, order ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10 text-sm"
          />
        </div>
        <div className="flex gap-2">
          <select
            className="h-10 px-3 border border-[var(--border)] rounded-lg text-xs bg-white"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="ALL">All Types</option>
            <option value="ONE_TIME">One-Time</option>
            <option value="SUBSCRIPTION">Subscription</option>
          </select>
          <select
            className="h-10 px-3 border border-[var(--border)] rounded-lg text-xs bg-white"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="ALL">All Status</option>
            <option value="NEW">New</option>
            <option value="PAID">Paid</option>
            <option value="PROCESSING">Processing</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders list — card layout for mobile */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton h-28 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-[var(--muted-foreground)]">
          <ShoppingBag className="h-10 w-10 mx-auto mb-3 opacity-20" />
          <p className="text-sm font-medium">No orders found</p>
          <p className="text-xs mt-1">
            {search || filterType !== "ALL" || filterStatus !== "ALL"
              ? "Try adjusting your filters"
              : "Orders will appear here once customers start buying"}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((order) => {
            const paymentStatus = order.payments[0]?.status || "PENDING";
            return (
              <Card
                key={order.id}
                className={`border-l-4 ${
                  order.orderType === "SUBSCRIPTION"
                    ? "border-l-emerald-600"
                    : "border-l-stone-300"
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="min-w-0">
                      <div className="font-medium text-sm">
                        {order.customer.name}
                      </div>
                      <div className="text-xs text-[var(--muted-foreground)] mt-0.5">
                        #{order.id.slice(-6).toUpperCase()} • {formatDate(order.createdAt)}
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-3">
                      <div className="font-bold text-sm">
                        {formatPrice(order.amount)}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge
                      variant="secondary"
                      className={`text-[10px] px-2 py-0 ${statusColor(order.orderStatus)}`}
                    >
                      {order.orderStatus}
                    </Badge>
                    <Badge
                      variant="secondary"
                      className={`text-[10px] px-2 py-0 ${
                        order.orderType === "SUBSCRIPTION"
                          ? "badge-info"
                          : "badge-neutral"
                      }`}
                    >
                      {order.orderType === "SUBSCRIPTION" ? (
                        <span className="flex items-center gap-1">
                          <RefreshCw className="h-3 w-3" />
                          {order.frequency}
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <ShoppingBag className="h-3 w-3" />
                          One-Time
                        </span>
                      )}
                    </Badge>
                    {order.subscription?.status && (
                      <Badge
                        variant="secondary"
                        className={`text-[10px] px-2 py-0 ${statusColor(
                          order.subscription.status
                        )}`}
                      >
                        Sub: {order.subscription.status}
                      </Badge>
                    )}
                    <Badge
                      variant="secondary"
                      className={`text-[10px] px-2 py-0 ${statusColor(paymentStatus)}`}
                    >
                      Pay: {paymentStatus}
                    </Badge>
                    <span className="text-[10px] text-[var(--muted-foreground)]">
                      {order.product.name}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
