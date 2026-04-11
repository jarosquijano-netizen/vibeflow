import type { Metadata } from "next";
import "@fontsource/dm-sans/400.css";
import "@fontsource/dm-sans/500.css";
import "@fontsource/dm-sans/700.css";
import "@fontsource/jetbrains-mono/400.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/space-grotesk/400.css";
import "@fontsource/space-grotesk/500.css";
import "@fontsource/space-grotesk/700.css";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
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
        <ThemeProvider>
          {children}
          <VibeToaster />
          <CommandPalette />
          <KeyboardShortcuts />
          <GlobalShortcuts />
        </ThemeProvider>
      </body>
    </html>
  );
}
