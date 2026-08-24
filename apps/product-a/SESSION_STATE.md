## 2026-08-24 — Scaffold

Scaffolded the Next.js app (App Router, TypeScript strict, Tailwind v4, Supabase client) on
`product-a/scaffold-nextjs-app`. Placeholder home page only — no catalog, ordering, or loyalty
UI yet.

**Not verified locally**: no Node.js runtime was available in the environment this scaffold was
built in, so `npm install` / `npm run dev` / `npm run build` have not been run. The config files
mirror Product D's working setup exactly (same Next/React/Tailwind versions), but run these
before trusting the scaffold:

```
cd apps/product-a
npm install
npm run dev
```

No Supabase project is wired up yet — `.env.example` lists the two env vars needed
(`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`); without them `lib/supabase.ts`
throws on import.

Next up: catalog browse page (`product-a/catalog-browse` branch).
