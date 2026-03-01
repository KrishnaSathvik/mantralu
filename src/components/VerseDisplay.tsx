import { motion } from "framer-motion";
import { DbMantraVerse } from "@/hooks/use-mantras";

interface VerseDisplayProps {
  verse: DbMantraVerse;
  fontSize: number;
  language: "te" | "en" | "both";
  index: number;
}

const verseVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.035, duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as const },
  }),
};

export function VerseDisplay({ verse, fontSize, language, index }: VerseDisplayProps) {
  const showTelugu = language === "te" || language === "both";
  const showEnglish = language === "en" || language === "both";

  return (
    <motion.div
      custom={index}
      initial="hidden"
      animate="visible"
      variants={verseVariants}
      className="verse-card"
    >
      {/* Verse number badge - top corner */}
      <div className="absolute top-3 right-4">
        <span className="verse-number-badge">{verse.verse_number}</span>
      </div>

      {/* Telugu text */}
      {showTelugu && (
        <div className="pr-8">
          <p
            className="font-telugu leading-[2.1] text-foreground whitespace-pre-line tracking-wide"
            style={{ fontSize: `${fontSize}px` }}
          >
            {verse.telugu}
          </p>
        </div>
      )}

      {/* Transliteration */}
      {showEnglish && verse.transliteration && (
        <div className={showTelugu ? "mt-4 pt-3 border-t border-border/50" : "pr-8"}>
          {showTelugu && (
            <span className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground/60 font-semibold mb-1 block">
              Transliteration
            </span>
          )}
          <p
            className="leading-[1.9] text-foreground/75 whitespace-pre-line"
            style={{
              fontSize: `${Math.max(fontSize - 3, 13)}px`,
              fontStyle: showTelugu ? "italic" : "normal",
            }}
          >
            {verse.transliteration}
          </p>
        </div>
      )}

      {/* Meaning */}
      {verse.meaning_en && (
        <div className={`mt-4 pt-3 ${showTelugu || showEnglish ? "border-t border-border/50" : ""}`}>
          <span className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground/60 font-semibold mb-1 block">
            Meaning
          </span>
          <p className="text-[13px] leading-[1.75] text-muted-foreground">
            {verse.meaning_en}
          </p>
        </div>
      )}
    </motion.div>
  );
}
