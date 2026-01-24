import "./globals.css";
import { Vazirmatn, Noto_Naskh_Arabic } from "next/font/google";
import { LanguageProvider } from "@/context/LanguageContext";
import { ThemeProvider } from "@/components/ThemeProvider";
import Navbar from "@/components/Navbar";
import SessionProviderWrapper from "@/components/SessionProviderWrapper";

const vazirmatn = Vazirmatn({
  subsets: ["arabic", "latin"],
  variable: "--font-vazirmatn",
  display: 'swap',
});

const notonaskh = Noto_Naskh_Arabic({
  weight: ["400", "500", "700"],
  subsets: ["arabic"],
  variable: "--font-noto-naskh",
  display: 'swap',
});

export const metadata = {
  title: "Maktab Yar | مکتب یار",
  description: "The Smartest School Management System",
  icons: {
    icon: "/images/logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" suppressHydrationWarning>
      <body className={`${vazirmatn.variable} ${notonaskh.variable} antialiased`}>
        <SessionProviderWrapper>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <LanguageProvider>
              <Navbar />
              <main className="min-h-screen">
                {children}
              </main>
            </LanguageProvider>
          </ThemeProvider>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
