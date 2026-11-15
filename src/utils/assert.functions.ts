export function assertIsNotUndefined<T>(value: T | undefined, message = "Unexpected undefined value"): asserts value is T {
    if (value === undefined) throw new Error(message);
}
