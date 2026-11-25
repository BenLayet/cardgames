import {describe, expect, it} from "vitest";

import {migrate, type Migration} from "./migrations.ts";

const addOne = (field: string): Migration => data => ({...data, [field]: 1});
const MIGRATIONS = [addOne("a"), addOne("b"), addOne("c")];

describe("stored data migrations", () => {
    it("applies every migration from the version of the data", () => {
        expect(migrate({}, 0, MIGRATIONS)).toEqual({a: 1, b: 1, c: 1});
        expect(migrate({}, 2, MIGRATIONS)).toEqual({c: 1});
    });

    it("leaves data of the current version as it is", () => {
        expect(migrate({x: 2}, 3, MIGRATIONS)).toEqual({x: 2});
    });

    it.each([4, -1, 1.5])("cannot read data of version %d", version => {
        expect(migrate({}, version, MIGRATIONS)).toBeNull();
    });

    it("fails on a version that has no migration", () => {
        expect(() => migrate({}, 0, [undefined, addOne("b")])).toThrow();
    });
});
