"use client";

import { useState, useEffect } from "react";
import { Mail, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface EmailLog {
  id: string;
  recipient: string;
  subject: string;
  type: string;
  payload: string;
  sentAt: string;
}

function typeColor(type: string): string {
  const map: Record<string, string> = {
    ORDER_CONFIRMATION: "badge-success",
    SUBSCRIPTION_CREATED: "badge-info",
    PAYMENT_FAILED: "badge-danger",
    PAYMENT_REMINDER: "badge-warning",
  };
  return map[type] || "badge-neutral";
}

function typeLabel(type: string): string {
  return type.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase());
}

export default function EmailLogsPage() {
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/emails")
      .then((r) => r.json())
      .then((data) => {
        setLogs(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  function formatDate(date: string): string {
    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div className="p-5 max-w-5xl mx-auto space-y-5">
      <div>
        <h1 className="heading-display text-2xl">Email Logs</h1>
        <p className="text-xs text-[var(--muted-foreground)] mt-1">
          {logs.length} notifications sent (mock mode)
        </p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton h-20 rounded-xl" />
          ))}
        </div>
      ) : logs.length === 0 ? (
        <div className="text-center py-12">
          <Mail className="h-10 w-10 mx-auto text-[var(--muted-foreground)] opacity-40 mb-3" />
          <p className="text-sm text-[var(--muted-foreground)]">No email logs yet</p>
        </div>
      ) : (
        <Accordion className="space-y-2">
          {logs.map((log) => (
            <AccordionItem key={log.id} value={log.id} className="border-0">
              <Card>
                <AccordionTrigger className="px-4 py-3 hover:no-underline">
                  <div className="flex items-start gap-3 text-left w-full mr-3">
                    <div className="w-8 h-8 rounded-lg bg-[var(--color-stone-100)] flex items-center justify-center shrink-0 mt-0.5">
                      <Mail className="h-4 w-4 text-[var(--color-stone-500)]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-sm truncate">
                        {log.subject}
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5 mt-1">
                        <Badge
                          variant="secondary"
                          className={`text-[10px] px-1.5 py-0 ${typeColor(log.type)}`}
                        >
                          {typeLabel(log.type)}
                        </Badge>
                        <span className="text-[10px] text-[var(--muted-foreground)]">
                          → {log.recipient}
                        </span>
                        <span className="text-[10px] text-[var(--muted-foreground)]">
                          • {formatDate(log.sentAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <CardContent className="pt-0 pb-4 px-4">
                    <div className="bg-[var(--color-stone-50)] rounded-lg p-3">
                      <div className="heading-label mb-2">Payload</div>
                      <pre className="text-xs text-[var(--color-stone-600)] whitespace-pre-wrap break-all font-mono leading-relaxed">
                        {JSON.stringify(JSON.parse(log.payload), null, 2)}
                      </pre>
                    </div>
                  </CardContent>
                </AccordionContent>
              </Card>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  );
}
