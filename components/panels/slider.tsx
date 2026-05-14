"use client";

import { useId } from "react";

type SliderProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (next: number) => void;
  formatValue?: (v: number) => string;
};

export function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  formatValue,
}: SliderProps) {
  const id = useId();
  const display = formatValue ? formatValue(value) : String(value);
  const fraction = Math.max(0, Math.min(1, (value - min) / (max - min)));

  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between text-xs">
        <label htmlFor={id} className="text-foreground/70">
          {label}
        </label>
        <span className="font-semibold tabular-nums text-foreground">
          {display}
        </span>
      </div>
      <div className="relative">
        <div className="h-1 rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-accent"
            style={{ width: `${fraction * 100}%` }}
          />
        </div>
        <input
          id={id}
          type="range"
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 h-1 w-full cursor-pointer appearance-none bg-transparent [&::-moz-range-thumb]:h-3.5 [&::-moz-range-thumb]:w-3.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:shadow-[0_0_12px_rgba(34,211,238,0.6)] [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-[0_0_12px_rgba(34,211,238,0.6)]"
        />
      </div>
    </div>
  );
}
