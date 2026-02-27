import type {
    ExtractComponentValuesContract,
    Selectors,
} from "@softer-components/types";
import {createBaseSelectors} from "@softer-components/utils";

import {type State, initialState, type PlayerState} from "./game.component.state.ts";
import {isFirstCardHigherValue} from "../../../../model/deck.model.ts";
import {flow} from "lodash";


const player1 = (state: State) => state.player1;
const player2 = (state: State) => state.player2;
const remainingCards = (player: PlayerState) => player.remainingCards;
const beingPlayedCard = (player: PlayerState) => player.beingPlayedCard;
const wonCards = (player: PlayerState) => player.wonCards;
const cardRevealed = (player: PlayerState) => player.cardRevealed;


const player1Cards = flow(player1, remainingCards);
const player2Cards = flow(player2, remainingCards);

const player1BeingPlayedCard = flow(player1, beingPlayedCard);
const player2BeingPlayedCard = flow(player2, beingPlayedCard);

const hasPlayer1WonRound = (state: State) =>
    isFirstCardHigherValue(player1BeingPlayedCard(state), player2BeingPlayedCard(state));
const hasPlayer2WonRound = (state: State) =>
    isFirstCardHigherValue(player2BeingPlayedCard(state), player1BeingPlayedCard(state));

const player1WonCards = flow(player1, wonCards);
const player2WonCards = flow(player2, wonCards);
const player1CardRevealed = flow(player1, cardRevealed);
const player2CardRevealed = flow(player2, cardRevealed);

export const selectors = {
    ...createBaseSelectors(initialState),
    player1Cards,
    player2Cards,
    player1BeingPlayedCard,
    player2BeingPlayedCard,
    hasPlayer1WonRound,
    hasPlayer2WonRound,
    player1WonCards,
    player2WonCards,
    player1CardRevealed,
    player2CardRevealed,
} satisfies Selectors<State>;
export type Values = ExtractComponentValuesContract<typeof selectors>;
