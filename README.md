# Funnel Builder

A visual drag-and-drop funnel builder for creating upsell funnels. Built with React, TypeScript, React Flow, and Tailwind CSS.

**[Live Demo →](https://funnel-builder.vercel.app)** _(update with actual URL after deploy)_

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for production

```bash
npm run build
npm run preview
```

## How It Works

Drag page nodes from the left sidebar onto the canvas to build a funnel. Connect nodes by dragging from the bottom handle of one node to the top handle of another. The app validates your funnel in real time and shows warnings when something looks off.

### Node Types

| Type | Purpose |
|------|---------|
| Sales Page | Landing page — entry point of the funnel |
| Order Page | Checkout/order form |
| Upsell | Post-purchase offer |
| Downsell | Alternative lower-priced offer |
| Thank You | Confirmation page (no outgoing connections) |

### Features

- **Drag & drop** — drag nodes from the palette onto the canvas
- **Visual connections** — connect nodes with directional arrows
- **Funnel validation** — warns about orphan nodes and invalid connections
- **Auto-increment labels** — "Upsell 1", "Upsell 2", etc.
- **Persistence** — auto-saves to localStorage
- **Export/Import** — download and upload funnel JSON files
- **Undo/Redo** — Cmd+Z / Cmd+Shift+Z
- **MiniMap** — overview of the canvas in the corner
- **Snap to grid** — nodes align to a 20px grid
- **Zoom controls** — zoom in/out and fit view
- **Keyboard accessible** — all palette items are focusable and activatable via Enter

## Architecture Decisions

### Why React Flow?

React Flow is the most mature graph/node editor library for React. It handles canvas rendering, panning, zooming, node dragging, and edge routing out of the box. Building this from scratch with SVG/Canvas would've taken 5x longer for a worse result.

### State management approach

I kept it simple — React's built-in `useState` via React Flow's `useNodesState` and `useEdgesState` hooks. No external state library. The funnel state is the nodes and edges arrays, and everything derives from them (validation warnings, persistence, etc.).

Validation warnings are passed through React Context rather than being embedded in node data. This avoids an infinite re-render loop where updating node data triggers validation recalculation, which updates node data again.

### Folder structure

```
src/
  components/     # UI components (FunnelNode, Sidebar, Toolbar, etc.)
  hooks/          # Custom hooks (persistence, validation, undo/redo)
  context/        # React context providers
  types/          # TypeScript types and node template definitions
  App.tsx          # Main app with React Flow canvas
```

Each concern is separated: types define the data model, hooks handle behavior, components handle rendering. The app wires them together.

### Undo/Redo

Implemented as a simple snapshot stack. Before any structural change (add/remove node or edge), the current state is captured. The stack is capped at 30 entries to avoid memory issues. Redo clears on new actions (standard behavior).

### Persistence

Auto-saves to localStorage with a 500ms debounce on every change. Export/Import uses JSON files with the same format — just the nodes and edges arrays.

## Tradeoffs & What I'd Improve

- **No real page editing** — nodes show a placeholder preview. In a real product, each node would link to a page editor.
- **Edge labels** — I built the custom edge component to support labels, but didn't add UI for editing them. Would be a good next step.
- **Mobile support** — the drag-and-drop palette isn't great on touch devices. I'd add a tap-to-place mode for mobile.
- **Testing** — I'd add component tests for the FunnelNode, Sidebar, and validation hook. Didn't include them in this MVP to keep scope tight.
- **Collaborative editing** — if multiple people needed to edit the same funnel, I'd swap localStorage for a backend with real-time sync (e.g., Liveblocks or Yjs).
- **Funnel templates** — pre-built funnel templates (e.g., "Basic Sales Funnel") that users can start from instead of a blank canvas.

## Accessibility Notes

- All sidebar palette items are keyboard-focusable (`tabIndex={0}`) and can be activated with Enter or Space
- Nodes use ARIA labels for screen readers
- The sidebar uses `role="complementary"` with an `aria-label`
- Focus indicators are visible on all interactive elements via Tailwind's `focus:ring` utilities
- Color is not the only indicator of state — warnings include both color (amber) and an icon (⚠️)
- The app uses semantic HTML where possible (headings, buttons, landmarks)

## Part 2 — Dashboard Architecture

See [docs/dashboard-architecture.md](./docs/dashboard-architecture.md) for the written answer about building a scalable admin dashboard.
