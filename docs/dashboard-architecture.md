# Dashboard Architecture — Cartpanda Admin

## Overview

This document outlines how I'd approach building a modern admin dashboard for a funnels + checkout product covering funnels, orders, customers, subscriptions, analytics, disputes, settings, and permissions. The goal is a system that stays fast, scales with the team, and doesn't require a rewrite six months in.

---

## 1. Architecture

I'd go with a **feature-based folder structure** rather than grouping by file type. Each domain (funnels, orders, customers, etc.) owns its own routes, components, queries, and types. This keeps boundaries clear and avoids the classic problem where touching one feature accidentally breaks another.

```
src/
  features/
    funnels/
      components/
      hooks/
      api/
      routes.tsx
      types.ts
    orders/
      ...
    customers/
      ...
  shared/
    ui/         # design system components
    hooks/      # generic reusable hooks
    utils/      # helpers, formatters
    layouts/    # shell, sidebar, header
  app/
    router.tsx  # top-level routes, lazy-loaded
    providers.tsx
```

Routes would be lazily loaded per feature so the initial bundle stays small. I'd use React Router with a layout route for the shell (sidebar + header) and nested routes per feature. Each feature module exports its own route config, and the top-level router just stitches them together.

The key rule: **features can import from `shared/`, but never from each other**. If two features need the same thing, it gets lifted into `shared/`. This avoids circular dependencies and keeps ownership clear.

---

## 2. Design System

I'd **start with an existing component library** — probably Radix UI primitives + Tailwind for styling. Building a full design system from scratch before you have product-market fit is premature. Radix gives you accessible, unstyled primitives that you wrap with your own styling layer.

For consistency I'd set up:

- **Design tokens** in Tailwind config: colors, spacing scale, typography, border radii. Every component pulls from these rather than hardcoding values.
- **A small set of composed components** in `shared/ui/`: Button, Input, Select, Table, Modal, Badge, Card, Toast. These are the building blocks that prevent one-off UI.
- **Storybook** for documenting these components. Not extensive stories for every feature component — just the shared primitives. This gives new engineers a visual catalog to reference instead of copying from random screens.

Accessibility is enforced at the component level. The Radix primitives already handle ARIA attributes, keyboard navigation, and focus management. We'd add a lint rule (`eslint-plugin-jsx-a11y`) to catch missing labels and roles. For WCAG compliance: all interactive elements need visible focus indicators, color contrast ratios meet AA standards, and forms have proper label associations.

---

## 3. Data Fetching + State

I'd split state into two buckets:

- **Server state** (data from the API): handled by **TanStack Query** (React Query). It gives you caching, background refetching, optimistic updates, and proper loading/error states out of the box. No need to reinvent this.
- **Client state** (UI state like sidebar open, modal visibility, form drafts): just React context or `useState`/`useReducer` kept local to where it's needed. No global store unless something genuinely needs to be global (like auth user or feature flags).

For **tables with filters/sorts/pagination** — I'd keep filter state in the URL search params using a hook like `useSearchParams`. This makes it shareable (copy the URL and someone else sees the same view), survives page refreshes, and avoids syncing URL ↔ state. The query key for TanStack Query includes the filter params, so changing a filter automatically triggers a new fetch.

Loading/error/empty states get standardized patterns:

- A `<QueryBoundary>` wrapper component that handles loading skeleton, error message with retry, and empty state. Each table or data view wraps its content in this. Consistent UX, no boilerplate per page.

For runtime data validation I'd use **Zod** schemas on API responses. This catches API contract issues early in development rather than silently rendering broken data.

---

## 4. Performance

- **Bundle splitting**: already handled by lazy-loading feature routes. Each feature only loads when visited. Shared UI and TanStack Query stay in the main bundle since they're used everywhere.
- **Table virtualization**: for large lists (orders, customers), I'd use `@tanstack/react-virtual`. Only render the rows that are visible in the viewport. This keeps the DOM small even for 10k+ row tables.
- **Memoization**: be intentional rather than blanket `React.memo()` on everything. Memoize expensive computations with `useMemo`, stable callback references with `useCallback` when passing to memoized children. The default should be "don't memoize unless you've measured a problem."
- **Avoiding rerenders**: colocate state. If only a modal needs to know it's open, keep that state in the modal's parent — not in a global store. TanStack Query's selector option lets you subscribe to specific fields from a query result rather than the whole object.

