# Animations

The game state never holds animation flags. It only says where each card is (which stack, at which
position, face up or down). The view turns that into positions on screen, and the browser's
[Web Animations API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API)
(`element.animate`) moves each card from where it is to where it should be. No animation library is used.

```
action → updater changes the stacks → cardsWithLocation selector → AnimatedCardView → element.animate(...)
```

## Card movements in Battle

### 1. Where each card belongs: `cardsWithLocation`

`src/components/app/battle/game/game.component.selectors.ts`

The `cardsWithLocation` selector lists every card on the table with a `CardPlacement`
(defined in `src/model/deck.model.ts`):

| Field           | Meaning                                                                        |
|-----------------|--------------------------------------------------------------------------------|
| `stackLocation` | The stack the card is in: `seat0Pile`, `seat3Played`… (a pile and the cards played for each seat) |
| `index`         | Position of the card in its stack, 0 being the bottom card                     |
| `stackIndex`    | Order of the stack, used for the z-index (pile 1, played 3)                    |
| `faceUp`        | Whether the card shows its face                                                |
| `messyLevel`    | How much the cards of the stack are rotated                                    |
| `fan`           | How far the card is moved aside, so that the cards of a battle stay in view    |

The cards won go under the pile of the winner, at the lowest indexes.

### 2. Where each stack is on screen: `tableLayout`

`src/components/app/battle/game/game.component.layout.ts`, `game.component.view.tsx` and `src/hooks/useMeasure.ts`

`useMeasure` reads the size of the table once it is laid out, and again when the window or the
table is resized. `tableLayout` places the seats for the number of players (seat 0 at the bottom,
the others clockwise), the cards played between each pile and the centre, and chooses the card size.
The view turns it into a `LayoutState`, the top left corner of each stack from the top left corner of the table:

```ts
type LayoutState = {
    table?: Coordinates;                                     // origin, the top left corner of the table
    stackLocations: Partial<Record<StackLocation, Coordinates>>;
};
```

All cards are rendered in one container at the top left corner of the table, with `position: absolute`.
The cards are only rendered once the first measure is available. The table is rendered again from
scratch for another number of players.

### 3. Moving the card: `AnimatedCardView`

`src/components/card/AnimatedCardView.tsx`

Each card is rendered with `key={card}`, so React keeps the same DOM element when the card
changes stack. When its placement or the layout changes, a `useLayoutEffect` computes the
target, reads the current `transform` of the element (which includes a movement still under way),
sets the target as its `transform`, and animates from the one to the other:

```ts
const target = `translate(${x}px, ${y}px) rotate(${rotation}deg)`;
const current = getComputedStyle(element).transform;
movement.current?.cancel();
element.style.transform = target;
movement.current = element.animate([{transform: current}, {transform: target}], {duration: 500, easing: EASE_OUT});
```

`computeFinalPosition`:
- starts from the stack coordinates minus the table coordinates;
- offsets each card by `index / 2` to the right and `index` up, so a stack looks thick, and by `fan` times part of its size to the right and down;
- adds a rotation from a pseudo-random value seeded by `index`, multiplied by `messyLevel`.
  The rotation is the same for a given index on every render, so cards do not jitter.

The z-index is `index + stackIndex * 100`, so cards higher in a stack are drawn on top, and
stacks being played are drawn above the others. It only orders the cards among themselves: the cards
container sits in the `--z-table-cards` layer of `src/style/variables/layers.css`, over the outlines of
the stacks and under what is written about them.

### 4. Turning a card over (CSS transition)

`src/components/card/CardView.tsx` and `src/style/components/card.css`

`CardView` renders the face and the back of the card back to back. When `faceUp` is false,
the `card-flip--face-down` class rotates `.card-flip-inner` by 180° on the Y axis, with
`transition: transform 0.45s ease-in-out`. `AnimatedCardView` is not involved in the flip.

## Card movements in Spider

`src/hooks/useCardFlight.ts`

Spider uses the same API with the FLIP technique: after each render, the hook measures every element
with a `data-card-id`, compares it with where it was before the render, and animates it from the old
place to the new one. A card that was not on the table comes from the stock. A card still flying is
taken from where it is on screen. Nothing flies when the screen is resized or when the user asks
for reduced motion.

## Timing of a round

`src/components/app/battle/game/game.component.timings.ts` and `game.component.effects.ts`

The pauses between the steps of a round are delays in effects, not animation callbacks.
`DELAYS_MS` holds them:

| Delay               | Value   | Between                                                      |
|---------------------|---------|--------------------------------------------------------------|
| `deal`              | 500 ms  | the deal request and the cards being on the table            |
| `computerAnswer`    | 100 ms  | the player playing and the computer playing                  |
| `suspense`          | 600 ms  | every card played and the cards being turned over            |
| `reviewWinner`      | 1000 ms | the cards being turned over and the round being resolved     |
| `revealedCards`     | 1500 ms | the face down cards being shown and going to the winner      |
| `collected`         | 600 ms  | the cards going to the winner's pile and the next round      |

Effects schedule the next action through `SchedulerService`
(`src/services/scheduler.service.ts`, implemented with `setTimeout` by
`TimeoutSchedulerAdapter` in `src/adapters/scheduler.adapter.ts`), for example:

```ts
suspenseStarted: ({suspenseCompleted}) => after(DELAYS_MS.suspense, suspenseCompleted),
```

`dealRequested` calls `schedulerService.cancelAll()` first, so nothing pending from a previous
game runs in the new one.

When a delay is shorter than a movement (0.5 s), the next movement starts from wherever
the card is: `AnimatedCardView` always starts from the position on screen.

## Other animations (CSS keyframes)

These do not depend on the card positions. They play when their element is rendered.

| Animation                  | Files                                                           | Shown when                         |
|----------------------------|-----------------------------------------------------------------|------------------------------------|
| Battle message pop / pulse | `src/style/components/battle-message.css`                       | `battleCount > 0`                  |
| Tomatoes thrown            | `src/components/tomatoes/Tomatoes.tsx`, `src/style/components/tomatoes.css` | the computer wins the game |
| Fireworks (SVG `<animate>`) | `src/components/fireworks/Fireworks.tsx`                       | a human wins the game              |
| Settings menu opening      | `src/style/components/settings-menu.css`                        | the settings menu opens            |

The battle message is rendered with `key={v.battleCount}`, so React creates a new element
for each new battle and the keyframes play again.

## Adding a movement

1. Change the state so the card is in another stack (or at another index) in an updater.
   `cardsWithLocation` and `AnimatedCardView` move it with no other change.
2. For a new stack: add it to `StackLocation` (`deck.model.ts`) and to `cardsWithLocation` (selectors),
   and give it a place in `tableLayout` and in the `LayoutState` built by the view.
3. If the next step must wait for the movement, schedule it in an effect with a new entry
   in `DELAYS_MS`.

## Debugging

1. Redux DevTools (the store is a Redux store, from `configureSofterStore`): is the card in the expected stack after the action?
2. `cardsWithLocation`: does the card have the expected `stackLocation` and `index`?
3. React DevTools: is `layoutState` measured (not null) and are the stack coordinates set?
4. Browser DevTools: does the card's `transform` change when the placement changes?
