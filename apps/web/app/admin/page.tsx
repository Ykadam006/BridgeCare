import { Metadata } from "next";
import { notFound } from "next/navigation";
import AdminDashboard from "./AdminDashboard";
import { createServerSupabase } from "@/lib/supabase.server";
import { Nav } from "@/components/shared/Nav";

export const metadata: Metadata = { title: "Analytics" };

export default async function AdminPage() {
  const supabase = await createServerSupabase();
  // Admins are rows in public.admins (migration 004); everyone else gets a plain 404.
  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdmin) notFound();

  const [{ data: cases }, { count: totalUsers }] = await Promise.all([
    supabase.from("cases").select("id,created_at,urgency_level,score,user_id")
      .order("created_at", { ascending: false }).limit(500),
    supabase.from("profiles").select("*", { count: "exact", head: true }),
  ]);

  return (
    <div className="min-h-screen bg-[#f3fbfd]">
      <Nav />
      <AdminDashboard cases={cases || []} totalUsers={totalUsers || 0} />
    </div>
  );
}
