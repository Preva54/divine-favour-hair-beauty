"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  Check,
  ChevronLeft,
  Clock,
  Loader2,
  MapPin,
  PartyPopper,
  RefreshCw,
  Scissors,
  Send,
  Sparkles,
  User,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";
import { cn, formatZAR } from "@/lib/utils";
import { bookableDates, dateKey } from "@/lib/utils";
import { CATEGORY_LABELS } from "@/lib/constants";
import { StylistAvatar } from "@/components/stylist-avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  createAppointmentAction,
  fetchSlotsAction,
  type CreateBookingResult,
} from "@/lib/actions/booking";

export interface WizardService {
  id: string;
  name: string;
  slug: string;
  category: "HAIR" | "NAILS" | "BEAUTY";
  image: string;
  price: number;
  durationMinutes: number;
  description: string;
  popular: boolean;
}

export interface WizardStylist {
  id: string;
  name: string;
  title: string;
  image: string;
  serviceIds: string[];
}

interface WizardProps {
  services: WizardService[];
  stylists: WizardStylist[];
  initialServiceId?: string | null;
  initialStylistId?: string | null;
  initialName?: string;
  initialEmail?: string;
  initialPhone?: string;
}

type Step = "service" | "stylist" | "datetime" | "details" | "review";

const STEPS: { key: Step; label: string }[] = [
  { key: "service", label: "Service" },
  { key: "stylist", label: "Specialist" },
  { key: "datetime", label: "Date & Time" },
  { key: "details", label: "Your Details" },
  { key: "review", label: "Confirm" },
];

function gCalUrl(title: string, start: Date, end: Date, details: string) {
  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const query = new URLSearchParams({ action: "TEMPLATE", text: title, dates: `${fmt(start)}Z/${fmt(end)}Z`, details });
  return `https://calendar.google.com/calendar/render?${query.toString()}`;
}

function StepTitle({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle: string }) {
  return (
    <div className="mb-6 flex items-start gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose/10 text-rose">{icon}</span>
      <div>
        <h2 className="font-serif text-2xl font-semibold">{title}</h2>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  );
}

