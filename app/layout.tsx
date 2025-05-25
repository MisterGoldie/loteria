import "./theme.css";
import "@coinbase/onchainkit/styles.css";
import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "./providers";
import dynamic from "next/dynamic";

// Dynamically import FarcasterLoader to avoid SSR issues
const FarcasterLoader = dynamic(
  () => import("./components/FarcasterLoader").then((mod) => mod.FarcasterLoader),
  { ssr: false }
);

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export async function generateMetadata(): Promise<Metadata> {
  const URL = "https://loteriagame.xyz";
  return {
    title: "Loteria",
    description: "A Mexican bingo-style game built as a Mini App",
    other: {
      "fc:frame": JSON.stringify({
        version: "next",
        imageUrl: "https://loteriagame.xyz/icon.png",
        button: {
          title: `Launch Loteria`,
          action: {
            type: "launch_frame",
            name: "Loteria",
            url: URL,
            splashImageUrl: "https://loteriagame.xyz/splash.png",
            splashBackgroundColor: "#000000",
          },
        },
      }),
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-background">
        <Providers>
          {/* FarcasterLoader is already dynamically imported with SSR disabled */}
          <FarcasterLoader />
          {children}
        </Providers>
      </body>
    </html>
  );
}
