import { ThemeProvider } from "better-themes/rsc";
import type { Metadata } from "next";

import { TooltipProvider } from "@/components/ui/tooltip";
import { bricolage, inter } from "@/styles/fonts";

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
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${bricolage.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          disableTransitionOnChange
          // defaultTheme="light"
          enableSystem
        >
          <TooltipProvider>{children}</TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
