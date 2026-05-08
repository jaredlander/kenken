# KenKen

Mobile-optimized KenKen built with Vite + React + TypeScript.

## Features

- Sizes 3×3, 4×4, 5×5, 6×6 (easily extendable)
- Daily puzzle per size + unlimited puzzles
- Notes mode with auto-elimination of row/column candidates
- Light/dark theme (auto-detects system preference)
- Hints: flag mistakes or reveal a cell
- Timer with auto-pause when tab is hidden
- Undo/redo, per-puzzle persistence, stats and streaks
- Mobile-first layout, safe-area aware, ≥44px touch targets

## Develop

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

The build output (`dist/`) is fully static and uses relative URLs (`base: "./"`),
so it works on Vercel, Netlify, Cloudflare Pages, GitHub Pages, or any static host.

## Adding a new size

1. Add the size to the `Size` union and `SIZES` array in `src/game/types.ts`.
2. Add an entry to `DAILY_DIFFICULTY` for daily-puzzle scaling.
3. Add a `PROFILES` entry in `src/game/generator.ts` (size weights + ops).
4. The UI auto-discovers new sizes from `SIZES`.

## Tests

```bash
npm test
```
