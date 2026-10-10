import Link from "next/link";
import { cn } from "@/lib/utils";

export function PageTitle({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-extrabold sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-ink/55">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Card({ title, children, className }: { title?: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-2xl border border-ink/10 bg-white p-5 sm:p-6", className)}>
      {title && <h2 className="mb-4 text-base font-bold">{title}</h2>}
      {children}
    </section>
  );
}

type FieldProps = { label: string; name: string; defaultValue?: string | number | null; hint?: string; required?: boolean; className?: string };

export function Field({ label, name, defaultValue, hint, required, className, type = "text", placeholder }: FieldProps & { type?: string; placeholder?: string }) {
  return (
    <label className={cn("block", className)}>
      <span className="label">{label}{required && " *"}</span>
      <input name={name} type={type} defaultValue={defaultValue ?? ""} required={required} placeholder={placeholder} className="field" />
      {hint && <span className="mt-1 block text-xs text-ink/50">{hint}</span>}
    </label>
  );
}

export function TextArea({ label, name, defaultValue, hint, required, className, rows = 4 }: FieldProps & { rows?: number }) {
  return (
    <label className={cn("block", className)}>
      <span className="label">{label}{required && " *"}</span>
      <textarea name={name} rows={rows} defaultValue={defaultValue ?? ""} required={required} className="field font-[inherit]" />
      {hint && <span className="mt-1 block text-xs text-ink/50">{hint}</span>}
    </label>
  );
}

export function Toggle({ label, name, defaultChecked, hint }: { label: string; name: string; defaultChecked?: boolean; hint?: string }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-ink/10 p-3 hover:bg-sand">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="mt-0.5 h-5 w-5 accent-brand-500" />
      <span>
        <span className="block text-sm font-semibold">{label}</span>
        {hint && <span className="block text-xs text-ink/50">{hint}</span>}
      </span>
    </label>
  );
}

export function Select({ label, name, defaultValue, options, className }: { label: string; name: string; defaultValue?: string | null; options: { value: string; label: string }[]; className?: string }) {
  return (
    <label className={cn("block", className)}>
      <span className="label">{label}</span>
      <select name={name} defaultValue={defaultValue ?? ""} className="field">
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </label>
  );
}

export function Badge({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "green" | "amber" | "red" | "blue" }) {
  const tones = {
    neutral: "bg-ink/5 text-ink/70",
    green: "bg-brand-50 text-brand-700",
    amber: "bg-amber-50 text-amber-700",
    red: "bg-red-50 text-red-700",
    blue: "bg-sky-50 text-sky-700",
  };
  return <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold", tones[tone])}>{children}</span>;
}

export function Notice({ ok }: { ok?: string }) {
  if (!ok) return null;
  return <p role="status" className="mb-6 rounded-xl bg-brand-50 px-4 py-3 text-sm font-medium text-brand-700">✓ Modifications enregistrées.</p>;
}

export function NewButton({ href, label }: { href: string; label: string }) {
  return <Link href={href} className="btn-primary !py-2.5">+ {label}</Link>;
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <p className="rounded-2xl border border-dashed border-ink/15 p-10 text-center text-sm text-ink/55">{children}</p>;
}

export function SimpleList({ base, items }: { base: string; items: { id: string; title: string; subtitle?: string | null; image?: string | null; online: boolean; extra?: string }[] }) {
  if (!items.length) return <Empty>Rien pour le moment. Les éléments ajoutés ici apparaîtront sur le site dès qu'ils sont en ligne.</Empty>;
  return (
    <ul className="divide-y divide-ink/5 rounded-2xl border border-ink/10 bg-white">
      {items.map((it) => (
        <li key={it.id}>
          <Link href={`${base}/${it.id}`} className="flex items-center gap-4 p-3 hover:bg-sand/60">
            <span className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-sand">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {it.image && <img src={it.image} alt="" className="h-full w-full object-cover" />}
            </span>
            <span className="flex-1 font-semibold">{it.title}{it.subtitle && <span className="block text-xs font-normal text-ink/50">{it.subtitle}</span>}</span>
            {it.extra && <Badge tone="amber">{it.extra}</Badge>}
            {it.online ? <Badge tone="green">En ligne</Badge> : <Badge>Masqué</Badge>}
          </Link>
        </li>
      ))}
    </ul>
  );
}
