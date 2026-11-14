# Install guide

How to start a new project from this starter (**Part A**, ~10 minutes), or rebuild
the same setup from an empty folder (**Part B**). Part C is the checklist to confirm
everything works.

**What you get:** Next.js 16 (App Router, Turbopack, Cache Components, React Compiler) ·
React 19 · TypeScript · Tailwind CSS 4 · shadcn/ui · next-themes · next/font · Motion ·
React Hook Form + Zod · Redux Toolkit Query · cookie-JWT auth with two protected areas
(customer `/profile`, staff `/admin`) · Prettier · ESLint · Husky + lint-staged +
commitlint · Lighthouse CI.

## Requirements

| Tool    | Version               | Check           |
| ------- | --------------------- | --------------- |
| Node.js | 20.9+ (22 LTS used)   | `node -v`       |
| pnpm    | 10+                   | `pnpm -v`       |
| Git     | any                   | `git --version` |
| Chrome  | any (for `pnpm perf`) |                 |

No pnpm yet? `corepack enable && corepack prepare pnpm@latest --activate`.
Use **pnpm only** (never mix npm/yarn lockfiles).

---

## Part A — New project from this starter

### 1. Copy the code

```bash
git clone https://github.com/nisharga/jemon-achi.git my-app
cd my-app
rm -rf .git            # forget the starter's history
git init -b main       # start your own
```

### 2. Rename

- `package.json` → `"name": "my-app"`
- `README.md` → title and description

### 3. Environment variables

```bash
cp .env.example .env.local
```

| Variable                          | What it is                                     | Example                             |
| --------------------------------- | ---------------------------------------------- | ----------------------------------- |
| `NEXT_PUBLIC_API_BASE_URL`        | Backend REST base (login, profile, admin data) | `https://api.example.com/api/v1`    |
| `NEXT_PUBLIC_SITE_DOMAIN`         | Public site URL (metadata, sitemap, robots)    | `https://example.com`               |
| `NEXT_PUBLIC_FILE_UPLOAD_API_KEY` | Upload service key (admin media)               | —                                   |
| `NEXT_PUBLIC_PLAUSIBLE_SRC`       | Plausible script URL; empty = analytics off    | `https://plausible.io/js/pa-XXX.js` |

`.env.local` is git-ignored. Never commit real keys or passwords. Every
`NEXT_PUBLIC_*` value is visible in the browser, so don't put server secrets there.

### 4. Install and run

```bash
pnpm install       # also installs the git hooks (husky "prepare" script)
pnpm dev           # http://localhost:3000
```

### 5. Make it yours

| What                           | Where                                                       |
| ------------------------------ | ----------------------------------------------------------- |
| Site title, description, font  | `src/configs/appConfigs.ts`                                 |
| Brand colours, breakpoints     | `@theme` block in `src/styles/globals.css`                  |
| Page copy (all text/data)      | `src/static/*` (pages read content from here)               |
| Menu, footer links             | `src/static/index.ts`                                       |
| Logo, favicon, images          | `public/` (`logo.png`, `favicon.png`, `images/*`)           |
| Social share images            | `src/app/opengraph-image.jpg`, `twitter-image.jpg`          |
| Route paths                    | `src/routes/index.ts`                                       |
| Login endpoints                | `src/auth/login-request.ts` (`LOGIN_ENDPOINTS`)             |
| Which roles count as staff     | `src/types/user.ts` (`USER_ROLE`) + `src/auth/roles.ts`     |
| Who may open which page        | `src/proxy.ts` (table in the file comment)                  |
| Dashboard menu                 | `src/app/(protected)/static/sidebarLinks.ts`                |
| Pages search engines may index | `src/app/sitemap.ts`, `src/app/robots.ts`                   |
| Calendly link (contact page)   | `src/app/(public)/contact-us/components/CalendlyWidget.tsx` |

**Images:** use real PNG/JPG/WebP files with `next/image`. Never put a photo inside an `.svg`
file: next/image can't optimise it, and that one mistake cost ~4 MB and an LCP of 13 s here.

### 6. First commit and push

Create an **empty** repo on GitHub (no README), then:

```bash
git add -A
git commit -m "chore: initial commit"          # must follow Conventional Commits
git remote add origin https://github.com/<you>/<repo>.git
git push -u origin main
```

---

## Part B — Rebuild from scratch

Run these in order in an empty folder. File contents are in this repo; copy them.

### 1. Next.js app

```bash
pnpm create next-app@latest my-app --ts --tailwind --eslint --app --src-dir \
  --turbopack --import-alias "@/*" --use-pnpm
cd my-app
```

### 2. UI stack

```bash
# shadcn/ui (Radix base, "nova" preset) — creates components.json, src/lib/utils.ts
pnpm dlx shadcn@latest init --base radix --preset nova

# shadcn components used by the app
pnpm dlx shadcn@latest add button input label card badge avatar separator skeleton \
  sheet sidebar tooltip dropdown-menu collapsible

# Theme, class helpers, icons, animation
pnpm add next-themes class-variance-authority clsx tailwind-merge cn lucide-react \
  motion tw-animate-css
```

- `form.tsx` (shadcn Form for React Hook Form) is no longer in the shadcn registry: copy
  `src/components/ui/form.tsx` from this repo.
- Move the CSS to `src/styles/globals.css` and set `"css"` to that path in `components.json`.
- `next/font` is built into Next; nothing to install.

### 3. Forms, data, auth

