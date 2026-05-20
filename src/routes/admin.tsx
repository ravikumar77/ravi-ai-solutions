import { useEffect, useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, LogOut } from "lucide-react";
import { listAllServices, upsertService, deleteService } from "@/lib/services.functions";
import { listLeads, updateLeadStatus, deleteLead } from "@/lib/leads.functions";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — Ravi Kumar AI Lab" }] }),
  component: AdminPage,
});

function AdminPage() {
  const nav = useNavigate();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      if (!data.session) nav({ to: "/login" });
      else setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session) nav({ to: "/login" });
    });
    return () => { mounted = false; sub.subscription.unsubscribe(); };
  }, [nav]);

  if (!ready) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>;

  return (
    <div className="min-h-screen">
      <div className="border-b border-border bg-card/40 backdrop-blur">
        <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
          <Link to="/" className="font-display font-semibold">
            <span className="neon-text">Ravi Kumar</span> AI Lab — Admin
          </Link>
          <Button variant="outlineNeon" size="sm" onClick={async () => { await supabase.auth.signOut(); nav({ to: "/login" }); }}>
            <LogOut size={14} /> Sign out
          </Button>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-10">
        <Tabs defaultValue="services">
          <TabsList>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="leads">Leads</TabsTrigger>
          </TabsList>
          <TabsContent value="services" className="mt-6"><ServicesAdmin /></TabsContent>
          <TabsContent value="leads" className="mt-6"><LeadsAdmin /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function ServicesAdmin() {
  const fetchAll = useServerFn(listAllServices);
  const upsert = useServerFn(upsertService);
  const remove = useServerFn(deleteService);
  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery({ queryKey: ["admin-services"], queryFn: () => fetchAll() });
  const [editing, setEditing] = useState<any | null>(null);

  const save = useMutation({
    mutationFn: (input: any) => upsert({ data: input }),
    onSuccess: () => { toast.success("Saved"); qc.invalidateQueries({ queryKey: ["admin-services"] }); qc.invalidateQueries({ queryKey: ["public-services"] }); setEditing(null); },
    onError: (e: any) => toast.error(e?.message ?? "Failed to save"),
  });
  const del = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: () => { toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["admin-services"] }); qc.invalidateQueries({ queryKey: ["public-services"] }); },
    onError: (e: any) => toast.error(e?.message ?? "Failed"),
  });

  if (error) return <p className="text-destructive text-sm">{(error as any).message}</p>;

  return (
    <div className="grid lg:grid-cols-[1fr_400px] gap-6">
      <div className="rounded-xl border border-border bg-card/60">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead><TableHead>Price</TableHead><TableHead>Order</TableHead><TableHead>Active</TableHead><TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && <TableRow><TableCell colSpan={5} className="text-muted-foreground text-sm">Loading...</TableCell></TableRow>}
            {data?.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="font-medium">{s.title}</TableCell>
                <TableCell className="text-muted-foreground">{s.price ?? "—"}</TableCell>
                <TableCell>{s.sort_order}</TableCell>
                <TableCell>{s.is_active ? "Yes" : "No"}</TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="ghost" onClick={() => setEditing(s)}><Pencil size={14} /></Button>
                  <Button size="sm" variant="ghost" onClick={() => { if (confirm("Delete this service?")) del.mutate(s.id); }}><Trash2 size={14} /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <ServiceForm key={editing?.id ?? "new"} initial={editing} onCancel={() => setEditing(null)} onSave={(v) => save.mutate(v)} saving={save.isPending} />
    </div>
  );
}

function ServiceForm({ initial, onSave, onCancel, saving }: any) {
  const [form, setForm] = useState({
    id: initial?.id, title: initial?.title ?? "", description: initial?.description ?? "",
    icon: initial?.icon ?? "", price: initial?.price ?? "",
    sort_order: initial?.sort_order ?? 0, is_active: initial?.is_active ?? true,
  });
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(form); }} className="rounded-xl border border-border bg-card/60 p-5 grid gap-4 h-fit">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">{initial ? "Edit service" : "New service"}</h3>
        {initial && <Button size="sm" variant="ghost" type="button" onClick={onCancel}>Cancel</Button>}
      </div>
      <div className="grid gap-1.5"><Label>Title</Label><Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
      <div className="grid gap-1.5"><Label>Description</Label><Textarea rows={4} required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-1.5"><Label>Icon (Workflow, Bot, Cpu, Sparkles, Zap)</Label><Input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} /></div>
        <div className="grid gap-1.5"><Label>Price</Label><Input value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></div>
        <div className="grid gap-1.5"><Label>Sort order</Label><Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} /></div>
        <div className="flex items-end gap-2"><Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} /><Label>Active</Label></div>
      </div>
      <Button variant="hero" type="submit" disabled={saving}>{saving ? "Saving..." : (<>{initial ? "Save" : (<><Plus size={14} /> Create</>)}</>)}</Button>
    </form>
  );
}

function LeadsAdmin() {
  const fetchLeads = useServerFn(listLeads);
  const update = useServerFn(updateLeadStatus);
  const remove = useServerFn(deleteLead);
  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery({ queryKey: ["admin-leads"], queryFn: () => fetchLeads() });

  const setStatus = useMutation({
    mutationFn: (v: { id: string; status: any }) => update({ data: v }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-leads"] }),
  });
  const del = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: () => { toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["admin-leads"] }); },
  });

  if (error) return <p className="text-destructive text-sm">{(error as any).message}</p>;

  return (
    <div className="rounded-xl border border-border bg-card/60 overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>When</TableHead><TableHead>Name</TableHead><TableHead>Email</TableHead>
            <TableHead>Help with</TableHead><TableHead>Stage</TableHead><TableHead>Status</TableHead><TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading && <TableRow><TableCell colSpan={7} className="text-muted-foreground text-sm">Loading...</TableCell></TableRow>}
          {data?.map((l) => (
            <TableRow key={l.id}>
              <TableCell className="text-xs text-muted-foreground">{new Date(l.created_at).toLocaleString()}</TableCell>
              <TableCell>{l.first_name} {l.last_name}</TableCell>
              <TableCell><a className="text-primary hover:underline" href={`mailto:${l.email}`}>{l.email}</a></TableCell>
              <TableCell className="text-muted-foreground">{l.help_with ?? "—"}</TableCell>
              <TableCell className="text-muted-foreground">{l.stage ?? "—"}</TableCell>
              <TableCell>
                <select
                  value={l.status}
                  onChange={(e) => setStatus.mutate({ id: l.id, status: e.target.value })}
                  className="bg-background border border-border rounded px-2 py-1 text-xs"
                >
                  <option value="new">new</option>
                  <option value="contacted">contacted</option>
                  <option value="won">won</option>
                  <option value="lost">lost</option>
                </select>
              </TableCell>
              <TableCell className="text-right">
                <Button size="sm" variant="ghost" onClick={() => { if (confirm("Delete this lead?")) del.mutate(l.id); }}>
                  <Trash2 size={14} />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
