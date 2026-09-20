# Low-Fidelity Wireframes

Text-based layout spec for the three core screens, intended as a guide for
building the actual mockup in Figma (frames sized for a mobile viewport,
e.g. 375x812, reused for the responsive desktop/tablet layout by widening
the grid columns).

## 1. Browse (Home) — `tabs/home`

```
┌─────────────────────────────┐
│  ●  Pokedex                 │  <- toolbar, primary color
├─────────────────────────────┤
│  [ Search Pokemon... 🔍 ]    │  <- searchbar
├─────────────────────────────┤
│ (Water)(Grass)(Fire)(Ghost)→ │  <- horizontal scroll type chips
├─────────────────────────────┤
│ ┌────────┐ ┌────────┐        │
│ │ #001 ♡ │ │ #002 ♡ │        │  <- 2-col grid on mobile,
│ │ [img]  │ │ [img]  │        │     up to 6-col on desktop
│ │Bulbasaur│ │ Ivysaur│        │
│ └────────┘ └────────┘        │
│      ... infinite scroll ... │
├─────────────────────────────┤
│   🀆 Pokedex   ♡ Favorites    │  <- bottom tab bar
└─────────────────────────────┘
```
Notes: heart icon top-right of each card toggles favorite inline. Selecting
a type chip replaces the grid contents with that type's Pokemon and disables
infinite scroll (full list returned in one call). Pull down to refresh.

## 2. Detail — `pokemon/:id`

```
┌─────────────────────────────┐
│ ←   Bulbasaur            ♡  │  <- back button, name, favorite toggle
├─────────────────────────────┤
│         [ artwork ]          │  <- large official artwork, light bg
│            #001              │
│          Bulbasaur           │
│        (Grass)(Poison)       │  <- type chips, colored per type
│                               │
│  "A strange seed was planted │
│   on its back at birth..."   │  <- flavor text description
│                               │
│  Height        0.7 m         │
│  Weight        6.9 kg         │
│  Abilities     Overgrow      │
│                               │
│  Base Stats                  │
│  HP        ████████░░  45    │
│  Attack    ███████░░░  49    │
│  Defense   ███████░░░  49    │
│  ...                         │
└─────────────────────────────┘
```

## 3. Favorites — `tabs/favorites`

```
┌─────────────────────────────┐
│  ●  Favorites                │
├─────────────────────────────┤
│ ┌────────┐ ┌────────┐        │
│ │ #001 ♥ │ │ #025 ♥ │        │  <- same card component as Browse
│ │Bulbasaur│ │Pikachu │        │
│ └────────┘ └────────┘        │
│                               │
│  (Empty state if none saved: │
│   heart-outline icon +        │
│   "Tap the heart on a         │
│    Pokemon to add it here.") │
├─────────────────────────────┤
│   🀆 Pokedex   ♡ Favorites    │
└─────────────────────────────┘
```

## Component inventory for Figma

- Top toolbar (primary color, title, optional back/action buttons)
- Searchbar
- Type-chip (pill, colored outline, filled when selected)
- Pokemon card (image, dex number, name, favorite heart)
- Bottom tab bar (2 tabs: Pokedex, Favorites)
- Stat row (label, value, progress bar)
- Empty / loading / error state (icon + one line of text)
