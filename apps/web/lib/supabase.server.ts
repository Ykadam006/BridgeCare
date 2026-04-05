import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

type CookieToSet = { name: string; value: string; options?: Record<string, unknown> };

export async function createServerSupabase() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(toSet: CookieToSet[]) {
          try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            toSet.forEach(({ name, value, options }) => (cookieStore as any).set(name, value, options));
          } catch { /* server component — ignore */ }
        },
      },
    }
  );
}
