
2026-03-10
- Dashboard room grid lives in `client/webapp/src/pages/dashboard/index.tsx` under the "Active rooms" section.
- Safari DOM check used: query `h2` containing "Active rooms" then `section.querySelector('div.grid')`; verified `New room` is the first card and first-two card heights match.
