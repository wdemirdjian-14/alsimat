'use client';

import { useEffect, useState } from 'react';
import { AdminShell } from '@/components/admin/admin-shell';
import { ImageUploader } from '@/components/admin/image-uploader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Save, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface HomeContent {
  heroTitle: string; heroHighlight: string; heroSubtitle: string; heroImage: string;
  gammesTitle: string; gammesSubtitle: string; ctaTitle: string; ctaSubtitle: string;
}
interface AboutContent {
  subtitle: string; image: string; introParagraphs: string[]; bodyParagraphs: string[];
  stats: { label: string; value: string }[];
}

const DEFAULT_HOME: HomeContent = {
  heroTitle: 'bienvenue chez', heroHighlight: 'alsimat',
  heroSubtitle: 'votre spécialiste tracteurs et nacelles électriques', heroImage: '',
  gammesTitle: 'Nos gammes', gammesSubtitle: 'Retrouvez tous les produits Alsimat',
  ctaTitle: 'Un projet ? Une question ?',
  ctaSubtitle: "Contactez-nous pour obtenir un devis personnalisé ou pour toute demande d'information.",
};
const DEFAULT_ABOUT: AboutContent = {
  subtitle: 'Qui sommes nous ?', image: '', introParagraphs: [''], bodyParagraphs: [''],
  stats: [{ label: '', value: '' }],
};

