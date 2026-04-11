import type { Metadata } from "next";
import "@fontsource/dm-sans/400.css";
import "@fontsource/dm-sans/500.css";
import "@fontsource/dm-sans/700.css";
import "@fontsource/jetbrains-mono/400.css";
import "./globals.css";
import { VibeToaster } from "@/components/polish/toasts";
import CommandPalette from "@/components/polish/command-palette";
import KeyboardShortcuts from "@/components/polish/keyboard-shortcuts";
import GlobalShortcuts from "@/components/polish/global-shortcuts";

export const metadata: Metadata = {
  title: "VibeFlow",
  description: "Premium product management for B2B logistics PMs",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        {children}
        <VibeToaster />
        <CommandPalette />
        <KeyboardShortcuts />
        <GlobalShortcuts />
      </body>
    </html>
  );
}
