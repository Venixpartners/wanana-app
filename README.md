# Wanana

AI music intelligence for Africa and the diaspora. Built by Wanana Technologies Limited.

## Stack

Next.js 16 (App Router), TypeScript, Tailwind CSS 4, Supabase (Postgres, Auth), Vercel.

## Running locally

```
cp .env.example .env.local   # add the Supabase publishable key
npm install
npm run dev
```

`NEXT_PUBLIC_LAUNCH_MODE=coming_soon` shows only the landing page and waitlist. `live` opens sign in and profiles.

## Database

All Wanana tables live in the `music` schema of the `wanana` Supabase project. The `public` schema holds the retired prediction beta and is not used by this app.
