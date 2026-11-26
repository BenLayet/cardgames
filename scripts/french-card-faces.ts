// Writes the French faces of the jacks, queens and kings to src/assets/cards/fr/:
// the same pictures, with V (valet), D (dame) and R (roi) in the corners instead of J, Q and K.
//   node scripts/french-card-faces.ts
import {mkdirSync, readFileSync, writeFileSync} from "node:fs";

const CARDS = new URL("../src/assets/cards/", import.meta.url);
const OUTPUT = new URL("fr/", CARDS);

// the letters are drawn like the English ones: strokes in a box from -500 to 500, with serifs
const FRENCH_LETTERS: Record<string, string> = {
    J: "M-320 -460L-120 -460M120 -460L320 -460M-220 -440L0 460L220 -440",
    Q: "M-285 -460L40 -460A245 460 0 0 1 40 460L-285 460M-185 -460L-185 460",
    K: "M-285 460L-85 460M-185 460L-185 -460L60 -460A215 230 0 0 1 60 0L-185 0M20 0L230 440M130 460L330 460",
};

mkdirSync(OUTPUT, {recursive: true});
for (const [rank, letter] of Object.entries(FRENCH_LETTERS)) {
    for (const suit of ["S", "H", "D", "C"]) {
        const svg = readFileSync(new URL(`${rank}${suit}.svg`, CARDS), "utf8");
        const symbol = new RegExp(`(<symbol id="V${suit}${rank}"[^>]*><path d=")[^"]*"`);
        if (!symbol.test(svg)) throw new Error(`No rank letter found in ${rank}${suit}.svg`);
        writeFileSync(new URL(`${rank}${suit}.svg`, OUTPUT), svg.replace(symbol, `$1${letter}"`));
    }
}
