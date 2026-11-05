import Link from "next/link";
import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin";
import { AdminShell } from "@/features/catalogue/admin/admin-shell";
import { BattleForm, BracketForm } from "@/features/versus/admin/versus-forms";

export const metadata: Metadata = { title: "Versus admin", robots: { index: false } };

export default async function VersusAdmin() {
  await requireAdmin();
  return (
    <AdminShell title="Versus" back={{ href: "/admin/catalogue", label: "Catalogue" }}>
      <p className="max-w-2xl text-sm text-mist">
        Battles and brackets are opinion only: no prizes and nothing to win. Closed battles are settled every 15 minutes, and a bracket moves to its next round once every battle in the round has closed. A tie goes to the side with the higher Fan Pulse.{" "}
        <Link href="/versus" className="text-paper underline">
          See Versus
        </Link>
      </p>
      <section className="mt-8">
        <h2 className="mb-3 font-display text-xl font-semibold">New battle</h2>
        <BattleForm />
      </section>
      <section className="mt-10">
        <h2 className="mb-3 font-display text-xl font-semibold">New bracket</h2>
        <BracketForm />
      </section>
    </AdminShell>
  );
}
