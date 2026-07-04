# KWATE — Auth Flow Runbook

## Avant de modifier l’auth

Lire :

1. `ai/AUTH_OPERATION_REGISTRY.yml`
2. `ai/AUTH_SECURITY_GATES.yml`
3. `docs/19_AUTH_CONTROL_PLANE.md`
4. `docs/06_RLS_AND_PERMISSIONS.md`

## Checklist signup

- [ ] Validation email.
- [ ] Validation password.
- [ ] Validation display name.
- [ ] Register InsForge.
- [ ] Profile créé.
- [ ] Erreurs affichées sans fuite sensible.
- [ ] Audit event.
- [ ] Redirect sûr.

## Checklist login

- [ ] Validation email/password.
- [ ] Session créée.
- [ ] Current user charge.
- [ ] Erreur générique si credentials invalides.
- [ ] Audit event.

## Checklist password reset

- [ ] Message neutre même si email inconnu.
- [ ] Pas de token dans URL loggué.
- [ ] Reset final avec token valide.
- [ ] Audit event.

## Tests minimum

- Signup valid.
- Signup invalid.
- Login valid.
- Login invalid.
- Logout.
- Password reset request.
