import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Loader2, Save, ArrowLeft, Plus, Trash2 } from "lucide-react";
import { useDeities, useCategories, DbMantra } from "@/hooks/use-mantras";
import { VersesEditor } from "./VersesEditor";
import { useQueryClient } from "@tanstack/react-query";

interface MantraEditorProps {
  mantra?: DbMantra | null;
  onBack: () => void;
  onSaved: () => void;
}

export function MantraEditor({ mantra, onBack, onSaved }: MantraEditorProps) {
  const queryClient = useQueryClient();
  const { data: deities = [] } = useDeities();
  const { data: categories = [] } = useCategories();
  const [saving, setSaving] = useState(false);
  const isNew = !mantra;

  const [form, setForm] = useState({
    title_en: "",
    title_te: "",
    slug: "",
    telugu_text: "",
    transliteration: "",
    meaning_en: "",
    meaning_te: "",
    deity_id: "",
    category_id: "",
    benefits: [] as string[],
    benefits_te: [] as string[],
    when_to_chant: "",
    when_to_chant_te: "",
    chant_count: null as number | null,
    source_ref: "",
    tags: [] as string[],
    is_published: true,
    sort_order: 0,
  });

  useEffect(() => {
    if (mantra) {
      setForm({
        title_en: mantra.title_en || "",
        title_te: mantra.title_te || "",
        slug: mantra.slug || "",
        telugu_text: mantra.telugu_text || "",
        transliteration: mantra.transliteration || "",
        meaning_en: mantra.meaning_en || "",
        meaning_te: mantra.meaning_te || "",
        deity_id: mantra.deity_id || "",
        category_id: mantra.category_id || "",
        benefits: Array.isArray(mantra.benefits) ? mantra.benefits : [],
        benefits_te: Array.isArray((mantra as any).benefits_te) ? (mantra as any).benefits_te : [],
        when_to_chant: mantra.when_to_chant || "",
        when_to_chant_te: (mantra as any).when_to_chant_te || "",
        chant_count: mantra.chant_count,
        source_ref: mantra.source_ref || "",
        tags: mantra.tags || [],
        is_published: mantra.is_published,
        sort_order: mantra.sort_order,
      });
    }
  }, [mantra?.id]);

  const updateField = (key: string, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  // Auto-generate slug from title
  const generateSlug = () => {
    const slug = form.title_en
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
    updateField("slug", slug);
  };

  const handleSave = async () => {
    if (!form.title_en || !form.slug || !form.telugu_text) {
      toast.error("Title (EN), Slug, and Telugu Text are required");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title_en: form.title_en,
        title_te: form.title_te,
        slug: form.slug,
        telugu_text: form.telugu_text,
        transliteration: form.transliteration,
        meaning_en: form.meaning_en,
        meaning_te: form.meaning_te || null,
        deity_id: form.deity_id || null,
        category_id: form.category_id || null,
        benefits: form.benefits.length > 0 ? form.benefits : [],
        benefits_te: form.benefits_te.length > 0 ? form.benefits_te : null,
        when_to_chant: form.when_to_chant || null,
        when_to_chant_te: form.when_to_chant_te || null,
        chant_count: form.chant_count,
        source_ref: form.source_ref || null,
        tags: form.tags,
        is_published: form.is_published,
        sort_order: form.sort_order,
      };

      if (isNew) {
        const { error } = await supabase.from("mantras").insert(payload);
        if (error) throw error;
        toast.success("Mantra created!");
      } else {
        const { error } = await supabase
          .from("mantras")
          .update(payload)
          .eq("id", mantra.id);
        if (error) throw error;
        toast.success("Mantra updated!");
      }

      queryClient.invalidateQueries({ queryKey: ["mantras"] });
      queryClient.invalidateQueries({ queryKey: ["mantra", form.slug] });
      onSaved();
    } catch (e: any) {
      toast.error(`Save failed: ${e.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-3">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to list
        </button>
        <Button onClick={handleSave} disabled={saving} size="sm">
          {saving ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Save className="h-4 w-4 mr-1.5" />}
          {isNew ? "Create" : "Save"}
        </Button>
      </div>

      <h2 className="font-display text-xl font-bold">
        {isNew ? "New Mantra" : `Edit: ${mantra.title_en}`}
      </h2>

      {/* Basic Info */}
      <Card className="p-4 space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Basic Info</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Title (English) *</Label>
            <Input value={form.title_en} onChange={(e) => updateField("title_en", e.target.value)} placeholder="Gayatri Mantra" />
          </div>
          <div className="space-y-1.5">
            <Label>Title (Telugu)</Label>
            <Input value={form.title_te} onChange={(e) => updateField("title_te", e.target.value)} placeholder="గాయత్రీ మంత్రం" className="font-telugu" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Slug *</Label>
            <div className="flex gap-2">
              <Input value={form.slug} onChange={(e) => updateField("slug", e.target.value)} placeholder="gayatri-mantra" className="flex-1" />
              <Button variant="outline" size="sm" onClick={generateSlug} type="button">Auto</Button>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Sort Order</Label>
            <Input type="number" value={form.sort_order} onChange={(e) => updateField("sort_order", parseInt(e.target.value) || 0)} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Deity</Label>
            <Select value={form.deity_id} onValueChange={(v) => updateField("deity_id", v === "none" ? "" : v)}>
              <SelectTrigger><SelectValue placeholder="Select deity" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {deities.map((d) => (
                  <SelectItem key={d.id} value={d.id}>{d.name_en}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Category</Label>
            <Select value={form.category_id} onValueChange={(v) => updateField("category_id", v === "none" ? "" : v)}>
              <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name_en}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Switch checked={form.is_published} onCheckedChange={(v) => updateField("is_published", v)} />
          <Label>Published</Label>
        </div>
      </Card>

      {/* Content */}
      <Card className="p-4 space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Content</h3>

        <div className="space-y-1.5">
          <Label>Telugu Text *</Label>
          <Textarea value={form.telugu_text} onChange={(e) => updateField("telugu_text", e.target.value)}
            className="font-telugu min-h-[160px] leading-[2]" placeholder="తెలుగు పాఠ్యం..." />
        </div>

        <div className="space-y-1.5">
          <Label>Transliteration</Label>
          <Textarea value={form.transliteration} onChange={(e) => updateField("transliteration", e.target.value)}
            className="min-h-[100px]" placeholder="Om Bhur Bhuvaḥ..." />
        </div>

        <div className="space-y-1.5">
          <Label>Meaning (English)</Label>
          <Textarea value={form.meaning_en} onChange={(e) => updateField("meaning_en", e.target.value)}
            className="min-h-[80px]" placeholder="English meaning..." />
        </div>

        <div className="space-y-1.5">
          <Label>Meaning (Telugu)</Label>
          <Textarea value={form.meaning_te || ""} onChange={(e) => updateField("meaning_te", e.target.value)}
            className="font-telugu min-h-[80px]" placeholder="తెలుగు అర్థం..." />
        </div>
      </Card>

      {/* Benefits & When to Chant */}
      <Card className="p-4 space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Benefits & When to Chant</h3>

        <ArrayEditor label="Benefits (English)" items={form.benefits} onChange={(v) => updateField("benefits", v)} />
        <ArrayEditor label="Benefits (Telugu)" items={form.benefits_te} onChange={(v) => updateField("benefits_te", v)} isTelugu />

        <div className="space-y-1.5">
          <Label>When to Chant (English)</Label>
          <Textarea value={form.when_to_chant} onChange={(e) => updateField("when_to_chant", e.target.value)} className="min-h-[60px]" />
        </div>
        <div className="space-y-1.5">
          <Label>When to Chant (Telugu)</Label>
          <Textarea value={form.when_to_chant_te} onChange={(e) => updateField("when_to_chant_te", e.target.value)} className="font-telugu min-h-[60px]" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Chant Count</Label>
            <Input type="number" value={form.chant_count ?? ""} onChange={(e) => updateField("chant_count", e.target.value ? parseInt(e.target.value) : null)} placeholder="108" />
          </div>
          <div className="space-y-1.5">
            <Label>Source Reference</Label>
            <Input value={form.source_ref} onChange={(e) => updateField("source_ref", e.target.value)} placeholder="Rig Veda 3.62.10" />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Tags (comma-separated)</Label>
          <Input value={form.tags.join(", ")} onChange={(e) => updateField("tags", e.target.value.split(",").map((t) => t.trim()).filter(Boolean))} placeholder="protection, daily, morning" />
        </div>
      </Card>

      {/* Verses Editor (only for existing mantras) */}
      {!isNew && mantra && (
        <>
          <Separator />
          <VersesEditor mantraId={mantra.id} />
        </>
      )}

      {/* Bottom save */}
      <div className="flex justify-end pt-2 pb-8">
        <Button onClick={handleSave} disabled={saving} size="lg">
          {saving ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Save className="h-4 w-4 mr-1.5" />}
          {isNew ? "Create Mantra" : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}

// Helper: editable string array
function ArrayEditor({ label, items, onChange, isTelugu }: { label: string; items: string[]; onChange: (v: string[]) => void; isTelugu?: boolean }) {
  const addItem = () => onChange([...items, ""]);
  const removeItem = (i: number) => onChange(items.filter((_, idx) => idx !== i));
  const updateItem = (i: number, val: string) => onChange(items.map((item, idx) => (idx === i ? val : item)));

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        <Button variant="ghost" size="sm" onClick={addItem} type="button">
          <Plus className="h-3 w-3 mr-1" /> Add
        </Button>
      </div>
      {items.map((item, i) => (
        <div key={i} className="flex gap-2">
          <Input value={item} onChange={(e) => updateItem(i, e.target.value)} className={`flex-1 ${isTelugu ? "font-telugu" : ""}`} />
          <Button variant="ghost" size="icon" onClick={() => removeItem(i)} className="shrink-0 text-destructive">
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ))}
    </div>
  );
}
