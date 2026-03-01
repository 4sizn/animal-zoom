2026-03-01: The three reference HTML files define overlapping semantic color keys (`background-dark`, `surface-dark`, `control-bg`) with different values.
Issue: A single Tailwind config cannot map one class key to multiple values simultaneously; current setup keeps one canonical value per key and preserves variant-specific alternates where possible via additional color tokens.
