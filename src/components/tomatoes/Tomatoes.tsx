import type {CSSProperties} from "react";

// Deterministic pseudo-random generator, so the layout is computed once at module load
const seededRandom = (seed: number) => () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
};
const random = seededRandom(42);
const between = (min: number, max: number) => min + random() * (max - min);

const splatPath = () => {
    const points = 16;
    const coordinates = [...Array(points)].map((_, i) => {
        const angle = (i / points) * Math.PI * 2;
        const radius = i % 2 === 0 ? between(36, 48) : between(22, 32);
        return [50 + Math.cos(angle) * radius, 50 + Math.sin(angle) * radius];
    });
    // Smooth closed curve through midpoints
    const mid = (a: number[], b: number[]) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    const start = mid(coordinates[points - 1], coordinates[0]);
    let path = `M${start[0].toFixed(1)},${start[1].toFixed(1)}`;
    coordinates.forEach((point, i) => {
        const next = mid(point, coordinates[(i + 1) % points]);
        path += ` Q${point[0].toFixed(1)},${point[1].toFixed(1)} ${next[0].toFixed(1)},${next[1].toFixed(1)}`;
    });
    return path + " Z";
};

const TOMATOES = [...Array(14)].map((_, i) => ({
    left: between(8, 85),
    top: between(8, 60),
    size: between(70, 130),
    delay: 0.3 + i * 0.35 + between(0, 0.3),
    fromX: between(-40, 40),
    rotation: between(-540, 540),
    splatRotation: between(0, 360),
    path: splatPath(),
    droplets: [...Array(5)].map(() => ({
        angle: between(0, Math.PI * 2),
        distance: between(48, 62),
        radius: between(2.5, 6),
    })),
    drips: [...Array(2)].map(() => ({x: between(35, 65), length: between(15, 40), delay: between(0, 1.5)})),
}));

const Tomato = () => <svg viewBox="0 0 100 100" width="100%" height="100%">
    <circle cx="50" cy="55" r="40" fill="#e0261b"/>
    <ellipse cx="36" cy="40" rx="10" ry="6" fill="#ff7a6b" opacity="0.7" transform="rotate(-30 36 40)"/>
    <path d="M50 18 L42 8 L50 13 L58 6 L54 16 L66 14 L56 22 L64 28 L50 24 L38 30 L44 22 L34 16 Z" fill="#2f8f2f"/>
    <rect x="48" y="4" width="4" height="12" rx="2" fill="#2f6b1f"/>
</svg>;

export const Tomatoes = () => {
    return <div className="tomatoes">
        {TOMATOES.map((tomato, i) =>
            <div key={i} className="tomato-throw" style={{
                left: `${tomato.left}%`,
                top: `${tomato.top}%`,
                width: tomato.size,
                height: tomato.size,
                "--delay": `${tomato.delay}s`,
                "--from-x": `${tomato.fromX}vw`,
                "--rotation": `${tomato.rotation}deg`,
            } as CSSProperties}>
                <div className="tomato-flying"><Tomato/></div>
                <div className="tomato-splat">
                    <svg viewBox="-20 -20 140 180" width="140%" height="180%"
                         style={{transform: `rotate(${tomato.splatRotation}deg)`}}>
                        <path d={tomato.path} fill="#c81d12"/>
                        <path d={tomato.path} fill="#e8402f" transform="translate(50 50) scale(0.6) translate(-50 -50)"/>
                        {tomato.droplets.map((droplet, j) =>
                            <circle key={j} r={droplet.radius} fill="#c81d12"
                                    cx={50 + Math.cos(droplet.angle) * droplet.distance}
                                    cy={50 + Math.sin(droplet.angle) * droplet.distance}/>)}
                        {[...Array(6)].map((_, j) =>
                            <ellipse key={`seed-${j}`} rx="2.5" ry="1.5" fill="#f7d56b"
                                     cx={38 + (j % 3) * 12} cy={42 + Math.floor(j / 3) * 14}
                                     transform={`rotate(${j * 40} ${38 + (j % 3) * 12} ${42 + Math.floor(j / 3) * 14})`}/>)}
                    </svg>
                    {tomato.drips.map((drip, j) =>
                        <div key={j} className="tomato-drip" style={{
                            left: `${drip.x}%`,
                            "--drip-length": `${drip.length}px`,
                            "--drip-delay": `${drip.delay}s`,
                        } as CSSProperties}/>)}
                </div>
            </div>
        )}
    </div>;
};
