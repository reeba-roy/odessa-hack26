import { DM_Sans, Fraunces } from "next/font/google";
import Navbar from "@/components/common/Navbar";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { LanguageProvider } from "@/components/common/LanguageContext";
import { ToastProvider } from "@/components/common/ToastProvider";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

export const metadata = {
  title: "AgriNode",
  description: "B2B agri-waste marketplace for farmers and industrial buyers.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${dmSans.variable} ${fraunces.variable} h-full antialiased`}>
      <body className="min-h-full bg-agri-white text-agri-navy">
        <AuthProvider>
          <LanguageProvider>
            <ToastProvider>
              <Navbar />
              {children}
            </ToastProvider>
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
