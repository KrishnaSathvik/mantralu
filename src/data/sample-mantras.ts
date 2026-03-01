export interface Mantra {
  id: string;
  slug: string;
  title_en: string;
  title_te: string;
  deity: string;
  category: string;
  text_te: string;
  transliteration: string;
  meaning_en: string;
  benefits: string;
  when_to_chant: string;
  tags: string[];
  chant_count?: number;
}

export interface Deity {
  id: string;
  name_en: string;
  name_te: string;
  icon: string;
}

export interface Category {
  id: string;
  name_en: string;
  name_te: string;
  slug: string;
  icon: string;
}

export const deities: Deity[] = [
  { id: "1", name_en: "Ganesha", name_te: "గణేశుడు", icon: "🕉️" },
  { id: "2", name_en: "Shiva", name_te: "శివుడు", icon: "🔱" },
  { id: "3", name_en: "Vishnu", name_te: "విష్ణువు", icon: "🪷" },
  { id: "4", name_en: "Hanuman", name_te: "హనుమాన్", icon: "🐒" },
  { id: "5", name_en: "Lakshmi", name_te: "లక్ష్మి", icon: "🪔" },
  { id: "6", name_en: "Saraswati", name_te: "సరస్వతి", icon: "📿" },
  { id: "7", name_en: "Surya", name_te: "సూర్యుడు", icon: "☀️" },
  { id: "8", name_en: "Universal", name_te: "సార్వత్రికం", icon: "🙏" },
];

export const categories: Category[] = [
  { id: "1", name_en: "Daily Prayers", name_te: "నిత్య ప్రార్థనలు", slug: "daily", icon: "🌅" },
  { id: "2", name_en: "Deity Mantras", name_te: "దేవతా మంత్రాలు", slug: "deity", icon: "🕉️" },
  { id: "3", name_en: "Stotras", name_te: "స్తోత్రాలు", slug: "stotras", icon: "📜" },
  { id: "4", name_en: "Aartis", name_te: "ఆరతులు", slug: "aartis", icon: "🪔" },
  { id: "5", name_en: "Healing", name_te: "ఆరోగ్యం", slug: "healing", icon: "💚" },
  { id: "6", name_en: "Prosperity", name_te: "సంపద", slug: "prosperity", icon: "✨" },
];

