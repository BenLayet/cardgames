# Cardgames

A browser version of **Battle** (*la bataille*), the classic card game, played against the computer. Each player turns over the top card of their pile; the higher card wins both. Equal cards start a battle: each player adds a face-down card and a face-up one. The player who collects all the cards wins.

Features: deck size choice (12, 16, 32 or 52 cards), English and French, music and sound effects, animated cards, and installable as a PWA that works offline.

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
      battle/         battle flow: start-screen, game
    card/             card views and animation
    fireworks/, tomatoes/  end-of-game effects
  model/              deck creation and card values
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
