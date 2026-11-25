// Stored data as read back from the browser, before it is checked
export type StoredObject = Record<string, unknown>;

// Turns stored data of one version into the next version
export type Migration = (data: StoredObject) => StoredObject;

// Brings stored data of the given version up to the current one, applying each migration in turn;
// migrations[n] turns version n into version n + 1, so the current version is migrations.length.
// Returns null for data written by a newer version of the application, which cannot be read.
export const migrate = (data: StoredObject, version: number, migrations: readonly (Migration | undefined)[]): StoredObject | null => {
    if (!Number.isInteger(version) || version < 0 || version > migrations.length) return null;
    return migrations.slice(version).reduce<StoredObject>((migrated, migration) => {
        if (migration === undefined) throw new Error(`No migration from version ${version}`);
        return migration(migrated);
    }, data);
};

export const isStoredObject = (value: unknown): value is StoredObject =>
    typeof value === "object" && value !== null && !Array.isArray(value);
