import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { submitLead } from "@/lib/leads.functions";
import { ArrowRight } from "lucide-react";

export function BookCallModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const submit = useServerFn(submitLead);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    help_with: "",
    goal: "",
    stage: "",
    needs: "",
    best_time: "",
  });

  const set = (k: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await submit({ data: form });
      toast.success("Request received — I'll be in touch shortly.");
      onOpenChange(false);
      setForm({
        first_name: "", last_name: "", email: "", phone: "",
        help_with: "", goal: "", stage: "", needs: "", best_time: "",
      });
    } catch (err: any) {
      toast.error(err?.message ?? "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-card border-border max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Book a Call</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Let&apos;s discuss how I can help you.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="grid gap-4 mt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="First name">
              <Input required value={form.first_name} onChange={(e) => set("first_name")(e.target.value)} />
            </Field>
            <Field label="Last name">
              <Input required value={form.last_name} onChange={(e) => set("last_name")(e.target.value)} />
            </Field>
            <Field label="Email">
              <Input required type="email" placeholder="you@example.com" value={form.email} onChange={(e) => set("email")(e.target.value)} />
            </Field>
            <Field label="Phone">
              <Input value={form.phone} onChange={(e) => set("phone")(e.target.value)} />
            </Field>
          </div>

          <Field label="I need help with...">
            <Select value={form.help_with} onValueChange={set("help_with")}>
              <SelectTrigger><SelectValue placeholder="Select an option" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="1 on 1 Session ($49)">1 on 1 Session ($49)</SelectItem>
                <SelectItem value="Live Workshop ($29)">Live Workshop ($29)</SelectItem>
                <SelectItem value="AI Consulting">AI Consulting</SelectItem>
                <SelectItem value="Partnership">Partnership</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <Field label="What's your goal?">
            <Input value={form.goal} onChange={(e) => set("goal")(e.target.value)} />
          </Field>

          <Field label="What stage are you at right now?">
            <Select value={form.stage} onValueChange={set("stage")}>
              <SelectTrigger><SelectValue placeholder="Select a stage" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Just starting out">Just starting out</SelectItem>
                <SelectItem value="Learning and exploring AI">Learning and exploring AI</SelectItem>
                <SelectItem value="Already building something">Already building something</SelectItem>
                <SelectItem value="Growing an existing business">Growing an existing business</SelectItem>
                <SelectItem value="Need help with a specific problem">Need help with a specific problem</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <Field label="Tell me about your needs">
            <Textarea rows={4} value={form.needs} onChange={(e) => set("needs")(e.target.value)} />
          </Field>

          <Field label="Best time to reach you">
            <Input placeholder="e.g. Weekdays 2–5pm PT" value={form.best_time} onChange={(e) => set("best_time")(e.target.value)} />
          </Field>

          <Button type="submit" variant="hero" size="lg" disabled={loading} className="mt-2 w-full md:w-auto md:self-end">
            {loading ? "Sending..." : (<>Request Call <ArrowRight size={16} /></>)}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-2">
      <Label className="text-xs uppercase tracking-wider text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
