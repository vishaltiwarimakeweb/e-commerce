import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { getSessionUser } from "@/lib/auth";
import { getCart } from "@/lib/cart";
import { Providers } from "@/components/layout/Providers";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Woozi E-commerce",
  description:
    "Shop the Woozi catalog — search, filter, and order in a few clicks.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getSessionUser();
  const initialCartCount = user ? (await getCart(user.id)).itemCount : 0;

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        <Providers initialUser={user} initialCartCount={initialCartCount}>
          <Navbar />
          <div className="flex flex-1 flex-col">{children}</div>
          <Footer />
        </Providers>
        <Script src="https://zendesk-clone-04pw.onrender.com/embed.js" data-slug="tiwariji-editz" strategy="afterInteractive" />
      </body>
    </html>
  );
}
