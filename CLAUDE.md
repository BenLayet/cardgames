# CLAUDE.md

See `README.md` for the stack, the commands, the structure and the versioning, and `docs/ANIMATIONS.md` for card movements.

## Guideline for a new game

Every new game follows these rules, so that all games look and behave the same way. Spider (`src/components/app/spider/`) and Bataille (`src/components/app/battle/`) are the reference implementations.

### 1. A menu to configure the game

- Before playing, the game shows its setup screen: the shared `Setup` component in `src/components/app/setup/`, not a screen of its own.
- The options it offers come from the game's `GameDefinition` in `src/model/games.model.ts` (players, `cardCountOptions`, `suitCountOptions`, hints…). Add a field there when a new kind of option is needed, rather than a special case in the setup view.
- Text fields of the setup (player names) chain on a phone: the keyboard's OK key (`enterKeyHint="next"`) goes to the next field, and on the last one (`"done"`) closes the keyboard without starting the game.
- The game is listed on the home page only once it is playable (`available: true`).

### 2. Resume the last game or start a new one

- When a game in progress exists for the chosen options, **Resume** is the main (default) action of the setup screen, and **New game** the second one. The game passes `onResume` to `Setup` when it can resume, as `spider.component.view.tsx` and `battle.component.view.tsx` do.
- The game in progress is saved after each move, in the browser, and is resumed without the deal animation.
- Games are saved **per game type**: each combination of options that makes a different game (for example the number of players, or the number of cards) has its own save. Spider does this: `LocalStorageSpiderSaveAdapter` keeps one game per number of cards and of suits, under `cardgames.spider.game.<cardCount>.<suitCount>`, and `savedVariants()` tells which ones can be resumed.
- Saving goes through a service interface in `src/services/` (`<game>-save.service.ts`) and a `localStorage` adapter in `src/adapters/` built on the shared `LocalStorageVariantStore` (`local-storage-variant-store.ts`: one key per game type, older single save moved, retry with a smaller game when full), wired in `src/configuration.tsx`. Without storage (private mode, storage full), the game is simply not kept and must not fail.
- The saved format carries a version number; a saved game of an older shape is migrated or ignored, never a crash (see `battle-save.adapter.ts`).
- Back from the game goes to the game's setup screen, and the game stays saved.

### 3. Cards use the shared card components

- Cards are drawn only with the components of `src/components/card/`; a game never draws its own cards.
  - `CompactCardView`: small compact cards, readable at small sizes (value and suit on the top line, pips as on a traditional card, figures in a frame).
  - `CardView`: the detailed SVG faces, where there is room.
  - `AnimatedCardView`: a card placed and moved on the table (see `docs/ANIMATIONS.md`).
- Cards vary by language: in French the figures show V, D, R, in English J, Q, K. This comes from the `ranks` translations and from `src/assets/cards/fr/` (made by `scripts/french-card-faces.ts`); a new game gets it for free by using these components.
- The card back is `src/assets/cards/back.svg` (ruby back of the "Salon vert" style).
- Screen readers get the card name from `useCardName`.

### 4. A slightly realistic effect for messy piles

- Piles are not perfectly aligned: each card of a stack is slightly rotated, the stack grows by a pixel per card, up to a few pixels.
- The tilt is the same everywhere, on the piles as for the cards in play: 3° at most on each side (`messyLevel` 6).
- Use the `messyLevel` field of `CardPlacement` (`src/model/deck.model.ts`): `AnimatedCardView` turns it into a tilt of up to `messyLevel / 2` degrees on each side (`cardTilt` in `src/components/card/card-tilt.ts`), and lifts each card of a stack a little by its index. The tilt comes from the card and its stack, not from `Math.random()` nor from the index of the card: a card keeps its tilt when the screen is drawn again or when cards go under it, and the first card of a stack is tilted like the others.
- Leave room for the tilt where cards lie side by side, so that tilted cards never overlap (Bataille: `slotGaps` in `game.component.layout.ts`).
- Keep it light: the value and suit of every face-up card must stay readable.

### 5. Status line at the bottom, actions at the bottom right

- Everything the game says to the player (whose turn it is, the move counter, the hint, what to do next) goes in the status line at the bottom centre of the felt; no message elsewhere on the table.
- The game's actions (Hint, Undo…) sit in the bottom right corner, under the right thumb (in a row upright, in a column sideways).
- They are ordered from the least used to the most used: the most used one sits in the corner, on the right upright and at the bottom sideways. In code, the last child of `TableActions` is the most used action (Spider: Positions, Hint, Undo).
- Both come from the shared `TableActions` component (`src/components/navigation/TableActions.tsx`): `status` for the line, its children for the buttons (`btn table-action`, an icon and a label). Its `statusRef` and `actionsRef` let the game measure the room left above them, as Spider does.
- The top bar is the shared `AppBar` (`src/components/navigation/AppBar.tsx`): Back, title, rules and Settings. No game buttons in it.

### 6. Layers: what is drawn over what

- Every z-index comes from the scale of `src/style/variables/layers.css` (`var(--z-…)`); never write a number. A new layer is added there, at its place, with a comment saying what it holds.
- The table isolates its content (`isolation: isolate`), so that the status line, the actions, the end message, the top bar and the windows always stay over the cards. Inside the table, from the bottom up: the places of the stacks (dotted outlines), the cards, the moving cards, the sparks, the message in the middle, the dragged card. Bataille draws the outline of a pile and its marks as two elements at the same place: the outline under the cards, the marks (names, keys) inside the cards container, over the cards lying in their stacks and under a card won flying to the winner's pile (`--z-cards-…`).
- In the end message, the effects (`Fireworks`, `Tomatoes`) stay behind the title, the texts and the buttons.
- A window (`Modal`) is drawn at the end of the page, so that it covers the end message and the update banner.

### 7. Animations to move cards

- Every card that changes place moves there, so that the eye can follow it: dealing, playing, a move, an undo. A card never jumps.
- The game state holds no animation flag, only where each card is; the view animates with the Web Animations API, without a library (`docs/ANIMATIONS.md`).
- Reuse what exists: `AnimatedCardView` (`src/components/card/AnimatedCardView.tsx`) for cards placed on a table by stack, as in Bataille, or `useCardFlight` (`src/hooks/useCardFlight.ts`) for cards laid out by the page, as in Spider (flight from the old place to the new one, deal from the stock).
- A resumed game appears in place, without the deal animation.

### 8. Victory and defeat screen

- The end of a game uses the shared `EndMessage` component (`src/components/end-message/EndMessage.tsx`), which offers Play again (same options) and Menu, and keeps the top bar usable.
- Inside it, the game puts its title and details, with the shared effects: `Fireworks` (`src/components/fireworks/`) for a victory, `Tomatoes` (`src/components/tomatoes/`) for a defeat against the computer.

### Also

- All texts in `src/locales/en` and `src/locales/fr`; French texts use "tu", never "vous".
- The rules of the game, in both languages, open from the book button of the top bar (setup screen and during play).
- Unit tests next to the code (Vitest), and an end-to-end test in `e2e/` for the main flow.
