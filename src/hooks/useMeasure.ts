import {type RefObject, useLayoutEffect, useState} from "react";

/**
 * Measures the rendered elements once they are in the page, then again whenever the window
 * or one of the observed elements is resized. Returns null until the first measure.
 * The measure function and the observed elements are only read once, when the component is mounted.
 */
export function useMeasure<T>(measure: () => T, observed: RefObject<Element | null>[]): T | null {
    const [measured, setMeasured] = useState<T | null>(null);
    useLayoutEffect(() => {
        const update = () => {
            setMeasured(measure());
        };
        update();
        const observer = new ResizeObserver(update);
        observed.forEach(ref => {
            if (ref.current) observer.observe(ref.current);
        });
        window.addEventListener("resize", update);
        return () => {
            observer.disconnect();
            window.removeEventListener("resize", update);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps -- only measured from the mounted elements
    }, []);
    return measured;
}
