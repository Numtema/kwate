# KWATE — Auth Control Plane

## Objectif

Les pages auth simulées ont été remplacées par InsForge Auth à l’étape 4. Ce document reste la source des règles de sécurité et d’évolution.

## Routes concernées

| Route | Action |
|---|---|
| `/signup` | register + profile bootstrap |
| `/login` | create session |
| `/forgot-password` | request reset |
| `/welcome` | onboarding après signup |
| `/profile` | current user |
| `/settings` | logout / privacy |

## Flows MVP

### Signup

```txt
user submits name/email/password
→ validate input
→ InsForge register
→ create/update profile
→ audit auth.signup
→ redirect welcome/dashboard
```

### Login

```txt
user submits email/password
→ InsForge login
→ store session safely
→ audit auth.login
→ redirect home/profile
```

### Logout

```txt
click logout
→ InsForge logout
→ clear local session state
→ audit auth.logout
→ redirect login/welcome
```

### Password reset

```txt
request reset email
→ avoid user enumeration
→ show neutral success
→ audit auth.password_reset_requested
```

## Contraintes sécurité

- Pas de refresh token web dans localStorage.
- Pas de secret dans logs.
- Toujours gérer loading/success/error.
- Toujours valider les redirects.
- Toujours bootstrapper un profile après signup.