export default function AdminContenuPage() {
  const [home, setHome] = useState<HomeContent>(DEFAULT_HOME);
  const [about, setAbout] = useState<AboutContent>(DEFAULT_ABOUT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/admin/settings');
        if (!res.ok) throw new Error();
        const map = await res.json();
        if (map.home_content) { try { setHome({ ...DEFAULT_HOME, ...JSON.parse(map.home_content) }); } catch {} }
        if (map.about_content) { try { setAbout({ ...DEFAULT_ABOUT, ...JSON.parse(map.about_content) }); } catch {} }
      } catch { toast.error('Erreur lors du chargement'); } finally { setLoading(false); }
    })();
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ home_content: JSON.stringify(home), about_content: JSON.stringify(about) }),
      });
      if (!res.ok) throw new Error();
      toast.success('Contenu enregistré');
    } catch { toast.error("Erreur lors de l'enregistrement"); } finally { setSaving(false); }
  };

  const updateArr = (arr: string[], i: number, v: string) => arr.map((x, idx) => (idx === i ? v : x));

  if (loading) {
    return <AdminShell><div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></AdminShell>;
  }

  return (
    <AdminShell>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contenu du site</h1>
          <p className="text-gray-500 mt-1">Modifiez les textes et images des pages Accueil et À propos</p>
        </div>
        <Button onClick={save} disabled={saving} className="bg-primary hover:bg-primary/90">
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}Enregistrer
        </Button>
      </div>

      <Tabs defaultValue="home" className="max-w-3xl">
        <TabsList className="mb-6"><TabsTrigger value="home">Accueil</TabsTrigger><TabsTrigger value="about">À propos</TabsTrigger></TabsList>

        <TabsContent value="home" className="space-y-6">
          <div className="rounded-xl border bg-white p-5 space-y-4">
            <h3 className="font-semibold text-gray-900">Bannière d'accueil</h3>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Titre</Label><Input value={home.heroTitle} onChange={(e) => setHome({ ...home, heroTitle: e.target.value })} /></div>
              <div><Label>Mot en vert</Label><Input value={home.heroHighlight} onChange={(e) => setHome({ ...home, heroHighlight: e.target.value })} /></div>
            </div>
            <div><Label>Sous-titre</Label><Input value={home.heroSubtitle} onChange={(e) => setHome({ ...home, heroSubtitle: e.target.value })} /></div>
            <div><Label>Image de fond</Label><ImageUploader images={home.heroImage ? [home.heroImage] : []} onChange={(imgs) => setHome({ ...home, heroImage: imgs[0] ?? '' })} multiple={false} /></div>
          </div>
          <div className="rounded-xl border bg-white p-5 space-y-4">
            <h3 className="font-semibold text-gray-900">Section « Nos gammes »</h3>
            <div><Label>Titre</Label><Input value={home.gammesTitle} onChange={(e) => setHome({ ...home, gammesTitle: e.target.value })} /></div>
            <div><Label>Sous-titre</Label><Input value={home.gammesSubtitle} onChange={(e) => setHome({ ...home, gammesSubtitle: e.target.value })} /></div>
          </div>
          <div className="rounded-xl border bg-white p-5 space-y-4">
            <h3 className="font-semibold text-gray-900">Bloc d'appel à l'action</h3>
            <div><Label>Titre</Label><Input value={home.ctaTitle} onChange={(e) => setHome({ ...home, ctaTitle: e.target.value })} /></div>
            <div><Label>Sous-titre</Label><Textarea rows={2} value={home.ctaSubtitle} onChange={(e) => setHome({ ...home, ctaSubtitle: e.target.value })} /></div>
          </div>
        </TabsContent>

        <TabsContent value="about" className="space-y-6">
          <div className="rounded-xl border bg-white p-5 space-y-4">
            <div><Label>Sous-titre de la bannière</Label><Input value={about.subtitle} onChange={(e) => setAbout({ ...about, subtitle: e.target.value })} /></div>
            <div><Label>Image</Label><ImageUploader images={about.image ? [about.image] : []} onChange={(imgs) => setAbout({ ...about, image: imgs[0] ?? '' })} multiple={false} /></div>
          </div>
          <div className="rounded-xl border bg-white p-5 space-y-3">
            <div className="flex items-center justify-between"><h3 className="font-semibold text-gray-900">Paragraphes d'introduction</h3>
              <Button variant="outline" size="sm" onClick={() => setAbout({ ...about, introParagraphs: [...about.introParagraphs, ''] })}><Plus className="h-3.5 w-3.5" /></Button></div>
            <p className="text-xs text-gray-400">Astuce : entourez un mot de &lt;strong&gt;...&lt;/strong&gt; pour le mettre en gras.</p>
            {about.introParagraphs.map((p, i) => (
              <div key={i} className="flex gap-2">
                <Textarea rows={3} value={p} onChange={(e) => setAbout({ ...about, introParagraphs: updateArr(about.introParagraphs, i, e.target.value) })} />
                <Button variant="outline" size="sm" className="text-red-600" onClick={() => setAbout({ ...about, introParagraphs: about.introParagraphs.filter((_, idx) => idx !== i) })}><Trash2 className="h-3.5 w-3.5" /></Button>
              </div>
            ))}
          </div>
          <div className="rounded-xl border bg-white p-5 space-y-3">
            <div className="flex items-center justify-between"><h3 className="font-semibold text-gray-900">Paragraphes de contenu</h3>
              <Button variant="outline" size="sm" onClick={() => setAbout({ ...about, bodyParagraphs: [...about.bodyParagraphs, ''] })}><Plus className="h-3.5 w-3.5" /></Button></div>
            {about.bodyParagraphs.map((p, i) => (
              <div key={i} className="flex gap-2">
                <Textarea rows={3} value={p} onChange={(e) => setAbout({ ...about, bodyParagraphs: updateArr(about.bodyParagraphs, i, e.target.value) })} />
                <Button variant="outline" size="sm" className="text-red-600" onClick={() => setAbout({ ...about, bodyParagraphs: about.bodyParagraphs.filter((_, idx) => idx !== i) })}><Trash2 className="h-3.5 w-3.5" /></Button>
              </div>
            ))}
          </div>
          <div className="rounded-xl border bg-white p-5 space-y-3">
            <div className="flex items-center justify-between"><h3 className="font-semibold text-gray-900">Chiffres clés</h3>
              <Button variant="outline" size="sm" onClick={() => setAbout({ ...about, stats: [...about.stats, { label: '', value: '' }] })}><Plus className="h-3.5 w-3.5" /></Button></div>
            {about.stats.map((s, i) => (
              <div key={i} className="flex gap-2 items-end">
                <div className="flex-1"><Label>Libellé</Label><Input value={s.label} onChange={(e) => setAbout({ ...about, stats: about.stats.map((x, idx) => idx === i ? { ...x, label: e.target.value } : x) })} /></div>
                <div className="flex-1"><Label>Valeur</Label><Input value={s.value} onChange={(e) => setAbout({ ...about, stats: about.stats.map((x, idx) => idx === i ? { ...x, value: e.target.value } : x) })} /></div>
                <Button variant="outline" size="sm" className="text-red-600" onClick={() => setAbout({ ...about, stats: about.stats.filter((_, idx) => idx !== i) })}><Trash2 className="h-3.5 w-3.5" /></Button>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </AdminShell>
  );
}