```bash
pnpm add react-hook-form @hookform/resolvers zod sonner
pnpm add @reduxjs/toolkit react-redux js-cookie jwt-decode axios
pnpm add -D @types/js-cookie
```

### 4. Marketing-site extras

```bash
pnpm add aos@3.0.0-beta.6 react-slick slick-carousel next-plausible
pnpm add -D @types/aos @types/react-slick
```

Keep AOS pinned to `3.0.0-beta.6`; other versions cause hydration warnings.

### 5. Code quality tooling

```bash
pnpm add -D prettier prettier-plugin-tailwindcss eslint-config-prettier \
  husky lint-staged @commitlint/cli @commitlint/config-conventional
pnpm exec husky init
```

Copy these files from this repo:

| File                    | Purpose                                                          |
| ----------------------- | ---------------------------------------------------------------- |
| `.prettierrc.json`      | single quotes, 4 spaces, no trailing commas, Tailwind class sort |
| `.prettierignore`       |                                                                  |
| `eslint.config.mjs`     | Next core-web-vitals + TypeScript + Prettier (must be last)      |
| `.lintstagedrc.mjs`     | typecheck + prettier + eslint on staged files                    |
| `commitlint.config.mjs` | Conventional Commits (`feat:`, `fix:`, `chore:` …)               |
| `.husky/pre-commit`     | `pnpm exec lint-staged`                                          |
| `.husky/commit-msg`     | `pnpm exec commitlint --edit "$1"`                               |
| `.vscode/settings.json` | format on save with Prettier                                     |

### 6. Performance tooling

```bash
pnpm add -D babel-plugin-react-compiler lighthouse @lhci/cli
```

Copy `next.config.ts` (Cache Components, React Compiler, AVIF/WebP, `optimizePackageImports`)
and `lighthouserc.json`. Add these scripts to `package.json`:

```json
"typecheck": "tsc --noEmit",
"lint:fix": "eslint --fix",
"format": "prettier --write .",
"format:check": "prettier --check .",
"analyze": "next analyze",
"perf": "pnpm build && lhci autorun"
```

Add `.lighthouseci` and `.env*` plus `!.env.example` to `.gitignore`.

### 7. Copy the source

Copy `src/` and `public/` from this repo. Layout:

```text
src/
├── app/
│   ├── (public)/        marketing site: home, contact-us, blogs (header + footer)
│   ├── (auth)/          /login and /admin-login (no Redux, fully static)
│   ├── (protected)/     Redux store; /admin (sidebar shell) and /profile
│   ├── layout.tsx       <html>, font, ThemeProvider, Toaster
│   ├── robots.ts  sitemap.ts  not-found.tsx
├── auth/                cookies, JWT decode, roles, area routes, login request
├── components/          Logo, Icons, ThemeSwitcher…; core/ (marketing), ui/ (shadcn)
├── configs/             appConfigs (font, SEO), env.ts (reads NEXT_PUBLIC_*)
├── hooks/               useLoggedInUser, useLogout, useMounted, use-mobile
├── lib/                 utils (cn), api-error
├── providers/           theme-provider, store-provider
├── redux/               store.ts, api-queries/ (one apiSlice + injectEndpoints files)
├── routes/  schema/  static/  styles/  types/  utils/
└── proxy.ts             route guard (Next 16 name for middleware)
```

Each feature folder may hold `components/ helpers/ hooks/ providers/ static/ types/`, each
with an `index.ts` barrel.

---

## Part C — Check everything works

```bash
pnpm typecheck      # no errors
pnpm lint           # no errors
pnpm format:check   # all files formatted
pnpm build          # all pages listed as ○ (static)
pnpm start          # production server on :3000
pnpm perf           # Lighthouse CI: perf ≥ 90, a11y ≥ 95, SEO ≥ 95, LCP < 2.5 s, CLS < 0.1
pnpm analyze        # optional: inspect bundle sizes
```

Then in the browser:

1. `/` loads; the theme toggle switches light/dark.
2. `/profile` while logged out → redirected to `/login?next=/profile`.
3. Log in at `/login` with a **customer** account → `/profile` shows your details.
4. Log in at `/admin-login` with a **staff** account (any role except `USER`) → `/admin`.
5. A customer opening `/admin` is sent to `/profile`; staff opening `/profile` are sent to `/admin`.

## Gotchas (learned the hard way)

- **Font variable goes on `<html>`**, not `<body>`. Tailwind 4 resolves `@theme` tokens on
  `:root`; otherwise the browser silently uses a system font.
- **Cache Components forbid `new Date()` / `Math.random()` in static pages.** Use a small
  client component (see `CopyrightYear`). A Redux store calls `Math.random()`, so the
  `StoreProvider` lives only in `(protected)/layout.tsx` inside `<Suspense>`, never in the root.
- **Don't call `useSearchParams()` while rendering a static page**: the component drops out
  of the HTML. Read `window.location.search` in the event handler instead.
- **No `data-aos` on above-the-fold content.** AOS hides elements until it starts, which
  delays the LCP.
- **Load only the font weights you use**: each weight is a separate preloaded file.
- **Third-party scripts** (Calendly, chat, analytics) use `next/script` with `lazyOnload`.
- **Hydration warnings mentioning `bis_skin_checked`, `cz-shortcut-listen`** come from browser
  extensions. Test in an incognito window.
- **The proxy only decodes the JWT; it doesn't verify it.** The backend must still check the
  token and role on every API call.
- **Commits are rejected** unless the message follows Conventional Commits
  (`feat: add pricing page`).
