
# MantraVani — Sacred Prayers & Mantras

A beautiful, offline-friendly web app for browsing Hindu mantras, prayers, and stotras in Telugu and English. Built with React + Supabase (Lovable Cloud).

---

## Phase 1: Foundation & Core UI ✅ DONE

### Design System & Theme ✅
- Warm devotional color palette: saffron primary (#E8731A), deep maroon headings, cream background (#FFFCF7)
- Dark mode with temple-friendly dark tones
- Noto Sans Telugu font for Telugu text, Playfair Display for headings, Source Sans 3 for body
- Mobile-first responsive design with generous spacing for readability
- Safe area insets for notched devices
- PWA manifest configured (vite-plugin-pwa)

### Home Page ✅
- Daily mantra highlight card (date-rotated from data)
- Search bar at top
- Category grid with deity icons (6 categories)
- "Recently Viewed" section (localStorage-based)
- Bottom navigation: Home, Browse, Search, Favorites, Settings
- Framer-motion animations: staggered cards, page transitions, AnimatePresence

### Browse Page ✅
- Filter by category (Daily Prayers, Deity, Stotras, Aartis, Healing, Prosperity)
- Filter by deity with icon tiles (8 deities)
- Tag-based filtering (morning, monday, festival, healing, etc.)
- Animated filter chips

### Mantra Detail Page ✅
- Full Telugu text with generous line spacing
- Transliteration section
- English meaning/translation
- Benefits and "When to Chant" info
- Font size slider (16px–36px)
- Share button (Web Share API)
- Copy to clipboard
- Language toggle (Both/Telugu/English)
- Cascading section entrance animations

### Search ✅
- Full-text search across titles, content, transliteration, deity, tags (Telugu + English)
- Staggered result animations

### Settings Page ✅
- Font size control with Telugu preview
- Dark mode toggle
- Language preference (both/te/en)
- About section

### Favorites ✅
- Heart toggle on all mantra cards
- Dedicated favorites page with empty state

---

## Phase 2: Database & Backend (Lovable Cloud / Supabase) ← NEXT

### Database Schema (from v2.1 Architecture Doc)

**mantras** table:
- id (uuid PK), slug (unique), title_en, title_te
- deity_id (FK → deities), category_id (FK → categories)
- telugu_text, transliteration, meaning_en, meaning_te
- benefits (jsonb array), when_to_chant, chant_count
- source_ref (nullable), tags (text[]), is_published (boolean)
- sort_order, created_at, updated_at

**deities** table:
- id (uuid PK), name_en, name_te, icon, description_en, description_te, image_url

**categories** table:
- id (uuid PK), name_en, name_te, slug (unique), icon, sort_order, mantra_count

**mantra_verses** table (for long stotras):
- id (uuid PK), mantra_id (FK), verse_number, telugu, transliteration, meaning_en, meaning_te

### Seed Data
- Start with 10 complete mantras: Gayatri, Ganesh Vandana, Panchakshari, Maha Mantra, Hanuman Chalisa (opening), Suprabhatam, Mrityunjaya, Guru Mantra, Lakshmi Mantra, Durga Suktam
- 8 deities: Ganesha, Shiva, Vishnu, Hanuman, Lakshmi, Saraswati, Surya, Universal
- 6 categories: Daily Prayers, Deity Mantras, Stotras, Aartis, Healing, Prosperity

### RLS Policies
- **mantras, deities, categories, mantra_verses**: Public read (anon), admin write
- **profiles, bookmarks, collections, collection_mantras, japa_sessions, reading_history**: Owner read/write (auth.uid = user_id)

### API Layer
- Supabase client SDK queries (no REST API routes needed)
- Replace hardcoded sample data with live DB queries
- React Query for caching and state management

---

## Phase 3: Auth & User Features

### Authentication (Supabase Auth)
- Google Sign-In (primary) + Email magic link (no passwords)
- Auth is NEVER a gate — only prompted when saving/bookmarking
- Soft "AuthGate" bottom sheet when user tries to save
- On first login, auto-create profiles row via DB trigger
- Session persists via Supabase session token

### User Features (requires free account)
- **Bookmarks**: Save/unsave mantras to favorites (migrate from localStorage)
- **Collections**: Create custom mantra playlists ("My Morning Routine")
- **Japa Counter**: Tap counter with 108/1008 presets, mala-style progress ring, haptic feedback, session history
- **Reading History**: Synced across devices (anonymous = localStorage, logged-in = DB)
- **Profile**: Stats, preferences sync, sign out

### User Database Tables
- profiles (id = auth.uid, display_name, avatar_url, preferred_lang, font_size, dark_mode)
- bookmarks (user_id FK, mantra_id FK)
- collections (user_id FK, name, description, is_default, sort_order)
- collection_mantras (collection_id FK, mantra_id FK, sort_order)
- japa_sessions (user_id FK, mantra_id FK, count, target, completed, started_at, ended_at)
- reading_history (user_id FK, mantra_id FK, last_read_at, read_count)

---

## Phase 4: Polish & Advanced Features

### Reading Experience Enhancements
- Auto-scroll with adjustable speed for reading
- Screen Wake Lock (keeps screen on during chanting)
- Verse-by-verse view for long stotras (using mantra_verses table)

### Content Expansion (Target: 50+ mantras)
- Daily Prayers (10): Gayatri, Guru, Suprabhatam, Aditya Hrudayam, Navagraha, Evening Lamp, Food Prayer, Bedtime, Pratah Smarana, Shanti
- Ganesha (5): Vandana, Vakratunda, Sankatanashana, Aarti, Atharvashirsha
- Shiva (6): Panchakshari, Mrityunjaya, Tandava, Lingashtakam, Bilvashtakam, Rudrashtakam
- Vishnu (5): Sahasranama, Suprabhatam, Sri Suktam, Narayana Suktam, Purusha Suktam
- Hanuman (3): Chalisa (full 40 chaupais), Aarti, Bajrang Baan
- Lakshmi (4): Mantra, Kanakadhara, Ashtottara, Sri Suktam
- Saraswati (3): Vandana, Mantra, Medha Suktam
- Rama (3): Mantra, Raksha Stotram, Ashtottara
- Krishna (4): Maha Mantra, Govinda Namavali, Ashtakam, Gita Ch 12
- Durga/Devi (4): Durga Suktam, Mahishasura Mardini, Lalitha Sahasranama, Devi Stuti
- Subramanya (2): Mantra, Sashti Kavacham
- Healing (2): Dhanvantari, Mrityunjaya
- Aartis (5): Om Jai Jagdish, Ganesh/Shiva/Hanuman/Lakshmi Aartis

### Discovery & Engagement
- Trending/most-read mantras (anonymous read counts)
- Occasion-based collections (Navaratri, Diwali, Shivaratri, Chaturthi)
- Admin panel for content management

### Color System Refinement
- Add gold decorative accent: --accent-gold: #C9A84C
- Add primary-dark for headings: --primary-dark: #5C1A1B

### Advanced Offline
- Pre-fetch top 20 mantras on first visit
- Explicit "Download for Offline" per mantra/category
- Offline indicator banner
- Background sync for bookmarks/japa queued while offline
- FlexSearch for offline search on cached mantras

### SEO (when published)
- JSON-LD structured data per mantra
- Open Graph + Twitter Cards
- Auto-generated sitemap
- Blog content for SEO
