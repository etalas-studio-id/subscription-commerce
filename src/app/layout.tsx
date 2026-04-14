import type { Metadata } from "next";
import { Onest } from "next/font/google";
import { Toaster } from "sonner";
import { I18nProvider } from "@/lib/i18n-context";
import { AuthProvider } from "@/components/providers/AuthProvider";
import "./globals.css";

const onest = Onest({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "ProBall Football | Akademi Sepak Bola Jakarta",
  description:
    "Bergabung dengan ProBall Football Academy dan tingkatkan kemampuan sepak bola Anda. Daftar program latihan bulanan, mingguan, atau intensif bersama pelatih profesional.",
  openGraph: {
    title: "ProBall Football | Akademi Sepak Bola Jakarta",
    description:
      "Bergabung dengan ProBall Football Academy dan tingkatkan kemampuan sepak bola Anda. Daftar program latihan bulanan, mingguan, atau intensif bersama pelatih profesional.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={`${onest.variable} antialiased`} suppressHydrationWarning>
        <AuthProvider>
          <I18nProvider>
            {children}
            <Toaster position="top-center" richColors />
          </I18nProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