export function BookingWizard({
  services,
  stylists,
  initialServiceId,
  initialStylistId = null,
  initialName = "",
  initialEmail = "",
  initialPhone = "",
}: WizardProps) {
  const [step, setStep] = useState<Step>("service");
  const [category, setCategory] = useState<string>("all");
  const [serviceId, setServiceId] = useState<string | null>(initialServiceId ?? null);
  const [stylistId, setStylistId] = useState<string | null>(() =>
    initialStylistId && (!initialServiceId || stylists.find((st) => st.id === initialStylistId)?.serviceIds.includes(initialServiceId))
      ? initialStylistId
      : null
  );
  const [date, setDate] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [slots, setSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [form, setForm] = useState({ name: initialName, email: initialEmail, phone: initialPhone, notes: "" });
  const [result, setResult] = useState<CreateBookingResult | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const signedIn = !!initialEmail;
  const service = serviceId ? services.find((s) => s.id === serviceId) ?? null : null;
  const stylist = stylistId ? stylists.find((st) => st.id === stylistId) ?? null : null;

  const offeredBy = useMemo(() => {
    if (!service) return stylists;
    const capable = stylists.filter((st) => st.serviceIds.includes(service.id));
    return capable.length > 0 ? capable : stylists;
  }, [service, stylists]);

  const preselectNote = useMemo(() => {
    if (!stylistId) return null;
    return stylists.find((st) => st.id === stylistId) ?? null;
  }, [stylistId, stylists]);

  const filteredServices = useMemo(
    () => (category === "all" ? services : services.filter((s) => s.category === category)),
    [services, category],
  );

  const dates = useMemo(() => bookableDates(14), []);

  useEffect(() => {
    if (!serviceId || !date) return;
    let cancelled = false;
    setLoadingSlots(true);
    setTime(null);
    setSlots([]);
    fetchSlotsAction(date, serviceId, stylistId)
      .then((res) => {
        if (!cancelled) {
          setSlots(res);
          setLoadingSlots(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoadingSlots(false);
      });
    return () => {
      cancelled = true;
    };
  }, [serviceId, date, stylistId]);

  const canContinue: Record<Step, boolean> = {
    service: !!serviceId,
    stylist: true,
    datetime: !!date && !!time,
    details: form.name.trim().length >= 2 && form.email.includes("@") && form.phone.trim().length >= 7,
    review: true,
  };

  const go = (s: Step) => {
    if (s === "datetime" && !date) setDate(dateKey(new Date()));
    setStep(s);
  };

  function handleSubmit() {
    if (!service || !date || !time) return;
    setSubmitting(true);
    createAppointmentAction({
      serviceId: service.id,
      stylistId,
      date,
      time,
      name: form.name,
      email: form.email,
      phone: form.phone,
      notes: form.notes || undefined,
    })
      .then((res) => {
        setResult(res);
        if (!res.ok) toast.error(res.error);
      })
      .catch(() => toast.error("Something went wrong. Please try again."))
      .finally(() => setSubmitting(false));
  }

  const stepIndex = STEPS.findIndex((s) => s.key === step);
  const done = result && result.ok ? true : false;
  const startDate = date && time ? new Date(`${date}T${time}`) : null;
  const endDate = startDate && service ? new Date(startDate.getTime() + service.durationMinutes * 60000) : null;

  return (
    <div className="mx-auto max-w-5xl">
      <ol className="mb-10 flex items-center justify-between gap-1">
        {!done &&
          STEPS.map((s, i) => {
            const active = i <= stepIndex;
            const current = i === stepIndex;
            return (
              <li key={s.key} className="flex flex-1 items-center gap-1 last:flex-none">
                <button
                  type="button"
                  disabled={i > stepIndex}
                  onClick={() => i < stepIndex && go(s.key)}
                  className={cn(
                    "flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide transition",
                    current ? "bg-ink text-ivory shadow-soft" : active ? "text-rose" : "text-muted-foreground",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-5 w-5 items-center justify-center rounded-full text-[10px]",
                      current ? "bg-white text-ink" : active ? "bg-rose text-white" : "bg-muted text-muted-foreground",
                    )}
                  >
                    {i + 1}
                  </span>
                  <span className="hidden sm:inline">{s.label}</span>
                </button>
                {i < STEPS.length - 1 && <div className={cn("h-px flex-1", i < stepIndex ? "bg-rose" : "bg-border")} />}
              </li>
            );
          })}
      </ol>

      <div className="rounded-[2rem] border border-border/70 bg-white p-6 shadow-lux sm:p-10">
        {done && result?.ok && startDate && endDate ? (
          <CompleteScreen
            result={result}
            start={startDate}
            end={endDate}
            signedIn={signedIn}
          />
        ) : result && !result.ok ? (
          <ErrorScreen error={result.error} onRetry={handleSubmit} />
        ) : (
          <>
            {step === "service" && (
              <ServiceStep
                services={filteredServices}
                category={category}
                setCategory={setCategory}
                selected={serviceId}
                preselect={preselectNote}
                onSelect={(id) => {
                  setServiceId(id);
                  if (preselectNote?.serviceIds.includes(id)) {
                    setStylistId(preselectNote.id);
                    go("datetime");
                  } else {
                    setStylistId(null);
                    go("stylist");
                  }
                }}
              />
            )}
            {step === "stylist" && (
              <StylistStep
                stylists={offeredBy}
                serviceName={service?.name ?? ""}
                selected={stylistId}
                onSelect={(id) => {
                  setStylistId(id);
                  setDate(null);
                  go("datetime");
                }}
                onContinue={() => go("datetime")}
                onBack={() => go("service")}
              />
            )}
            {step === "datetime" && (
              <DateTimeStep
                dates={dates}
                date={date}
                setDate={(d) => {
                  setDate(d);
                  setTime(null);
                }}
                slots={slots}
                time={time}
                setTime={setTime}
                loading={loadingSlots}
                onContinue={() => go("details")}
                onBack={() => go("stylist")}
                duration={service?.durationMinutes ?? 0}
              />
            )}
            {step === "details" && (
              <DetailsStep
                form={form}
                setForm={setForm}
                signedIn={signedIn}
                onContinue={() => go("review")}
                onBack={() => go("datetime")}
                canContinue={canContinue.details}
              />
            )}
            {step === "review" && service && date && time && endDate && (
              <ReviewStep
                service={service}
                stylist={stylist}
                date={date}
                time={time}
                end={endDate}
                form={form}
                submitting={submitting}
                onSubmit={handleSubmit}
                onBack={() => go("details")}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

function ServiceStep({
  services,
  category,
  setCategory,
  selected,
  preselect,
  onSelect,
}: {
  services: WizardService[];
  category: string;
  setCategory: (c: string) => void;
  selected: string | null;
  preselect: WizardStylist | null;
  onSelect: (id: string) => void;
}) {
  const cats = ["all", "HAIR", "NAILS", "BEAUTY"] as const;
  return (
    <div>
      <StepTitle
        icon={<Scissors className="h-5 w-5" />}
        title="Choose your treatment"
        subtitle="Pick a service to begin — you can choose a specialist next."
      />
      {preselect && (
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-gold/30 bg-gradient-to-br from-gold/10 to-rose/10 p-4">
          <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full ring-2 ring-gold/40">
            <StylistAvatar name={preselect.name} image={preselect.image} initialsClassName="text-sm" />
          </span>
          <p className="text-sm text-ink">
            You&apos;ll be booking with <span className="font-semibold">{preselect.name}</span> ({preselect.title}) —
            pick a service below to continue.
          </p>
        </div>
      )}
      <div className="mb-6 flex flex-wrap gap-2">
        {cats.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCategory(c)}
            className={cn(
              "rounded-full px-4 py-1.5 text-xs font-semibold transition",
              category === c ? "bg-ink text-ivory" : "bg-muted/50 text-muted-foreground hover:text-rose",
            )}
          >
            {c === "all" ? "All" : CATEGORY_LABELS[c]}
          </button>
        ))}
      </div>
      <div className="grid max-h-[30rem] gap-3 overflow-y-auto pr-1 sm:grid-cols-2">
        {services.map((s) => {
          const active = selected === s.id;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => onSelect(s.id)}
              className={cn(
                "group flex items-center gap-4 rounded-2xl border p-3 text-left transition-all",
                active ? "border-rose bg-rose/5 ring-1 ring-rose" : "border-border/70 bg-white hover:border-rose/40 hover:shadow-soft",
              )}
            >
              <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl">
                <Image src={s.image} alt={s.name} fill sizes="64px" className="object-cover" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-2">
                  <span className="truncate font-serif text-base font-semibold">{s.name}</span>
                  <span className="shrink-0 text-sm font-bold text-rose">{formatZAR(s.price)}</span>
                </span>
                <span className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {s.durationMinutes} min
                  </span>
                  {s.popular && <span className="text-gold">Popular</span>}
                </span>
              </span>
              <span
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition",
                  active ? "border-rose bg-rose text-white" : "border-border",
                )}
              >
                {active && <Check className="h-3.5 w-3.5" />}
              </span>
            </button>
          );
        })}
        {services.length === 0 && (
          <p className="col-span-full p-6 text-center text-sm text-muted-foreground">No services in this category.</p>
        )}
      </div>
      <div className="mt-8 flex justify-end">
        <Button variant="dark" onClick={() => selected && onSelect(selected)} disabled={!selected}>
          Continue <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function StylistStep({
  stylists,
  serviceName,
  selected,
  onSelect,
  onContinue,
  onBack,
}: {
  stylists: WizardStylist[];
  serviceName: string;
  selected: string | null;
  onSelect: (id: string | null) => void;
  onContinue: () => void;
  onBack: () => void;
}) {
  return (
    <div>
      <StepTitle
        icon={<UserRound className="h-5 w-5" />}
        title="Choose your specialist"
        subtitle={serviceName ? `These artists work with "${serviceName}".` : "Pick who you'd love to see."}
      />
      <div className="grid gap-3 sm:grid-cols-3">
        <button
          type="button"
          onClick={() => onSelect(null)}
          className={cn(
            "flex flex-col items-center gap-3 rounded-2xl border p-6 text-center transition-all",
            selected === null ? "border-rose bg-rose/5 ring-1 ring-rose" : "border-border/70 hover:border-rose/40 hover:shadow-soft",
          )}
        >
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-rose/10">
            <Sparkles className="h-7 w-7 text-rose" />
          </span>
          <span className="font-serif text-base font-semibold">No preference</span>
          <span className="text-xs text-muted-foreground">We assign the first available artist</span>
        </button>
        {stylists.map((st) => {
          const active = selected === st.id;
          return (
            <button
              key={st.id}
              type="button"
              onClick={() => onSelect(st.id)}
              className={cn(
                "flex flex-col items-center gap-3 rounded-2xl border p-6 text-center transition-all",
                active ? "border-rose bg-rose/5 ring-1 ring-rose" : "border-border/70 hover:border-rose/40 hover:shadow-soft",
              )}
            >
              <span className="relative h-16 w-16 overflow-hidden rounded-full ring-2 ring-gold/40">
                <StylistAvatar name={st.name} image={st.image} initialsClassName="text-xl" />
              </span>
              <span>
                <span className="block font-serif text-base font-semibold">{st.name}</span>
                <span className="block text-xs text-muted-foreground">{st.title}</span>
              </span>
            </button>
          );
        })}
      </div>
      <div className="mt-8 flex items-center justify-between">
        <Button variant="ghost" onClick={onBack}>
          <ChevronLeft className="h-4 w-4" /> Back
        </Button>
        <Button variant="dark" onClick={onContinue}>
          Continue <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function DateTimeStep({
  dates,
  date,
  setDate,
  slots,
  time,
  setTime,
  loading,
  duration,
  onContinue,
  onBack,
}: {
  dates: Date[];
  date: string | null;
  setDate: (d: string) => void;
  slots: string[];
  time: string | null;
  setTime: (t: string) => void;
  loading: boolean;
  duration: number;
  onContinue: () => void;
  onBack: () => void;
}) {
  const todayKey = dateKey(new Date());
  return (
    <div>
      <StepTitle
        icon={<CalendarDays className="h-5 w-5" />}
        title="Pick a date & time"
        subtitle={`Your appointment takes approx ${duration} minutes.`}
      />
      <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
        {dates.map((d) => {
          const key = dateKey(d);
          const active = date === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setDate(key)}
              className={cn(
                "flex min-w-[4.5rem] flex-col items-center rounded-2xl border px-3 py-3 transition-all",
                active ? "border-rose bg-rose text-white shadow-soft" : "border-border/70 bg-white hover:border-rose/40",
              )}
            >
              <span className={cn("text-[10px] font-semibold uppercase", active ? "text-white/80" : "text-muted-foreground")}>
                {d.toLocaleDateString("en-ZA", { weekday: "short" })}
              </span>
              <span className="font-serif text-xl font-bold">{d.getDate()}</span>
              <span className={cn("text-[10px]", active ? "text-white/80" : "text-muted-foreground")}>
                {key === todayKey ? "Today" : d.toLocaleDateString("en-ZA", { month: "short" })}
              </span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-12 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" /> Checking availability…
        </div>
      ) : slots.length > 0 ? (
        <>
          <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {slots.length} available times
          </p>
          <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 md:grid-cols-5">
            {slots.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTime(t)}
                className={cn(
                  "rounded-xl border px-3 py-2.5 text-sm font-semibold transition-all",
                  time === t ? "border-rose bg-rose text-white shadow-soft" : "border-border/70 bg-white hover:border-rose/50",
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </>
      ) : (
        <p className="flex items-center justify-center gap-2 rounded-2xl border border-dashed py-10 text-sm text-muted-foreground">
          <RefreshCw className="h-4 w-4" /> No openings that day — try another date.
        </p>
      )}

      <div className="mt-8 flex items-center justify-between">
        <Button variant="ghost" onClick={onBack}>
          <ChevronLeft className="h-4 w-4" /> Back
        </Button>
        <Button variant="dark" onClick={onContinue} disabled={!date || !time}>
          Continue <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function DetailsStep({
  form,
  setForm,
  signedIn,
  canContinue,
  onContinue,
  onBack,
}: {
  form: { name: string; email: string; phone: string; notes: string };
  setForm: (f: { name: string; email: string; phone: string; notes: string }) => void;
  signedIn: boolean;
  canContinue: boolean;
  onContinue: () => void;
  onBack: () => void;
}) {
  return (
    <div>
      <StepTitle
        icon={<User className="h-5 w-5" />}
        title="Your details"
        subtitle="We'll confirm your appointment by email or WhatsApp."
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="bk-name">Full name</Label>
          <Input id="bk-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Thandi Nkosi" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="bk-phone">Phone / WhatsApp</Label>
          <Input id="bk-phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="e.g. +27 82 000 0000" />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="bk-email">Email</Label>
          <Input id="bk-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="bk-notes">Notes for us (optional)</Label>
          <Textarea
            id="bk-notes"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="Anything we should know — allergies, inspiration photos, occasion…"
            rows={3}
          />
        </div>
      </div>
      {signedIn && (
        <p className="mt-4 text-xs text-muted-foreground">
          You&apos;re signed in — the booking will appear in your dashboard and earn loyalty points.
        </p>
      )}
      <div className="mt-8 flex items-center justify-between">
        <Button variant="ghost" onClick={onBack}>
          <ChevronLeft className="h-4 w-4" /> Back
        </Button>
        <Button variant="dark" onClick={onContinue} disabled={!canContinue}>
          Continue <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function ReviewStep({
  service,
  stylist,
  date,
  time,
  end,
  form,
  submitting,
  onSubmit,
  onBack,
}: {
  service: WizardService;
  stylist: WizardStylist | null;
  date: string;
  time: string;
  end: Date;
  form: { name: string; email: string; phone: string; notes: string };
  submitting: boolean;
  onSubmit: () => void;
  onBack: () => void;
}) {
  const when = new Date(`${date}T${time}`);
  const rows = [
    { label: "Service", value: `${service.name} · ${formatZAR(service.price)}` },
    { label: "Duration", value: `${service.durationMinutes} minutes` },
    { label: "Specialist", value: stylist ? stylist.name : "First available artist" },
    {
      label: "When",
      value: `${when.toLocaleDateString("en-ZA", { weekday: "long", day: "numeric", month: "long", year: "numeric" })} at ${time}`,
    },
    { label: "Until", value: end.toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" }) },
    { label: "Name", value: form.name },
    { label: "Email", value: form.email },
    { label: "Phone", value: form.phone },
  ];
  return (
    <div>
      <StepTitle
        icon={<MapPin className="h-5 w-5" />}
        title="Review your booking"
        subtitle="Double-check everything — a 20% deposit secures your slot."
      />
      <div className="rounded-2xl border bg-ivory/60 p-5">
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          {rows.map((r) => (
            <div key={r.label} className="flex flex-col gap-0.5">
              <dt className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{r.label}</dt>
              <dd className="font-medium">{r.value}</dd>
            </div>
          ))}
          {form.notes && (
            <div className="sm:col-span-2">
              <dt className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Notes</dt>
              <dd className="font-medium">{form.notes}</dd>
            </div>
          )}
        </dl>
      </div>
      <p className="mt-4 text-xs text-muted-foreground">
        A {formatZAR(Math.round(service.price * 0.2))} deposit is payable to secure this time; the balance is settled after your visit.
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        Add to Google Calendar once confirmed — there are no charges today.
      </p>
      <div className="mt-8 flex items-center justify-between">
        <Button variant="ghost" onClick={onBack}>
          <ChevronLeft className="h-4 w-4" /> Back
        </Button>
        <Button variant="dark" onClick={onSubmit} disabled={submitting}>
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {submitting ? "Booking…" : "Confirm booking"} <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function CompleteScreen({
  result,
  start,
  end,
  signedIn,
}: {
  result: Extract<CreateBookingResult, { ok: true }>;
  start: Date;
  end: Date;
  signedIn: boolean;
}) {
  const calUrl = gCalUrl(
    result.serviceName,
    start,
    end,
    `Booking ${result.ref} at Divine Favour Hair & Beauty with ${result.stylistName}.`,
  );
  return (
    <div className="flex flex-col items-center py-4 text-center">
      <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-gold/30 to-rose/30">
        <PartyPopper className="h-9 w-9 text-rose" />
      </div>
      <span className="eyebrow mb-2">Booking confirmed</span>
      <h2 className="font-serif text-3xl font-semibold">You&apos;re booked!</h2>
      <p className="mt-3 max-w-md text-muted-foreground">
        Confirmation <span className="font-semibold text-ink">{result.ref}</span> · {result.serviceName} with{" "}
        {result.stylistName} ·{" "}
        {start.toLocaleDateString("en-ZA", { weekday: "long", day: "numeric", month: "long" })} at{" "}
        {start.toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" })}.
      </p>
      <p className="mt-2 text-sm text-muted-foreground">
        We&apos;ve sent the confirmation to your email — your slot is held for 24 hours pending the deposit.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Button asChild variant="dark">
          <a href={calUrl} target="_blank" rel="noreferrer">
            Add to calendar
          </a>
        </Button>
        {signedIn ? (
          <Button asChild variant="outline">
            <Link href="/account/appointments">View my appointments</Link>
          </Button>
        ) : (
          <Button asChild variant="secondary">
            <Link href="/login">Sign in to manage bookings</Link>
          </Button>
        )}
        <Button asChild variant="ghost">
          <Link href="/booking">Book another</Link>
        </Button>
      </div>
    </div>
  );
}

function ErrorScreen({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center py-6 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-rose/10 text-rose">
        <RefreshCw className="h-6 w-6" />
      </div>
      <h2 className="font-serif text-2xl font-semibold">We couldn&apos;t confirm that</h2>
      <p className="mt-2 max-w-sm text-muted-foreground">{error}</p>
      <Button className="mt-6" variant="dark" onClick={onRetry}>
        Try again
      </Button>
    </div>
  );
}