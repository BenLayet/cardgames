import {useTranslation} from "react-i18next";

import type {Card, Rank, Suit} from "../../model/deck.model.ts";

// The name of a card as a screen reader says it: "Valet de pique", "Jack of spades"
export const useCardName = () => {
    const {t} = useTranslation();
    return (card: Card) => t("cardNames.card", {
        rank: t(`cardNames.ranks.${card.charAt(0) as Rank}`),
        suit: t(`cardNames.suits.${card.charAt(1) as Suit}`),
    });
};
