import type { Metadata } from "next";
import Link from "next/link";

import { TRPCProvider } from "@/components/TRPCProvider";

import "./globals.css";

export const metadata: Metadata = {
  title: "Taskflow",
  description: "A simple task manager built with Next.js and tRPC.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <TRPCProvider>
          <header className="site-header">
            <div className="shell header-inner">
              <Link className="brand" href="/" aria-label="Taskflow home">
                <span className="brand-mark" aria-hidden="true">
                  ✓
                </span>
                Taskflow
              </Link>
            </div>
          </header>
          <main className="shell main-content">{children}</main>
        </TRPCProvider>
      </body>
    </html>
  );
}
