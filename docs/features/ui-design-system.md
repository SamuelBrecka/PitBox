# UI/UX Design System – Minimalist Light Theme & Slovak Localization

## 1. Design Philosophy
PitBox follows a **Minimalist & Bento Grid** light interface design (`uiux-designer` Style #1 & #39) focused on visual calm, generous whitespace, and clear hierarchy so users immediately know where to look while having actionable dashboard tools and visual previews at hand.

## 2. Light Color Palette & Tokens
- **Canvas Background (`pitbox-cream`)**: `#F7F6F2` (Light Alabaster Cream — soft, glare-free light surface)
- **Surface / Cards (`pitbox-card`)**: `#FFFFFF` with subtle `#E2E8F0` (`border-slate-200/80`) borders
- **Primary Accent (`pitbox-steel`)**: `#3368A0` (Deep Steel Blue — primary CTAs and active indicators)
- **Secondary Accent (`pitbox-glacier`)**: `#66A3BF` (Glacier Sky Blue — subtle icons and secondary highlights)
- **Soft Highlight (`pitbox-seafoam`)**: `#C8DFDB` (Soft Seafoam Mint — quiet status pills)
- **Typography (`slate-900` / `slate-500`)**: `#0F172A` for primary headings and metrics, `#64748B` for secondary labels

## 3. Slovak Language Localization (`lang="sk"`)
The entire user-facing web interface (`index.html`, navigation, public landing page, authentication forms, garage dashboard, vehicle profile, and interactive modals) is localized into Slovak (`sk`) using authentic Slovak automotive terminology:
- **Navigation & Auth**: *Moja garáž*, *Prihlásiť sa*, *Vytvoriť účet*, *Odhlásiť sa*.
- **Fuel Types**: Mapped from backend enum keys (`PETROL` → *Benzín*, `DIESEL` → *Nafta*, `HYBRID` → *Hybrid / PHEV*, `EV` → *Elektromobil (EV)*).
- **Service Categories & Line Items**: `MAINTENANCE` → *Bežná údržba*, `REPAIR` → *Oprava*, `INSPECTION` → *Kontrola (STK / EK)*, `OTHER` → *Iné / Úpravy*; `PART` → *Diel*, `FLUID` → *Kvapalina / Olej*, `LABOR` → *Práca*.

## 4. Page Architecture
- **Landing Page (`LandingPage.tsx`)**:
  - Centered hero section (`max-w-5xl`) with Slovak copy (*Digitálna servisná knižka a história vozidla*) and pill-shaped primary/secondary actions.
  - **Featured Vehicle Card with Real Photography**: Split-card preview (`2019 Škoda Octavia Combi 2.0 TDI`) pairing a high-resolution automotive photograph and license plate badge (`1AB 2345`) with 3 core metrics (*Tachometer*, *Výmena oleja*, *Kontrola STK*).
  - **Compact Visual Showcase Gallery (`SHOWCASE_ITEMS`)**: 3-column photographic showcase (*Vizuálne profily vozidiel*, *Archív servisov a bločkov*, *Tachometer a upozornenia na intervaly*) with lazy-loaded images and concise descriptions.
- **Garage Page (`GaragePage.tsx`)**:
  - **Bento KPI Summary Strip**: 3 clean summary tiles showing *Evidované vozidlá*, *Nájazd flotily*, and *Stav servisu* (*V poriadku*).
  - **Asymmetric 2-Column Dashboard (`lg:grid-cols-3`)**:
    - **Main Column (`lg:col-span-2`)**: Instant search & fuel-type filter bar above the responsive vehicle cards grid.
    - **Companion Sidebar (`lg:col-span-1`)**: Interactive **Rýchly zápis tachometra** widget and an **Odporúčané intervaly** reference checklist card.
