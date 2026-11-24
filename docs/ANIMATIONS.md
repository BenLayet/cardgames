# Animations

The game state never holds animation flags. It only says where each card is (which stack, at which
position, face up or down). The view turns that into positions on screen, and GSAP moves each card
from where it is to where it should be.

```
action → updater changes the stacks → cardsWithLocation selector → AnimatedCardView → gsap.to(...)
```

## Card movements (GSAP)

### 1. Where each card belongs: `cardsWithLocation`

`src/components/app/battle/game/game.component.selectors.ts`

The `cardsWithLocation` selector lists every card on the table with a `CardPlacement`
(defined in `src/model/deck.model.ts`):

| Field           | Meaning                                                                        |
|-----------------|--------------------------------------------------------------------------------|
| `stackLocation` | The stack the card is in, e.g. `player1RemainingCards`, `player2WonCards`      |
| `index`         | Position of the card in its stack, 0 being the bottom card                     |
| `stackIndex`    | Order of the stack, used for the z-index (remaining 1, won 2, being played 3)  |
| `faceUp`        | Whether the card shows its face                                                |
| `messyLevel`    | How much the cards of the stack are rotated (2 for most stacks, 10 for won cards) |

The stacks and their settings are declared in the `STACKS` array of the same file.

### 2. Where each stack is on screen: `useMeasure`

`src/components/app/battle/game/game.component.view.tsx` and `src/hooks/useMeasure.ts`

The view renders an empty `div.card-stack-container` for each stack, with a ref.
`useMeasure` reads their `getBoundingClientRect()` once they are laid out, and again when the
window or the game container is resized. The result is a `LayoutState`:

```ts
type LayoutState = {
    table?: Coordinates;                                     // origin, the deck container
    stackLocations: Record<StackLocation, Coordinates | undefined>;
};
```

All cards are rendered in the deck container (`deckRef`), with `position: absolute`, so the
coordinates of a stack are relative to that container. The cards are only rendered once the
first measure is available.

### 3. Moving the card: `AnimatedCardView`

`src/components/card/AnimatedCardView.tsx`

Each card is rendered with `key={card}`, so React keeps the same DOM element when the card
changes stack. When its placement or the layout changes, a `useLayoutEffect` computes the
target and tweens the element to it:

```ts
const {x, y, rotation} = computeFinalPosition({stackLocation, index, messyLevel}, layoutState);
gsap.to(ref.current, {x, y, rotation, duration: 0.5, ease: "power2.out"});
```

`computeFinalPosition`:
- starts from the stack coordinates minus the table coordinates;
- offsets each card by `index / 2` to the right and `index` up, so a stack looks thick;
- adds a rotation from a pseudo-random value seeded by `index`, multiplied by `messyLevel`.
  The rotation is the same for a given index on every render, so cards do not jitter.

The z-index is `index + stackIndex * 100`, so cards higher in a stack are drawn on top, and
stacks being played are drawn above the others.

### 4. Turning a card over (CSS transition)

`src/components/card/CardView.tsx` and `src/style/components/card.css`

`CardView` renders the face and the back of the card back to back. When `faceUp` is false,
the `card-flip--face-down` class rotates `.card-flip-inner` by 180° on the Y axis, with
`transition: transform 0.45s ease-in-out`. GSAP is not involved in the flip.

## Timing of a round

`src/components/app/battle/game/game.component.timings.ts` and `game.component.effects.ts`

The pauses between the steps of a round are delays in effects, not animation callbacks.
`DELAYS_MS` holds them:

| Delay               | Value   | Between                                                      |
|---------------------|---------|--------------------------------------------------------------|
| `deal`              | 500 ms  | the deal request and the cards being on the table            |
| `player2Answer`     | 100 ms  | player 1 playing and player 2 playing                         |
| `suspense`          | 600 ms  | both cards played and the cards being turned over            |
| `reviewWinner`      | 1000 ms | the cards being turned over and the round being resolved     |
| `revealedPair`      | 1500 ms | a hidden pair being revealed and it going to the winner      |
| `pairTransferPause` | 300 ms  | two pairs going to the winner's stack                        |

Effects schedule the next action through `SchedulerService`
(`src/services/scheduler.service.ts`, implemented with `setTimeout` by
`TimeoutSchedulerAdapter` in `src/adapters/scheduler.adapter.ts`), for example:

```ts
suspenseStarted: ({suspenseCompleted}) => after(DELAYS_MS.suspense, suspenseCompleted),
```

`dealRequested` calls `schedulerService.cancelAll()` first, so nothing pending from a previous
game runs in the new one.

When a delay is shorter than the GSAP tween (0.5 s), the next movement starts from wherever
the card is: `gsap.to` always starts from the current position.

## Other animations (CSS keyframes)

These do not depend on the card positions. They play when their element is rendered.

| Animation                  | Files                                                           | Shown when                         |
|----------------------------|-----------------------------------------------------------------|------------------------------------|
| Battle message pop / pulse | `src/style/components/battle-message.css`                       | `battleCount > 0`                  |
| Tomatoes thrown            | `src/components/tomatoes/Tomatoes.tsx`, `src/style/components/tomatoes.css` | player 2 wins the game |
| Fireworks (SVG `<animate>`) | `src/components/fireworks/Fireworks.tsx`                       | player 1 wins the game             |
| Settings menu opening      | `src/style/components/settings-menu.css`                        | the settings menu opens            |

The battle message is rendered with `key={v.battleCount}`, so React creates a new element
for each new battle and the keyframes play again.

## Adding a movement

1. Change the state so the card is in another stack (or at another index) in an updater.
   `cardsWithLocation` and `AnimatedCardView` move it with no other change.
2. For a new stack: add it to `StackLocation` (`deck.model.ts`), to `STACKS` (selectors),
   and add a ref, a `card-stack-container` and an entry in the `useMeasure` callback in the view.
3. If the next step must wait for the movement, schedule it in an effect with a new entry
   in `DELAYS_MS`.

## Debugging

1. Redux DevTools (the store is a Redux store, from `configureSofterStore`): is the card in the expected stack after the action?
2. `cardsWithLocation`: does the card have the expected `stackLocation` and `index`?
3. React DevTools: is `layoutState` measured (not null) and are the stack coordinates set?
4. Browser DevTools: does the card's `transform` change when the placement changes?
