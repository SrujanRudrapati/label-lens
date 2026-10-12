import type { Metadata, Viewport } from "next";
import { Atkinson_Hyperlegible } from "next/font/google";
import "./globals.css";

const atkinson = Atkinson_Hyperlegible({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-atkinson",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Label Lens",
  description: "Point your phone at any label. Label Lens explains what it means for you.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#FAFBFC",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={atkinson.variable}>
      <body className="flex min-h-dvh flex-col">
        <div className="mx-auto flex w-full max-w-[560px] flex-1 flex-col px-5 pt-5">{children}</div>
        <footer className="mx-auto w-full max-w-[560px] border-t border-rule px-5 py-5 text-meta text-ink-soft">
          Label Lens explains labels. It is not medical advice.
        </footer>
      </body>
    </html>
  );
}
