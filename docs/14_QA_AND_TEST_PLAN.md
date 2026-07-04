# KWATE — QA and Test Plan

## Tests minimum avant branchement production

### Auth

- Signup valid.
- Signup invalid email.
- Login valid.
- Login wrong password.
- Logout clears session.
- Password reset request does not reveal account existence.

### Posts

- Public sees active posts.
- Public does not see blocked/deleted posts.
- Auth user creates post.
- Owner updates own post.
- User cannot update another user post.
- Soft delete hides post.

### Pass/payment

- Auth user starts checkout.
- Anonymous cannot start checkout.
- Webhook completed activates pass.
- Duplicate webhook/idempotency does not create duplicate active pass.

### Contact

- Locked contact is hidden without pass.
- Active pass unlocks contact.
- Exchange can be contacted freely if rule says free.

### Messages

- Participant can read conversation.
- Non participant cannot read conversation.
- Empty message rejected.

### Admin

- Admin can block post.
- Non-admin cannot access admin action.
- Audit event written.

## Commandes actuelles

```bash
npm run lint
npm run build
```

## Futur

Ajouter Vitest + Playwright après migration runtime InsForge.
