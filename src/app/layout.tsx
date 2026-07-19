import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { PostHogProvider } from "@/providers/PostHogProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Verdict | Autonomous Growth Auditor",
  description: "An autonomous agent that strips away positivity bias to deliver brutally honest, YC-grade landing page teardowns.",
  openGraph: {
    title: "Verdict | Autonomous Growth Auditor",
    description: "An autonomous agent that strips away positivity bias to deliver brutally honest, YC-grade landing page teardowns.",
    url: "https://verdict.ai",
    siteName: "Verdict",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Verdict | Autonomous Growth Auditor",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Verdict | Autonomous Growth Auditor",
    description: "An autonomous agent that strips away positivity bias to deliver brutally honest, YC-grade landing page teardowns.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-50 dark:bg-slate-950`}
    >
      <body className="min-h-screen flex flex-col font-sans text-slate-900 dark:text-slate-50">
        <PostHogProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </PostHogProvider>
      </body>
    </html>
  );
}