For **instrumentation**, I'd track Core Web Vitals (LCP, FID, CLS) using `web-vitals` library and ship them to something like Datadog or a simple custom endpoint. Additionally, wrap key user flows (loading the orders table, opening a funnel) with performance marks so we can measure actual perceived latency. If the P95 for "orders page load" starts creeping up, we'd notice before users complain.

---

## 5. Developer Experience & Scaling to a Team

The goal is that a new engineer can open a PR on day two without asking where things go.

- **Conventions documented in the repo**: a `CONTRIBUTING.md` that covers folder structure rules, naming conventions, how to add a new feature module, and how to add shared components. Not a 50-page doc — a one-pager with examples.
- **ESLint + Prettier** enforced via pre-commit hooks (Husky + lint-staged). No debates about formatting in PRs.
- **PR template** with a checklist: "Does this touch shared UI?", "Did you add/update types?", "Does it handle loading/error/empty states?", "Is it keyboard accessible?"
- **Component guidelines**: shared UI components must have TypeScript props, basic JSDoc comments, and a Storybook story. Feature-level components don't need Storybook but do need proper typing.
- **Import boundaries** enforced with ESLint `no-restricted-imports`. Feature A can't import from Feature B directly — this keeps modules decoupled and prevents the codebase from turning into spaghetti.

To prevent one-off UI: code reviews specifically look for it. If someone builds a custom button instead of using `<Button>` from `shared/ui`, that's a review comment. The Storybook catalog makes it easy to check what already exists.

---

## 6. Testing Strategy

I'd aim for a pragmatic testing pyramid:

- **Unit tests** (Vitest): pure utility functions, data transformations, validation logic, custom hooks that don't depend on DOM. These are cheap to write and fast to run.
- **Component/integration tests** (Vitest + Testing Library): the shared UI components get tested for accessibility and interaction behavior (click, keyboard nav, focus). Feature-level components get tested for key user flows — "user can filter the orders table", "creating a funnel adds it to the list."
- **E2E tests** (Playwright): a small set covering critical paths only — login, create a funnel, view an order, process a dispute. These are slow and flaky so I'd keep the count low. Maybe 10-15 tests covering the flows that would be embarrassing to break.

**Minimum bar before shipping**: shared UI components need component tests. Feature PRs need at least one integration test for the main flow. E2E runs in CI on the main branch. We don't block PRs on E2E passing (too slow/flaky) but we do investigate failures promptly.

---

## 7. Release & Quality

- **Feature flags** (LaunchDarkly or a simple in-house system backed by a config endpoint). New features ship behind flags. This decouples deployment from release — you can merge to main and deploy without exposing unfinished work. Flags also enable staged rollouts (10% of users → 50% → 100%) and instant kill switches.
- **Error monitoring**: Sentry for frontend errors. Every unhandled exception and rejected promise gets captured with context (user ID, current route, recent actions). Set up alerts for spikes.
- **Staged rollouts**: for risky changes, use the feature flag's percentage rollout. For infrastructure changes (new API version, state management migration), use a canary deployment — deploy to one region or a small user segment first, watch error rates, then proceed.

The philosophy is **ship fast but safe**: small PRs, feature flags for anything user-facing, automated checks in CI (types, lint, tests), and error monitoring in production. If something breaks, the flag gets toggled off in seconds, not minutes.

---

## Tradeoffs & What I'd Skip Initially

- **Skip**: building a custom component library from scratch. Use Radix + Tailwind and compose. Revisit if/when the product matures and design needs diverge significantly from what Radix provides.
- **Skip**: a heavy global state manager (Redux, Zustand). TanStack Query handles 90% of state in a dashboard. Client state stays local until proven otherwise.
- **Skip**: comprehensive E2E coverage. Start with critical paths only and expand based on what actually breaks in production.
- **Skip**: micro-frontends. Feature folders with import boundaries give you most of the isolation benefits without the operational complexity. Reconsider only if the team grows past 15+ engineers working in the same repo.
- **Later**: internationalization, dark mode, advanced analytics dashboards. Ship the core workflows first, layer on polish once the foundation is stable.
