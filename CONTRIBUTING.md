# Contributing Guide

First, some principles:

- Make very strict database rules; tokens are stored there
- Minimal personal data collection
- Use git branches for features, frequent commits

## Setting Up

1. **Prerequisites**:
   - Download Node.js 20+!

2. **Dependencies**:

   ```bash
   # Backend (in root)
   npm install

   # Frontend (in /web)
   cd web && npm install

   # Backend (in /functions)
   cd functions && npm install
   ```

3. **Environment Setup**:
Request .env files from a team member. Create local copies from examples:

   ```bash
   # Project (in root .env)
   cp .env.example .env

   # Frontend (in /web .env)
   cp web/.env.example web/.env

   # Backend (in /functions .env)
   cp web/.env.example functions/.env
   ```

4. **Service Account**:

Request `serviceAccountKey.json` from a team member. Place it in root

5. **Development**:

   ```bash
   cd web && npm run dev            # Frontend dev server
   cd functions && npm run serve    # backend Firebase emulator for testing functions
   ```

## Tech Stack 

Frontend:

- HTML + CSS: the structure (HTML) and visual styling (CSS) of web pages.
- TypeScript: JavaScript with "types" that help catch mistakes early.
- React: lets us easily build the UI from small, reusable components.
- Vite: Fast dev server ("npm run dev") and build tool. Pronounced "veet".
- Tailwind CSS: style quickly using small utility classes.
- Node.js + npm: run tools and install packages on your computer.
- ESLint: checks code for common errors and enforces consistent style.
- PostCSS + Autoprefixer: makes CSS work consistently across different browsers.

Backend:

- Firebase Functions: make our backend handlers work when triggered by frontend or on schedule
- Firebase Hosting: deploy the website through a particular url on the internet.
- Firebase Firestore: cloud database for events, pages, and settings.
- Firebase Storage: cloud storage specifically for images to speed up database reads
- Google Secret Manager: dedicated mega-encrypted google cloud storage for tokens and env vars
- Github Actions: automatically hosts "live" branch to Firebase
- Facebook Graph API: automatically fetch event data from Facebook pages.
- Axios: Simple HTTP client that calls http requests, especially for the facebook callback process
- Jest: JavaScript testing framework
- Vitest: TypeScript testing framework

## Architecture

In general, we're very reliant on not just Facebook for the data, but Firebase for handling a lot of our backend security needs. You could put middleware/validation in the backend, but 1) firebase does a lot of that for us, and 2) this is a small school project with a small amount of students as its user base, not a bank 3) we don't have auth or profiles

Our web-app is in some ways a SPA, single-page application in that the client/user carries a lot of the heavy weight, which is fine because our app has minimal interaction and only consists of under 10 pages. 

Another important thing is that to maximize speed, we've put the database in the middle instead of behind the backend: The frontend makes quick calls to the database, meanwhile the backend is chiefly responsible for "ingesting" (populating) the DB with Facebook data on scheduled syncs, plus handling the callback. 

Frontend (/web):

- Components: "Display isolated stuff", e.g. a button or page element like a list or toggle. Doesn't have to be reusable, just has to be isolated
- Hooks: "Provide functionality for stuff", e.g. applying filter functionaltiy. Note that its always prefixed by use[Component name] and 
- Pages: "Dispays entire pages" by importing components plus adding it's own things
- Services: "Connect to stuff", in our case external services like Google and Facebook
- Utils: "Help with stuff" by supplying reusable functions. Rule of thumb: If the function is used in several files, it's probably a util. If it's used by one, it's probably a helper

Backend (/functions): 

- Handlers: "Do stuff", e.g. callback or refresh tokens
- Services (see above)
- Utils (see above)

Misc: 

