import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-emerald-50)] via-white to-[var(--color-emerald-100)]" />
      <div className="relative max-w-6xl mx-auto px-5 pt-12 pb-16 md:pt-20 md:pb-24">
        <div className="max-w-xl">
          <div className="heading-label text-[var(--primary)] mb-3">
            Farm-fresh produce subscription
          </div>
          <h1 className="heading-display text-4xl md:text-5xl lg:text-6xl text-[var(--foreground)] mb-4">
            Eat fresh,
            <br />
            <span className="text-[var(--primary)]">live well.</span>
          </h1>
          <p className="text-base md:text-lg text-[var(--muted-foreground)] mb-8 leading-relaxed max-w-md">
            Curated organic vegetables delivered from local farms to your
            doorstep. Subscribe once, enjoy fresh produce on your schedule.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/products">
              <Button
                size="lg"
                className="w-full sm:w-auto rounded-full text-sm px-8 h-12 font-medium"
              >
                Start Your Order
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <a href="#how-it-works">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto rounded-full text-sm px-8 h-12 font-medium"
              >
                Learn More
              </Button>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
