import React from "react";

type IconProps = { size?: number; color?: string; stroke?: number };

const base = (size: number, color: string, stroke: number, children: React.ReactNode) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    {children}
  </svg>
);

export function AncIcon({ size = 28, color = "currentColor", stroke = 1.6 }: IconProps) {
  return base(size, color, stroke, (
    <>
      <path d="M4.5 10.5v3a7.5 7.5 0 0 0 15 0v-3" />
      <path d="M9 10.2V8.6a3 3 0 0 1 6 0v1.6" />
      <path d="M9 14.2v1.2a3 3 0 0 0 6 0v-1.2" />
      <path d="M3 12h2.2M18.8 12H21" />
    </>
  ));
}

export function TransparencyIcon({ size = 28, color = "currentColor", stroke = 1.6 }: IconProps) {
  return base(size, color, stroke, (
    <>
      <path d="M8 12a4 4 0 0 1 8 0c0 3.2-2.2 4.6-2.8 7.2-.2.8-.9 1.3-1.7 1.3h.9c-.8 0-1.5-.5-1.7-1.3C9.2 16.6 8 15.2 8 12Z" />
      <path d="M10.2 10.4c.5-1.4 1.6-2.1 2.8-2.1" />
      <path d="M4 10.5c2-2.8 5-4.2 8-4.2s6 1.4 8 4.2" />
    </>
  ));
}

export function AdaptiveIcon({ size = 28, color = "currentColor", stroke = 1.6 }: IconProps) {
  return base(size, color, stroke, (
    <>
      <path d="M3 12h2" />
      <path d="M7 8v8" />
      <path d="M11 5v14" />
      <path d="M15 8v8" />
      <path d="M19 12h2" />
    </>
  ));
}

export function SpatialIcon({ size = 28, color = "currentColor", stroke = 1.6 }: IconProps) {
  return base(size, color, stroke, (
    <>
      <circle cx="12" cy="12" r="2.2" />
      <path d="M7.2 7.2a6.8 6.8 0 0 0 0 9.6" />
      <path d="M16.8 7.2a6.8 6.8 0 0 1 0 9.6" />
      <path d="M4.4 4.6a11 11 0 0 0 0 14.8" />
      <path d="M19.6 4.6a11 11 0 0 1 0 14.8" />
    </>
  ));
}

export function ChipIcon({ size = 28, color = "currentColor", stroke = 1.6 }: IconProps) {
  return base(size, color, stroke, (
    <>
      <rect x="7" y="7" width="10" height="10" rx="1.6" />
      <path d="M10.2 10.2h3.6v3.6h-3.6z" />
      <path d="M9 4.5v2.5M12 4.5v2.5M15 4.5v2.5" />
      <path d="M9 17v2.5M12 17v2.5M15 17v2.5" />
      <path d="M4.5 9h2.5M4.5 12h2.5M4.5 15h2.5" />
      <path d="M17 9h2.5M17 12h2.5M17 15h2.5" />
    </>
  ));
}

export function BatteryIcon({ size = 28, color = "currentColor", stroke = 1.6 }: IconProps) {
  return base(size, color, stroke, (
    <>
      <rect x="2.8" y="7.2" width="16.4" height="9.6" rx="2" />
      <path d="M19.2 10.2h1.4a.8.8 0 0 1 .8.8v2a.8.8 0 0 1-.8.8h-1.4" />
      <rect x="5" y="9.4" width="9.2" height="5.2" rx="0.8" fill={color} stroke="none" />
    </>
  ));
}

export function MagSafeIcon({ size = 28, color = "currentColor", stroke = 1.6 }: IconProps) {
  return base(size, color, stroke, (
    <>
      <circle cx="12" cy="12" r="2" />
      <circle cx="12" cy="12" r="5.2" />
      <circle cx="12" cy="12" r="8.4" />
      <path d="M12 2.4v1.6M12 20v1.6M2.4 12h1.6M20 12h1.6" />
    </>
  ));
}

export function WaterIcon({ size = 28, color = "currentColor", stroke = 1.6 }: IconProps) {
  return base(size, color, stroke, (
    <>
      <path d="M12 3.2c2.6 3.4 6.6 7.2 6.6 11a6.6 6.6 0 1 1-13.2 0c0-3.8 4-7.6 6.6-11Z" />
      <path d="M9.4 14.4a3.4 3.4 0 0 0 2.4 2.5" />
    </>
  ));
}

