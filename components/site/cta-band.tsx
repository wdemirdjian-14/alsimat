import Link from "next/link";
import { ArrowRight, Phone } from "lucide-react";
import { telHref } from "@/lib/site";

export function CtaBand({ title, subtitle, phone }: { title: string; subtitle: string; phone: string }) {
  return (
    <section className="container-x py-20 lg:py-28">
      <div data-reveal className="relative isolate overflow-hidden rounded-[2rem] bg-brand-500 px-6 py-14 text-white sm:px-14 lg:py-20">
        <div className="absolute -top-24 -right-24 -z-10 h-80 w-80 rounded-full bg-brand-300/60 blur-3xl" aria-hidden />
        <div className="absolute -bottom-32 -left-20 -z-10 h-80 w-80 rounded-full bg-ink/30 blur-3xl" aria-hidden />
        <svg className="absolute right-0 bottom-0 -z-10 h-full opacity-10" viewBox="0 0 200 200" aria-hidden>
          <path d="M100 10c50 30 80 70 70 120-8 40-50 60-90 50C30 170 10 120 30 70 45 35 70 18 100 10Z" fill="white" />
        </svg>
        <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-extrabold sm:text-4xl lg:text-5xl">{title}</h2>
            <p className="mt-4 text-lg text-white/85">{subtitle}</p>
          </div>
          <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
            <Link href="/contact" className="btn-dark !px-7 !py-4">
              Demander un devis <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <a href={telHref(phone)} className="btn-light !px-7 !py-4">
              <Phone className="h-4 w-4" aria-hidden /> {phone}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
