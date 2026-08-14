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

## Admin access request pass

The new `/admin/request-access` route loads in the local preview with Arabic RTL text, bilingual-ready fields for first name, family name, email, requested permissions, and a clear notice that passwords are never entered or stored in the request. The form exposes only the intended permission checkboxes and the secure invitation explanation.

Submitting the empty request is stopped by native required-field validation before any network request. No production or Supabase data was written during this check. The remaining integration check is to apply `supabase_admin_access_requests.sql`, deploy the updated Edge Function, and test the submit/approve/reject flow with a real authenticated owner session.

## Current interface pass — 2026-08-14

The local preview at `http://127.0.0.1:4176/` rendered the Arabic home page with the original brand treatment, navigation, hero, delivery areas, empty latest-creations state, story section, and 2026 footer. The extracted page content showed no missing primary route labels or obvious broken text.

The browser console contained only React Router v7 future-flag warnings (`v7_startTransition` and `v7_relativeSplatPath`) plus the standard React DevTools notice. No runtime exception or failed rendering error appeared in the initial home-page pass.

The shop route rendered its intentional empty state and Custom Order escape route without visible overflow. Switching from Arabic to English changed the navigation, title, delivery notice, empty-state copy, and footer to English and changed the document direction to LTR. No visible layout break appeared in the language-toggle pass.

The Custom Order route rendered all expected fields in English, including the description textarea, reference-image drop area, preferred colors, full name, and WhatsApp phone input. Because no contact channel is configured in the current environment, the page correctly ended with a styled explanatory state rather than an inactive or missing submit action.

The Cart route rendered a clear empty-cart state with a working Browse the shop link, the 2026 footer, and the Blida/Algiers delivery notice. No clipped content or broken route was visible at the tested desktop viewport.

The FAQ route rendered the first item expanded by default. Clicking the second question closed the first and expanded the second, with the answer and `add`/`remove` state updating correctly. The accordion remained readable and did not introduce visible clipping at the desktop viewport.

The About route rendered its hero story, Blida-focused brand copy, quality/local-delivery/made-to-order highlights, and two working calls to action. The Shipping route clearly limited delivery to Blida and Algiers provinces and described the fallback for an unlisted commune. Both routes kept the 2026 footer and showed no obvious content overflow at the desktop viewport.

The admin login route rendered only the email/password form, security-purpose notice, 2026 footer, and the Request admin access escape route. No admin names, roles, or security records were exposed while unauthenticated.

The admin request route is a single-page form with first name, family name, email, one password field, and optional additional information. It explicitly states that the password remains in the authentication system and that the owner assigns permissions after review; no applicant-controlled permission selector is present.

Direct navigation to `/admin` and `/admin/security-log` redirected to `/admin/login` while unauthenticated. The login screen exposed no admin list, role information, security records, device data, or other protected content.

The invalid product route rendered a dedicated “Product not found” state with a working Browse the shop escape route, footer, delivery notice, and no broken image. Switching to Arabic updated the header, error state, CTA, footer, and delivery copy while preserving the layout and direction.

The shop route in Arabic rendered the empty catalog state and custom-order escape link. Switching to dark mode changed the surfaces and icon state without hiding the title, empty-state copy, CTA, or footer links; no horizontal overflow was visible in the inspected viewport.

After the AuthContext/AdminLogin compatibility fix, `/admin/login` rendered its complete form, request-access link, audit notice, and 2026 footer in dark mode. The browser console contained only the expected React Router v7 future-flag warnings and no runtime errors.

The admin request form remains a single page with name, family name, email, one password field, optional owner information, and no applicant permission selector. Submitting it empty was blocked by native required-field validation before any request was sent.

The home route rendered the Arabic storefront, hero actions, empty-catalog state, story section, and footer in the persisted dark theme. A browser measurement at a 1280px viewport reported equal document/body width and viewport width, with no horizontal overflow.

The missing-product route now shows a product-specific explanation instead of the generic empty-catalog text. Its shop CTA navigated to `/shop` through the client router, and the empty-shop custom-order CTA is now also a router link rather than a full-page anchor.

Unauthenticated navigation to `/admin/admin-requests` and the legacy `/admin-portal/settings` route both ended at `/admin/login`; no admin request data or legacy portal UI was exposed.

After `npm run build`, the home route loaded with the delivery notice, hero, empty-catalog state, story, and footer. The console again showed only React Router future-flag warnings; no runtime exception or failed component render was observed.

The home language toggle switched the full page to English and back to Arabic successfully. Navigation labels, delivery notice, hero copy, empty-catalog text, and footer copy all changed with the language while the layout remained intact.
