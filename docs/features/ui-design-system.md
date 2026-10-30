# UI/UX Design System – Minimalist Light Theme

## 1. Design Philosophy
PitBox follows a **Minimalist & Bento Grid** light interface design (`uiux-designer` Style #1 & #39) focused on visual calm, generous whitespace, and clear hierarchy so users immediately know where to look while having actionable dashboard tools and visual previews at hand.

## 2. Light Color Palette & Tokens
- **Canvas Background (`pitbox-cream`)**: `#F7F6F2` (Light Alabaster Cream — soft, glare-free light surface)
- **Surface / Cards (`pitbox-card`)**: `#FFFFFF` with subtle `#E2E8F0` (`border-slate-200/80`) borders
- **Primary Accent (`pitbox-steel`)**: `#3368A0` (Deep Steel Blue — primary CTAs and active indicators)
- **Secondary Accent (`pitbox-glacier`)**: `#66A3BF` (Glacier Sky Blue — subtle icons and secondary highlights)
- **Soft Highlight (`pitbox-seafoam`)**: `#C8DFDB` (Soft Seafoam Mint — quiet status pills)
- **Typography (`slate-900` / `slate-500`)**: `#0F172A` for primary headings and metrics, `#64748B` for secondary labels

## 3. Page Architecture
- **Landing Page (`LandingPage.tsx`)**:
  - Centered hero section (`max-w-5xl`) with concise copy and pill-shaped primary/secondary actions.
  - **Featured Vehicle Card with Real Photography**: Split-card preview (`2019 Škoda Octavia Combi 2.0 TDI`) pairing a high-resolution automotive photograph and license plate badge (`1AB 2345`) with 3 core metrics (`Odometer`, `Oil Service`, `Inspection`).
  - **Compact Visual Showcase Gallery (`SHOWCASE_ITEMS`)**: 3-column photographic showcase (`Visual Garage Profiles`, `Service & Receipt Archive`, `Odometer & Interval Alerts`) with lazy-loaded images and concise descriptions.
- **Garage Page (`GaragePage.tsx`)**:
  - **Bento KPI Summary Strip**: 3 clean summary tiles showing `Registered Vehicles`, `Fleet Distance` (combined odometer total), and `Service Status` (`All Clear`).
  - **Asymmetric 2-Column Dashboard (`lg:grid-cols-3`)**:
    - **Main Column (`lg:col-span-2`)**: Instant search & fuel-type filter bar above the responsive vehicle cards grid.
    - **Companion Sidebar (`lg:col-span-1`)**: Interactive **Quick Odometer Log** widget (one-click modal trigger per vehicle) and a **Recommended Intervals** reference checklist card.