export function ConversationIcon({ size = 28, color = "currentColor", stroke = 1.6 }: IconProps) {
  return base(size, color, stroke, (
    <>
      <path d="M4.2 6.4h10.2a1.8 1.8 0 0 1 1.8 1.8v5.2a1.8 1.8 0 0 1-1.8 1.8H8.6L4.2 18.6V6.4Z" />
      <path d="M16.4 9.2h3.4A1.6 1.6 0 0 1 21.4 10.8v4.6a1.6 1.6 0 0 1-1.6 1.6h-3.2L19.4 19.4" />
    </>
  ));
}

export function TouchIcon({ size = 28, color = "currentColor", stroke = 1.6 }: IconProps) {
  return base(size, color, stroke, (
    <>
      <path d="M9.2 11.2V7.6a2.2 2.2 0 1 1 4.4 0v2.2" />
      <path d="M13.6 9.8V8.8a1.6 1.6 0 1 1 3.2 0v5.4" />
      <path d="M16.8 14.2v-1.4a1.4 1.4 0 0 1 2.8 0v3.6c0 2.6-1.8 4.8-4.6 5.4-2.2.5-4.2.2-5.8-1.1L6.2 17.4a1.5 1.5 0 0 1 2.1-2.1l1.9 1.6V11.2" />
    </>
  ));
}

export function UsbCIcon({ size = 28, color = "currentColor", stroke = 1.6 }: IconProps) {
  return base(size, color, stroke, (
    <>
      <rect x="3.2" y="9.4" width="17.6" height="5.2" rx="2.6" />
      <path d="M7 12h10" />
    </>
  ));
}

export function FindMyIcon({ size = 28, color = "currentColor", stroke = 1.6 }: IconProps) {
  return base(size, color, stroke, (
    <>
      <circle cx="12" cy="12" r="2.1" fill={color} stroke="none" />
      <circle cx="12" cy="12" r="5.4" />
      <circle cx="12" cy="12" r="8.8" />
    </>
  ));
}

export function MicIcon({ size = 28, color = "currentColor", stroke = 1.6 }: IconProps) {
  return base(size, color, stroke, (
    <>
      <rect x="9.2" y="3.4" width="5.6" height="10.2" rx="2.8" />
      <path d="M6.2 11.2a5.8 5.8 0 0 0 11.6 0" />
      <path d="M12 17v3.4M9.2 20.4h5.6" />
    </>
  ));
}

export function CaseIcon({ size = 28, color = "currentColor", stroke = 1.6 }: IconProps) {
  return base(size, color, stroke, (
    <>
      <rect x="6.2" y="3.4" width="11.6" height="17.2" rx="4.2" />
      <path d="M6.2 11.4h11.6" />
      <circle cx="12" cy="8.2" r="0.7" fill={color} stroke="none" />
    </>
  ));
}

export function TruckIcon({ size = 22, color = "currentColor", stroke = 1.7 }: IconProps) {
  return base(size, color, stroke, (
    <>
      <path d="M3 7.2h11.2v8.2H3z" />
      <path d="M14.2 10.2h4.2L20.8 13v2.4h-6.6" />
      <circle cx="6.4" cy="16.6" r="1.5" />
      <circle cx="16.6" cy="16.6" r="1.5" />
    </>
  ));
}

export function ShieldIcon({ size = 22, color = "currentColor", stroke = 1.7 }: IconProps) {
  return base(size, color, stroke, (
    <>
      <path d="M12 3.2 19.4 6v5.6c0 4.4-3 6.8-7.4 8.6-4.4-1.8-7.4-4.2-7.4-8.6V6L12 3.2Z" />
      <path d="M9.2 12.1 11.1 14l3.8-4.2" />
    </>
  ));
}

export function CashIcon({ size = 22, color = "currentColor", stroke = 1.7 }: IconProps) {
  return base(size, color, stroke, (
    <>
      <rect x="2.8" y="6.4" width="18.4" height="11.2" rx="2" />
      <circle cx="12" cy="12" r="2.4" />
      <path d="M5.4 9.2h.8M17.8 14.8h.8" />
    </>
  ));
}

export function AppleLogo({ size = 18, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} aria-hidden>
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  );
}

export function CheckIcon({ size = 16, color = "currentColor", stroke = 2.4 }: IconProps) {
  return base(size, color, stroke, <polyline points="20 6 9 17 4 12" />);
}
