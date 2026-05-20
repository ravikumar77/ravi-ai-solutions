import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Workflow, Bot, Cpu, ArrowRight, Youtube, Sparkles, Zap } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { BookCallModal } from "@/components/site/BookCallModal";
import { Button } from "@/components/ui/button";
import { listPublicServices } from "@/lib/services.functions";
import { useReveal } from "@/hooks/use-reveal";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ravi Kumar AI Lab — Automate Your Business with AI & n8n" },
      { name: "description", content: "Senior Full Stack Developer & AI Systems Architect. n8n workflows, OpenClaw agents, and custom AI automation for modern businesses." },
      { property: "og:title", content: "Ravi Kumar AI Lab — AI & n8n Automation" },
      { property: "og:description", content: "n8n workflows, OpenClaw agents, and full-stack AI automation." },
    ],
  }),
  component: Landing,
});

const ICONS: Record<string, any> = { Workflow, Bot, Cpu, Sparkles, Zap };

function Landing() {
  const [modal, setModal] = useState(false);
  const fetchServices = useServerFn(listPublicServices);
  const { data: services } = useQuery({ queryKey: ["public-services"], queryFn: () => fetchServices() });

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero onBook={() => setModal(true)} />
        <Services services={services ?? []} />
        <About />
        <Schedule />
      </main>
      <Footer />
      <BookCallModal open={modal} onOpenChange={setModal} />
    </div>
  );
}

function Hero({ onBook }: { onBook: () => void }) {
  const r = useReveal<HTMLDivElement>();
  useEffect(() => { r.current?.classList.add("in"); }, [r]);
  return (
    <section className="relative pt-40 pb-28 overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-40 pointer-events-none" />
      <div ref={r} className="reveal relative mx-auto max-w-5xl px-6 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-card/60 backdrop-blur text-xs text-muted-foreground mb-8">
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          AI Systems Architect · 13+ years full-stack
        </div>
        <h1 className="font-display text-5xl md:text-7xl font-semibold leading-[1.05] tracking-tighter">
          Automate Your Business with{" "}
          <span className="neon-text">AI &amp; n8n</span>.
        </h1>
        <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
          I help businesses streamline operations and build autonomous workflows using n8n, OpenClaw, and custom AI agents.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button variant="hero" size="lg" onClick={onBook}>
            Request a Call <ArrowRight size={16} />
          </Button>
          <Button variant="outlineNeon" size="lg" asChild>
            <a href="#services">View Automation Packages</a>
          </Button>
        </div>
      </div>
    </section>
  );
}

function Services({ services }: { services: any[] }) {
  const r = useReveal<HTMLDivElement>();
  return (
    <section id="services" className="py-28 border-t border-border">
      <div ref={r} className="reveal mx-auto max-w-7xl px-6">
        <div className="max-w-2xl">
          <p className="text-xs uppercase tracking-[0.2em] text-primary mb-3">Packages</p>
          <h2 className="font-display text-4xl md:text-5xl font-semibold tracking-tight">
            Automation engineered for outcomes.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Production-ready packages designed to ship value in weeks, not quarters.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6">
          {services.map((s) => {
            const Icon = (s.icon && ICONS[s.icon]) || Sparkles;
            return (
              <div
                key={s.id}
                className="group relative rounded-2xl border border-border bg-card/60 backdrop-blur p-8 transition-all duration-300 hover:border-primary/60 hover:-translate-y-1 hover:shadow-[0_20px_60px_-20px_var(--neon-glow)]"
              >
                <div className="h-11 w-11 rounded-xl border border-border bg-background flex items-center justify-center text-primary group-hover:neon-ring transition-all">
                  <Icon size={20} />
                </div>
                <h3 className="mt-6 font-display text-xl font-semibold">{s.title}</h3>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{s.description}</p>
                {s.price && (
                  <p className="mt-6 text-sm text-primary font-medium">{s.price}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function About() {
  const r = useReveal<HTMLDivElement>();
  return (
    <section id="about" className="py-28 border-t border-border">
      <div ref={r} className="reveal mx-auto max-w-7xl px-6 grid md:grid-cols-2 gap-16 items-center">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-primary mb-3">About</p>
          <h2 className="font-display text-4xl md:text-5xl font-semibold tracking-tight">
            An AI Systems Architect, not just another dev.
          </h2>
          <p className="mt-6 text-muted-foreground leading-relaxed">
            Over 13 years architecting full-stack systems for startups and enterprises. Today I focus
            exclusively on building autonomous AI workflows — combining n8n, OpenClaw, and custom
            agents to replace brittle manual processes with self-running infrastructure.
          </p>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            I share what I learn in the field on YouTube — practical, no-fluff breakdowns.
          </p>
          <a
            href="https://www.youtube.com/@ravikumar-ailab"
            target="_blank"
            rel="noreferrer"
            className="mt-8 inline-flex items-center gap-2 text-primary font-medium hover:underline"
          >
            <Youtube size={18} /> Visit Ravi Kumar AI Lab on YouTube →
          </a>
        </div>

        <a
          href="https://www.youtube.com/@ravikumar-ailab"
          target="_blank"
          rel="noreferrer"
          className="relative aspect-video rounded-2xl overflow-hidden border border-border bg-card group"
        >
          <div className="absolute inset-0 grid-bg opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/20" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-20 w-20 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-[0_0_60px_var(--neon-glow)] group-hover:scale-110 transition-transform">
              <Youtube size={32} />
            </div>
          </div>
          <div className="absolute bottom-6 left-6 right-6">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Channel</p>
            <p className="font-display text-lg font-semibold">Ravi Kumar AI Lab</p>
          </div>
        </a>
      </div>
    </section>
  );
}

function Schedule() {
  const r = useReveal<HTMLDivElement>();
  useEffect(() => {
    const s = document.createElement("script");
    s.src = "https://assets.calendly.com/assets/external/widget.js";
    s.async = true;
    document.body.appendChild(s);
    return () => { document.body.removeChild(s); };
  }, []);
  return (
    <section id="schedule" className="py-28 border-t border-border">
      <div ref={r} className="reveal mx-auto max-w-6xl px-6">
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-xs uppercase tracking-[0.2em] text-primary mb-3">Booking</p>
          <h2 className="font-display text-4xl md:text-5xl font-semibold tracking-tight">
            Schedule a Consultation.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Pick a time that works for you. We&apos;ll talk through your stack, goals, and where automation creates the biggest lift.
          </p>
        </div>
        <div className="mt-12 rounded-2xl border border-border bg-card/60 backdrop-blur overflow-hidden">
          <div
            className="calendly-inline-widget"
            data-url="https://calendly.com/ravikumar-devforge?background_color=181a1f&text_color=f5f7fa&primary_color=4ade80"
            style={{ minWidth: "320px", height: "720px" }}
          />
        </div>
      </div>
    </section>
  );
}