- Index files are "entry points", often for re-exporting a folder's files for easier import elsewhere.
- Types are for interfaces; in TypeScript, these interfaces disappear when you run the app (unlike e.g. Java/C#) but still help with type safety

## Project Structure

In general: 
- functions is backend, web is frontend
- root dir for config and docs, */src for code
- npm run build produces */src/dist for JS code and */src/node_modules for packages 

```text
DTUEvent/
├── CONTRIBUTING.md                          # techical documentation
├── README.md                                # general documentation
├── LICENSE
├── package.json                             # root npm scripts (build, tokens, deploy helpers)
├── firebase.json                            # Firebase hosting config
├── firestore.rules                          # Firestore security rules
├── dtuevent-*-firebase-adminsdk-*.json      # service account (gitignored!)
├── functions/                               # Cloud Functions (backend implementation)
│   ├── package.json                         # backend npm scripts ()
│   ├── tsconfig.json                        # TypeScript config
│   ├── jest.config.js                       # Jest (JavaScript Test config)
│   ├── src/
│   │   ├── index.ts                         # entry-point for Firebase Functions
│   │   ├── types.ts                         # type checking interfaces from TypeScript
│   │   ├── handlers/
│   │   │   ├── facebookCallbackHandler.ts   # handler for receiving token from FB when approved
│   │   │   ├── ingestEventsHandler.ts       # scheduled population of DB events from FB pages
│   │   │   └── tokenRefreshHandler.ts       # refreshes FB tokens every 45 days
│   │   ├── services/
│   │   │   ├── FacebookService.ts           # CRUD for Facebook Graph API 
│   │   │   ├── FirestoreService.ts          # CRUD for DB
│   │   │   ├── SecretManagerService.tsn     # CRUD for Google Secret Manager, for safely storing our tokens 
│   │   │   └── StorageService.ts            # CRUD for images
│   │   └── utils/
│   │       ├── configUtil.ts                # centralized env and const config
│   │       ├── depUtil.ts                   # dependency injection of services
│   │       ├── eventNormalizerUtil.ts       # transforms Facebook events to our Firebase events
│   │       └── httpStatusUtil.ts            # converts http status to msg (e.g. 500 = Internal Server Error)
│   └── lib/                                 # Compiled TS to JS output, generated with npm run build
│       ├── index.js
│       └── ...
├── web/                                     # React + Vite frontend
│   ├── package.json                         # frontend npm config
│   ├── index.html                           # config for browser tab text and image
│   ├── vite.config.ts                       # Vite config
│   ├── postcss.config.js                    # postcss config
│   ├── tsconfig.app.json                    # TypeScript config
│   ├── .env.example                         # frontend env vars, prefixed with VITE_
│   ├── public/                              # Static assets/resources (images, icons)
│   └── src/
│       ├── main.tsx                         # App entry
│       ├── App.tsx                          # router setup
│       ├── router.tsx                       # React Router for redirecting
│       ├── index.css                        # css config
│       ├── types.ts                         # TypeScript interfaces for type checking 
│       ├── components/                      # various tsx components, purely UI
│       │   ├── EventCard.tsx                
│       │   ├── EventList.tsx
│       │   ├── FacebookLinkButton.tsx       
│       │   └── ...
│       ├── pages/                           
│       │   ├── MainPage.tsx                 # aggregates components and more into Main Page
│       │   └── EventPage.tsx                # same but for a page for each individual event
│       ├── hooks/                           # hooks = functionality of components/UI
│       │   ├── useEventCard.ts              # (but only if it changes states!)
│       │   └── useFilterBar.ts
│       ├── services/                        # connect to services
│       │   ├── dal.ts                       # Data Access Layer, i.e. Firestore connection
│       │   ├── facebook.ts
│       │   └── firebase.ts
│       ├── styles/                          # css styles
│       │   ├── App.css                      # entire app styles
│       │   ├── theme.css                    # Light/Dark theme styles
│       │   └── ThemeToggle.css              # for toggle specifically
│       └── utils/      
│           ├── dateUtils.ts                 # Helper functions for converting and extracting dates
│           └── eventUtils.ts                # Helper functions related to functions
└── .github/                                 # GitHub Actions workflows
   └── firebase-hosting-merge.yml            # Automatically deploys when merging into main
```

## Firebase Security Rules

Tokens stored in admin-only Firestore collections:

- `events/` - Public read, admin write
- `pages/` - Public read, admin write  
- `admin-tokens/` - Admin only (no client access)

## Deployment

GitHub Actions automatically deploys `main` branch to Firebase Hosting.

Manual deployment:

```bash
firebase deploy
```
