# Checklist de test Auth InsForge

## Configuration

- [ ] `NEXT_PUBLIC_INSFORGE_URL` pointe vers le bon projet.
- [ ] `NEXT_PUBLIC_INSFORGE_ANON_KEY` est une clé anonyme, jamais une clé admin.
- [ ] `/login` et `/reset-password` sont dans les URLs de redirection autorisées.
- [ ] La migration Step 3 est appliquée si la création automatique du profil doit fonctionner.

## Inscription

- [ ] Un nouvel utilisateur peut créer un compte.
- [ ] Une adresse déjà utilisée retourne un message lisible.
- [ ] `disableSignup=true` désactive le formulaire.
- [ ] La règle `passwordMinLength` est affichée et respectée.
- [ ] Le flow code redirige vers `/verify-email`.
- [ ] Le flow lien revient vers `/login` avec un état succès/erreur.

## Connexion et session

- [ ] Un utilisateur vérifié peut se connecter.
- [ ] Des identifiants invalides ne révèlent aucune donnée sensible.
- [ ] Un refresh de page restaure la session avec `getCurrentUser()`.
- [ ] `/profile`, `/settings`, `/messages` et `/publish` redirigent les visiteurs anonymes.
- [ ] `next` n’accepte qu’un chemin interne commençant par `/`.
- [ ] La déconnexion invalide la session et retourne à `/login`.

## Mot de passe oublié

- [ ] La réponse reste générique même pour un email inconnu.
- [ ] Le flow code accepte exactement 6 chiffres.
- [ ] Le flow lien exige `insforge_status=ready`, `insforge_type=reset_password` et un token.
- [ ] Un token expiré affiche une erreur et aucun formulaire utilisable.
- [ ] Après changement, la connexion avec le nouveau mot de passe fonctionne.

## Sécurité

- [ ] Aucun token auth n’apparaît dans `localStorage` ou `sessionStorage`.
- [ ] Aucun secret `INSFORGE_ADMIN_TOKEN` n’est présent dans le bundle client.
- [ ] Les tables privées restent protégées par RLS.
- [ ] Les erreurs et logs n’impriment ni mot de passe, ni token, ni cookie.
