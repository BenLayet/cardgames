/**
 * Guide: Getting Elements by CSS Selectors
 * 
 * There are two main methods:
 * 1. querySelector() - Returns the first matching element
 * 2. querySelectorAll() - Returns all matching elements as a NodeList
 */

// ============================================
// 1. BASIC SELECTORS
// ============================================

// By ID
const element = document.querySelector('#player1RemainingCards');
// or
const element2 = document.getElementById('player1RemainingCards');

// By Class
const element3 = document.querySelector('.card');
// or get all with that class
const elements = document.querySelectorAll('.card');

// By tag name
const divs = document.querySelectorAll('div');

// ============================================
// 2. COMPLEX SELECTORS (CSS Combinators)
// ============================================

// Child combinator (>)
// Selects direct children
const lastCard = document.querySelector('#player1RemainingCards > .card:last-child');

// Descendant combinator (space)
// Selects any nested elements
const nestedCard = document.querySelector('#player1RemainingCards .card');

// Multiple levels
const deepElement = document.querySelector('#player1RemainingCards > div > .card:last-child');

// ============================================
// 3. ATTRIBUTE SELECTORS
// ============================================

// By attribute value
const element4 = document.querySelector('[data-player="player1"]');

// By attribute existence
const element5 = document.querySelector('[disabled]');

// By attribute containing text
const element6 = document.querySelector('[class~="card"]');

// ============================================
// 4. PSEUDO-CLASSES
// ============================================

// First child
const firstCard = document.querySelector('#player1RemainingCards > .card:first-child');

// Last child
const lastCard2 = document.querySelector('#player1RemainingCards > .card:last-child');

// Nth child
const thirdCard = document.querySelector('#player1RemainingCards > .card:nth-child(3)');

// Nth of type
const secondDiv = document.querySelector('#player1RemainingCards > div:nth-of-type(2)');

// ============================================
// 5. MULTIPLE SELECTORS (OR logic)
// ============================================

// Selects elements matching ANY of these selectors
const elements2 = document.querySelectorAll('.card, .stack, [data-card]');

// ============================================
// 6. NOT selector
// ============================================

// Selects all cards that don't have the 'hidden' class
const visibleCards = document.querySelectorAll('.card:not(.hidden)');

// ============================================
// 7. PRACTICAL EXAMPLES
// ============================================

// Your use case: Get last card in remaining cards
const lastRemainingCard = document.querySelector('#player1RemainingCards > .card:last-child');

// Get all cards in a player's remaining stack
const allRemainingCards = document.querySelectorAll('#player1RemainingCards .card');

// Get the first visible card
const firstVisibleCard = document.querySelector('#player1RemainingCards > .card:not(.hidden)');

// Get all cards across both players
const allCards = document.querySelectorAll('[id*="RemainingCards"] .card');

// ============================================
// 8. WORKING WITH NodeList
// ============================================

const cards = document.querySelectorAll('.card');

// Method 1: forEach (modern)
cards.forEach(card => {
  console.log(card);
});

// Method 2: for loop
for (let i = 0; i < cards.length; i++) {
  console.log(cards[i]);
}

// Method 3: Convert to array
const cardsArray = Array.from(cards);
cardsArray.map(card => card.id);

// ============================================
// 9. PERFORMANCE TIPS
// ============================================

// ✅ GOOD: Specific selector
const good = document.querySelector('#player1RemainingCards > .card:last-child');

// ❌ BAD: Too broad, then narrow down
const bad = document.querySelectorAll('.card'); // Gets ALL cards, then you filter

// ✅ GOOD: Use closest() to find parent
const card = event.target;
const container = card.closest('#player1RemainingCards');

// ✅ GOOD: Cache selectors if used multiple times
const container2 = document.querySelector('#player1RemainingCards');
const cards2 = container2.querySelectorAll('.card'); // Scoped query is faster

// ============================================
// 10. COMMON PATTERNS FOR ANIMATIONS
// ============================================

// Get element to animate
const cardToAnimate = document.querySelector('#player1RemainingCards > .card:last-child');

// Get animation target
const target = document.querySelector('#player1BeingPlayedCard');

// Get bounding rectangles for position calculation
const fromRect = cardToAnimate.getBoundingClientRect();
const toRect = target.getBoundingClientRect();

// Calculate distance
const translateX = toRect.left - fromRect.left;
const translateY = toRect.top - fromRect.top;

console.log(`Move ${translateX}px right, ${translateY}px down`);

