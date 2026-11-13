# jemon-achi

Large-scale frontend: a public marketing site plus an authenticated admin dashboard in a
single Next.js app.

## Stack

- Next.js 16 (App Router, Turbopack), React 19, TypeScript (strict)
- Tailwind CSS v4, shadcn/ui (radix-nova), `cn()` via clsx + tailwind-merge, class-variance-authority
- next-themes (class-based dark mode), lucide-react icons
- Prettier + prettier-plugin-tailwindcss, ESLint 9 (flat config), Husky + lint-staged + commitlint

## Getting started

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

## Scripts

| Script              | What it does               |
| ------------------- | -------------------------- |
| `pnpm dev`          | start the dev server       |
| `pnpm build`        | production build           |
| `pnpm start`        | serve the production build |
| `pnpm lint`         | eslint                     |
| `pnpm typecheck`    | `tsc --noEmit`             |
| `pnpm format`       | prettier --write           |
| `pnpm format:check` | prettier --check           |

Commits must follow Conventional Commits (`feat:`, `fix:`, `chore:`…); Husky runs
lint-staged on pre-commit and commitlint on commit-msg.

## Project structure

```
src/
  app/
    layout.tsx          root layout: fonts, ThemeProvider, analytics
    (public)/           marketing site: layout + TheHeader/TheFooter + routes
      (home)/           "/"  – thin page composing section components
      contact-us/, blogs/
    (protected)/        app shell: layout + TheSidebar + admin/
  components/
    core/               design-system primitives (Button, InputField, …)
    ui/                 shadcn/ui generated components
    Icons.tsx           single icon registry (lucide + custom SVG)
  configs/              site metadata, fonts, env (NEXT_PUBLIC_*)
  providers/            theme provider
  routes/               typed route paths
  static/               content-as-data (copy, menus, pricing…)
  styles/globals.css    Tailwind v4 theme tokens + base styles
  utils/                helpers
```

Each feature folder follows the same scaffold: `components/ helpers/ hooks/ providers/
static/ types/`, each with an `index.ts` barrel.

See `readme/00-START-HERE.md` for the design notes and roadmap.
