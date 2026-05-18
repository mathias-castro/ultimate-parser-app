// Unique brand mark: a stylized parse tree (root branching into leaves),
// representing syntactic derivation.
export default function Logo({ size = 30 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M16 8 L8 18 M16 8 L24 18 M16 8 L16 17"
        stroke="#ffffff"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.85"
      />
      <circle cx="16" cy="6" r="4" fill="#ffffff" />
      <circle cx="8" cy="21" r="3.4" fill="#c7d2fe" />
      <circle cx="16" cy="20" r="3.4" fill="#a5b4fc" />
      <circle cx="24" cy="21" r="3.4" fill="#c7d2fe" />
    </svg>
  );
}
