import type { Metadata } from "next";
import "./globals.css";
import MainLayout from "@/components/layout/MainLayout";

export const metadata: Metadata = {
  title: "Infinity's Reach - Story Management System",
  description: "Agent SDK-based UI system for organizing and tracking the Infinity's Reach novel",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <MainLayout>{children}</MainLayout>
      </body>
    </html>
  );
}
