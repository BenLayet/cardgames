import {SUITS} from "./deck.model.ts";
import {
    collectCompletedSequences,
    dealRow,
    hasCompletedSequence,
    isWon,
    type Move,
    moveCards,
    sequenceCountOf,
    type SpiderCard,
    spiderRank,
    suitOf,
    type Table,
} from "./spider.model.ts";

// A Spider solver that sees every card, the face down ones and the stock too.
// It is used offline to find the deals that can be won (see scripts/find-solvable-spider-deals.ts).
// It does not find a solution for every deal that has one, but every solution it finds is checked with replaySolution.

export type SolutionStep = { kind: "move", move: Move } | { kind: "deal" };
// The search explores up to nodesPerDeal tables between two deals,
// then deals a row from the best tables it reached, keeping at most beamWidth of them
export type SolverBudget = { nodesPerDeal: number, beamWidth: number };
export const DEFAULT_BUDGET: SolverBudget = {nodesPerDeal: 20000, beamWidth: 30};
// findSolution tries a larger budget only when the smaller one found nothing
export const SOLVER_BUDGETS: readonly SolverBudget[] = [
    {nodesPerDeal: 5000, beamWidth: 10},
    DEFAULT_BUDGET,
    {nodesPerDeal: 60000, beamWidth: 60},
];

const RANK_COUNT = 13;
// a card is suit * 13 + rank, the ace is rank 0 and the king rank 12
const rankOf = (card: number) => card % RANK_COUNT;
const suitIndexOf = (card: number) => Math.floor(card / RANK_COUNT);

type State = {
    columns: number[][];
    // the face down cards are the first ones of each column
    faceDown: number[];
    // the last card is dealt first
    stock: number[];
    completed: number;
};
// null deals a row
type StateMove = { column: number, index: number, to: number } | null;
type PathLink = { move: StateMove, previous: PathLink | null };
// a table to explore; to save memory, a table waiting in the queue is kept as the table before its last move
type Node = { value: number, path: PathLink | null } & ({ state: State } | { state: null, before: State });
const stateOf = (node: Node): State => node.state ?? play(node.before, node.path?.move ?? null);

const toState = (table: Table): State => {
    const encode = ({card}: SpiderCard) =>
        SUITS.indexOf(suitOf(card)) * RANK_COUNT + spiderRank(card);
    return {
        columns: table.columns.map(column => column.map(encode)),
        faceDown: table.columns.map(column => column.filter(card => !card.faceUp).length),
        stock: table.stock.map(encode),
        completed: table.completed.length,
    };
};

const copy = (state: State): State => ({
    columns: state.columns.map(column => column.slice()),
    faceDown: state.faceDown.slice(),
    stock: state.stock,
    completed: state.completed,
});

const runStart = (column: number[], faceDown: number) => {
    let start = column.length - 1;
    while (start > faceDown
    && rankOf(column[start - 1]) === rankOf(column[start]) + 1
    && suitIndexOf(column[start - 1]) === suitIndexOf(column[start])) start--;
    return start;
};

// collects a completed sequence and turns the card left on top face up
const settle = (state: State, columnIndex: number) => {
    const column = state.columns[columnIndex];
    if (column.length >= RANK_COUNT
        && column.length - runStart(column, state.faceDown[columnIndex]) >= RANK_COUNT
        && rankOf(column[column.length - RANK_COUNT]) === RANK_COUNT - 1) {
        column.length -= RANK_COUNT;
        state.completed++;
    }
    if (column.length > 0 && state.faceDown[columnIndex] >= column.length) state.faceDown[columnIndex] = column.length - 1;
};

const movesOf = (state: State): StateMove[] => {
    const moves: StateMove[] = [];
    const hasEmptyColumn = state.columns.some(column => column.length === 0);
    state.columns.forEach((column, from) => {
        if (column.length === 0) return;
        const start = runStart(column, state.faceDown[from]);
        for (let index = start; index < column.length; index++) {
            const card = column[index];
            const below = index > 0 && index - 1 >= state.faceDown[from] ? column[index - 1] : undefined;
            const onHigherCard = below !== undefined && rankOf(below) === rankOf(card) + 1;
            const onSameSuit = onHigherCard && suitIndexOf(below) === suitIndexOf(card);
            let emptyColumnTried = false;
            for (let to = 0; to < state.columns.length; to++) {
                if (to === from) continue;
                const target = state.columns[to];
                if (target.length === 0) {
                    // a whole column moved to an empty one changes nothing, and all empty columns are alike
                    if (index === 0 || emptyColumnTried) continue;
                    emptyColumnTried = true;
                    moves.push({column: from, index, to});
                    continue;
                }
                const top = target[target.length - 1];
                if (rankOf(top) !== rankOf(card) + 1) continue;
                // a part of a run only leaves it for an empty column
                if (onSameSuit) continue;
                moves.push({column: from, index, to});
            }
        }
    });
    if (!hasEmptyColumn && state.stock.length > 0) moves.push(null);
    return moves;
};

const play = (state: State, move: StateMove): State => {
    const next = copy(state);
    if (move === null) {
        const row = next.stock.slice(-next.columns.length).reverse();
        next.stock = next.stock.slice(0, -row.length);
        row.forEach((card, i) => {
            next.columns[i].push(card);
            settle(next, i);
        });
    } else {
        next.columns[move.to].push(...next.columns[move.column].splice(move.index));
        settle(next, move.column);
        settle(next, move.to);
    }
    return next;
};

