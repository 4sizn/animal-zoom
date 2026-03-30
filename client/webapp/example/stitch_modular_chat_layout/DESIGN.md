# Design System Specification: Editorial Modularism

## 1. Overview & Creative North Star

**Creative North Star: "The Architectural Monolith"**

This design system rejects the "web-page" metaphor in favor of a high-end, structural interface. It treats communication not as a scrolling feed, but as a series of curated, independent modules. By leaning into a high-contrast dark theme and a vibrant, "Safety Orange" primary accent, we create a space that feels authoritative, utilitarian, and premium.

The system breaks the "template" look through **intentional modular independence**. Each panel—sidebar, chat thread, or utility drawer—is treated as a physical entity with its own elevation and spatial logic. We utilize asymmetrical weighting, where the density of the sidebar contrasts against the expansive, airy "breathing room" of the main message thread.

---

## 2. Colors & Surface Logic

The palette is rooted in deep obsidian tones, punctuated by high-chroma orange tokens.

### The "No-Line" Rule
Standard 1px solid borders are strictly prohibited for structural sectioning. Boundaries must be defined by **Tonal Transitions**. Use `surface-container-low` for secondary panels (like the sidebar) sitting against a `surface` background. The eye should perceive the edge of a module by the shift in value, not by a drawn line.

### Surface Hierarchy & Nesting
Treat the UI as a series of stacked obsidian sheets.
*   **Base Layer (`surface` / `#0e0e0e`):** The global canvas.
*   **Secondary Layer (`surface-container-low` / `#131313`):** Sidebars and persistent navigation.
*   **Interactive Layer (`surface-container` / `#1a1a1a`):** Hover states and active selections.
*   **Elevated Layer (`surface-container-highest` / `#262626`):** Message bubbles and modals.

### The "Glass & Gradient" Rule
To add "soul" to the high-contrast dark mode, use Glassmorphism for floating elements (like the FAB). Utilize `surface-container-high` at 80% opacity with a `20px` backdrop-blur. 
For the primary CTA (`primary`), use a subtle linear gradient from `primary` (#ff9062) to `primary-container` (#ff793d) at a 135-degree angle to create a "glowing" physical presence.

---

## 3. Typography: Editorial Utility

The system uses a pairing of **Manrope** for structural authority and **Inter** for high-performance legibility.

*   **Display & Headlines (Manrope):** Use `display-md` (2.75rem) for empty states or onboarding headers. Manrope’s geometric nature reinforces the "modular" aesthetic.
*   **Titles (Inter):** `title-md` (1.125rem) is the workhorse for thread headers and user names. 
*   **Body (Inter):** `body-md` (0.875rem) is used for the core message content. The tight kerning and modern letterforms of Inter ensure readability even in high-density communication.
*   **Labels (Inter):** `label-sm` (0.6875rem) in `on-surface-variant` is reserved for timestamps and metadata, providing a secondary layer of information that doesn't compete with the content.

---

## 4. Elevation & Depth

We eschew traditional drop shadows for **Tonal Layering** and **Ambient Glows**.

*   **The Layering Principle:** Depth is achieved by stacking. A `surface-container-highest` card placed on a `surface` background creates a natural lift.
*   **Ambient Shadows:** For floating elements like the Orange FAB, use a shadow with a `24px` blur, 0px offset, and 8% opacity using the `primary` color (#FF6719) as the shadow tint. This mimics a light-emitting object rather than a grey shadow.
*   **The "Ghost Border" Fallback:** If a divider is mandatory for accessibility, use the `outline-variant` (#484847) at **15% opacity**. This creates a "hairline" feel that suggests a boundary without "cutting" the layout.
*   **Backdrop Blur:** Use `xl` roundedness (1.5rem) on containers with backdrop-blur to soften the high-contrast edges and make the modular units feel integrated.

---

## 5. Components

### Message Bubbles
*   **Visuals:** Use `surface-container-highest` for incoming and `primary-container` for outgoing.
*   **Shape:** Apply `lg` (1rem) roundedness. 
*   **Layout:** No dividers between messages. Use `spacing.2` (0.7rem) for clustered messages and `spacing.4` (1.4rem) between different senders.

### Floating Action Button (FAB)
*   **Visuals:** `primary` background with `on-primary-fixed` icon.
*   **Shape:** `full` (9999px) roundedness.
*   **Detail:** Apply a subtle inner glow (1px white overlay at 10% opacity) on the top edge to simulate a beveled, high-end physical button.

### Sidebars & Panels
*   **Logic:** Independent, slot-driven modules. The sidebar should use `surface-container-low` and be separated from the main chat by a wide gutter (`spacing.6`).
*   **Interaction:** Active items use `secondary-container` with a `2px` left-aligned "indicator bar" in `primary` orange.

### Input Fields
*   **Visuals:** `surface-container-lowest` (#000000) background to create a "sunken" effect. 
*   **States:** On focus, the border-less field should transition to a `ghost-border` of `primary` at 40% opacity.

### List Items (Chat List)
*   **Prohibition:** Dividers are forbidden. Separate list items using `spacing.3` vertical margins and a subtle `surface-container` hover state that spans the full width of the panel.

---

## 6. Do's and Don'ts

### Do
*   **Do** use the Spacing Scale (specifically `spacing.4` and `spacing.6`) to create "luxurious" gaps between major UI modules.
*   **Do** mirror layouts. If a right-side utility panel is opened, it should mirror the sidebar's logic and tonal weighting.
*   **Do** use `primary` orange sparingly—it is a laser-focused tool for action, not a decorative wash.

### Don't
*   **Don't** use 100% white (#FFFFFF) for body text. Use `on-surface` or `on-surface-variant` to prevent "halation" (eye strain) in high-contrast dark mode.
*   **Don't** use standard `none` or `sm` roundedness. This system requires `md` to `xl` to maintain its sophisticated, modern personality.
*   **Don't** use drop shadows on fixed panels. Shadows are reserved exclusively for floating, temporary elements (FABs, Tooltips, Popovers).