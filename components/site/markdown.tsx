import Link from "next/link";
import { Fragment } from "react";
import { slugify } from "@/lib/utils";

/** Rendu Markdown minimal (titres ##/###, listes -, **gras**, [liens](url)) pour les contenus de l'admin. */
function inline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g);
  return parts.map((p, i) => {
    if (p.startsWith("**") && p.endsWith("**")) return <strong key={i}>{p.slice(2, -2)}</strong>;
    const m = p.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (m) {
      const href = m[2];
      return href.startsWith("/") ? <Link key={i} href={href}>{m[1]}</Link> : <a key={i} href={href} rel="noopener" target="_blank">{m[1]}</a>;
    }
    return <Fragment key={i}>{p}</Fragment>;
  });
}

export function Markdown({ text, className = "prose-alsimat" }: { text: string; className?: string }) {
  const blocks = text.replace(/\r/g, "").split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);
  return (
    <div className={className}>
      {blocks.map((b, i) => {
        if (b.startsWith("### ")) return <h3 key={i}>{inline(b.slice(4))}</h3>;
        if (b.startsWith("## ")) return <h2 key={i} id={slugify(b.slice(3))}>{inline(b.slice(3))}</h2>;
        const lines = b.split("\n");
        if (lines.every((l) => /^[-*] /.test(l))) return <ul key={i}>{lines.map((l, j) => <li key={j}>{inline(l.slice(2))}</li>)}</ul>;
        return <p key={i}>{lines.map((l, j) => <Fragment key={j}>{j > 0 && <br />}{inline(l)}</Fragment>)}</p>;
      })}
    </div>
  );
}

/** Table des matières à partir des titres ## */
export const headingsOf = (text: string) => text.split("\n").filter((l) => l.startsWith("## ")).map((l) => l.slice(3).trim());
