import {isSpiderWin, type SpiderWin} from "../model/spider-records.model.ts";
import type {SpiderRecordsService} from "../services/spider-records.service.ts";
import {isStoredObject, migrate, type Migration} from "./migrations.ts";

const STORAGE_KEY = "cardgames.spider.records";

// Each change of the stored records adds a migration at the end; the format field gives the version
const MIGRATIONS: readonly (Migration | undefined)[] = [
    // there was no version 0
    undefined,
    // 1 → 2: the time played, unknown before
    records => ({
        ...records, format: 2,
        wins: Array.isArray(records.wins) ? (records.wins as unknown[]).map(win => isStoredObject(win) ? {...win, elapsedMs: null} : win) : [],
    }),
];

export const encodeRecords = (wins: SpiderWin[]): string => JSON.stringify({format: MIGRATIONS.length, wins});

// the wins in the text; a win that cannot be read is left out, and records of an unknown shape are ignored
export const decodeRecords = (text: string): SpiderWin[] => {
    try {
        const parsed: unknown = JSON.parse(text);
        if (!isStoredObject(parsed)) return [];
        const records = migrate(parsed, Number(parsed.format), MIGRATIONS);
        return records !== null && Array.isArray(records.wins) ? records.wins.filter(isSpiderWin) : [];
    } catch {
        return [];
    }
};

// Stores the won games in the browser; without storage (private mode, blocked, full...) they are simply not kept
export class LocalStorageSpiderRecordsAdapter implements SpiderRecordsService {
    load = (): SpiderWin[] => {
        try {
            const text = localStorage.getItem(STORAGE_KEY);
            return text === null ? [] : decodeRecords(text);
        } catch {
            return [];
        }
    };

    save = (wins: SpiderWin[]): void => {
        try {
            if (wins.length === 0) localStorage.removeItem(STORAGE_KEY);
            else localStorage.setItem(STORAGE_KEY, encodeRecords(wins));
        } catch {
            // not kept
        }
    };
}
