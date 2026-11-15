// Composes two functions from left to right: pipe(f, g)(x) === g(f(x))
export const pipe = <A, B, C>(f: (a: A) => B, g: (b: B) => C) => (a: A): C => g(f(a));
