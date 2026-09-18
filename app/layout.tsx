import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Jev Kitchen Chaos",
  description:
    "Slam a live AI kitchen with chaos events and watch Jev lose its mind trying to survive the dinner rush.",
  openGraph: {
    title: "Jev Kitchen Chaos",
    description:
      "Slam a live AI kitchen with chaos events and watch Jev lose its mind. How low can your K/D go?",
    url: "https://jev-kitchen-chaos.vercel.app",
    siteName: "Jev Kitchen Chaos",
    type: "website",
    images: [
      {
        url: "https://jev-kitchen-chaos.vercel.app/og.png",
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Jev Kitchen Chaos",
    description:
      "I broke an AI chef. My K/D was 0.2. Jev quit. You can do this too.",
    images: ["https://jev-kitchen-chaos.vercel.app/og.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Space+Grotesk:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
