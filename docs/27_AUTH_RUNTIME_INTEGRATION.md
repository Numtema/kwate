# Étape 4 — Auth runtime InsForge

## Statut

```txt
Implémentation locale : PASS
Build TypeScript/Next : PASS
Test avec instance InsForge réelle : À FAIRE
OAuth social : HORS PÉRIMÈTRE ÉTAPE 4
```

## Objectif

Remplacer les formulaires simulés de KWATE par les flows réels du SDK officiel `@insforge/sdk`.

```txt
Auth UI
→ validation Zod
→ SDK officiel InsForge
→ cookie refresh httpOnly géré par InsForge
→ access token en mémoire SDK
→ session courante
→ profil applicatif KWATE en best effort
→ état UI succès/erreur
```

## Fichiers runtime

```txt
lib/insforge/sdk-browser.ts
lib/insforge/auth-client.ts
lib/insforge/auth-types.ts
features/auth/schema.ts
features/auth/errors.ts
features/auth/adapters.ts
features/auth/profile-bootstrap.ts
components/AuthProvider.tsx
components/AuthRouteState.tsx
```

## Routes branchées

| Route | Flow |
|---|---|
| `/login` | email + mot de passe, restauration session, retour vers `next` sécurisé |
| `/signup` | création compte, respect de `disableSignup` et de la longueur du mot de passe |
| `/verify-email` | vérification par code ou attente du lien email |
| `/forgot-password` | demande de reset avec réponse anti-énumération |
| `/reset-password` | changement par code ou jeton provenant du lien |
| `/profile` | utilisateur réel + déconnexion réelle |
| `/settings` | email réel + déconnexion réelle |

## Routes nécessitant une session

```txt
/profile
/settings
/messages
/publish
```

Le guard client améliore l’expérience et redirige vers `/login?next=...`.
La vraie frontière de sécurité des données reste InsForge Auth + les policies RLS de l’étape 3.

## Session et tokens

Règles appliquées :

- aucun access token ou refresh token dans `localStorage` ;
- le SDK garde l’access token en mémoire ;
- le navigateur utilise le cookie refresh `httpOnly` InsForge ;
- `getCurrentUser()` restaure/rafraîchit la session ;
- aucune clé admin dans le navigateur ;
- les erreurs sont normalisées avant affichage.

## Synchronisation du profil KWATE

Après une authentification réussie, `ensureKwateProfile()` vérifie la table `profiles` et crée le profil applicatif absent.
Cette opération est volontairement non bloquante : l’auth ne doit pas échouer uniquement parce que la migration SQL n’a pas encore été exécutée.

## Configuration requise

```env
NEXT_PUBLIC_INSFORGE_URL=https://votre-projet.insforge.app
NEXT_PUBLIC_INSFORGE_ANON_KEY=votre_cle_anonyme
```

Dans la configuration Auth InsForge, ajouter au minimum :

```txt
https://votre-domaine/login
https://votre-domaine/reset-password
```

## Non inclus dans cette étape

- OAuth Google/GitHub et PKCE ;
- middleware serveur de session ;
- suppression réelle du compte ;
- édition persistante du profil ;
- connexion distante des flows aux variables du compte propriétaire ;
- test end-to-end contre un projet InsForge déployé.
