import { Inter } from "next/font/google";
import Navbar from "@/components/common/Navbar";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata = {
  title: "AgriNode",
  description: "B2B agri-waste marketplace for farmers and industrial buyers.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full bg-agri-white text-agri-navy">
        <Navbar />
        {children}
      </body>
    </html>
  );
}
