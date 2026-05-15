"use client";

import { useId, useState } from "react";

type ImpactSliderProps = {
  label: string;
  description?: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (next: number) => void;
  prefix?: string;
  suffix?: string;
  formatRange: (v: number) => string;
};

export function ImpactSlider({
  label,
  description,
  value,
  min,
  max,
  step,
  onChange,
  prefix = "",
  suffix = "",
  formatRange,
}: ImpactSliderProps) {
  const sliderId = useId();
  const inputId = `${sliderId}-num`;
  const [raw, setRaw] = useState(() => value.toLocaleString("en-US"));
  const [focused, setFocused] = useState(false);
  const [syncedValue, setSyncedValue] = useState(value);

  // Re-sync the text input when the slider drives the value (render-time
  // adjustment — see React docs "adjusting state when a prop changes").
  if (value !== syncedValue) {
    setSyncedValue(value);
    if (!focused) setRaw(value.toLocaleString("en-US"));
  }

  function commit() {
    const parsed = Number(raw.replace(/[,\s]/g, ""));
    if (!Number.isFinite(parsed)) {
      setRaw(value.toLocaleString("en-US"));
      return;
    }
    const clamped = Math.max(min, Math.min(max, parsed));
    const snapped = Math.round((clamped - min) / step) * step + min;
    onChange(snapped);
    setRaw(snapped.toLocaleString("en-US"));
  }

  const fraction = Math.max(0, Math.min(1, (value - min) / (max - min)));

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-3">
        <label
          htmlFor={sliderId}
          className="text-xs font-medium text-foreground/75"
        >
          {label}
        </label>
        <div className="flex items-center gap-1 text-sm">
          {prefix && (
            <span className="text-foreground/50" aria-hidden="true">
              {prefix}
            </span>
          )}
          <input
            id={inputId}
            type="text"
            inputMode="numeric"
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            onFocus={(e) => {
              setFocused(true);
              e.target.select();
            }}
            onBlur={() => {
              setFocused(false);
              commit();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") (e.target as HTMLInputElement).blur();
              if (e.key === "Escape") {
                setRaw(value.toLocaleString("en-US"));
                (e.target as HTMLInputElement).blur();
              }
            }}
            aria-label={`${label} value`}
            className="w-28 rounded-md border border-foreground/10 bg-foreground/[0.04] px-2 py-1 text-right font-semibold tabular-nums text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          />
          {suffix && (
            <span className="text-foreground/50" aria-hidden="true">
              {suffix}
            </span>
          )}
        </div>
      </div>
      <div className="relative">
        <div className="h-1 rounded-full bg-foreground/10">
          <div
            className="h-full rounded-full bg-accent"
            style={{ width: `${fraction * 100}%` }}
          />
        </div>
        <input
          id={sliderId}
          type="range"
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={(e) => onChange(Number(e.target.value))}
          aria-label={label}
          className="absolute inset-0 h-1 w-full cursor-pointer appearance-none bg-transparent [&::-moz-range-thumb]:h-3.5 [&::-moz-range-thumb]:w-3.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:shadow-[0_0_12px_rgba(34,211,238,0.6)] [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-[0_0_12px_rgba(34,211,238,0.6)]"
        />
      </div>
      <div className="flex items-center justify-between text-[10px] font-medium tabular-nums text-foreground/40">
        <span>{formatRange(min)}</span>
        {description && (
          <span className="text-foreground/55">{description}</span>
        )}
        <span>{formatRange(max)}</span>
      </div>
    </div>
  );
}
