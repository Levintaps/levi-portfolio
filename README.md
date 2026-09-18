# Jayson Levin Tapia — Portfolio

A React and Vite portfolio with two views driven by one content source.

- `/` is the resume view: minimalist, mobile first, light and dark.
- `/chess` is the chess career, a timeline reached from the achievements
  card. Its content lives in `src/data/chess.ts`.
- `/cyber` is the cyberpunk view. It is parked for now: its code and tests
  stay in `src/components/cyber`, but no route or link reaches it, and
  `/cyber` sends visitors to the resume. To bring it back, restore its route
  in `src/App.tsx`, the `CyberEntry` panel in `ResumeView`, and its entry in
  `public/sitemap.xml`.

## Running it

```bash
npm install
cp .env.example .env.local   # fill in the Firebase and EmailJS values
npm run dev
```

## Commands

- `npm run dev` — development server
- `npm test` — unit tests
- `npm run build` — type check and production build
- `npm run preview` — serve the production build

## Editing the content

Everything on both pages comes from `src/data/resume.ts`. Change it there and
both views update. Replace the CV by overwriting
`public/cv/Jayson_Levin_Tapia_Resume.pdf` with the same filename.

### Projects

The carousel shows the first five entries of the `projects` array, in file
order, so reordering that array is how the running order is set. Everything
else appears under Show all.

Each entry supports these optional fields:

- `client` and `clientUrl` name the owner or company, and link to them. Leave
  `client` empty and no line is rendered.
- `demoUrl` and `repoUrl` turn the panel's two actions into real links. Without
  them the action stays and explains itself when clicked.
- `demoNote` and `repoNote` override that explanation for one project. The
  defaults live in `projectLinkNotes` in the same file.
- `confidential: true` hides everything about the project. The card shows the
  kind, the name, a blurred placeholder and the shared teaser in
  `confidentialNote`, and nothing else. Use it for startup work that is not
  public yet, and add one entry per project you want counted.
- `screenshot` needs the three image files to exist under `public/images/`, at
  the width and height the entry declares.

`kind` is one of `Client project`, `Capstone project`, `Personal project`,
`Game project` or `Startup project`.

## Data

Feedback messages and ratings are stored in Firestore under `messages` and
`ratings`. The rules in `firestore.rules` allow anyone to create and read, and
nobody to update or delete.

The rules are written but not yet deployed to the live project. Deploy them
with:

```bash
npx firebase-tools deploy --only firestore:rules --project levi-portfolio
```

Until that command has been run, the rules in the repository are a local
draft only — the rules actually enforced by Firestore are whatever was last
deployed from the console or a previous deploy. Confirm the live rules in the
Firebase console before relying on them.

## Production domain

The production domain is currently `https://levintapia.vercel.app`. It is
carried as a literal string in four places, since none of them can read the
value from `src/data/resume.ts` at build time:

- `index.html` (the `og:url` and `og:image` meta tags)
- `public/robots.txt` (the `Sitemap:` line)
- `public/sitemap.xml` (the `/` and `/chess` entries, and `/cyber` once that view returns)
- `src/data/resume.ts` (the `siteUrl` constant, which the React app itself
  reads for structured data)

If the site ever moves to a different domain, update all four.

The legacy static site is kept in git history for reference; it was removed
from the working tree once the rebuild above was verified.
