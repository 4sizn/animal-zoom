# Learnings

- Routing: `client/webapp/src/main.tsx` defines `<AppRoutes>` with `react-router-dom` routes including `/login` and `/forgot-password`.
- UI styling: pages use Tailwind classes with custom theme colors (see `client/webapp/tailwind.config.cjs`).
- `/login` page establishes the “auth card” layout (container + header + `bg-surface-dark` card + `bg-charcoal-light/60` input rows).
- Manual QA: Playwright MCP can verify local pages + console errors; add a `data:,` favicon in `client/webapp/index.html` to avoid dev-console 404 on `/favicon.ico`.
