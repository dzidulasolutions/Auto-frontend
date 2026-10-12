import type { Metadata } from "next";
import "./globals.css";
import { righteous, googleSans } from "@/lib/fonts";
import Providers from "@/components/providers";
import type { Viewport } from "next";
import RegisterSW from "@/components/pwa/register-sw";

export const metadata: Metadata = {
    title: "Application de gestion financiere",
    description: "Plateforme de microfinance AuTogo",  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "AuTogo",
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html
            lang="fr" translate="no"
            className={`${righteous.variable} ${googleSans.variable} h-full antialiased`}
            suppressHydrationWarning
        >
            <head>
                <meta name="google" content="notranslate" />
            </head>
            <body className="min-h-full flex flex-col">
                 <Providers>{children}</Providers>
                 <RegisterSW />
            </body>
        </html>
    );
}
