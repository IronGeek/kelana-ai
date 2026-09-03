import type { Metadata } from "next";
import { Google_Sans_Code, Andika, Schoolbell, Akaya_Kanadaka } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/toast"
import { Footer } from "@/components/footer";
import { ThemeProvider } from "@/components/theme-provider";

const andika = Andika({
  subsets: ['latin'],
  weight: ["400", "700"],
  variable: '--font-sans'
});

const googleSansCode = Google_Sans_Code({
  subsets: ['latin'],
  variable: '--font-mono',
  adjustFontFallback: false
});

const schoolbell = Schoolbell({
  subsets: ['latin'],
  variable: '--font-handwritten',
  weight: "400"
});

const akayaKanadaka = Akaya_Kanadaka({
  subsets: ['latin'],
  variable: '--font-logo',
  weight: "400"
});

export const metadata: Metadata = {
  title: "KelanaAI",
  description: "AI-powered Travel Assistant",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", andika.variable, googleSansCode.variable, akayaKanadaka.variable, schoolbell.variable, "font-sans")}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <main className="flex flex-col flex-grow">
            {children}
          </main>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
