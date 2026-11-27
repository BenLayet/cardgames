import {type Ref, useEffect, useImperativeHandle, useRef} from "react";

// A burst of sparks, to celebrate: gold, and the colour of a player
export type Burst = {
    // where the sparks come from, in pixels from the top left corner of the canvas
    x: number,
    y: number,
    // a CSS colour, or the name of a CSS custom property such as --app-seat-0
    color: string,
    count: number,
    // how fast the sparks go, in pixels per frame at most: they reach about 30 times as far
    speed: number,
};
export type SparksHandle = { burst: (burst: Burst) => void };

type Particle = { x: number, y: number, vx: number, vy: number, life: number, decay: number, color: string, size: number };

const GOLD = "--app-gold";
// part of the sparks drawn in gold, the others in the colour of the burst
const GOLD_PART = 0.6;
const GRAVITY = 0.09;
const DRAG = 0.02;

const resolveColor = (element: HTMLElement, color: string) =>
    color.startsWith("--") ? getComputedStyle(element).getPropertyValue(color).trim() || "#f2d48a" : color;

const newParticles = ({x, y, count, speed}: Burst, gold: string, colour: string): Particle[] =>
    Array.from({length: count}, () => {
        const angle = Math.random() * Math.PI * 2;
        const velocity = speed * (0.3 + Math.random() * 0.7);
        return {
            x, y,
            vx: Math.cos(angle) * velocity,
            vy: Math.sin(angle) * velocity - speed * 0.3,
            life: 1,
            decay: 0.012 + Math.random() * 0.018,
            color: Math.random() < GOLD_PART ? gold : colour,
            size: speed * (0.45 + Math.random() * 0.55),
        };
    });

// A canvas over its positioned parent, that draws the sparks of each burst until they fade; touches go through it.
// Nothing is drawn when the player asks for reduced motion.
export const Sparks = ({ref, className}: { ref?: Ref<SparksHandle>, className?: string }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const particles = useRef<Particle[]>([]);
    const frame = useRef<number | null>(null);

    const draw = () => {
        const canvas = canvasRef.current;
        const context = canvas?.getContext("2d");
        if (!canvas || !context) {
            frame.current = null;
            return;
        }
        const ratio = window.devicePixelRatio || 1;
        const width = canvas.clientWidth, height = canvas.clientHeight;
        if (canvas.width !== Math.round(width * ratio) || canvas.height !== Math.round(height * ratio)) {
            canvas.width = Math.round(width * ratio);
            canvas.height = Math.round(height * ratio);
        }
        context.setTransform(ratio, 0, 0, ratio, 0, 0);
        context.clearRect(0, 0, width, height);
        particles.current = particles.current.filter(p => p.life > 0);
        for (const p of particles.current) {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += GRAVITY;
            p.vx *= 1 - DRAG;
            p.life -= p.decay;
            context.globalAlpha = Math.max(p.life, 0);
            context.fillStyle = p.color;
            context.beginPath();
            context.arc(p.x, p.y, p.size * (0.5 + p.life / 2), 0, Math.PI * 2);
            context.fill();
        }
        context.globalAlpha = 1;
        frame.current = particles.current.length > 0 ? requestAnimationFrame(draw) : null;
    };

    useImperativeHandle(ref, () => ({
        burst: (burst: Burst) => {
            const canvas = canvasRef.current;
            if (!canvas || typeof requestAnimationFrame !== "function") return;
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
            particles.current.push(...newParticles(burst, resolveColor(canvas, GOLD), resolveColor(canvas, burst.color)));
            frame.current ??= requestAnimationFrame(draw);
        },
    }));
    useEffect(() => () => {
        if (frame.current !== null) cancelAnimationFrame(frame.current);
    }, []);

    return <canvas ref={canvasRef} className={className} aria-hidden="true"
                   style={{position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none"}}/>;
};
