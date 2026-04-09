# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## TrustCart AI+ App

### Purpose
Privacy-first AI e-commerce platform with "Amethyst & Obsidian" glassmorphism design.

### Features
- Mood-based AI recommendations (Energetic / Chill / Professional / Party)
- SecureSync Vault privacy control center
- AI Analytics Dashboard with Recharts (accuracy, categories, trust scores)
- Cart, Wishlist, Orders management
- User preference personalization
- Privacy Pulse Indicator in navbar

### Design System
- Theme: dark charcoal (#0F172A), purple-to-blue gradients
- Fonts: Plus Jakarta Sans (headings), Inter (body)
- Glassmorphism utilities: `glass-card`, `glass-strong`
- Animations: Framer Motion throughout
- Icons: Lucide React (no emojis)

### Auth
- Cookie-based (`userId` cookie), SHA-256 hashed passwords
- No JWT — simple server-side auth middleware

### Database
- 16 products seeded across categories: Clothing, Footwear, Electronics, Accessories, Beauty
- Tables: users, products, cart, wishlist, orders, preferences

### API
- Base: `artifacts/api-server` on port 8080
- Frontend: `artifacts/trustcart` (Vite)
- Generated hooks: `@workspace/api-client-react`
