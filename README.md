# AuTogo — Frontend

Interface web et PWA pour AuTogo, une plateforme de microfinance destinée au marché togolais : gestion de clients, comptes épargne, tontines et prêts, avec des espaces dédiés par rôle (Admin, Manager, Agent, Caissier, Comptable, Client).

**Backend associé :** 
- Lien github : [github](https://github.com/dzidulasolutions/AUTOGO) 
- Lien de l'application backend : [autogo-backend](autogo-79vw.onrender.com/api/docs)
- Technologies : (NestJS, PostgreSQL, Prisma)

---

## Sommaire

- [Aperçu](#aperçu)
- [Stack technique](#stack-technique)
- [Fonctionnalités](#fonctionnalités)
- [Démarrage local](#démarrage-local)
- [Variables d'environnement](#variables-denvironnement)
- [Structure du projet](#structure-du-projet)
- [Rôles et accès](#rôles-et-accès)
- [PWA](#pwa)
- [Déploiement](#déploiement)

---

## Aperçu

AuTogo digitalise les opérations d'une institution de microfinance : ouverture et suivi de comptes clients, dépôts/retraits d'épargne, gestion de cycles de tontine avec calendrier de collecte, et cycle de vie complet des prêts (demande → approbation → décaissement → remboursement).

L'interface est pensée **mobile-first** pour les profils terrain (Agent, Caissier, Client) et **desktop-first** pour les profils de gestion (Admin, Manager, Comptable), avec un système responsive unique plutôt que deux interfaces séparées.

## Stack technique

- **Framework** : Next.js (App Router), TypeScript
- **Style** : Tailwind CSS, design system noir/blanc minimal
- **Données** : TanStack Query (React Query)
- **Graphiques** : Recharts
- **Animations** : Motion
- **Authentification** : JWT (staff) + JWT dédié (portail client), cookies httpOnly, refresh token automatique
- **PWA** : manifest, service worker, invite d'installation (Chrome/Edge + instructions iOS)

## Fonctionnalités

### Authentification

Connexion staff et client, MFA (TOTP), vérification email/téléphone, mot de passe oublié, gestion des sessions actives, garde de routes par rôle.

### Clients

CRUD complet, recherche floue, upload photo/pièce d'identité, indicateur de complétude du dossier, désactivation et réactivation.

### Transactions

Historique filtrable, dépôt/retrait avec garantie d'idempotence, annulation (Comptable/Admin) avec ajustement de solde.

### Épargne

Ouverture de compte, dépôt, retrait, vue consolidée par client et vue globale par agence.

### Tontines

Création de cycle, génération automatique du calendrier de collecte, validation d'échéance (y compris rattrapage), clôture avec restitution et commission.

### Prêts

Demande → soumission → approbation/rejet → décaissement (génération d'échéancier) → remboursement FIFO → report d'échéances, téléchargement PDF de l'échéancier.

### Dashboard

Résumé d'agence (graphique de flux de trésorerie), portefeuille de prêts à risque, collectes du jour (vue Agent), génération de rapports mensuels (PDF).

### Administration

Gestion des utilisateurs staff, des agences (avec statistiques), des paramètres système (taux d'intérêt, commission).

### Portail client

Espace lecture seule : prêts, épargne, tontines, consultables par le client lui-même après activation de son compte.

## Démarrage local

```bash
git clone https://github.com/dzidulasolutions/Auto-front.git
cd autogo-front
npm install
cp .env.example .env.local   # renseigner BACKEND_URL
npm run dev
```

L'application démarre sur `http://localhost:3000`.

## Variables d'environnement

| Variable       | Description                                  |
|----------------|-----------------------------------------------|
| `BACKEND_URL`  | URL de base de l'API backend (NestJS)          |

## Structure du projet

```
src/
├─ app/                 Pages (App Router), routes par espace (/admin, /manager, /agent, /caissier, /client)
│  └─ api/               Routes proxy (auth, backend, téléchargements)
├─ components/           Composants React, organisés par domaine
├─ hooks/                Hooks React Query par domaine
├─ services/             Appels API, un fichier par module backend
├─ types/                Types TypeScript, alignés sur le contrat backend
├─ lib/                  Client API, session, utilitaires
└─ config/               Routes, navigation par rôle
```

## Rôles et accès

| Rôle        | Périmètre                                              |
|-------------|----------------------------------------------------------|
| SuperAdmin / Admin | Accès complet, toutes agences                     |
| Manager     | Approuve les prêts, toute son agence                     |
| Agent       | Son portefeuille de clients assignés                      |
| Caissier    | Transactions au sein de son agence                        |
| Comptable   | Annulation de transactions                                |
| Client      | Portail en lecture seule sur ses propres données           |

## PWA

L'application est installable sur mobile et desktop (Chrome/Edge via invite native, iOS via instructions manuelles guidées). Un service worker assure la mise en cache des ressources essentielles.

## Déploiement

Déployé sur [Render](https://autogo-finance.onrender.com) en tant que service web Node. Le déploiement est automatique à chaque push sur la branche principale (`render.yaml` à la racine). Une intégration continue GitHub Actions (`.github/workflows/ci.yml`) vérifie le lint et le build avant déploiement.
