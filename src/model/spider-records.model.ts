import type {SpiderVariant} from "./spider.model.ts";

// A won game of Spider, kept to rank it among the other games of its kind
export type SpiderWin = {
    cardCount: number;
    suitCount: number;
    moveCount: number;
    // when it was won, in milliseconds since 1970; it also tells a win from another
    wonAt: number;
};

// how many of the best games of each kind are shown
export const TOP_SIZE = 10;

const isOfVariant = ({cardCount, suitCount}: SpiderVariant) => (win: SpiderWin) =>
    win.cardCount === cardCount && win.suitCount === suitCount;
const sameWin = (a: SpiderWin, b: SpiderWin) => a.wonAt === b.wonAt && isOfVariant(a)(b);
// fewer moves first; between equal games, the one made first keeps its place
const byMoves = (a: SpiderWin, b: SpiderWin) => a.moveCount - b.moveCount || a.wonAt - b.wonAt;

// the best games of a kind, the best first
export const topWins = (wins: readonly SpiderWin[], variant: SpiderVariant): SpiderWin[] =>
    wins.filter(isOfVariant(variant)).sort(byMoves).slice(0, TOP_SIZE);

// the place of a win among the best games of its kind, from 1, or null when it is not one of them
export const rankOf = (wins: readonly SpiderWin[], win: SpiderWin): number | null => {
    const index = topWins(wins, win).findIndex(top => sameWin(top, win));
    return index < 0 ? null : index + 1;
};

// a new win is kept only while it is among the best games of its kind
export const withWin = (wins: readonly SpiderWin[], win: SpiderWin): SpiderWin[] => {
    const all = [...wins, win];
    return all.filter(kept => rankOf(all, kept) !== null);
};

export const isSpiderWin = (value: unknown): value is SpiderWin => {
    const win = value as Partial<SpiderWin> | null;
    return typeof win === "object" && win !== null
        && Number.isInteger(win.cardCount) && Number.isInteger(win.suitCount)
        && Number.isInteger(win.moveCount) && typeof win.wonAt === "number" && Number.isFinite(win.wonAt);
};
