import { Breadcrumbs } from "./breadcrumbs";

export function LegalPage({ title, path, children }: { title: string; path: string; children: React.ReactNode }) {
  return (
    <div className="container-x max-w-3xl pt-28 pb-20 lg:pt-36">
      <Breadcrumbs items={[{ name: title, href: path }]} />
      <h1 className="mt-8 text-4xl font-extrabold">{title}</h1>
      <div className="prose-alsimat mt-8">{children}</div>
    </div>
  );
}
