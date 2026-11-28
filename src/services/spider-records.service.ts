import type {SpiderWin} from "../model/spider-records.model.ts";

// Keeps the won Spider games, to rank each new one among the best of its kind
export interface SpiderRecordsService {
    // none when nothing was kept, or the storage cannot be read
    load(): SpiderWin[];
    save(wins: SpiderWin[]): void;
}
