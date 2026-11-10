# Cagnotte solidaire – Next.js + PayPal

Page responsive en français pour une cagnotte avec un objectif de 2 000 €, contributions prédéfinies et paiement PayPal Checkout.

## 1. Installation

```bash
npm install
cp .env.example .env.local
npm run dev
```

## 2. Configurer PayPal

1. Créez une application dans le [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/).
2. Copiez le Client ID dans `NEXT_PUBLIC_PAYPAL_CLIENT_ID` et le Secret dans `PAYPAL_CLIENT_SECRET`.
3. Commencez avec `PAYPAL_ENV=sandbox` pour tester. Passez à `PAYPAL_ENV=live` uniquement après les tests et vérifications nécessaires.
4. Ne publiez jamais le Secret PayPal dans le code côté navigateur ou dans Git.

## 3. Activer le suivi réel de la collecte

1. Créez un projet Supabase.
2. Dans SQL Editor, exécutez le contenu de `supabase-schema.sql`.
3. Ajoutez l'URL du projet à `NEXT_PUBLIC_SUPABASE_URL` et la clé `service_role` à `SUPABASE_SERVICE_ROLE_KEY` dans `.env.local`.
4. Redémarrez le serveur.

Le montant collecté et le nombre de contributeurs sont mis à jour uniquement après confirmation de capture PayPal. Les identifiants de capture sont uniques afin d'éviter de compter deux fois le même paiement.

## 4. Déploiement Vercel

Importez le dépôt dans Vercel, ajoutez les variables d'environnement, puis déployez. Utilisez les identifiants PayPal Live seulement lorsque la page, l'identité de l'organisateur, le bénéficiaire et les informations de collecte sont prêts et vérifiés.

## À compléter avant publication

- Ajouter le nom ou la présentation de l'organisateur et un moyen de contact.
- Confirmer que le bénéficiaire a autorisé la collecte.
- Indiquer comment les fonds seront remis au bénéficiaire et ce qui se passera si l'objectif n'est pas atteint ou est dépassé.
- Vérifier les règles de PayPal et les obligations locales applicables aux collectes de dons.

Le visuel de couverture est une illustration CSS originale et non une photo de bénéficiaire.
