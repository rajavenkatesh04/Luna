import type { Metadata } from "next";
import { Cal_Sans } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/app/ui/theme-provider";
import { Analytics } from "@vercel/analytics/next"

const calSans = Cal_Sans({
    weight: ['400'],
    subsets: ['latin'],
    fallback: ['system-ui', 'arial'],
});

export const metadata: Metadata = {
    title: {
        template: '%s | Luna',
        default: 'Luna',
    },
    description: 'The better platform to spice up your events',
    metadataBase: new URL('https://luna-ashy.vercel.app/'),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${calSans.className} antialiased`}
      >
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
          <Analytics />
      </ThemeProvider>
      </body>
    </html>
  );
}