// two numbers of 32 bits mixed into one safe integer; the order of the columns does not matter
const hashOf = (state: State): number => {
    const columnHashes = state.columns.map((column, i) => {
        let hash = 2166136261 ^ state.faceDown[i];
        for (const card of column) hash = Math.imul(hash ^ (card + 1), 16777619);
        return hash >>> 0;
    }).sort((a, b) => a - b);
    let first = state.stock.length;
    let second = 7;
    for (const hash of columnHashes) {
        first = Math.imul(first ^ hash, 16777619) >>> 0;
        second = (Math.imul(second, 31) + hash) >>> 0;
    }
    return first * 2097152 + (second & 2097151);
};

// how promising a table is: completed sequences, cards of the same suit in order, few face down cards
const valueOf = (state: State): number => {
    let value = state.completed * 2000 + state.stock.length * 3;
    state.columns.forEach((column, i) => {
        if (column.length === 0) {
            value += 40;
            return;
        }
        value -= state.faceDown[i] * 30;
        for (let j = state.faceDown[i] + 1; j < column.length; j++) {
            if (rankOf(column[j - 1]) !== rankOf(column[j]) + 1) continue;
            value += suitIndexOf(column[j - 1]) === suitIndexOf(column[j]) ? 20 : 1;
        }
    });
    return value;
};

// a binary heap, the most valuable node first
class Queue {
    private readonly nodes: Node[] = [];

    get size() {
        return this.nodes.length;
    }

    push(node: Node) {
        const nodes = this.nodes;
        nodes.push(node);
        let i = nodes.length - 1;
        while (i > 0) {
            const parent = (i - 1) >> 1;
            if (nodes[parent].value >= node.value) break;
            nodes[i] = nodes[parent];
            nodes[parent] = node;
            i = parent;
        }
    }

    pop(): Node {
        const nodes = this.nodes;
        const top = nodes[0];
        const last = nodes.pop();
        if (last === undefined || nodes.length === 0) return top;
        nodes[0] = last;
        let i = 0;
        for (; ;) {
            const left = 2 * i + 1;
            const right = left + 1;
            let best = i;
            if (left < nodes.length && nodes[left].value > nodes[best].value) best = left;
            if (right < nodes.length && nodes[right].value > nodes[best].value) best = right;
            if (best === i) return top;
            [nodes[i], nodes[best]] = [nodes[best], nodes[i]];
            i = best;
        }
    }
}

const stepsOf = (path: PathLink | null): SolutionStep[] => {
    const moves: StateMove[] = [];
    for (let link = path; link !== null; link = link.previous) moves.push(link.move);
    return moves.reverse().map((move): SolutionStep => move === null
        ? {kind: "deal"}
        : {kind: "move", move: {from: {column: move.column, index: move.index}, to: move.to}});
};

// The moves and deals that win the game from this table, or null when none were found within the budget.
// The search is deterministic: the same table and budget always give the same answer.
export const solveTable = (table: Table, budget: SolverBudget = DEFAULT_BUDGET): SolutionStep[] | null => {
    const sequenceCount = sequenceCountOf(table);
    let frontier: (Node & { state: State })[] = [{state: toState(table), value: 0, path: null}];
    const seen = new Set<number>();
    for (; ;) {
        const queue = new Queue();
        frontier.forEach(node => queue.push({...node, value: valueOf(node.state)}));
        const dealable: (Node & { state: State })[] = [];
        for (let explored = 0; queue.size > 0 && explored < budget.nodesPerDeal; explored++) {
            const popped = queue.pop();
            const node = {value: popped.value, path: popped.path, state: stateOf(popped)};
            if (node.state.completed === sequenceCount) return stepsOf(node.path);
            for (const move of movesOf(node.state)) {
                if (move === null) {
                    dealable.push(node);
                    continue;
                }
                const state = play(node.state, move);
                const hash = hashOf(state);
                if (seen.has(hash)) continue;
                seen.add(hash);
                queue.push({state: null, before: node.state, value: valueOf(state), path: {move, previous: node.path}});
            }
        }
        if (dealable.length === 0) return null;
        frontier = dealable
            .sort((a, b) => b.value - a.value)
            .slice(0, budget.beamWidth)
            .map(node => ({state: play(node.state, null), value: 0, path: {move: null, previous: node.path}}));
    }
};

// Plays the steps with the rules of the game, collecting the completed sequences as the game does: true when they win
export const replaySolution = (table: Table, steps: SolutionStep[]): boolean => {
    try {
        let current = table;
        for (const step of steps) {
            current = step.kind === "deal" ? dealRow(current) : moveCards(current, step.move.from, step.move.to);
            while (hasCompletedSequence(current)) current = collectCompletedSequences(current);
        }
        return isWon(current);
    } catch {
        return false;
    }
};

// A solution checked with the rules of the game, or null
export const findSolution = (table: Table): SolutionStep[] | null => {
    for (const budget of SOLVER_BUDGETS) {
        const solution = solveTable(table, budget);
        if (solution !== null && replaySolution(table, solution)) return solution;
    }
    return null;
};
