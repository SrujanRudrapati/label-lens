import type { Metadata } from "next";
import { LabelLens } from "@/components/LabelLens";

export const metadata: Metadata = { title: "Label Lens demo", robots: { index: false } };

/** The real app, opened on the snack sample. Shown inside the phone on the desktop home page. */
export default function Demo() {
  return <LabelLens demo="snack" />;
}
