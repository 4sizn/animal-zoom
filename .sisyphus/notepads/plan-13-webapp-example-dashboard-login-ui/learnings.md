
- Webapp routing is a minimal in-file router in `client/webapp/src/main.tsx` (`Router()` checks `window.location.pathname` + `popstate`).
- Styling uses Tailwind (`client/webapp/src/styles.css` has `@tailwind` directives; forms + typography plugins). Theme tokens live in `client/webapp/tailwind.config.cjs`.
- Existing auth pages live under `client/webapp/src/pages/*` and currently use inline styles (e.g. `client/webapp/src/pages/login/index.tsx`).
- UI examples to mirror are static Tailwind HTML under `client/webapp/example/dashboard/code.html` and `client/webapp/example/loginForm/code.html`.
