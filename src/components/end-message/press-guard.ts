// The tap that ends a game shows the end message under the finger: on a phone, the click that follows that tap
// lands on the message. Only a click whose press started on the message counts.
export const pressGuard = () => {
    let pressedHere = false;
    return {
        pressed: () => {
            pressedHere = true;
        },
        // whether the click comes from a press on the message
        clicked: (): boolean => {
            const counts = pressedHere;
            pressedHere = false;
            return counts;
        },
    };
};
