import { Truck, RefreshCw, Shield, Leaf, Check, Star } from "lucide-react";
import { Card } from "@/components/ui/card";

export function TrustBar() {
  return (
    <section className="border-y border-[var(--border)] bg-white">
      <div className="max-w-6xl mx-auto px-5 py-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Leaf, text: "100% Organic" },
            { icon: Truck, text: "Free Delivery" },
            { icon: RefreshCw, text: "Flexible Schedule" },
            { icon: Shield, text: "Secure Payment" },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-2.5 justify-center">
              <Icon className="h-4 w-4 text-[var(--primary)] shrink-0" />
              <span className="text-xs font-medium text-[var(--foreground)]">{text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="bg-white border-y border-[var(--border)]"
    >
      <div className="max-w-6xl mx-auto px-5 py-14 md:py-20">
        <div className="text-center mb-10">
          <div className="heading-label mb-2">Simple & convenient</div>
          <h2 className="heading-display text-2xl md:text-3xl text-[var(--foreground)]">
            How it works
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              step: "01",
              title: "Choose Your Box",
              desc: "Pick from our curated selection of organic harvest boxes sized for your household.",
            },
            {
              step: "02",
              title: "Set Your Schedule",
              desc: "Order once or subscribe for automatic deliveries — weekly, monthly, or your preference.",
            },
            {
              step: "03",
              title: "Enjoy Fresh Produce",
              desc: "We deliver farm-fresh vegetables to your door. Cancel or pause anytime.",
            },
          ].map((item) => (
            <div key={item.step} className="text-center md:text-left">
              <div className="text-3xl font-bold text-[var(--color-emerald-200)] mb-3">
                {item.step}
              </div>
              <h3 className="font-semibold text-base mb-2">{item.title}</h3>
              <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function OrderTypes() {
  return (
    <section className="max-w-6xl mx-auto px-5 py-14 md:py-20">
      <div className="text-center mb-10">
        <div className="heading-label mb-2">Flexible options</div>
        <h2 className="heading-display text-2xl md:text-3xl text-[var(--foreground)]">
          One-time or subscription
        </h2>
      </div>
      <div className="grid md:grid-cols-2 gap-5">
        <Card className="p-6 hover:shadow-md transition-shadow">
          <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[var(--color-stone-100)] flex items-center justify-center">
              <Star className="h-4 w-4 text-[var(--color-stone-500)]" />
            </div>
            One-Time Order
          </h3>
          <p className="text-sm text-[var(--muted-foreground)] mb-4 leading-relaxed">
            Try our harvest box without commitment. Perfect for first-time customers.
          </p>
          <ul className="space-y-2">
            {["No commitment required", "Multiple payment options", "Standard delivery"].map(
              (item) => (
                <li key={item} className="flex items-center gap-2 text-sm">
                  <Check className="h-3.5 w-3.5 text-[var(--primary)]" />
                  {item}
                </li>
              )
            )}
          </ul>
        </Card>
        <Card className="p-6 ring-2 ring-[var(--primary)] hover:shadow-md transition-shadow relative">
          <div className="absolute -top-3 left-4 px-3 py-0.5 bg-[var(--primary)] text-white text-[10px] font-semibold tracking-wider uppercase rounded-full">
            Recommended
          </div>
          <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[var(--color-emerald-50)] flex items-center justify-center">
              <RefreshCw className="h-4 w-4 text-[var(--primary)]" />
            </div>
            Subscription
          </h3>
          <p className="text-sm text-[var(--muted-foreground)] mb-4 leading-relaxed">
            Set it and forget it. Fresh produce delivered automatically on your preferred schedule.
          </p>
          <ul className="space-y-2">
            {[
              "Automatic recurring delivery",
              "Never run out of fresh produce",
              "Pause or cancel anytime",
              "Priority delivery slot",
            ].map((item) => (
              <li key={item} className="flex items-center gap-2 text-sm">
                <Check className="h-3.5 w-3.5 text-[var(--primary)]" />
                {item}
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </section>
  );
}

export function PaymentTrust() {
  return (
    <section className="bg-[var(--color-emerald-900)] text-white">
      <div className="max-w-6xl mx-auto px-5 py-14 md:py-20">
        <div className="text-center mb-10">
          <div className="text-[10px] font-semibold tracking-[0.15em] uppercase text-[var(--color-emerald-200)] mb-2">
            Secure & trustworthy
          </div>
          <h2 className="heading-display text-2xl md:text-3xl text-white">
            Payment you can trust
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            {
              title: "Bank Transfer",
              desc: "BCA, BNI, Mandiri & more",
            },
            {
              title: "Credit Card",
              desc: "Visa, Mastercard, JCB",
            },
            {
              title: "E-Wallet",
              desc: "OVO, GoPay, ShopeePay",
            },
            {
              title: "Direct Debit",
              desc: "Automatic billing",
            },
          ].map((method) => (
            <div key={method.title} className="text-center">
              <div className="w-12 h-12 mx-auto rounded-xl bg-white/10 flex items-center justify-center mb-3">
                <Shield className="h-5 w-5 text-[var(--color-emerald-200)]" />
              </div>
              <div className="font-medium text-sm mb-0.5">{method.title}</div>
              <div className="text-xs text-[var(--color-emerald-200)] opacity-80">
                {method.desc}
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-10">
          <p className="text-xs text-[var(--color-emerald-200)] opacity-70 max-w-md mx-auto">
            All payments are processed securely through Xendit, Indonesia&apos;s leading payment
            platform. Your data is encrypted and protected.
          </p>
        </div>
      </div>
    </section>
  );
}