export const mantras: Mantra[] = [
  {
    id: "1",
    slug: "gayatri-mantra",
    title_en: "Gayatri Mantra",
    title_te: "గాయత్రీ మంత్రం",
    deity: "Surya",
    category: "daily",
    text_te: "ఓం భూర్భువస్సువః\nతత్సవితుర్వరేణ్యం\nభర్గో దేవస్య ధీమహి\nధియో యో నః ప్రచోదయాత్",
    transliteration: "Om Bhur Bhuvaḥ Swaḥ\nTat Savitur Vareṇyaṃ\nBhargo Devasya Dhīmahi\nDhiyo Yo Naḥ Prachodayāt",
    meaning_en: "We meditate on the glory of the Creator who has created the Universe, who is worthy of worship, who is the embodiment of knowledge and light, who is the remover of all sin and ignorance. May He enlighten our intellect.",
    benefits: "Enhances concentration and learning. Purifies the mind and removes negativity. Bestows wisdom and spiritual growth. One of the most powerful Vedic mantras.",
    when_to_chant: "During sunrise (Brahma Muhurta), ideally 108 times. Also effective during sunset and noon — the three sandhya times.",
    tags: ["morning", "daily", "vedic", "meditation"],
    chant_count: 108,
  },
  {
    id: "2",
    slug: "ganesh-vandana",
    title_en: "Ganesh Vandana",
    title_te: "గణేష వందన",
    deity: "Ganesha",
    category: "deity",
    text_te: "వక్రతుండ మహాకాయ\nసూర్యకోటి సమప్రభ\nనిర్విఘ్నం కురు మే దేవ\nసర్వకార్యేషు సర్వదా",
    transliteration: "Vakratunda Mahakaya\nSuryakoti Samaprabha\nNirvighnam Kuru Me Deva\nSarva Karyeshu Sarvada",
    meaning_en: "O Lord with the curved trunk and massive body, whose splendor equals a billion suns, please make all my endeavors free of obstacles, always.",
    benefits: "Removes obstacles from all undertakings. Brings auspicious beginnings. Invokes divine blessings for success.",
    when_to_chant: "Before starting any new venture, journey, or important task. Traditionally chanted at the beginning of prayers.",
    tags: ["morning", "auspicious", "beginnings"],
    chant_count: 11,
  },
  {
    id: "3",
    slug: "panchakshari-mantra",
    title_en: "Panchakshari Mantra",
    title_te: "పంచాక్షరి మంత్రం",
    deity: "Shiva",
    category: "deity",
    text_te: "ఓం నమః శివాయ",
    transliteration: "Om Namaḥ Śivāya",
    meaning_en: "I bow to Lord Shiva — the auspicious one, the transformer, the supreme consciousness that resides in all.",
    benefits: "Destroys negativity and purifies the soul. Brings inner peace and mental clarity. Connects the chanter to cosmic consciousness. One of the most sacred mantras in Shaivism.",
    when_to_chant: "Anytime, especially during Pradosha Kala (evening twilight). Particularly powerful on Mondays and during Maha Shivaratri.",
    tags: ["monday", "shiva", "meditation", "daily"],
    chant_count: 108,
  },
  {
    id: "4",
    slug: "maha-mantra",
    title_en: "Maha Mantra (Hare Krishna)",
    title_te: "మహా మంత్రం",
    deity: "Vishnu",
    category: "deity",
    text_te: "హరే కృష్ణ హరే కృష్ణ\nకృష్ణ కృష్ణ హరే హరే\nహరే రామ హరే రామ\nరామ రామ హరే హరే",
    transliteration: "Hare Kṛṣṇa Hare Kṛṣṇa\nKṛṣṇa Kṛṣṇa Hare Hare\nHare Rāma Hare Rāma\nRāma Rāma Hare Hare",
    meaning_en: "O Supreme Energy (Hare), O All-Attractive One (Krishna), O Source of all Joy (Rama) — please engage me in Your loving devotional service.",
    benefits: "Supreme mantra for this age (Kali Yuga). Purifies the heart and awakens divine love. Brings liberation and eternal bliss. Easy to chant for all, regardless of qualification.",
    when_to_chant: "Anytime, anywhere. Traditionally chanted on japa mala (108 beads) in the early morning. No restrictions — can be chanted by anyone.",
    tags: ["daily", "bhakti", "meditation", "japa"],
    chant_count: 108,
  },
  {
    id: "5",
    slug: "hanuman-chalisa",
    title_en: "Hanuman Chalisa (Opening)",
    title_te: "హనుమాన్ చాలీసా (ప్రారంభం)",
    deity: "Hanuman",
    category: "stotras",
    text_te: "శ్రీ గురు చరణ సరోజ రజ\nనిజ మను ముకురు సుధారి\nబరణఉ రఘుబర బిమల జసు\nజో దాయకు ఫల చారి\n\nబుద్ధిహీన తను జానికే\nసుమిరౌ పవన కుమార\nబల బుద్ధి విద్యా దేహు మోహి\nహరహు కలేశ విక్ర",
    transliteration: "Shri Guru Charan Saroj Raj\nNij Manu Mukuru Sudhari\nBaranau Raghubar Bimal Jasu\nJo Dayaku Phal Chari\n\nBuddhiheen Tanu Jaanike\nSumirau Pavan Kumar\nBal Buddhi Vidya Dehu Mohi\nHarahu Kalesh Vikar",
    meaning_en: "With the dust of Guru's lotus feet, I clean the mirror of my mind and then narrate the sacred glory of Sri Ram, the Supreme among the Raghu dynasty, the giver of four fruits of life.\n\nKnowing myself to be ignorant, I meditate upon Hanuman, son of the Wind God. Grant me strength, wisdom, and knowledge, and remove all afflictions and impurities.",
    benefits: "Grants courage, strength, and protection. Removes fear and evil influences. Bestows wisdom and devotion. Extremely powerful for overcoming difficulties.",
    when_to_chant: "Tuesdays and Saturdays are especially auspicious. Also during times of fear, difficulty, or when seeking courage.",
    tags: ["tuesday", "saturday", "protection", "courage", "stotra"],
    chant_count: 1,
  },
];
