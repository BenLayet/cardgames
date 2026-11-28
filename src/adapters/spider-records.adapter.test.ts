import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";

import {decodeRecords, encodeRecords, LocalStorageSpiderRecordsAdapter} from "./spider-records.adapter.ts";
import type {SpiderWin} from "../model/spider-records.model.ts";

const wins: SpiderWin[] = [
    {cardCount: 104, suitCount: 1, moveCount: 142, elapsedMs: 545_000, wonAt: 1_764_000_000_000},
    {cardCount: 26, suitCount: 2, moveCount: 58, elapsedMs: null, wonAt: 1_764_100_000_000},
];

describe("spider records storage", () => {
    let stored: Map<string, string>;
    let isAvailable: boolean;
    beforeEach(() => {
        stored = new Map();
        isAvailable = true;
        const available = () => {
            if (!isAvailable) throw new Error("no storage");
        };
        vi.stubGlobal("localStorage", {
            getItem: (key: string) => {
                available();
                return stored.get(key) ?? null;
            },
            setItem: (key: string, value: string) => {
                available();
                stored.set(key, value);
            },
            removeItem: (key: string) => stored.delete(key),
        });
    });
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("reads back the stored wins", () => {
        const adapter = new LocalStorageSpiderRecordsAdapter();
        adapter.save(wins);

        expect(new LocalStorageSpiderRecordsAdapter().load()).toEqual(wins);
    });

    it("forgets everything once the records are cleared", () => {
        const adapter = new LocalStorageSpiderRecordsAdapter();
        adapter.save(wins);
        adapter.save([]);

        expect(stored.size).toBe(0);
        expect(adapter.load()).toEqual([]);
    });

    it("leaves out what cannot be read, and ignores records of a newer version", () => {
        expect(decodeRecords("not json")).toEqual([]);
        expect(decodeRecords(JSON.stringify({format: 99, wins}))).toEqual([]);
        expect(decodeRecords(JSON.stringify({format: 2, wins: [wins[0], {moveCount: "12"}]}))).toEqual([wins[0]]);
        expect(decodeRecords(encodeRecords(wins))).toEqual(wins);
    });

    it("reads the wins kept before the time was measured, their time unknown", () => {
        const {cardCount, suitCount, moveCount, wonAt} = wins[0];
        expect(decodeRecords(JSON.stringify({format: 1, wins: [{cardCount, suitCount, moveCount, wonAt}]})))
            .toEqual([{...wins[0], elapsedMs: null}]);
    });

    it("does not fail without storage", () => {
        isAvailable = false;
        const adapter = new LocalStorageSpiderRecordsAdapter();

        expect(() => adapter.save(wins)).not.toThrow();
        expect(adapter.load()).toEqual([]);
    });
});
