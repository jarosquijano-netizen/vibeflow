import type { Metadata } from "next";
/* Fonts — loaded via @fontsource (npm packages, no network required at build time).
   Run `npm install` after every git pull that adds new font packages. */
import "@fontsource/dm-sans";
import "@fontsource/jetbrains-mono";
import "@fontsource/space-grotesk";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { XPProvider } from "@/lib/xp-engine";
import { VibeToaster } from "@/components/polish/toasts";
import CommandPalette from "@/components/polish/command-palette";
import KeyboardShortcuts from "@/components/polish/keyboard-shortcuts";
import GlobalShortcuts from "@/components/polish/global-shortcuts";

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
    <html lang="en" className="h-full antialiased">
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
