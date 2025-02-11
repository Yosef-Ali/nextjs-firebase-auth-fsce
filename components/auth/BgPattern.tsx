const BgPattern = () => (
    <svg
        width="100%"
        height="100%"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
    >
        <defs>
            <pattern id="circles" x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse">
                <circle cx="25" cy="25" r="15" fill="none" stroke="hsl(var(--primary))" strokeWidth="0.5" opacity="0.3" />
                <circle cx="25" cy="25" r="10" fill="none" stroke="hsl(var(--primary))" strokeWidth="0.5" opacity="0.5" />
            </pattern>
            <pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1" fill="hsl(var(--primary))" opacity="0.2" />
            </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dots)" />
        <rect width="100%" height="100%" fill="url(#circles)" />
    </svg>
)

export default BgPattern;