import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Uncharted Stars Saga",
    template: "%s | Uncharted Stars Saga"
  },
  description:
    "A premium audiobook universe built for immersion. Experience cinematic audio storytelling with clean reading mode and a community that stays for the long haul.",
  keywords: [
    "audiobook",
    "audio fiction",
    "sci-fi",
    "space opera",
    "serialized fiction"
  ],
  authors: [{ name: "Uncharted Stars Saga" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Uncharted Stars Saga",
    title: "Uncharted Stars Saga",
    description:
      "A premium audiobook universe built for immersion. No subscriptions. No interruptions. Just story."
  },
  twitter: {
    card: "summary_large_image",
    title: "Uncharted Stars Saga",
    description:
      "A premium audiobook universe built for immersion. No subscriptions. No interruptions. Just story."
  },
  robots: {
    index: true,
    follow: true
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg"
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#05060a"
};

export default function RootLayout({
  children
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
