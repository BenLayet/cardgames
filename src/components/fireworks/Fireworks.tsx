export const Fireworks = () => {
    return (
        <svg
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 9999
            }}
            xmlns="http://www.w3.org/2000/svg"
        >
            <defs>
                {/* Firework explosion animation */}
                <radialGradient id="firework-gradient-1">
                    <stop offset="0%" stopColor="#ff0000" stopOpacity="1" />
                    <stop offset="100%" stopColor="#ff0000" stopOpacity="0" />
                </radialGradient>
                <radialGradient id="firework-gradient-2">
                    <stop offset="0%" stopColor="#00ff00" stopOpacity="1" />
                    <stop offset="100%" stopColor="#00ff00" stopOpacity="0" />
                </radialGradient>
                <radialGradient id="firework-gradient-3">
                    <stop offset="0%" stopColor="#0080ff" stopOpacity="1" />
                    <stop offset="100%" stopColor="#0080ff" stopOpacity="0" />
                </radialGradient>
                <radialGradient id="firework-gradient-4">
                    <stop offset="0%" stopColor="#ffff00" stopOpacity="1" />
                    <stop offset="100%" stopColor="#ffff00" stopOpacity="0" />
                </radialGradient>
                <radialGradient id="firework-gradient-5">
                    <stop offset="0%" stopColor="#ff00ff" stopOpacity="1" />
                    <stop offset="100%" stopColor="#ff00ff" stopOpacity="0" />
                </radialGradient>
            </defs>

            {/* Firework 1 - Top Left */}
            <g className="firework" style={{ transformOrigin: '20% 30%' }}>
                {[...Array(20)].map((_, i) => (
                    <line
                        key={i}
                        x1="20%"
                        y1="30%"
                        x2="20%"
                        y2="30%"
                        stroke="url(#firework-gradient-1)"
                        strokeWidth="4"
                        strokeLinecap="round"
                        style={{
                            transform: `rotate(${i * 18}deg)`,
                            transformOrigin: '20% 30%',
                        }}
                    >
                        <animate
                            attributeName="x2"
                            from="20%"
                            to="20%"
                            dur="1.5s"
                            repeatCount="indefinite"
                            values="20%;30%;20%"
                            keyTimes="0;0.5;1"
                        />
                        <animate
                            attributeName="y2"
                            from="30%"
                            to="25%"
                            dur="1.5s"
                            repeatCount="indefinite"
                            values="30%;15%;30%"
                            keyTimes="0;0.5;1"
                        />
                        <animate
                            attributeName="opacity"
                            from="0"
                            to="0"
                            dur="1.5s"
                            repeatCount="indefinite"
                            values="0;1;0"
                            keyTimes="0;0.5;1"
                        />
                    </line>
                ))}
            </g>

            {/* Firework 2 - Top Right */}
            <g className="firework" style={{ transformOrigin: '80% 25%' }}>
                {[...Array(20)].map((_, i) => (
                    <line
                        key={i}
                        x1="80%"
                        y1="25%"
                        x2="80%"
                        y2="25%"
                        stroke="url(#firework-gradient-2)"
                        strokeWidth="4"
                        strokeLinecap="round"
                        style={{
                            transform: `rotate(${i * 18}deg)`,
                            transformOrigin: '80% 25%',
                        }}
                    >
                        <animate
                            attributeName="x2"
                            from="80%"
                            to="90%"
                            dur="2s"
                            repeatCount="indefinite"
                            values="80%;90%;80%"
                            keyTimes="0;0.5;1"
                            begin="0.3s"
                        />
                        <animate
                            attributeName="y2"
                            from="25%"
                            to="10%"
                            dur="2s"
                            repeatCount="indefinite"
                            values="25%;10%;25%"
                            keyTimes="0;0.5;1"
                            begin="0.3s"
                        />
                        <animate
                            attributeName="opacity"
                            from="0"
                            to="0"
                            dur="2s"
                            repeatCount="indefinite"
                            values="0;1;0"
                            keyTimes="0;0.5;1"
                            begin="0.3s"
                        />
                    </line>
                ))}
            </g>

            {/* Firework 3 - Center */}
            <g className="firework" style={{ transformOrigin: '50% 40%' }}>
                {[...Array(24)].map((_, i) => (
                    <line
                        key={i}
                        x1="50%"
                        y1="40%"
                        x2="50%"
                        y2="40%"
                        stroke="url(#firework-gradient-3)"
                        strokeWidth="5"
                        strokeLinecap="round"
                        style={{
                            transform: `rotate(${i * 15}deg)`,
                            transformOrigin: '50% 40%',
                        }}
                    >
                        <animate
                            attributeName="x2"
                            from="50%"
                            to="65%"
                            dur="1.8s"
                            repeatCount="indefinite"
                            values="50%;65%;50%"
                            keyTimes="0;0.5;1"
                            begin="0.6s"
                        />
                        <animate
                            attributeName="y2"
                            from="40%"
                            to="20%"
                            dur="1.8s"
                            repeatCount="indefinite"
                            values="40%;20%;40%"
                            keyTimes="0;0.5;1"
                            begin="0.6s"
                        />
                        <animate
                            attributeName="opacity"
                            from="0"
                            to="0"
                            dur="1.8s"
                            repeatCount="indefinite"
                            values="0;1;0"
                            keyTimes="0;0.5;1"
                            begin="0.6s"
                        />
                    </line>
                ))}
            </g>

            {/* Firework 4 - Bottom Left */}
            <g className="firework" style={{ transformOrigin: '30% 70%' }}>
                {[...Array(18)].map((_, i) => (
                    <line
                        key={i}
                        x1="30%"
                        y1="70%"
                        x2="30%"
                        y2="70%"
                        stroke="url(#firework-gradient-4)"
                        strokeWidth="4"
                        strokeLinecap="round"
                        style={{
                            transform: `rotate(${i * 20}deg)`,
                            transformOrigin: '30% 70%',
                        }}
                    >
                        <animate
                            attributeName="x2"
                            from="30%"
                            to="40%"
                            dur="1.6s"
                            repeatCount="indefinite"
                            values="30%;40%;30%"
                            keyTimes="0;0.5;1"
                            begin="0.9s"
                        />
                        <animate
                            attributeName="y2"
                            from="70%"
                            to="55%"
                            dur="1.6s"
                            repeatCount="indefinite"
                            values="70%;55%;70%"
                            keyTimes="0;0.5;1"
                            begin="0.9s"
                        />
                        <animate
                            attributeName="opacity"
                            from="0"
                            to="0"
                            dur="1.6s"
                            repeatCount="indefinite"
                            values="0;1;0"
                            keyTimes="0;0.5;1"
                            begin="0.9s"
                        />
                    </line>
                ))}
            </g>

            {/* Firework 5 - Bottom Right */}
            <g className="firework" style={{ transformOrigin: '75% 65%' }}>
                {[...Array(22)].map((_, i) => (
                    <line
                        key={i}
                        x1="75%"
                        y1="65%"
                        x2="75%"
                        y2="65%"
                        stroke="url(#firework-gradient-5)"
                        strokeWidth="4"
                        strokeLinecap="round"
                        style={{
                            transform: `rotate(${i * 16.4}deg)`,
                            transformOrigin: '75% 65%',
                        }}
                    >
                        <animate
                            attributeName="x2"
                            from="75%"
                            to="87%"
                            dur="1.7s"
                            repeatCount="indefinite"
                            values="75%;87%;75%"
                            keyTimes="0;0.5;1"
                            begin="1.2s"
                        />
                        <animate
                            attributeName="y2"
                            from="65%"
                            to="48%"
                            dur="1.7s"
                            repeatCount="indefinite"
                            values="65%;48%;65%"
                            keyTimes="0;0.5;1"
                            begin="1.2s"
                        />
                        <animate
                            attributeName="opacity"
                            from="0"
                            to="0"
                            dur="1.7s"
                            repeatCount="indefinite"
                            values="0;1;0"
                            keyTimes="0;0.5;1"
                            begin="1.2s"
                        />
                    </line>
                ))}
            </g>

            {/* Sparks/particles */}
            {[...Array(50)].map((_, i) => (
                <circle
                    key={`spark-${i}`}
                    cx={`${10 + (i * 3) % 80}%`}
                    cy={`${20 + (i * 5) % 60}%`}
                    r="3"
                    fill={['#ff0000', '#00ff00', '#0080ff', '#ffff00', '#ff00ff'][i % 5]}
                    opacity="0"
                >
                    <animate
                        attributeName="opacity"
                        values="0;1;0"
                        dur={`${1.2 + (i % 5) * 0.2}s`}
                        repeatCount="indefinite"
                        begin={`${(i % 10) * 0.15}s`}
                    />
                    <animate
                        attributeName="r"
                        values="2;5;2"
                        dur={`${1.2 + (i % 5) * 0.2}s`}
                        repeatCount="indefinite"
                        begin={`${(i % 10) * 0.15}s`}
                    />
                </circle>
            ))}
        </svg>
    );
};

