# QA notes — Production deploy

## 2026-08-14

Netlify deploy `6a7eca2a87b913b03770a8de` reached the `ready` state. The first alias load showed stale-looking content while the immutable deploy URL initially needed a second render pass; after waiting, the published `/admin/login` page displayed both shared controls with translated accessible labels, the login form, and the 2026 footer.

The immutable deployment URL used for verification was:
`https://6a7eca2a87b913b03770a8de--crochetbyalae.netlify.app/admin/login`
