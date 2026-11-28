import type {SpiderVariant} from "./spider.model.ts";

// A won game of Spider, kept to rank it among the other games of its kind
export type SpiderWin = {
    cardCount: number;
    suitCount: number;
    moveCount: number;
    // the time played, null for a game started before the time was measured
    elapsedMs: number | null;
    // when it was won, in milliseconds since 1970; it also tells a win from another
    wonAt: number;
};

// what the games are ranked by
export type RecordMeasure = "moves" | "time";
export const RECORD_MEASURES: readonly RecordMeasure[] = ["moves", "time"];

// how many of the best games of each kind are shown
export const TOP_SIZE = 10;

const isOfVariant = ({cardCount, suitCount}: SpiderVariant) => (win: SpiderWin) =>
    win.cardCount === cardCount && win.suitCount === suitCount;
const sameWin = (a: SpiderWin, b: SpiderWin) => a.wonAt === b.wonAt && isOfVariant(a)(b);
// the better game first; between equal games, the one made first keeps its place
const BY: Record<RecordMeasure, (a: SpiderWin, b: SpiderWin) => number> = {
    moves: (a, b) => a.moveCount - b.moveCount || a.wonAt - b.wonAt,
    time: (a, b) => (a.elapsedMs ?? 0) - (b.elapsedMs ?? 0) || a.wonAt - b.wonAt,
};
// a game without a known time is ranked by its moves only
const isRanked = (measure: RecordMeasure) => (win: SpiderWin) => measure === "moves" || win.elapsedMs !== null;

// the best games of a kind, the best first
export const topWins = (wins: readonly SpiderWin[], variant: SpiderVariant, measure: RecordMeasure = "moves"): SpiderWin[] =>
    wins.filter(isOfVariant(variant)).filter(isRanked(measure)).sort(BY[measure]).slice(0, TOP_SIZE);

// the place of a win among the best games of its kind, from 1, or null when it is not one of them
export const rankOf = (wins: readonly SpiderWin[], win: SpiderWin, measure: RecordMeasure = "moves"): number | null => {
    const index = topWins(wins, win, measure).findIndex(top => sameWin(top, win));
    return index < 0 ? null : index + 1;
};

// a new win is kept only while it is among the best games of its kind, by moves or by time
export const withWin = (wins: readonly SpiderWin[], win: SpiderWin): SpiderWin[] => {
    const all = [...wins, win];
    return all.filter(kept => RECORD_MEASURES.some(measure => rankOf(all, kept, measure) !== null));
};

// a time as minutes and seconds, with hours when there are some: 9:05, 1:02:40
export const formatDuration = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const two = (n: number) => String(n).padStart(2, "0");
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor(seconds / 60) % 60;
    return hours > 0 ? `${hours}:${two(minutes)}:${two(seconds % 60)}` : `${minutes}:${two(seconds % 60)}`;
};

export const isSpiderWin = (value: unknown): value is SpiderWin => {
    const win = value as Partial<SpiderWin> | null;
    return typeof win === "object" && win !== null
        && Number.isInteger(win.cardCount) && Number.isInteger(win.suitCount)
        && Number.isInteger(win.moveCount) && typeof win.wonAt === "number" && Number.isFinite(win.wonAt)
        && (win.elapsedMs === null || (typeof win.elapsedMs === "number" && Number.isFinite(win.elapsedMs) && win.elapsedMs >= 0));
};
