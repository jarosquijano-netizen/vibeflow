import type { Metadata } from "next";
import { DM_Sans, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { XPProvider } from "@/lib/xp-engine";
import { VibeToaster } from "@/components/polish/toasts";
import CommandPalette from "@/components/polish/command-palette";
import KeyboardShortcuts from "@/components/polish/keyboard-shortcuts";
import GlobalShortcuts from "@/components/polish/global-shortcuts";

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
  variable: '--font-dm-sans',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400'],
  display: 'swap',
  variable: '--font-jetbrains-mono',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
  variable: '--font-space-grotesk',
});

export const metadata: Metadata = {
  title: "VibeFlow",
  description: "Premium product management for B2B logistics PMs",
};

/* Anti-flash: read theme from localStorage before React hydrates */
const antiFlashScript = `
(function(){
  try {
    var t = localStorage.getItem('vibeflow-theme');
    if (t === 'cyber' || t === 'default') {
      document.documentElement.setAttribute('data-theme', t);
    }
  } catch(e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`h-full antialiased ${dmSans.variable} ${jetbrainsMono.variable} ${spaceGrotesk.variable}`}
    >
      <head>
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script dangerouslySetInnerHTML={{ __html: antiFlashScript }} />
      </head>
      <body className="min-h-full flex flex-col">
        <XPProvider>
          <ThemeProvider>
            {children}
            <VibeToaster />
            <CommandPalette />
            <KeyboardShortcuts />
            <GlobalShortcuts />
          </ThemeProvider>
        </XPProvider>
      </body>
    </html>
  );
}
