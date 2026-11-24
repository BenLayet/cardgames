# Cardgames

A browser collection of card games. The home page lists the games. Two are playable, the others are shown as coming soon.

- **Battle** (*la bataille*), against the computer or between two people on the same device. Each player turns over the top card of their pile; the higher card wins both. Equal cards start a battle: each player adds a face-down card and a face-up one. The player who collects all the cards wins.
- **Spider solitaire**, with 1, 2 or 4 suits. Two decks are dealt into ten columns. A card goes on a card one rank higher of any suit, or on an empty column; a run of the same suit in descending order moves as a whole. Each deal from the stock adds one card to every column, and needs every column to hold a card. A run from king to ace of the same suit is removed; removing eight wins. Cards move by drag and drop or by a click: a card that can go to a single column goes there right away, otherwise the possible columns light up and the next click picks one. A hint button shows the useful moves one after the other, most useful first, or suggests dealing. Moves can be undone.

Features: a setup screen per game (player count, human or computer at each seat), deck size choice for Battle (12, 16, 32 or 52 cards), number of suits for Spider, English and French, music and sound effects, animated cards, and installable as a PWA that works offline.

## Stack

- [React 19](https://react.dev/) and TypeScript
- [Vite](https://vite.dev/) for dev server and build, [Vitest](https://vitest.dev/) for tests
- [softer-components](https://www.npmjs.com/package/@softer-components/types) on top of Redux for state (components are split into state, updaters, effects, selectors and views)
- [i18next](https://www.i18next.com/) / react-i18next for translations
- [GSAP](https://gsap.com/) for card animations
- [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) for the manifest and service worker
- Bootstrap and Font Awesome for UI

## Getting started

Requires Node.js and [pnpm](https://pnpm.io/) (version pinned in `package.json`).

```sh
pnpm install
pnpm dev          # dev server, exposed on the local network
pnpm test         # run tests once
pnpm test:watch   # run tests in watch mode
pnpm lint         # ESLint
pnpm build        # type check and production build into dist/
pnpm preview      # serve the production build
```

## Structure

```
src/
  components/
    app/              root component, settings
      home/           list of games
      setup/          setup screen shared by every game
      battle/         battle flow: setup, game
      spider/         spider solitaire flow: setup, game
    card/             card views and animation
    fireworks/, tomatoes/  end-of-game effects
  model/              deck creation, card values, game registry, spider rules
  services/           service interfaces (audio, language, scheduler, settings)
  adapters/           browser implementations of those services
  configuration.tsx   wires adapters into the app
  locales/            en and fr translations
  assets/             card SVGs and audio
  style/              CSS
  test/               test fakes
public/               icons for the PWA
docs/                 notes on animations and CSS selectors
```

## Deployment

The app is hosted on AWS Amplify. `amplify.yml` installs pnpm, runs `pnpm install --frozen-lockfile` and `pnpm run build`, and publishes `dist/`.
