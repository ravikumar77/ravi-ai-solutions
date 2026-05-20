import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const leadInput = z.object({
  first_name: z.string().trim().min(1).max(80),
  last_name: z.string().trim().min(1).max(80),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  help_with: z.string().max(80).optional().or(z.literal("")),
  goal: z.string().max(500).optional().or(z.literal("")),
  stage: z.string().max(120).optional().or(z.literal("")),
  needs: z.string().max(2000).optional().or(z.literal("")),
  best_time: z.string().max(200).optional().or(z.literal("")),
});

async function assertAdmin(userId: string) {
  const { data, error } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden: admin role required");
}

export const submitLead = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => leadInput.parse(d))
  .handler(async ({ data }) => {
    const { error } = await supabaseAdmin.from("leads").insert({
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      phone: data.phone || null,
      help_with: data.help_with || null,
      goal: data.goal || null,
      stage: data.stage || null,
      needs: data.needs || null,
      best_time: data.best_time || null,
    });
    if (error) throw new Error(error.message);
    // Email notification placeholder — wire Resend/Lovable Emails later.
    console.log(`[lead] new submission from ${data.email}`);
    return { ok: true };
  });

export type Lead = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  help_with: string | null;
  goal: string | null;
  stage: string | null;
  needs: string | null;
  best_time: string | null;
  status: string;
  created_at: string;
};

export const listLeads = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<Lead[]> => {
    await assertAdmin(context.userId);
    const { data, error } = await supabaseAdmin
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as Lead[];
  });

export const updateLeadStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ id: z.string().uuid(), status: z.enum(["new", "contacted", "won", "lost"]) }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { error } = await supabaseAdmin.from("leads").update({ status: data.status }).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteLead = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { error } = await supabaseAdmin.from("leads").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
