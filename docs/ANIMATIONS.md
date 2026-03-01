# How to Trigger CSS Animations with Redux Actions

This guide explains the complete implementation of CSS animations triggered by Redux state changes in your game component.

## Architecture Overview

The animation system uses Redux state to control CSS classes, which trigger CSS animations. Here's how it works:

```
Redux Action → State Updater → Animation State → Selector → View → CSS Class → Animation
```

## Files Involved

### 1. `game.component.state.ts`
Defines the animation state:
```typescript
animations: {
    player1CardPlay: false,
    player2CardPlay: false,
    cardFlip: false,
    roundWin: false,
}
```

### 2. `game.component.updaters.ts`
Sets animation flags when actions are dispatched:
```typescript
player1Played: ({state}) => {
    // ... existing logic
    state.animations.player1CardPlay = true;  // ✅ Trigger animation
},
```

### 3. `game.component.selectors.ts`
Exposes animation state to components:
```typescript
shouldAnimatePlayer1CardPlay: (state: State) => state.animations.player1CardPlay,
```

### 4. `game.component.view.tsx`
Applies CSS classes based on animation state:
```tsx
<div className={v.shouldAnimatePlayer1CardPlay ? 'animate-card-play' : ''}>
    {/* Card content */}
</div>
```

### 5. `animations.css`
Defines the CSS animations:
```css
.animate-card-play {
    animation: slideToCenter 0.3s ease-out forwards;
}

@keyframes slideToCenter {
    from { transform: translateY(0) scale(1); }
    to { transform: translateY(-50px) scale(1.1); }
}
```

## How It Works

### Step-by-Step Flow

1. **User Action**: User clicks to play a card
2. **Redux Action**: `player1Clicked()` is dispatched
3. **State Update**: The updater sets `state.animations.player1CardPlay = true`
4. **React Re-render**: Component re-renders with new state
5. **CSS Class Applied**: `animate-card-play` class is added to the element
6. **Animation Plays**: Browser executes the CSS animation
7. **Cleanup**: Animation flag is reset in the next relevant action (e.g., `player1WonRound`)

## Animation Lifecycle

### Trigger Animation
```typescript
// In updater
state.animations.player1CardPlay = true;
```

### Reset Animation
```typescript
// In a subsequent updater (e.g., when round ends)
state.animations.player1CardPlay = false;
```

### Important: Timing
- Animation flags should be reset in a subsequent action, not immediately
- This allows the animation to complete before being removed
- Use effects or setTimeout for delayed resets if needed

## Available Animations

All animations are defined in `animations.css`:

1. **animate-card-play**: Slides card to center with scale
2. **animate-flip**: Rotates card 360° (flip effect)
3. **animate-pulse**: Gentle scale pulse
4. **animate-shake**: Horizontal shake effect
5. **animate-fade-in**: Fade in with scale
6. **animate-bounce-in**: Bouncy entrance animation

## Adding New Animations

### 1. Add animation state:
```typescript
// game.component.state.ts
animations: {
    // ...existing
    myNewAnimation: false,
}
```

### 2. Add selector:
```typescript
// game.component.selectors.ts
shouldAnimateMyNewThing: (state: State) => state.animations.myNewAnimation,
```

### 3. Trigger in updater:
```typescript
// game.component.updaters.ts
myAction: ({state}) => {
    // ... your logic
    state.animations.myNewAnimation = true;
},
```

### 4. Reset in another updater:
```typescript
anotherAction: ({state}) => {
    // ... your logic
    state.animations.myNewAnimation = false;
},
```

### 5. Apply in view:
```tsx
// game.component.view.tsx
<div className={v.shouldAnimateMyNewThing ? 'animate-bounce-in' : ''}>
    {/* content */}
</div>
```

### 6. Define CSS (optional - if using a new animation):
```css
/* animations.css */
@keyframes myAnimation {
    0% { /* start state */ }
    100% { /* end state */ }
}

.animate-my-thing {
    animation: myAnimation 0.5s ease-in-out;
}
```

## Advanced Patterns

### Multiple Animations
```tsx
<div className={`
    ${v.shouldAnimateCardPlay ? 'animate-card-play' : ''}
    ${v.shouldAnimateFlip ? 'animate-flip' : ''}
`}>
```

### Conditional Animation Types
```tsx
<div className={
    v.player1Won ? 'animate-bounce-in' : 
    v.player2Won ? 'animate-shake' : ''
}>
```

### Animation Sequences
Use effects to chain animations:
```typescript
// In effects file
myEffect: ({myActionCompleted}) => {
    setTimeout(() => {
        myActionCompleted();
    }, 500); // Wait for animation to complete
}
```

## Tips & Best Practices

1. **Keep animations short** (0.3s - 0.5s) for responsive feel
2. **Reset flags** after animations complete to allow re-triggering
3. **Use `animation-fill-mode: forwards`** to maintain final state
4. **Test performance** - too many simultaneous animations can cause lag
5. **Use CSS transforms** (scale, translate, rotate) for better performance than animating position/size
6. **Consider accessibility** - respect `prefers-reduced-motion` media query

## Debugging

If animations aren't working:

1. ✅ Check Redux DevTools - is the animation flag being set?
2. ✅ Check React DevTools - is the selector returning the correct value?
3. ✅ Check browser DevTools - is the CSS class being applied?
4. ✅ Check CSS - is the animation defined correctly?
5. ✅ Check timing - is the flag being reset too quickly?

## Example: Complete Animation Implementation

```typescript
// 1. State
animations: { cardDeal: false }

// 2. Selector
shouldAnimateCardDeal: (state) => state.animations.cardDeal

// 3. Updater (trigger)
dealRequested: ({state}) => {
    state.animations.cardDeal = true;
}

// 4. Updater (reset)
dealCompleted: ({state}) => {
    state.animations.cardDeal = false;
}

// 5. View
<div className={v.shouldAnimateCardDeal ? 'animate-fade-in' : ''}>
    <CardStack cards={v.cards} />
</div>

// 6. CSS (already defined in animations.css)
.animate-fade-in {
    animation: fadeInScale 0.4s ease-out forwards;
}
```

## Summary

CSS animations triggered by Redux actions follow this pattern:
1. **State**: Boolean flags for each animation
2. **Selectors**: Expose animation state
3. **Updaters**: Set flags when actions occur
4. **View**: Apply CSS classes based on flags
5. **CSS**: Define the visual animations

This creates a clean separation between state management and visual effects!

