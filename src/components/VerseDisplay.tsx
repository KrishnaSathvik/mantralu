import { motion } from "framer-motion";
import { DbMantraVerse } from "@/hooks/use-mantras";

interface VerseDisplayProps {
  verse: DbMantraVerse;
  fontSize: number;
  language: "te" | "en" | "both";
  index: number;
}

const verseVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.04, duration: 0.35, ease: [0, 0, 0.2, 1] as const },
  }),
};

export function VerseDisplay({ verse, fontSize, language, index }: VerseDisplayProps) {
  return (
    <motion.div
      custom={index}
      initial="hidden"
      animate="visible"
      variants={verseVariants}
      className="verse-card pl-7"
    >
      {/* Verse number */}
      <div className="flex items-center gap-2 mb-3">
        <span className="verse-number-badge">{verse.verse_number}</span>
      </div>

      {/* Telugu text */}
      {(language === "te" || language === "both") && (
        <div className="mb-3">
          <p
            className="font-telugu leading-[2] text-foreground whitespace-pre-line"
            style={{ fontSize: `${fontSize}px` }}
          >
            {verse.telugu}
          </p>
        </div>
      )}

      {/* Transliteration */}
      {(language === "en" || language === "both") && verse.transliteration && (
        <div className={language === "both" ? "mb-3" : ""}>
          <div className="section-divider">
            <span>Transliteration</span>
          </div>
          <p
            className="italic leading-[1.8] text-foreground/80 whitespace-pre-line mt-1.5"
            style={{ fontSize: `${Math.max(fontSize - 3, 13)}px` }}
          >
            {verse.transliteration}
          </p>
        </div>
      )}

      {/* Meaning */}
      {verse.meaning_en && (
        <>
          <div className="section-divider">
            <span>Meaning</span>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground mt-1.5">
            {verse.meaning_en}
          </p>
        </>
      )}
    </motion.div>
  );
}
