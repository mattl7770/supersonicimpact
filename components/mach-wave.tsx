type MachWaveProps = {
  className?: string;
};

export function MachWave({ className }: MachWaveProps) {
  return (
    <svg
      viewBox="0 0 200 100"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M10 50 Q 60 10 110 50" opacity="0.7" />
      <path d="M30 50 Q 75 25 120 50" opacity="0.5" />
      <path d="M50 50 Q 90 35 130 50" opacity="0.3" />
      <circle
        cx="135"
        cy="50"
        r="3"
        fill="currentColor"
        opacity="0.9"
        stroke="none"
      />
    </svg>
  );
}
