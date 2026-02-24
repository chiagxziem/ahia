import type { Metadata } from "next";

import { TooltipProvider } from "@/components/ui/tooltip";
import { inter, sometypeMono } from "@/styles/fonts";

import "@/styles/globals.css";

export const metadata: Metadata = {
  title: {
    default: "Ahia — Curated Essentials, Beautifully Minimal",
    template: "%s — Ahia",
  },
  description:
    "Discover premium quality and exceptional design. Ahia brings a curated shopping experience right to your fingertips.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${sometypeMono.variable} antialiased`}>
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
