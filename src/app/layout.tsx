import type { Metadata } from "next";
import { Geist_Mono, Metrophobic } from "next/font/google";
import "./globals.css";
import {ThemeProvider} from "next-themes";

const metrophobic = Metrophobic({
  variable: "--font-metrophobic",
  weight: "400",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mock Propulse",
  description: "A mock app of propulse",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${metrophobic.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider defaultTheme="system" attribute={"class"}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
