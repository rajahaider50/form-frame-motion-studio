import type { Metadata } from "next";
import { AdminConsole } from "@/components/admin-console";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Studio console",
  robots: { index: false, follow: false, nocache: true },
};

export default function StudioConsolePage() {
  return <AdminConsole />;
}
