import Image from "next/image";
import { Breadcrumbs, type Crumb } from "./breadcrumbs";

/** Bandeau de page intérieure, avec ou sans image de fond. */
export function PageHero({
  title,
  subtitle,
  eyebrow,
  image,
  crumbs,
  children,
}: {
  title: string;
  subtitle?: string | null;
  eyebrow?: string;
  image?: string | null;
  crumbs: Crumb[];
  children?: React.ReactNode;
}) {
  return (
    <section className="relative isolate overflow-hidden bg-ink pt-32 pb-16 text-white sm:pt-40 sm:pb-20">
      {image ? (
        <>
          <Image src={image} alt="" fill priority sizes="100vw" className="-z-20 animate-ken-burns object-cover opacity-60" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-ink via-ink/85 to-ink/30" />
        </>
      ) : (
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,rgba(105,202,152,0.35),transparent_55%)]" />
      )}
      <div className="container-x">
        <Breadcrumbs items={crumbs} light />
        {eyebrow && <p className="eyebrow mt-8 text-brand-300">{eyebrow}</p>}
        <h1 className="mt-4 max-w-3xl animate-fade-up text-4xl font-extrabold sm:text-5xl lg:text-6xl">{title}</h1>
        {subtitle && (
          <p className="mt-5 max-w-2xl animate-fade-up text-base text-white/80 [animation-delay:120ms] sm:text-lg">{subtitle}</p>
        )}
        {children && <div className="mt-8 animate-fade-up [animation-delay:220ms]">{children}</div>}
      </div>
    </section>
  );
}
