import type { Metadata } from "next";

export const metadata: Metadata = { title: { default: "Administration", template: "%s · Admin Alsimat" }, robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default function AdminRoot({ children }: { children: React.ReactNode }) {
  return children;
}
