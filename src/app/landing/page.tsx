'use client';

import Link from "next/link";
import {
  ArrowRight,
  Play,
  MessageCircle,
  Calculator,
  BarChart3,
  Globe,
  Package,
  RefreshCw,
  LayoutDashboard,
  CheckCircle2,
  Shield,
} from "lucide-react";

// ─── Palette (dark navy + green accent) ──────────────────────────────────────
// Dark bg:   #080E1D  (matches --color-blue-900)
// Green:     #22C55E
// Green dk:  #16A34A
// White bg:  #FFFFFF
// Off-white: #F8FAFC
// Text dark: #0F172A
// Muted:     #64748B
// Border:    #E2E8F0

// ─── Nav ─────────────────────────────────────────────────────────────────────

function LandingNav() {
  return (
    <nav
      className="sticky top-0 z-50 backdrop-blur-md border-b border-white/10"
      style={{ background: "rgba(8,14,29,0.92)" }}
    >
      <div className="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between">
        <Link href="/" className="font-bold text-white text-base tracking-tight">
          Berkala
        </Link>
        <div className="hidden md:flex items-center gap-7">
          <a href="#fitur"     className="text-sm text-white/60 hover:text-white transition-colors">Fitur</a>
          <a href="#harga"     className="text-sm text-white/60 hover:text-white transition-colors">Harga</a>
          <a href="#integrasi" className="text-sm text-white/60 hover:text-white transition-colors">Integrasi</a>
        </div>
        <a href="#daftar">
          <button className="bg-[#22C55E] hover:bg-[#16A34A] text-white text-sm font-semibold px-5 py-2 rounded-full transition-colors">
            Daftar Slot Pilot
          </button>
        </a>
      </div>
    </nav>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function HeroSection() {
  return (
    <section className="bg-[#080E1D]">
      {/* Main content */}
      <div className="max-w-6xl mx-auto px-5 pt-16 pb-16 text-center">
        {/* Live badge */}
        <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-4 py-1.5 mb-8">
          <span
            className="w-1.5 h-1.5 rounded-full bg-[#22C55E]"
            style={{ boxShadow: "0 0 6px #22C55E" }}
          />
          <span className="text-xs text-white/70 font-medium">
            Sekarang menerima pendaftaran pilot
          </span>
        </div>

        {/* Headline */}
        <h1 className="heading-display text-4xl md:text-5xl lg:text-6xl text-white mb-5 max-w-3xl mx-auto">
          Berhenti Kejar Setoran.<br />Fokus Besarkan Bisnis.
        </h1>

        {/* Subtext */}
        <p className="text-white/55 text-base md:text-lg max-w-xl mx-auto mb-9 leading-relaxed">
          Otomasi tagihan berulang, kurangi churn, dan kembangkan bisnis langganan Anda
          dengan infrastruktur pembayaran terpercaya Indonesia.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a href="#daftar">
            <button className="inline-flex items-center justify-center gap-2 bg-[#22C55E] hover:bg-[#16A34A] text-white font-semibold text-sm px-7 py-3 rounded-full transition-colors w-full sm:w-auto">
              Daftar Slot Pilot <ArrowRight className="h-4 w-4" />
            </button>
          </a>
          <a href="#">
            <button className="inline-flex items-center justify-center gap-2 border border-white/20 text-white/70 hover:text-white text-sm px-7 py-3 rounded-full transition-colors w-full sm:w-auto" style={{ background: "transparent" }}>
              <Play className="h-3.5 w-3.5 fill-current" /> Lihat Demo
            </button>
          </a>
        </div>
      </div>

      {/* Stats strip */}
      <div className="border-t border-white/10" style={{ background: "rgba(255,255,255,0.04)" }}>
        <div className="max-w-6xl mx-auto px-5 py-10">
          <p className="text-center text-[#22C55E] text-sm font-semibold mb-7 tracking-wide">
            Otomasi tagihan terbukti menghasilkan:
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: "+90%", label: "Penghematan waktu admin" },
              { value: "-90%", label: "Kesalahan hitung" },
              { value: "-50%", label: "Telat bayar" },
              { value: "2X",   label: "Penghasilan total per pelanggan" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-2xl md:text-3xl font-bold text-white mb-1.5">{stat.value}</div>
                <div className="text-xs text-white/40 leading-snug">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Pain Points ──────────────────────────────────────────────────────────────

const PAIN_POINTS = [
  {
    Icon: MessageCircle,
    title: "Buang Waktu",
    question: "Capek ingetin bayar lewat WhatsApp?",
    desc: "Pengingat pembayaran manual menghabiskan waktu tim Anda setiap minggu.",
  },
  {
    Icon: Calculator,
    title: "Rentan Eror",
    question: "Rekonsiliasi manual yang bikin pusing?",
    desc: "Mencocokkan pembayaran ke invoice secara manual menyebabkan error dan keterlambatan.",
  },
  {
    Icon: BarChart3,
    title: "Hasil Tidak Jelas",
    question: "Data pelanggan berantakan di Excel?",
    desc: "Data yang terpecah membuat Anda sulit memahami bisnis Anda.",
  },
];

function PainPointsSection() {
  return (
    <section className="bg-white py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-5">
        <div className="text-center mb-12">
          <h2 className="heading-display text-3xl md:text-4xl text-[#0F172A] mb-3">
            Kenal Situasi Ini?
          </h2>
          <p className="text-[#64748B] text-base">
            Proses manual ini merugikan lebih dari yang Anda kira.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {PAIN_POINTS.map(({ Icon, title, question, desc }) => (
            <div key={title} className="bg-[#080E1D] rounded-2xl p-7">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl mb-5" style={{ background: "rgba(34,197,94,0.15)" }}>
                <Icon className="h-5 w-5 text-[#22C55E]" />
              </div>
              <h3 className="font-bold text-white text-lg mb-2">{title}</h3>
              <p className="font-semibold text-white/90 text-sm mb-2">{question}</p>
              <p className="text-white/45 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Features ─────────────────────────────────────────────────────────────────

const FEATURES = [
  {
    Icon: Globe,
    title: "Website",
    desc: "Biarkan pelanggan mengelola langganan dan metode pembayaran mereka sendiri.",
  },
  {
    Icon: Package,
    title: "Pengaturan Produk",
    desc: "Atur produk yang Anda jual, baik yang sekali bayar maupun paket bulanan.",
  },
  {
    Icon: RefreshCw,
    title: "Penagihan Bulanan Otomatis",
    desc: "Setelah otorisasi pembayaran, pelanggan otomatis dipotong per bulan. Sistem kami mendukung retry apabila ada kegagalan bayar.",
  },
  {
    Icon: Calculator,
    title: "Rekonsiliasi Bulanan",
    desc: "Paket kami memungkinkan penyesuaian jumlah tagihan bulan berikutnya apabila diperlukan — misalnya diskon 1x kelas karena libur nasional.",
  },
  {
    Icon: LayoutDashboard,
    title: "Admin Dashboard",
    desc: "Lakukan penyesuaian untuk semua data pelanggan dan lihat metrik bisnis dalam satu dashboard.",
  },
];

function FeaturesSection() {
  return (
    <section id="fitur" className="bg-[#F8FAFC] py-20 md:py-28 border-t border-[#E2E8F0]">
      <div className="max-w-6xl mx-auto px-5">
        <div className="text-center mb-12">
          <h2 className="heading-display text-3xl md:text-4xl text-[#0F172A] mb-3">
            Semua yang Anda Butuhkan untuk Berkembang
          </h2>
          <p className="text-[#64748B] text-base max-w-lg mx-auto leading-relaxed">
            Tools powerful untuk mengotomasi tagihan, mengurangi churn, dan meningkatkan pendapatan.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map(({ Icon, title, desc }) => (
            <div
              key={title}
              className="bg-white rounded-2xl border border-[#E2E8F0] p-6 hover:shadow-md transition-shadow"
            >
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-[#F0FDF4] mb-4">
                <Icon className="h-5 w-5 text-[#16A34A]" />
              </div>
              <h3 className="font-semibold text-[#0F172A] text-base mb-2">{title}</h3>
              <p className="text-[#64748B] text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Xendit ───────────────────────────────────────────────────────────────────

const PAYMENT_METHODS = [
  "Transfer bank (VA)",
  "Kartu Kredit/Debit",
  "E-wallet (OVO, GoPay, Dana)",
  "Pembayaran QRIS",
];

const XENDIT_BADGES = [
  { label: "PCI-DSS", sub: "Certified" },
  { label: "BI",      sub: "Licensed"  },
  { label: "ISO",     sub: "27001"     },
];

function XenditSection() {
  return (
    <section id="integrasi" className="bg-white py-20 md:py-28 border-t border-[#E2E8F0]">
      <div className="max-w-6xl mx-auto px-5">
        <div className="flex flex-col lg:flex-row items-center gap-14">

          {/* Left — copy */}
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 bg-[#F0FDF4] border border-[#BBF7D0] rounded-full px-4 py-1.5 mb-6">
              <Shield className="h-3.5 w-3.5 text-[#16A34A]" />
              <span className="text-xs font-semibold text-[#16A34A]">Integrasi Resmi Xendit</span>
            </div>
            <h2 className="heading-display text-3xl md:text-4xl text-[#0F172A] mb-4">
              Diperkuat oleh Xendit
            </h2>
            <p className="text-[#64748B] mb-7 leading-relaxed">
              Integrasi resmi dengan payment gateway terdepan Indonesia. Dipercaya ribuan bisnis.
            </p>
            <div className="grid grid-cols-2 gap-y-3 gap-x-4">
              {PAYMENT_METHODS.map((m) => (
                <div key={m} className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-[#22C55E] flex-shrink-0" />
                  <span className="text-sm text-[#334155]">{m}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Xendit card */}
          <div className="flex-1 flex justify-center lg:justify-end w-full">
            <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-lg p-10 flex flex-col items-center gap-5 w-full max-w-sm">
              {/* Xendit logo placeholder — white bg keeps it clean */}
              <div className="w-20 h-20 bg-white border border-[#E2E8F0] rounded-2xl flex items-center justify-center shadow-sm">
                <span className="font-black text-3xl text-[#003049]">X</span>
              </div>
              <div className="text-center">
                <div className="font-bold text-lg text-[#0F172A]">Xendit</div>
                <div className="text-sm text-[#64748B]">Payment Gateway Terdepan Indonesia</div>
              </div>
              <div className="flex gap-3">
                {XENDIT_BADGES.map((b) => (
                  <div
                    key={b.label}
                    className="flex flex-col items-center bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl px-4 py-2.5"
                  >
                    <span className="font-bold text-sm text-[#16A34A]">{b.label}</span>
                    <span className="text-[10px] text-[#64748B] mt-0.5">{b.sub}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

// ─── CTA ──────────────────────────────────────────────────────────────────────

function CtaSection() {
  return (
    <section id="daftar" className="bg-[#080E1D] py-24">
      <div className="max-w-6xl mx-auto px-5 flex justify-center">
        <div
          className="rounded-3xl p-10 md:p-14 text-center w-full max-w-xl border border-white/10"
          style={{ background: "rgba(255,255,255,0.04)" }}
        >
          <h2 className="heading-display text-3xl md:text-4xl text-white mb-4">
            Siap Mengotomasi Tagihan Anda?
          </h2>
          <p className="text-white/55 mb-9 leading-relaxed">
            Bergabung dengan program pilot dan jadilah yang pertama mengubah bisnis langganan Anda.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-5">
            <button className="inline-flex items-center justify-center gap-2 bg-[#22C55E] hover:bg-[#16A34A] text-white font-semibold text-sm px-7 py-3 rounded-full transition-colors">
              Daftar Slot Pilot <ArrowRight className="h-4 w-4" />
            </button>
            <button
              className="inline-flex items-center justify-center gap-2 border border-white/20 text-white/70 hover:text-white text-sm px-7 py-3 rounded-full transition-colors"
              style={{ background: "transparent" }}
            >
              <Play className="h-3.5 w-3.5 fill-current" /> Lihat Demo
            </button>
          </div>
          <p className="text-xs text-white/30">Slot terbatas untuk akses awal.</p>
        </div>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function LandingFooter() {
  return (
    <footer className="bg-[#080E1D] border-t border-white/10">
      <div className="max-w-6xl mx-auto px-5 pt-12 pb-8">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
          {/* Brand */}
          <div>
            <div className="font-bold text-white text-base mb-3">Berkala</div>
            <p className="text-white/35 text-sm leading-relaxed max-w-xs">
              Platform tagihan langganan yang dibangun untuk bisnis Indonesia.
            </p>
          </div>

          {/* Produk */}
          <div>
            <div className="font-semibold text-white/80 text-sm mb-4">Produk</div>
            <div className="flex flex-col gap-3">
              <a href="#fitur"     className="text-white/40 hover:text-white text-sm transition-colors">Fitur</a>
              <a href="#harga"     className="text-white/40 hover:text-white text-sm transition-colors">Harga</a>
              <a href="#integrasi" className="text-white/40 hover:text-white text-sm transition-colors">Integrasi</a>
            </div>
          </div>

          {/* Perusahaan */}
          <div>
            <div className="font-semibold text-white/80 text-sm mb-4">Perusahaan</div>
            <div className="flex flex-col gap-3">
              <a href="#" className="text-white/40 hover:text-white text-sm transition-colors">Tentang Kami</a>
              <a href="#" className="text-white/40 hover:text-white text-sm transition-colors">Karir</a>
              <a
                href="mailto:team@3wiraderata.com?subject=Hello%2C%20I%20saw%20your%20website"
                className="text-white/40 hover:text-white text-sm transition-colors"
              >
                Kontak
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <span className="text-white/25 text-xs">© 2024 Berkala.co. Hak cipta dilindungi.</span>
          <div className="flex gap-5">
            <a href="#" className="text-white/25 hover:text-white/60 text-xs transition-colors">Kebijakan Privasi</a>
            <a href="#" className="text-white/25 hover:text-white/60 text-xs transition-colors">Syarat Layanan</a>
          </div>
        </div>

      </div>
    </footer>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function NewLandingPage() {
  return (
    <div className="min-h-screen">
      <LandingNav />
      <HeroSection />
      <PainPointsSection />
      <FeaturesSection />
      <XenditSection />
      <CtaSection />
      <LandingFooter />
    </div>
  );
}
