import React from "react";
import "@/styles/globals.css";
import { Metadata, Viewport } from "next";
import clsx from "clsx";
import { siteConfig } from "@/config/site";
import { almarai, notoSans } from "@/config/fonts";
import { Navbar } from "@/components/navbar";
import Web3Provider from "@/components/Web3Provider";

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning lang="en">
      <head />
      <body
        className={clsx(
          "min-h-screen font-sans antialiased bg-[#F5F7FA]",
          notoSans.variable,
          almarai.variable
        )}
      >
        {/* Web3Provider handles wallet connections and fallback to limited functionality mode */}
        <Web3Provider>
          <div className="relative flex flex-col h-screen">
            <Navbar />
            <main className="container mx-auto max-w-3xl px-6 flex-grow">
              {children}
            </main>
          </div>
        </Web3Provider>
      </body>
    </html>
  );
}
