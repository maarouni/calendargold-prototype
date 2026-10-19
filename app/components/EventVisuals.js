import { Glyph } from "./Icons";
// Small presentational pieces shared by the home page: generated posters,
// host avatars, and date/time formatting. Everything is drawn from the
// Every Circle palette in Cesar's Figma, so no stock photos are needed.

import { CATEGORY_GROUPS } from "../lib/taxonomy";

const PERSONAL = new Set(
  CATEGORY_GROUPS.filter((g) => g.group === "Cultural, Ethnic" || g.group === "Diversity").flatMap((g) => g.options)
);

export const PALETTE = ["#ff9500", "#007aff", "#af52de", "#00c7be", "#1a1a1a"];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function hash(str) {
  let h = 2166136261;
  for (const ch of String(str)) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return Math.abs(h);
}

export function parseDate(iso) {
  const [y, m, d] = String(iso || "").split("-").map(Number);
  return y ? new Date(y, m - 1, d) : null;
}

export function isoOf(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function to12h(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  const suffix = h >= 12 ? "pm" : "am";
  const hr = h % 12 || 12;
  return `${String(hr).padStart(2, "0")}:${String(m || 0).padStart(2, "0")}${suffix}`;
}

// Cesar's time format: "18:00-21:00" -> "06:00pm-09:00pm"
export function fmtTime(t) {
  const m = String(t || "").match(/(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/);
  if (!m) return t || "";
  return `${to12h(m[1])}-${to12h(m[2])}`;
}

const WD3 = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const yy = (d) => `\u2018${String(d.getFullYear()).slice(2)}`;
const md = (d) => `${MONTHS[d.getMonth()]} ${String(d.getDate()).padStart(2, "0")}`;

// Cesar's Components / Modules date formats (Figma Rev 261012):
//   A  one day             Wed, Jun 10 \u201826 06:00pm-09:00pm
//   B  same month          Jun 10-12 \u201826 06:00pm-09:00pm
//   C  across months       Jun 10-Jul 07 \u201826 06:00pm-09:00pm
//   D  across years        Jun 10 \u201826-Feb 07 \u201827 11:00am-10:00pm
export function fmtDateRange(startIso, endIso) {
  const s = parseDate(startIso);
  if (!s) return "";
  const e = parseDate(endIso);
  if (!e || endIso <= startIso) return `${WD3[s.getDay()]}, ${md(s)} ${yy(s)}`;
  if (s.getFullYear() !== e.getFullYear()) return `${md(s)} ${yy(s)}-${md(e)} ${yy(e)}`;
  if (s.getMonth() !== e.getMonth()) return `${md(s)}-${md(e)} ${yy(s)}`;
  return `${md(s)}-${String(e.getDate()).padStart(2, "0")} ${yy(s)}`;
}

export function dateFormatOf(e) {
  if (!e.endDate || e.endDate <= e.date) return "A";
  const s = parseDate(e.date), t = parseDate(e.endDate);
  if (s.getFullYear() !== t.getFullYear()) return "D";
  return s.getMonth() !== t.getMonth() ? "C" : "B";
}

export function fmtWhen(e) {
  return `${fmtDateRange(e.date, e.endDate)} ${fmtTime(e.time)}`.trim();
}

export function startTime(t) {
  const m = String(t || "").match(/(\d{1,2}:\d{2})/);
  return m ? to12h(m[1]) : "";
}

// Group header for the timeline: { day: "Oct 8", weekday: "Thursday", tag: "Today" }
export function dayLabel(iso, today) {
  const d = parseDate(iso);
  if (!d) return { day: iso, weekday: "", tag: "" };
  const t = new Date(today);
  t.setHours(0, 0, 0, 0);
  const diff = Math.round((d - t) / 86400000);
  let tag = "";
  if (diff === 0) tag = "Today";
  else if (diff === 1) tag = "Tomorrow";
  else if (diff > 1 && diff < 7 && (d.getDay() === 0 || d.getDay() === 6)) tag = "This weekend";
  return { day: `${MONTHS[d.getMonth()]} ${d.getDate()}`, weekday: DAYS[d.getDay()], tag };
}

export function shortDate(iso) {
  const d = parseDate(iso);
  if (!d) return iso;
  return `${DAYS[d.getDay()].slice(0, 3)}, ${MONTHS[d.getMonth()]} ${d.getDate()}`;
}

export function initialsOf(name) {
  return String(name || "?")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

export function HostAvatar({ name, size = 22 }) {
  // Oct 19: neutral gray initials instead of colored circles.
  return (
    <span
      className="host-avatar host-avatar-plain"
      style={{ width: size, height: size, fontSize: size * 0.42 }}
      aria-hidden="true"
    >
      {initialsOf(name)}
    </span>
  );
}

// Oct 19: no more generated purple/orange circle art. Until real uploads
// exist, an event's image is a plain box with the legend image for its kind
// (expo, dinner, workshop) — "Icon, Image or Logo" in Cesar's mocks.
export function Poster({ event, className = "" }) {
  const cats = [...(event.categories || []), event.category].join(" ").toLowerCase();
  const kind = cats.includes("dinner") ? "dinner" : cats.includes("workshop") || cats.includes("seminar") ? "workshop" : "expo";
  return (
    <span className={`poster poster-plain ${className}`} aria-hidden="true">
      <Glyph name={kind} size={40} strokeWidth={1.3} />
    </span>
  );
}

// Outline icons for the Premier 4-line format (spec: "bolded with icons").
export function Icon({ name }) {
  const common = { width: 14, height: 14, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true };
  if (name === "clock")
    return (<svg {...common}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>);
  if (name === "pin")
    return (<svg {...common}><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z" /><circle cx="12" cy="9.5" r="2.5" /></svg>);
  if (name === "globe")
    return (<svg {...common}><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" /></svg>);
  if (name === "tag")
    return (<svg {...common}><path d="M3 12V4h8l10 10-8 8L3 12Z" /><circle cx="7.5" cy="8" r="1.4" /></svg>);
  if (name === "check")
    return (<svg {...common} strokeWidth="2.6"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>);
  if (name === "plus")
    return (<svg {...common} strokeWidth="2.4"><path d="M12 5v14M5 12h14" /></svg>);
  if (name === "chev-l")
    return (<svg {...common}><path d="M15 6l-6 6 6 6" /></svg>);
  if (name === "chev-r")
    return (<svg {...common}><path d="M9 6l6 6-6 6" /></svg>);
  if (name === "chev-u")
    return (<svg {...common}><path d="M6 15l6-6 6 6" /></svg>);
  if (name === "chev-d")
    return (<svg {...common}><path d="M6 9l6 6 6-6" /></svg>);
  return null;
}
