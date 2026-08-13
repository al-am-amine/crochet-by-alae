# QA browser observations — 2026-08-13

## Sources checked

- Live public routes: `https://crochetbyalae.netlify.app/`, `/shop`, `/custom-design`, `/cart`, `/about`, `/shipping`, `/faq`.
- Local production preview after the latest build: `http://localhost:4176/faq`.

## Confirmed findings

- The public route set loaded without a visible JavaScript error in the browser pass.
- The footer consistently shows copyright year 2026 and the delivery areas Blida and Algiers.
- The local preview initially showed weak supporting-copy contrast in dark mode because the static `text-on-surface-variant` color stayed dark on charcoal surfaces.
- A global dark-mode contrast contract was added to `src/index.css`, covering supporting text, outline text, and surface utility backgrounds.
- The FAQ page was static before the fix. It now uses an accessible accordion: the first item opens by default, clicking another item closes the previous one, and `aria-expanded`/`aria-controls` are present.
- The local preview confirmed the first FAQ item opened, then the second item opened while the first closed, without layout breakage.

## Remaining checks

- Continue interaction and responsive checks for the header, language toggle, theme toggle, shop, custom request form, cart, and admin routes.
- Rebuild and verify the final source after all confirmed fixes.

## Interaction pass

The local preview confirmed that the language toggle switches Arabic and English content and direction without breaking the header or FAQ layout. The theme toggle switches between the light and dark surfaces while preserving readable primary and supporting text. The shop empty state is intentional and offers a working route to Custom Order. The Custom Order page exposes the description, reference-image drop area, preferred-colors, full-name, and WhatsApp fields without visible overflow or broken image assets.

## Custom request edge case

The preview had no enabled contact channels, so the form ended without an action control. This is a valid configuration state, but the empty ending was confusing. `CustomRequest.jsx` now renders the existing localized `no_channels_configured` message inside a styled, readable state instead of leaving an unexplained blank area. No contact number or channel was fabricated.

The browser measurement at 1280px reported no horizontal overflow (`scrollWidth` below `innerWidth`), and no hidden submit button was found. The menu button is intentionally hidden on desktop.

## Admin login edge case

The standalone admin login page loaded with the 2026 footer and no visible Super Admin navigation. Submitting the empty form triggered native required-field validation on the email input, which is the expected safe behavior and did not make a network request or create a login attempt.

## Unauthenticated admin-route checks

Direct navigation to `/admin-portal` and `/admin/security-log` both redirected to `/admin/login`. No Super Admin menu, admin names, role list, or security records were exposed before authentication.

## Public route checks

The home route rendered the original Crochet by Alae navigation, hero copy, delivery message for Blida and Algiers, latest-creations empty state, story section, and 2026 footer without a runtime error. The shop route rendered the `All` filter, an explicit `No products yet` empty state, and a Custom Order escape route. The current data state is empty, so no product-card interaction could be exercised in this pass.

The cart route rendered a clear empty-cart state with a working Browse the shop link and the same 2026 footer. The FAQ route rendered the first question expanded with a readable answer and the remaining questions as keyboard-friendly controls; no clipping or broken layout was visible at the tested desktop viewport.

The FAQ language control switched the page to Arabic with RTL navigation and Arabic accordion content; the layout remained aligned and readable. The theme control then switched to the dark surface, where the headline, supporting answer text, controls, and footer remained legible.

## Local fixture interaction pass

The development-only `?qa=fixtures` route exposed three local fixture products and category filters without writing to Supabase. Opening the basket fixture rendered its detail page, color and size controls, notes textarea, delivery hint, and description. Clicking Add to Cart incremented the cart badge and changed the action to Go to cart, confirming the core cart transition with non-production data.

After rebuilding, `/product/1` rendered the improved empty state with the inventory icon, localized not-found heading, supporting copy, and a visible Browse the shop action. The footer stayed anchored below the content in both the Arabic RTL and dark-theme state. Fixture image URLs remain development-only test data and are not used by production routes.

## Final build and deployment check

The final Vite build completed successfully after merging the remote delivery commits. The local branch now contains the delivery pages, bilingual delivery translations, the separated Super Admin portal, RBAC protections, dark-mode contrast fixes, FAQ accordion, empty states, and QA notes. The generated bundle warning concerns chunk size only; it did not fail the build.

The deployment request reached the correct Netlify site, but Netlify marked it `skipped` with the account-level message `production deploys are paused because your team has used all of its available credits for this billing cycle`. The live site remains available and its public home, FAQ, and admin-login routes responded through HTML extraction. The updated source is therefore ready locally, but the live domain still cannot receive this build until Netlify resumes production deploys or the team changes its billing/hosting state.
