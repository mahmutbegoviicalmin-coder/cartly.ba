"use client";

import { useRef } from "react";

/** Hidden field + form clock. Bots fill it; humans never see it. */
export function useOrderProtection() {
  const startedAt = useRef(Date.now());
  const websiteRef = useRef<HTMLInputElement>(null);

  function protectionPayload() {
    return {
      website: websiteRef.current?.value ?? "",
      formStartedAt: startedAt.current,
    };
  }

  const honeypot = (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        left: "-10000px",
        top: "auto",
        width: 1,
        height: 1,
        overflow: "hidden",
      }}
    >
      <label>
        Website
        <input
          ref={websiteRef}
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          defaultValue=""
        />
      </label>
    </div>
  );

  return { honeypot, protectionPayload };
}
