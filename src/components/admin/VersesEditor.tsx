import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useMantraVerses, DbMantraVerse } from "@/hooks/use-mantras";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Save, Plus, Trash2, GripVertical } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

interface VersesEditorProps {
  mantraId: string;
}

interface VerseForm {
  id?: string;
  verse_number: number;
  telugu: string;
  transliteration: string;
  meaning_en: string;
  meaning_te: string;
  _deleted?: boolean;
}

export function VersesEditor({ mantraId }: VersesEditorProps) {
  const queryClient = useQueryClient();
  const { data: existingVerses = [], isLoading } = useMantraVerses(mantraId);
  const [verses, setVerses] = useState<VerseForm[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (existingVerses.length > 0) {
      setVerses(
        existingVerses.map((v) => ({
          id: v.id,
          verse_number: v.verse_number,
          telugu: v.telugu,
          transliteration: v.transliteration || "",
          meaning_en: v.meaning_en || "",
          meaning_te: v.meaning_te || "",
        }))
      );
    }
  }, [existingVerses]);

  const addVerse = () => {
    const maxNum = verses.reduce((max, v) => (!v._deleted && v.verse_number > max ? v.verse_number : max), 0);
    setVerses((prev) => [
      ...prev,
      { verse_number: maxNum + 1, telugu: "", transliteration: "", meaning_en: "", meaning_te: "" },
    ]);
  };

  const updateVerse = (index: number, key: keyof VerseForm, value: any) => {
    setVerses((prev) => prev.map((v, i) => (i === index ? { ...v, [key]: value } : v)));
  };

  const deleteVerse = (index: number) => {
    setVerses((prev) =>
      prev.map((v, i) => {
        if (i !== index) return v;
        if (v.id) return { ...v, _deleted: true };
        return v;
      }).filter((v, i) => i !== index || v.id) // remove unsaved, mark saved as deleted
    );
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      // Delete removed verses
      const toDelete = verses.filter((v) => v._deleted && v.id);
      for (const v of toDelete) {
        const { error } = await supabase.from("mantra_verses").delete().eq("id", v.id!);
        if (error) throw error;
      }

      // Upsert remaining verses
      const toUpsert = verses.filter((v) => !v._deleted);
      for (const v of toUpsert) {
        const payload = {
          mantra_id: mantraId,
          verse_number: v.verse_number,
          telugu: v.telugu,
          transliteration: v.transliteration || null,
          meaning_en: v.meaning_en || null,
          meaning_te: v.meaning_te || null,
        };

        if (v.id) {
          const { error } = await supabase.from("mantra_verses").update(payload).eq("id", v.id);
          if (error) throw error;
        } else {
          const { error } = await supabase.from("mantra_verses").insert(payload);
          if (error) throw error;
        }
      }

      toast.success(`Saved ${toUpsert.length} verses`);
      queryClient.invalidateQueries({ queryKey: ["mantra-verses", mantraId] });
    } catch (e: any) {
      toast.error(`Verse save failed: ${e.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return <Card className="p-6 text-center text-muted-foreground">Loading verses...</Card>;
  }

  const activeVerses = verses.filter((v) => !v._deleted);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-semibold">Verses ({activeVerses.length})</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={addVerse}>
            <Plus className="h-3.5 w-3.5 mr-1" /> Add Verse
          </Button>
          <Button size="sm" onClick={handleSaveAll} disabled={saving}>
            {saving ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <Save className="h-3.5 w-3.5 mr-1" />}
            Save Verses
          </Button>
        </div>
      </div>

      {activeVerses.length === 0 && (
        <Card className="p-6 text-center text-muted-foreground">
          No verses yet. Click "Add Verse" to add content, or use the main Telugu Text field for short mantras.
        </Card>
      )}

      <div className="space-y-3">
        {verses.map((verse, index) => {
          if (verse._deleted) return null;
          return (
            <Card key={verse.id || `new-${index}`} className="p-4 space-y-3 relative">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GripVertical className="h-4 w-4 text-muted-foreground/40" />
                  <Label className="text-xs font-bold uppercase tracking-wider text-primary">
                    Verse #{verse.verse_number}
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={verse.verse_number}
                    onChange={(e) => updateVerse(index, "verse_number", parseInt(e.target.value) || 0)}
                    className="w-16 h-7 text-xs"
                    title="Verse number"
                  />
                  <Button variant="ghost" size="icon" onClick={() => deleteVerse(index)} className="h-7 w-7 text-destructive">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Telugu</Label>
                <Textarea
                  value={verse.telugu}
                  onChange={(e) => updateVerse(index, "telugu", e.target.value)}
                  className="font-telugu min-h-[80px] leading-[2]"
                  placeholder="తెలుగు పద్యం..."
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Transliteration</Label>
                <Textarea
                  value={verse.transliteration}
                  onChange={(e) => updateVerse(index, "transliteration", e.target.value)}
                  className="min-h-[60px]"
                  placeholder="Transliteration..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Meaning (English)</Label>
                  <Textarea
                    value={verse.meaning_en}
                    onChange={(e) => updateVerse(index, "meaning_en", e.target.value)}
                    className="min-h-[60px]"
                    placeholder="English meaning..."
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Meaning (Telugu)</Label>
                  <Textarea
                    value={verse.meaning_te}
                    onChange={(e) => updateVerse(index, "meaning_te", e.target.value)}
                    className="font-telugu min-h-[60px]"
                    placeholder="తెలుగు అర్థం..."
                  />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {activeVerses.length > 0 && (
        <div className="flex justify-between pt-2">
          <Button variant="outline" size="sm" onClick={addVerse}>
            <Plus className="h-3.5 w-3.5 mr-1" /> Add Verse
          </Button>
          <Button size="sm" onClick={handleSaveAll} disabled={saving}>
            {saving ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <Save className="h-3.5 w-3.5 mr-1" />}
            Save All Verses
          </Button>
        </div>
      )}
    </div>
  );
}
