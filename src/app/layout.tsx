import type { Metadata } from "next";
import { Inter, DM_Serif_Display } from "next/font/google";
import { Toaster } from "sonner";
import { I18nProvider } from "@/lib/i18n-context";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const dmSerif = DM_Serif_Display({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-serif",
});

export const metadata: Metadata = {
  title: "Panen Baik - Toko Langganan",
  description:
    "Sayuran segar berkualitas premium dikirim ke pintu Anda. Berlangganan pengiriman mingguan, bulanan, atau sekali jadi dari sayuran dan buah organik pilihan.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${inter.variable} ${dmSerif.variable} antialiased`}>
        <I18nProvider>
          {children}
          <Toaster position="top-center" richColors />
        </I18nProvider>
      </body>
    </html>
  );
}
