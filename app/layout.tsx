import type { Metadata, Viewport } from "next";
import { Atkinson_Hyperlegible, Instrument_Serif } from "next/font/google";
import "./globals.css";

const atkinson = Atkinson_Hyperlegible({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-atkinson",
  display: "swap",
});

// Display only: the landing headline and the text strip. Everything readable stays in Atkinson.
const instrument = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-instrument",
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
    <html lang="en" className={`${atkinson.variable} ${instrument.variable}`}>
      <body className="flex min-h-dvh flex-col">
        <div className="flex w-full flex-1 flex-col px-5 pt-4">{children}</div>
      </body>
    </html>
  );
}
