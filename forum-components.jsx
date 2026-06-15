/* APIC at Home — shared presentational components + helpers */
const { useState, useEffect, useRef, useMemo } = React;

/* ---------- helpers ---------- */
const NOW = new Date("2026-06-12T10:00:00Z").getTime();
function timeAgo(iso) {
  const t = new Date(iso).getTime();
  const s = Math.max(1, Math.floor((NOW - t) / 1000));
  const u = [["y", 31536000], ["mo", 2592000], ["d", 86400], ["h", 3600], ["m", 60]];
  for (const [label, sec] of u) {
    const v = Math.floor(s / sec);
    if (v >= 1) return v + label;
  }
  return "now";
}
function fmtNum(n) {
  if (n >= 1000) return (n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(/\.0$/, "") + "k";
  return String(n);
}
function initials(name) {
  return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

const ACCENTS = {
  cyan: "#22d3ee",
  blue: "#4f9bff",
  violet: "#a78bfa",
  amber: "#fbbf24",
  green: "#34d399",
};

/* ---------- icons (simple line set) ---------- */
function Icon({ name, size = 18, stroke = 1.6, style }) {
  const paths = {
    beaker: <><path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.8 3h10.4a2 2 0 0 0 1.8-3l-5-9V3" /><path d="M7.5 15h9" /></>,
    chat: <><path d="M21 12a8 8 0 0 1-11.5 7.2L4 21l1.8-5.5A8 8 0 1 1 21 12Z" /></>,
    download: <><path d="M12 4v10m0 0 4-4m-4 4-4-4" /><path d="M5 19h14" /></>,
    wrench: <><path d="M14.5 6.5a3.5 3.5 0 0 0-4.8 4.5L4 16.7 7.3 20l5.7-5.7a3.5 3.5 0 0 0 4.5-4.8l-2.3 2.3-2-2 2.3-2.3Z" /></>,
    branch: <><circle cx="6" cy="6" r="2.4" /><circle cx="6" cy="18" r="2.4" /><circle cx="18" cy="8" r="2.4" /><path d="M6 8.4v7.2M8.4 6H14a3 3 0 0 1 3 3v-1" /></>,
    search: <><circle cx="11" cy="11" r="6.5" /><path d="m20 20-3.5-3.5" /></>,
    check: <><path d="m5 12 4.5 4.5L19 7" /></>,
    pin: <><path d="M12 17v5M8 3h8l-1.5 6 3 3H6.5l3-3L8 3Z" /></>,
    eye: <><path d="M2 12s3.5-6.5 10-6.5S22 12 22 12s-3.5 6.5-10 6.5S2 12 2 12Z" /><circle cx="12" cy="12" r="2.6" /></>,
    reply: <><path d="M9 7 4 12l5 5" /><path d="M4 12h11a5 5 0 0 1 5 5v1" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    fire: <><path d="M12 3c1 3-1.5 4.5-1.5 7A2.5 2.5 0 0 0 13 12c.5-1.5 0-2.5 0-2.5 2 1.5 3 3.5 3 5.5a4 4 0 1 1-8 0c0-2 .8-3.2 1.8-4.4C11 9 12 6 12 3Z" /></>,
    clock: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></>,
    bolt: <><path d="M13 3 5 13h5l-1 8 8-10h-5l1-8Z" /></>,
    bell: <><path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z" /><path d="M10 19a2 2 0 0 0 4 0" /></>,
    book: <><path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 0-3 3V4Z" /><path d="M5 4v16" /></>,
    tag: <><path d="M3 11.5 11.5 3H20v8.5L11.5 20 3 11.5Z" /><circle cx="15.5" cy="8.5" r="1.4" /></>,
    arrowRight: <><path d="M5 12h14m-6-6 6 6-6 6" /></>,
    grid: <><rect x="3.5" y="3.5" width="7" height="7" rx="1.5" /><rect x="13.5" y="3.5" width="7" height="7" rx="1.5" /><rect x="3.5" y="13.5" width="7" height="7" rx="1.5" /><rect x="13.5" y="13.5" width="7" height="7" rx="1.5" /></>,
    list: <><path d="M8 6h12M8 12h12M8 18h12" /><circle cx="4" cy="6" r="1" /><circle cx="4" cy="12" r="1" /><circle cx="4" cy="18" r="1" /></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"
      style={style} aria-hidden="true">
      {paths[name] || null}
    </svg>
  );
}

/* ---------- avatar ---------- */
function Avatar({ user, size = 36 }) {
  return (
    <div title={user.name} style={{
      width: size, height: size, borderRadius: size * 0.3, flex: "0 0 auto",
      display: "grid", placeItems: "center",
      fontFamily: "var(--mono)", fontWeight: 600, fontSize: size * 0.36,
      color: "#05080f",
      background: `linear-gradient(140deg, ${user.color}, ${user.color}bb)`,
      boxShadow: `0 0 0 1px ${user.color}44, 0 2px 8px ${user.color}22`,
      letterSpacing: "-0.02em",
    }}>
      {initials(user.name)}
    </div>
  );
}

/* ---------- tag chip ---------- */
function TagChip({ label, active, onClick }) {
  return (
    <button className="tag-chip" data-active={active ? "1" : "0"} onClick={onClick}>
      <span className="tag-hash">#</span>{label}
    </button>
  );
}

/* ---------- category glyph badge ---------- */
function CatGlyph({ cat, size = 40 }) {
  const c = ACCENTS[cat.accent];
  return (
    <div style={{
      position: "relative", width: size, height: size, flex: "0 0 auto",
      display: "grid", placeItems: "center",
    }}>
      <svg width={size} height={size} viewBox="0 0 40 40" style={{ position: "absolute", inset: 0 }}>
        <polygon points="20,3 34,11 34,29 20,37 6,29 6,11" fill={c + "1a"} stroke={c + "66"} strokeWidth="1.2" />
      </svg>
      <span style={{ color: c, position: "relative", display: "grid", placeItems: "center" }}>
        <Icon name={cat.icon} size={size * 0.46} />
      </span>
    </div>
  );
}

/* ---------- solved badge ---------- */
function SolvedBadge() {
  return (
    <span className="solved-badge">
      <Icon name="check" size={12} stroke={2.4} /> Solved
    </span>
  );
}

Object.assign(window, {
  React, useState, useEffect, useRef, useMemo,
  timeAgo, fmtNum, initials, ACCENTS,
  Icon, Avatar, TagChip, CatGlyph, SolvedBadge,
});
