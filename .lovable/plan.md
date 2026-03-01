
# MantraVani — Sacred Prayers & Mantras

A beautiful, offline-friendly web app for browsing Hindu mantras, prayers, and stotras in Telugu and English. Built with React + Supabase (Lovable Cloud).

---

## Phase 1: Foundation & Core UI (Start Here)

### Design System & Theme
- Warm devotional color palette: saffron primary (#E8731A), deep maroon headings, cream background (#FFFCF7)
- Dark mode with temple-friendly dark tones
- Noto Sans Telugu font for Telugu text, clean sans-serif for English
- Mobile-first responsive design with generous spacing for readability

### Home Page
- Daily mantra highlight card (random from DB)
- Search bar at top
- Category grid with deity icons (Ganesha, Shiva, Vishnu, etc.)
- "Recently Viewed" section (localStorage-based)
- Bottom navigation: Home, Browse, Search, Favorites, Settings

### Browse Page
- Filter by category (Daily Prayers, Deity-specific, Aartis, Healing)
- Filter by deity with icon tiles
- Tag-based filtering (morning, monday, festival, healing)
- Mantra cards showing title (Telugu + English), deity, category

### Mantra Detail Page
- Full Telugu text with generous line spacing
- Transliteration section
- English meaning/translation
- Benefits and "When to Chant" info
- Font size slider (16px–36px)
- Share button (Web Share API)
- Copy to clipboard

### Search
- Full-text search across mantra titles and content (Telugu + English)
- Search suggestions and recent searches

### Settings Page
- Font size control
- Dark mode toggle
- Language preference (stored in localStorage)

---

## Phase 2: Database & Backend (Lovable Cloud / Supabase)

### Database Schema
- **mantras** table: id, slug, titles (EN/TE), deity, category, full Telugu text, transliteration, meanings, benefits, tags, chant_count, source_ref
- **deities** table: name (EN/TE), icon, description
- **categories** table: name (EN/TE), slug, icon, sort_order
- **mantra_verses** table: for long stotras broken into numbered verses
- Seed with 5 sample mantras (Gayatri, Ganesh Vandana, Panchakshari, Maha Mantra, Hanuman Chalisa)
- Public read access (no auth required to browse)

---

## Phase 3: Auth & User Features

### Authentication (Supabase Auth)
- Google Sign-In + Email magic link
- Auth is never a gate — only prompted when saving/bookmarking
- Soft "AuthGate" bottom sheet when user tries to save

### User Features (requires free account)
- **Bookmarks**: Save/unsave mantras to favorites
- **Collections**: Create custom mantra playlists ("My Morning Routine")
- **Japa Counter**: Tap counter with 108/1008 presets, mala-style progress ring, session history
- **Reading History**: Synced across devices
- **Profile**: Stats, preferences sync, sign out

### User Database Tables
- profiles, bookmarks, collections, collection_mantras, japa_sessions, reading_history
- Row Level Security: owner-only access for all user data

---

## Phase 4: Polish & Advanced Features
- Auto-scroll with adjustable speed for reading
- Screen Wake Lock (keeps screen on during chanting)
- Verse-by-verse view for long stotras
- Trending/most-read mantras
- Occasion-based collections (Navaratri, Diwali, Shivaratri)
- Admin panel for content management
